import { observable, action, runInAction, autorun, computed } from 'mobx'
import { pinyin } from '@gm-common/tool'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import moment from 'moment'
import { deleteEmptyPlanData } from './util'
import { isValid } from 'common/util'

const initHelpProcessPlanList = {
  pre_custom_id: undefined,
  sku_name: undefined,
  category1_name: undefined,
  category2_name: undefined,
  pinlei_name: undefined,
  sale_ratio: undefined,
  sale_unit_name: undefined,
  std_unit_name: undefined,
  sale_remain: undefined,
  customIdSameError: false, // 是否是重复计划编号
  emptyError: {
    sku_id: false,
    custom_id: false,
    plan_amount: false,
    plan_finish_time: false,
    plan_start_time: false,
  }, // 空的字段，只校验必填项
  zeroPlanAmountError: false, // 计划生产数是否为0
  idCharacterError: false, // 只能输入数字，字母，中划线
}

const initProcessPlanList = {
  // 提交数据
  custom_id: undefined,
  sku_id: undefined,
  plan_amount: null,
  plan_start_time: undefined,
  plan_finish_time: undefined,
  suggest_plan_amount: undefined,

  // 辅助数据
  ...initHelpProcessPlanList,
}

const initAlgorithmFilterData = {
  query_order_type: 1, // 日均下单数设置
  query_order_days: null, // 手动填写的最近下单数，query_order_type === 1时使用
  adjust_ratio: null, // 调整比例
  stock_up_type: 1, // 备货天数类型，1为按手动填写，2为按保质期
  stock_up_days: null, // 手动填写的备货天数，stock_up_type === 1 时使用
  is_deduct_stock: 0, // 是否扣减库存
  product_show_type: 1, // 商品展示设置，1仅展示建议计划生产数大于0的智能推荐商品 2全部
}

const initRecommendPlanData = {
  plan_start_time: undefined,
  plan_finish_time: undefined,
  sort_name: undefined,
  sort_direction: undefined,
}

class Store {
  // 预生产计划商品
  @observable processPlanList = [{ ...initProcessPlanList }]

  // 推荐数据
  @observable recommendPlanData = { ...initRecommendPlanData }

  // 推荐商品
  @observable recommendProcessPlanList = []

  // 推荐商品选择
  @observable recommendSelected = []

  // 物料详情
  @observable materialDetail = []

  // 算法设置
  @observable algorithmFilterData = { ...initAlgorithmFilterData }

  // 运算进度
  @observable loadingProgress = 0

  // 运算loading
  @observable recommendLoading = false

  // 待覆盖商品(数据来源是推荐商品数据)
  @observable waitForReplaceProductData = []

  // 后台返回错误计划编号
  @observable errorCustomIds = []

  // 开启校验提示
  @observable startCheck = false

  _customIdDisposer = _.noop

  _emptyDisposer = _.noop // 必填校验
  _noZeroDisposer = _.noop // 不能为0
  _characterDisposer = _.noop // 计划编号只能为数字、字母、中划线

  @action
  initAutoRun() {
    this._customIdDisposer = autorun(() => {
      // 判断是否重复
      _.each(this.processPlanList, (processPlan, index) => {
        // 默认不重复
        processPlan.customIdSameError = false

        _.each(this.processPlanList, (item, i) => {
          // 排除当前项和空的情况
          if (
            index !== i && // 非当前项
            processPlan.custom_id === item.custom_id && // 重复
            isValid(processPlan.custom_id) // 非空
          ) {
            processPlan.customIdSameError = true
            return false
          }
        })
      })
    })

    this._emptyDisposer = autorun(() => {
      console.log('filter')
      _.each(this.processPlanList, (item) => {
        let noCheck = false
        // 全部为空时不校验且置为合理，因为不提交
        if (
          !isValid(item.custom_id) &&
          !isValid(item.sku_id) &&
          !isValid(item.plan_amount) &&
          !isValid(item.plan_start_time) &&
          !isValid(item.plan_finish_time)
        ) {
          noCheck = true
        }

        item.emptyError.custom_id = noCheck ? false : !isValid(item.custom_id)
        item.emptyError.plan_amount = noCheck
          ? false
          : !isValid(item.plan_amount)
        item.emptyError.plan_start_time = noCheck
          ? false
          : !isValid(item.plan_start_time)
        item.emptyError.plan_finish_time = noCheck
          ? false
          : !isValid(item.plan_finish_time)
        item.emptyError.sku_id = noCheck ? false : !isValid(item.sku_id)
      })
    })

    this._noZeroDisposer = autorun(() => {
      _.each(this.processPlanList, (item) => {
        let noCheck = false

        // 全部为空时不校验且置为合理，因为不提交
        if (
          !isValid(item.custom_id) &&
          !isValid(item.sku_id) &&
          !isValid(item.plan_amount) &&
          !isValid(item.plan_start_time) &&
          !isValid(item.plan_finish_time)
        ) {
          noCheck = true
        }

        item.zeroPlanAmountError = noCheck
          ? false
          : _.toNumber(item.plan_amount) === 0
      })
    })

    this._characterDisposer = autorun(() => {
      const reg = new RegExp('^[A-Za-z0-9-]+$')

      _.each(this.processPlanList, (item) => {
        item.idCharacterError = !reg.test(item.custom_id)
      })
    })
  }

  @action
  changeStartCheck(bool) {
    this.startCheck = bool
  }

  // 清空edittable 需要清空的数据
  @action.bound
  clearEditTable() {
    // 销毁autorun
    this._customIdDisposer()
    this._emptyDisposer()
    this._noZeroDisposer()
    this._characterDisposer()
    // 关闭校验提示
    this.startCheck = false
  }

  /**
   * 是否可以提交
   */
  @computed
  get canSubmit() {
    let submit = true
    _.each(this.processPlanList, (item) => {
      if (item.customIdSameError) {
        submit = false
      }

      if (_.filter(item.emptyError, (i) => i).length > 0) {
        submit = false
      }

      if (item.zeroPlanAmountError) {
        submit = false
      }

      if (item.idCharacterError) {
        submit = false
      }
    })

    return submit
  }

  /**
   * 设置算法配置值
   * @param {string} name 字段名
   * @param {string | number} value 值
   */
  @action.bound
  changeAlgorithmSetting(name, value) {
    this.algorithmFilterData[name] = value
  }

  /**
   * 改变预生产计划具体数据
   * @param {number} index 待改变下标
   * @param {object} changeData 待改变键值
   */
  @action
  changeProcessPlanListItem(index, changeData) {
    Object.assign(this.processPlanList[index], changeData)
  }

  /**
   * 增加预生产计划空项
   */
  @action
  addProcessPlanListItem() {
    this.processPlanList.push({ ...initProcessPlanList })
  }

  /**
   * 删除预生产计划列表项
   * @param {number} index 待删除下标
   */
  @action
  delProcessPlanListItem(index) {
    this.processPlanList.remove(this.processPlanList[index])
  }

  /**
   * 选择商品
   * @param {number} index 下标
   * @param {object} selected 选中商品
   */
  @action
  async changeProductNameSelect(index, selected) {
    let changeData

    // 切换时清空该行数据
    this.processPlanList[index] = {
      ...initProcessPlanList,
      custom_id: this.processPlanList[index].custom_id,
    }

    if (selected) {
      changeData = {
        std_unit_name: selected.std_unit_name,
        sku_id: selected.id,
        sale_ratio: selected.ratio,
        sku_name: selected.name,
        sale_unit_name: selected.sale_unit_name,
        sale_remain: selected.product_stock,
      }

      // 获取建议计划生产数并设置计划生产数
      await this.fetchOneRecommend({
        sku_id: selected.id,
      })
        .then((json) => {
          if (json.data) {
            changeData.suggest_plan_amount = json.data.suggest_plan_amount

            // 由于接口可能很慢，这里拉到数据后，如果已有数据，则不填充
            if (
              !this.processPlanList[index].plan_amount ||
              this.processPlanList[index].plan_amount !== 0
            ) {
              changeData.plan_amount = json.data.suggest_plan_amount
            }
          }
        })
        .catch((err) => {
          console.log('suggest_plan_amount', err)
        })

      // 由于可能重复的过多，前端先不设置默认计划编号
      // changeData.custom_id = `${selected.id}-JG-0001`

      this.changeProcessPlanListItem(index, changeData)
    }
  }

  /**
   * 改变推荐计划数据
   * @param {string} field 字段名
   * @param {date | string} value 待改变的值
   */
  @action
  changeRecommendPlanDataItem(field, value) {
    this.recommendPlanData[field] = value
  }

  /**
   * 改变推荐商品数据
   * @param {number} index 下标
   * @param {object} changeData 改变的值
   */
  @action
  changeRecommendListItem(index, changeData) {
    Object.assign(this.recommendProcessPlanList[index], { ...changeData })
  }

  /**
   * 获取过滤已经选择的商品
   * @param {array} productList 搜索出来的商品数据
   */
  @action
  getFilterExistProduct(productList, currentSkuId) {
    const existSkuIds = _.map(this.processPlanList, (item) => item.sku_id)

    return _.filter(productList, (item) => {
      return !_.includes(existSkuIds, item.id) || currentSkuId === item.id
    })
  }

  /**
   * 改变推荐表格选中
   * @param {array} selected 表格选中项
   */
  @action.bound
  changeRecommendSelected(selected) {
    this.recommendSelected = selected
  }

  /**
   * 推荐商品排序
   * @param {string} field 排序列
   * @param {string} sortType 排序类型，desc(降序)，asc(升序)
   */
  @action
  sortRecommendData(field, sortType) {
    this.recommendPlanData.sort_name = field
    this.recommendPlanData.sort_direction = sortType

    // 排序之后，仍需对生产数降序排序
    if (field === 'product') {
      this.recommendProcessPlanList = _.orderBy(
        this.recommendProcessPlanList,
        ['product_pinyin', 'suggest_plan_amount'],
        [sortType, 'desc']
      )
    } else if (field === 'category_name') {
      this.recommendProcessPlanList = _.orderBy(
        this.recommendProcessPlanList,
        [
          'category1_name_pinyin',
          'category2_name_pinyin',
          'pinlei_name_pinyin',
          'suggest_plan_amount',
        ],
        [sortType, sortType, sortType, 'desc']
      )
    }
  }

  /**
   * 获取批量新建加工计划可提交数据
   */
  @action
  getValidPlanListData() {
    return _.map(deleteEmptyPlanData(this.processPlanList), (item) => {
      // 清除辅助数据
      return _.omit(item, Object.keys(initHelpProcessPlanList))
    })
  }

  /**
   * 获取待提交批量新建加工计划数据
   */
  @action
  getPlanListPostData(submitType) {
    const postData = {
      is_submit: submitType,
    }
    const data_list = []

    _.each(this.getValidPlanListData(), (item) => {
      data_list.push({
        custom_id: item.custom_id,
        sku_id: item.sku_id,
        plan_amount: item.plan_amount,
        plan_start_time: moment(item.plan_start_time).format('YYYY-MM-DD'),
        plan_finish_time: moment(item.plan_finish_time).format('YYYY-MM-DD'),
        suggest_plan_amount: item.suggest_plan_amount,
      })
    })

    postData.data_list = JSON.stringify(data_list)

    return postData
  }

  /**
   * 设置推荐结果数据
   * @param {array} data 推荐结果
   */
  @action.bound
  setRecommendResult(data) {
    // 计划生产数默认等于建议计划生产数
    this.recommendProcessPlanList = _.map(data, (item) => {
      return {
        ...item,
        plan_amount: item.suggest_plan_amount,
        product_pinyin: pinyin(item.sku_name, 'first_letter'),
        category1_name_pinyin: pinyin(item.category1_name, 'first_letter'),
        category2_name_pinyin: pinyin(item.category2_name, 'first_letter'),
        pinlei_name_pinyin: pinyin(item.pinlei_name, 'first_letter'),
      }
    })
  }

  /**
   * 设置获取推荐数据进度
   * @param {number} processSchedule 进度
   */
  @action
  setLoadingProgress(processSchedule) {
    this.loadingProgress = processSchedule
  }

  /**
   * 设置loading状态
   * @param {bool} isStart 是否loading
   */
  @action
  setRecommendLoading(isStart) {
    this.recommendLoading = isStart
    // 重置进度
    if (!isStart) {
      this.loadingProgress = 0
    }
  }

  /**
   * 筛选已经添加的重复商品
   */
  @action
  verifyAndSameProduct() {
    const sameProduct = []

    _.each(this.processPlanList, (processPlanItem) => {
      if (_.includes(this.recommendSelected, processPlanItem.sku_id)) {
        _.each(this.recommendProcessPlanList, (recommendItem) => {
          if (recommendItem.sku_id === processPlanItem.sku_id) {
            sameProduct.push({
              ...recommendItem,
            })
          }
        })
      }
    })

    this.waitForReplaceProductData = sameProduct
  }

  /**
   * 清除推荐数据
   */
  @action
  clearRecommendData() {
    this.recommendPlanData = { ...initRecommendPlanData }
    this.recommendProcessPlanList = []
    this.recommendSelected = []
  }

  /**
   * 添加商品进加工计划列表
   * @param {bool} isCover 是否覆盖已存在的相同sku数据
   */
  @action
  addProduct(isCover) {
    const replaceIds = _.map(this.waitForReplaceProductData, (v) => v.sku_id)
    // 添加计划生产数
    const selectedData = _.filter(this.recommendProcessPlanList, (item) => {
      return _.includes(this.recommendSelected, item.sku_id)
    })

    // 选择的推荐数据去除共同存在的
    const delCommonSelectedData = _.filter(selectedData, (item) => {
      return !_.includes(replaceIds, item.sku_id)
    })

    // 加工计划生产商品去除共同存在的
    const delCommonPlanData = _.filter(this.processPlanList, (item) => {
      return !_.includes(replaceIds, item.sku_id)
    })

    // 不管是否覆盖，都去掉空数据
    if (isCover) {
      const recommendCover = _.map(selectedData, (item) => {
        return _.omit(
          {
            ...initProcessPlanList, // 保留一些辅助数据
            ...item,
            custom_id: item.pre_custom_id,
            plan_start_time: this.recommendPlanData.plan_start_time,
            plan_finish_time: this.recommendPlanData.plan_finish_time,
          },
          [
            'pinlei_name_pinyin',
            'category2_name_pinyin',
            'category1_name_pinyin',
            'product_pinyin',
          ]
        )
      })

      // 覆盖数据的话，将剔除了公共数据的processPlanList数据和选择的推荐数据合并
      this.processPlanList = deleteEmptyPlanData(
        delCommonPlanData.concat(recommendCover)
      )
    } else {
      const recommendNotCover = _.map(delCommonSelectedData, (item) => {
        return _.omit(
          {
            ...initProcessPlanList, // 保留一些辅助数据
            ...item,
            custom_id: item.pre_custom_id,
            plan_start_time: this.recommendPlanData.plan_start_time,
            plan_finish_time: this.recommendPlanData.plan_finish_time,
          },
          [
            'pinlei_name_pinyin',
            'category2_name_pinyin',
            'category1_name_pinyin',
            'product_pinyin',
          ]
        )
      })

      // 不覆盖数据，将剔除公共数据的推荐数据和原有数据processPlanList合并
      this.processPlanList = deleteEmptyPlanData(
        this.processPlanList.concat(recommendNotCover)
      )
    }

    this.clearRecommendData()
  }

  /**
   * 获取sku商品列表
   * @param {object} reqData 请求参数
   */
  @action
  fetchSkuList(reqData) {
    return Request('/process/sku/list').data(reqData).get()
  }

  /**
   * 获取单个商品建议计划生产数
   * @param {object} reqData 请求参数
   */
  @action
  fetchOneRecommend(reqData) {
    return Request('/stock/process/process_order/recommend_one_sku')
      .data(reqData)
      .code([1, 4])
      .post()
  }

  /**
   * 获取保存计划错误列表
   * @param {object} reqData 请求数据
   */
  @action
  fetchErrorProcessPlanList(reqData) {
    return Request('/task/get')
      .data(reqData)
      .get()
      .then((json) => {
        runInAction(() => {
          const errorList = []
          this.processPlanList = _.map(
            json.data.result.business_data.error_list,
            (item) => {
              errorList.push(item.custom_id)

              return {
                ...initProcessPlanList, // 保留一些辅助数据
                ...item,
              }
            }
          )

          this.errorCustomIds = errorList
        })
      })
  }

  /**
   * 获取skuid对应物料详情
   * @param {object} reqData 请求参数
   */
  @action
  fetchMaterialDetail(reqData) {
    return Request('/stock/process/process_order/stock/get')
      .data(reqData)
      .get()
      .then((json) => {
        runInAction(() => {
          this.materialDetail = json.data
        })
        return json
      })
  }

  /**
   * 执行运算
   */
  @action
  postStartCompute() {
    const reqData = {
      ...this.algorithmFilterData,
      is_deduct_stock: _.toNumber(this.algorithmFilterData.is_deduct_stock),
    }
    return Request('/stock/process/process_order/recommend_all_sku')
      .data(reqData)
      .post()
      .then((json) => {
        return json
      })
  }

  /**
   * 获取智能推荐结果
   * @param {string} taskUrl 后台返回的轮询地址
   */
  @action
  getRecommendResult(taskUrl) {
    return Request(taskUrl).data().get()
  }

  /**
   * 提交批量创建加工计划
   * @param {number} submitType 是否下单加工计划，0 否， 1 是
   */
  @action
  postBatchCreatePlan(submitType) {
    const reqData = this.getPlanListPostData(submitType)

    return Request('/stock/process/process_order/batch_create')
      .data(reqData)
      .post()
      .then((json) => {
        return json
      })
  }
}

export default new Store()
