import { observable, action, runInAction, reaction } from 'mobx'
import { Request } from '@gm-common/request'
import {
  initIngredient,
  initSkuDetail,
  initPurchaseSpecInfo,
  initCleanFoodInfo,
  defaultNutritionInfo,
} from './init_data'
import { isNumber } from '../../../common/util'
import { System } from '../../../common/service'
import { boolToNum, yuanToFen, getImgId } from './util'
import _ from 'lodash'
import Big from 'big.js'
import globalStore from '../../../stores/global'
import { i18next } from 'gm-i18n'
import { CLEAN_FOOD_NUTRITION_INFO } from 'common/enum'

class SkuDetailStore {
  // spu下所有sku列表
  @observable skuList = [initSkuDetail()]

  @observable beforeSkuList = [initSkuDetail()]

  // 当前所点击的sku index，新增时为0
  @observable activeIndex = 0

  // 当前所点击sku 详情
  @observable skuDetail = initSkuDetail()

  // 新建采购规格信息
  @observable purchaseSpecInfo = initPurchaseSpecInfo

  // spuid和supplierid可以选择的采购规格列表
  @observable purchaseSpecList = []

  // sku 卡片 列表
  @observable skuListCard = []

  // 工艺信息，所选出成率参考值，1-7天 2-15天 3-30天
  @observable craftRefType = 1

  // 工艺信息，可选择的供应商
  @observable craftSupplierList = []

  // 相同spu下的报价单列表
  @observable unitySkuSalemenuList = []

  // 未修改前的skudetail,用来筛选可同步的报价单
  // eslint-disable-next-line gm-react-app/no-observable-empty-object
  @observable nowSkuCardDetail = {}

  // 判断新建同步异步
  @observable asyncCreate = 1

  // 保存或同步
  @observable unity = 1

  // 周转物
  @observable turnOverList = []

  constructor() {
    this.r = reaction(
      () => {
        // eslint-disable-next-line
        this.skuList.length
        return {
          skuList: this.skuList,
          activeIndex: this.activeIndex,
          retail: System.isC(),
        }
      },
      ({ skuList, activeIndex, retail }) => {
        this.skuListCard = _.map(skuList, (v) => {
          const sale_spec =
            '(' +
            v.sale_ratio +
            v.std_unit_name_forsale +
            '/' +
            v.sale_unit_name +
            ')'
          return {
            title: v.sku_name,
            info: retail ? sale_spec : sale_spec + '(' + v.salemenu_name + ')',
          }
        })
        this.skuDetail = skuList[activeIndex]
        this.purchaseSpecInfo = Object.assign({}, this.purchaseSpecInfo, {
          std_unit_name: this.skuDetail ? this.skuDetail.std_unit_name : '-',
        })
        this.unitySkuSalemenuList = _.map(skuList, (v) => {
          return {
            sale_ratio: v.sale_ratio,
            sale_unit_name: v.sale_unit_name,
            value: v.salemenu_id,
            text: v.salemenu_name,
            fee_type: v.fee_type,
            is_active: v.salemenu_enable,
            type: v.salemenu_type,
          }
        })
      },
    )
  }

  @action
  // 获取银豹商品编码
  getSkuPospalCodeAndName(sku_id, index) {
    if (!sku_id || !globalStore.hasPermission('open_app_pospal_sync_order')) {
      return Promise.resolve()
    }

    return Request('/openapi/app/pospal/code/get')
      .data({ sku_id })
      .get()
      .then((json) => {
        runInAction(() => {
          const list = this.skuList.slice()
          list[index].pospal_data = json.data
          this.skuList = list
        })
        return json
      })
  }

  @action
  getSkuListDetail(spu_id) {
    let req = { spu_id }
    if (System.isC()) {
      req = {
        spu_id,
        salemenu_id: globalStore.c_salemenu_id,
        is_retail_interface: 1,
      }
    }
    return Request('/product/sku_sale/list')
      .data(req)
      .get()
      .then((json) => {
        runInAction(() => {
          this.skuList = _.map(json.data, (v) => {
            let suggest_price_max = v.suggest_price_max
            let suggest_price_min = v.suggest_price_min
            if (suggest_price_max)
              suggest_price_max = Big(suggest_price_max).div(100).toFixed(2)
            if (suggest_price_min)
              suggest_price_min = Big(suggest_price_min).div(100).toFixed(2)

            return {
              ...v,
              suggest_price_max,
              suggest_price_min,
              pospal_data: [],
              image_list: v.image_list || [],
              saleSpec:
                v.sale_unit_name === v.std_unit_name_forsale &&
                v.sale_ratio === 1
                  ? 1
                  : 2,
              std_sale_price_forsale: Big(v.std_sale_price_forsale)
                .div(100)
                .toFixed(2),
              sale_price: Big(v.sale_price).div(100).toFixed(2),
              // 周转物关联关闭状态 给个默认的换算方式
              turnover_bind_type:
                !v.bind_turnover && !v.turnover_bind_type
                  ? 1
                  : v.turnover_bind_type,
              turnover_ratio: v.turnover_ratio ?? '', // 需要保留该字段
              is_already_clean_food: !!v.clean_food, // 若已开启加工，则不可再编辑是否开启加工
              isRound: !!v.rounding, // 是否开启下单取整 rounding=0-关闭取整
              roundType: v.rounding || 1, // rounding=1 向上取整 2 向下取整
              ingredients: v.ingredients.map((item) => {
                return { ...initIngredient, ...item }
              }),
              clean_food_info: {
                ...initCleanFoodInfo,
                ...v.clean_food_info,
                nutrition_info: this.handleNutritionData(v.clean_food_info),
              },
              is_step_price: v?.is_step_price || 0,
              step_price_table: v?.step_price_table?.length
                ? v.step_price_table.map((e) => {
                    return {
                      ...e,
                      step_sale_price: Big(e.step_sale_price)
                        .div(100)
                        .toFixed(2),
                      step_std_price: Big(e.step_std_price).div(100).toFixed(2),
                    }
                  })
                : [],
              // : [
              //     {
              //       index: 0,
              //       min: v?.sale_num_least || 1,
              //       max: '',
              //       step_sale_price: '',
              //       step_std_price: '',
              //     }, // 阶梯定价表格
              //   ],
            }
          })
        })
        return json.data
      })
  }

  @action
  changeUnity = (u) => {
    this.unity = u
  }

  @action
  changeTurnOverList = (turnOverList) => {
    this.turnOverList = turnOverList
  }

  @action
  getBeforeSkuListDetail(spu_id) {
    let req = { spu_id }
    if (System.isC()) {
      req = {
        spu_id,
        salemenu_id: globalStore.c_salemenu_id,
        is_retail_interface: 1,
      }
    }
    return Request('/product/sku_sale/list')
      .data(req)
      .get()
      .then((json) => {
        runInAction(() => {
          this.beforeSkuList = _.map(
            json.data,
            ({ suggest_price_max, suggest_price_min, ...other }) => {
              return {
                ...other,
                suggest_price_max: suggest_price_max
                  ? Big(suggest_price_max).div(100).toFixed(2)
                  : suggest_price_max,
                suggest_price_min: suggest_price_min
                  ? Big(suggest_price_min).div(100).toFixed(2)
                  : suggest_price_min,
                pospal_data: [],
                image_list: other.image_list || [],
                std_sale_price_forsale: Big(other.std_sale_price_forsale)
                  .div(100)
                  .toFixed(2),
                sale_price: Big(other.sale_price).div(100).toFixed(2),
                // 周转物关联关闭状态 给个默认的换算方式
                turnover_bind_type:
                  !other.bind_turnover && !other.turnover_bind_type
                    ? 1
                    : other.turnover_bind_type,
                is_already_clean_food: !!other.clean_food, // 若已开启加工，则不可再编辑是否开启加工
                isRound: !!other.rounding, // 是否开启下单取整 rounding=0-关闭取整
                roundType: other.rounding || 1, // rounding=1 向上取整 2 向下取整
                ingredients: other.ingredients.map((item) => {
                  return { ...initIngredient, ...item }
                }),
                clean_food_info: {
                  ...initCleanFoodInfo,
                  ...other.clean_food_info,
                  nutrition_info: this.handleNutritionData(
                    other.clean_food_info,
                  ),
                },
              }
            },
          )
        })
        return json.data
      })
  }

  @action
  handleNutritionData(data) {
    const nutritionInfo =
      data.nutrition_info?.length > 0
        ? data.nutrition_info.map((item) => {
            let unit
            let name
            CLEAN_FOOD_NUTRITION_INFO.forEach((nutrition) => {
              if (nutrition.value === item.key) {
                unit = nutrition.unit
                name = nutrition.text
              }
            })

            return {
              ...item,
              unit,
              name,
            }
          })
        : defaultNutritionInfo

    return nutritionInfo
  }

  @action.bound
  addNutritionRow() {
    // 默认为第一个
    this.skuDetail.clean_food_info.nutrition_info.push({
      name: '',
      key: '',
      per_100g: null,
      NRV: null,
      unit: null,
    })
  }

  @action.bound
  delNutritionRow(index) {
    this.skuDetail.clean_food_info.nutrition_info.splice(index, 1)
  }

  @action.bound
  addTieredPriceRow() {
    const len = this.skuDetail.step_price_table.length
    if (len === 5) return
    const step_price = this.skuDetail.step_price_table[len - 1]
    this.skuDetail.step_price_table.push({
      index: len,
      min: step_price?.max || '',
      max: '',
      step_sale_price: '',
      step_std_price: '',
    })
  }

  @action.bound
  delTieredPriceRow(index) {
    const len = this.skuDetail.step_price_table.length
    this.skuDetail.step_price_table.splice(index, 1)
    if (index === len - 1) {
      this.skuDetail.step_price_table[len - 2].max = ''
    }
  }

  @action
  changeNutritionInfo(index, changeData) {
    Object.assign(this.skuDetail.clean_food_info.nutrition_info[index], {
      ...changeData,
    })
  }

  @action
  addNewSku(spuDetail, supplier_id, salemenuSelected) {
    // 已有一个新建的sku，不做处理
    if (this.skuList.length && !this.skuList[0].sku_id) {
      return
    }

    this.skuList.unshift(
      initSkuDetail(spuDetail, supplier_id, salemenuSelected),
    )
    this.changeActiveIndex(0)
  }

  @action
  afterChangeActiveIndex(index) {
    // 净菜sku获取物料出成率
    if (this.skuList[index].clean_food) {
      this.fetchAllMaterialPercentage(index)
    }
    // 拉取银豹编码如有权限
    return this.getSkuPospalCodeAndName(this.skuList[index].sku_id, index)
  }

  @action
  changeActiveIndex(index) {
    this.afterChangeActiveIndex(index)
    this.activeIndex = index
  }

  /**
   * 删除sku
   * 删除后，activeIndex默认选为第一个
   * 若删除后没有sku了，则显示空
   */
  @action
  deleteSku(index) {
    const id = this.skuList[index].sku_id
    return Request('/product/sku/delete')
      .data({ id, is_retail_interface: System.isC() ? 1 : null })
      .post()
      .then((json) => {
        runInAction(() => {
          if (json.code === 0) {
            this.skuList = _.filter(this.skuList, (sku) => sku.sku_id !== id)
            if (this.skuList.length === 0) this.skuList = [initSkuDetail()]

            this.changeActiveIndex(0)
          }
        })
        return json
      })
  }

  /**
   * 新建sku
   * 新建的时候，需要salemenu_id和spu_id，没有sku_id
   * 如果是净菜，必须把多物料列表中物料ID为空的物料给过滤掉，不发给后台
   */
  @action
  createSku(spu_id) {
    const {
      salemenu_ids,
      ingredients,
      clean_food,
      clean_food_info,
      slitting,
      purchase_spec_id,
      supplier_id,
      sku_name,
      sale_unit_name,
      std_unit_name_forsale,
      image_list,
      suggest_price_min,
      suggest_price_max,
      std_sale_price_forsale,
      sale_ratio,
      sale_price,
      attrition_rate,
      desc,
      is_price_timing,
      is_weigh,
      outer_id,
      partframe,
      remark_type,
      sale_num_least,
      state,
      stocks,
      stock_type,
      isRound,
      roundType,
      tid,
      turnover_bind_type,
      turnover_ratio,
      bind_turnover,
      box_type,
      brand,
      origin_area,
      origin_place,
      specification_desc,
      feature_desc,
      after_sale_desc,
      is_step_price,
      step_price_table,
      price_cal_type,
    } = this.skuDetail
    if (salemenu_ids.length === 1) {
      this.asyncCreate = 0
    } else {
      this.asyncCreate = 1
    }
    // 判断同步异步
    let on_salemenu_ids
    if (salemenu_ids[0]?.value) {
      on_salemenu_ids = JSON.stringify(_.map(salemenu_ids, 'value'))
    } else on_salemenu_ids = JSON.stringify(salemenu_ids)
    let query = {
      salemenu_ids: on_salemenu_ids,
      spu_id,
      name: sku_name,
      desc,
      // std_sale_price_forsale: yuanToFen(std_sale_price_forsale || 0),
      // sale_price: yuanToFen(sale_price || 0),
      sale_unit_name,
      std_unit_name_forsale,
      price_cal_type,
      sale_ratio,
      sale_num_least,
      attrition_rate: attrition_rate || 0,
      state: boolToNum(state),
      is_weigh: System.isC() ? 0 : boolToNum(is_weigh),
      is_price_timing: boolToNum(is_price_timing),
      slitting: boolToNum(slitting),
      partframe: boolToNum(partframe),
      stock_type,
      stocks,
      rounding: !isRound ? 0 : roundType,
      outer_id,
      supplier_id,
      purchase_spec_id,
      images: JSON.stringify(getImgId(image_list)),
      clean_food: boolToNum(clean_food), // 是否开启加工
      box_type,
      brand,
      origin_area,
      origin_place,
      specification_desc,
      feature_desc,
      after_sale_desc,
      is_step_price,
      // step_price_table: toJS(step_price_table),
    }
    if (boolToNum(is_price_timing) === 0) {
      if (is_step_price === 0) {
        query.std_sale_price_forsale = yuanToFen(std_sale_price_forsale || 0)
        query.sale_price = yuanToFen(sale_price || 0)
      } else {
        query.std_sale_price_forsale = yuanToFen(
          step_price_table[0]?.step_std_price || 0,
        )
        query.sale_price = yuanToFen(step_price_table[0]?.step_sale_price || 0)
        query.step_price_table = JSON.stringify(
          _.map(step_price_table, (e) => {
            return {
              index: e.index,
              min: e.min,
              max: e.max,
              step_sale_price: yuanToFen(e.step_sale_price || 0),
              step_std_price: yuanToFen(e.step_std_price || 0),
            }
          }),
        )
        query.std_sale_price_forsale = yuanToFen(
          step_price_table[0].step_std_price || 0,
        )
        query.sale_price = yuanToFen(step_price_table[0].step_sale_price || 0)
      }
    }

    // 净菜相关
    if (clean_food) {
      query = Object.assign({}, query, {
        remark_type, // 商品类型
        ingredients: JSON.stringify(
          _.filter(ingredients, (ingredient) => ingredient.id),
        ), // 物料信息
        clean_food_info: JSON.stringify({
          ...clean_food_info,
          combine_technic_status: boolToNum(
            clean_food_info.combine_technic_status,
          ),
          process_unit_status: boolToNum(clean_food_info.process_unit_status),
          nutrition_status: boolToNum(clean_food_info.nutrition_status),
          nutrition_info: clean_food_info.nutrition_status
            ? _.map(clean_food_info.nutrition_info, (item) => {
                const { key, per_100g, NRV } = item
                return {
                  key,
                  per_100g,
                  NRV,
                }
              })
            : [],
        }),
      })
    }

    // 周转物
    if (globalStore.hasPermission('add_turnover_sku_info')) {
      query = Object.assign({}, query, {
        bind_turnover,
        tid,
        turnover_ratio,
        turnover_bind_type,
      })
    }

    // 建议价格区间
    if (globalStore.otherInfo.showSuggestPrice) {
      query.suggest_price_min = isNumber(suggest_price_min)
        ? yuanToFen(suggest_price_min)
        : ''
      query.suggest_price_max = isNumber(suggest_price_max)
        ? yuanToFen(suggest_price_max)
        : ''
    }
    if (System.isC()) {
      query.is_retail_interface = 1
      query.is_weight = 0
    }

    return Request('/product/sku_sale/create')
      .data(query)
      .post()
      .then((json) => {
        if (this.asyncCreate === 0) {
          runInAction(() => {
            this.skuDetail.sku_id = json.data
          })
        }

        return json.data
      })
  }

  /**
   * 修改sku
   * 更新的时候，需要sku_id, 没有salemenu_id和spu_id
   * 如果是净菜，必须把多物料列表中物料ID为空的物料给过滤掉，不发给后台
   */
  @action
  updateSku() {
    const {
      sku_id,
      ingredients,
      clean_food,
      clean_food_info,
      slitting,
      purchase_spec_id,
      supplier_id,
      sku_name,
      sale_unit_name,
      std_unit_name_forsale,
      price_cal_type,
      suggest_price_min,
      suggest_price_max,
      std_sale_price_forsale,
      sale_ratio,
      sale_price,
      attrition_rate,
      desc,
      is_price_timing,
      is_weigh,
      outer_id,
      partframe,
      remark_type,
      sale_num_least,
      state,
      stocks,
      stock_type,
      isRound,
      roundType,
      bind_turnover,
      tid,
      turnover_ratio,
      turnover_bind_type,
      box_type,
      image_list,
      unity_salemenu_ids,
      brand,
      origin_area,
      origin_place,
      specification_desc,
      feature_desc,
      after_sale_desc,
      is_step_price,
      step_price_table,
    } = this.skuDetail

    let query = {
      id: sku_id,
      name: sku_name,
      desc,
      // std_sale_price_forsale: yuanToFen(std_sale_price_forsale || 0),
      // sale_price: yuanToFen(sale_price || 0),
      sale_unit_name,
      sale_ratio,
      sale_num_least,
      std_unit_name_forsale,
      price_cal_type,
      attrition_rate: attrition_rate || 0,
      state: boolToNum(state),
      is_weigh: boolToNum(is_weigh),
      is_price_timing: boolToNum(is_price_timing),
      slitting: boolToNum(slitting),
      partframe: boolToNum(partframe),
      stock_type,
      stocks,
      rounding: !isRound ? 0 : roundType,
      outer_id,
      supplier_id,
      purchase_spec_id,
      images: JSON.stringify(getImgId(image_list)),
      clean_food: boolToNum(clean_food), // 净菜相关
      box_type: box_type,
      brand,
      origin_area,
      origin_place,
      specification_desc,
      feature_desc,
      after_sale_desc,
      // step_price_table: toJS(step_price_table),
      is_step_price,
    }

    if (boolToNum(is_price_timing) === 0) {
      // query.is_step_price = is_step_price
      if (is_step_price === 0) {
        query.std_sale_price_forsale = yuanToFen(std_sale_price_forsale || 0)
        query.sale_price = yuanToFen(sale_price || 0)
      } else {
        query.std_sale_price_forsale = yuanToFen(
          step_price_table[0]?.step_std_price || 0,
        )
        query.sale_price = yuanToFen(step_price_table[0]?.step_sale_price || 0)
        query.step_price_table = JSON.stringify(
          _.map(step_price_table, (e) => {
            return {
              index: e.index,
              min: e.min,
              max: e.max,
              step_sale_price: yuanToFen(e.step_sale_price || 0),
              step_std_price: yuanToFen(e.step_std_price || 0),
            }
          }),
        )
      }
    }

    // 同步
    if (this.unity === 1) {
      query = Object.assign({}, query, {
        salemenu_ids: JSON.stringify(_.map(unity_salemenu_ids, 'value')),
      })
    }
    // 净菜相关
    if (clean_food) {
      query = Object.assign({}, query, {
        remark_type, // 商品类型
        ingredients: JSON.stringify(
          _.filter(ingredients, (ingredient) => ingredient.id),
        ), // 物料信息
        clean_food_info: JSON.stringify({
          ...clean_food_info,
          combine_technic_status: boolToNum(
            clean_food_info.combine_technic_status,
          ),
          process_unit_status: boolToNum(clean_food_info.process_unit_status),
          nutrition_status: boolToNum(clean_food_info.nutrition_status),
          nutrition_info: clean_food_info.nutrition_status
            ? _.map(clean_food_info.nutrition_info, (item) => {
                const { key, per_100g, NRV } = item
                return {
                  key,
                  per_100g,
                  NRV,
                }
              })
            : [],
        }),
      })
    }

    // 周转物
    if (globalStore.hasPermission('add_turnover_sku_info')) {
      query = Object.assign({}, query, {
        bind_turnover,
        tid,
        turnover_ratio,
        turnover_bind_type,
      })
    }

    // 建议价格区间
    if (globalStore.otherInfo.showSuggestPrice) {
      query.suggest_price_min = isNumber(suggest_price_min)
        ? yuanToFen(suggest_price_min)
        : ''
      query.suggest_price_max = isNumber(suggest_price_max)
        ? yuanToFen(suggest_price_max)
        : ''
    }
    if (System.isC()) {
      query.is_retail_interface = 1
      query.is_weight = 0
    }

    return Request('/product/sku/update').data(query).post()
  }

  /**
   * obj 格式 {name: value}
   */
  @action
  changeSkuDetail(obj) {
    this.skuDetail = Object.assign({}, this.skuDetail, obj)
  }

  @action
  changeSkuDetailTieredTable(index, key, value) {
    if (
      key === 'max' &&
      index < 4 &&
      this.skuDetail.step_price_table.length > index + 1
    ) {
      this.skuDetail.step_price_table[index + 1].min = value
    }

    const newData = { [key]: value }
    const { sale_ratio } = this.skuDetail
    if (key === 'step_std_price') {
      const step_sale_price = sale_ratio
        ? +Big(value || 0)
            .times(sale_ratio)
            .toFixed(2)
        : 0
      newData.step_sale_price = step_sale_price
    } else if (key === 'step_sale_price') {
      const step_std_price = sale_ratio
        ? +Big(value || 0)
            .div(sale_ratio)
            .toFixed(2)
        : 0
      newData.step_std_price = step_std_price
    }
    const originalData = this.skuDetail.step_price_table[index]
    this.skuDetail.step_price_table[index] = { ...originalData, ...newData }
  }

  /**
   * obj 格式 {name: value}
   */
  @action
  changeCleanFoodInfo(obj) {
    this.skuDetail = Object.assign({}, this.skuDetail, {
      clean_food_info: Object.assign({}, this.skuDetail.clean_food_info, obj),
    })
  }

  /**
   * obj 格式 {name: value}
   */
  @action
  changePurchaseSpecInfo(obj) {
    this.purchaseSpecInfo = Object.assign({}, this.purchaseSpecInfo, obj)
  }

  /**
   * 拉取采购规格列表
   * @param spu_id string
   * @param supplier_id string 供应商id
   * @param fee_type string 货币类型
   */
  @action
  getPurchaseSpecList(spu_id, supplier_id, fee_type) {
    // 供应商id为选填

    if (!spu_id) return Promise.reject(new Error(i18next.t('no spu_id')))

    const req = { spu_id, supplier_id, fee_type }
    // 零售 需要加上零售报价单id
    if (System.isC()) req.salemenu_id = globalStore.c_salemenu_id

    return Request('/product/sku_spec/list')
      .data(req)
      .get()
      .then((json) => {
        runInAction(() => {
          this.purchaseSpecList = json.data
        })
        return json
      })
  }

  @action
  getIngredientSkuList(sku_id, q) {
    const req = sku_id ? { sku_id, q } : { q }
    req.limit = 1000 // 会拉取所有的销售sku和采购sku，所以限制一下
    return Request('/product/sku/ingredient/list').data(req).get()
  }

  @action
  changeIngredients(index, obj) {
    Object.assign(this.skuDetail.ingredients[index], { ...obj })
  }

  @action.bound
  addNewIngredient() {
    this.skuDetail.ingredients.push(initIngredient)
  }

  @action
  deleteIngredient(index) {
    this.skuDetail.ingredients.splice(index, 1)

    if (this.skuDetail.ingredients.length === 0) {
      this.skuDetail.ingredients.push(initIngredient)
    }
  }

  @action
  getTurnOverList() {
    return Request('/station/turnover/simple_list').data().get()
  }

  @action
  removeNewSku() {
    this.skuList = _.slice(this.skuList, 1)
  }

  @action
  createPurchaseSpec(data) {
    return Request('/purchase_spec/create').data(data).post()
  }

  @action
  init() {
    this.skuList = [initSkuDetail()]
    // 当前所点击的sku index，新增时为0
    this.activeIndex = 0
    // 当前所点击sku 详情
    this.skuDetail = initSkuDetail()
    // 新建采购规格信息
    this.purchaseSpecInfo = initPurchaseSpecInfo
    // spuid和supplierid可以选择的采购规格列表
    this.purchaseSpecList = []
    // sku 卡片 列表
    this.skuListCard = []
  }

  @action
  changeSkuListCard() {
    const {
      sku_name,
      sale_unit_name,
      sale_ratio,
      std_unit_name_forsale,
      salemenu_name,
    } = this.skuDetail
    const sale_spec =
      '(' + sale_ratio + std_unit_name_forsale + '/' + sale_unit_name + ')'

    this.skuListCard[this.activeIndex] = {
      title: sku_name,
      info: System.isC() ? sale_spec : sale_spec + '(' + salemenu_name + ')',
    }
  }

  @action
  copyNowSkuCardDetail(obj) {
    const {
      sale_ratio,
      sale_unit_name,
      salemenu_id,
      fee_type,
      clean_food,
    } = this.skuDetail
    this.nowSkuCardDetail = {
      sale_ratio,
      sale_unit_name,
      salemenu_id,
      fee_type,
      clean_food,
    }
  }

  /**
   * 工艺信息 修改出成率参考值
   */
  @action
  changeCraftRefType(type) {
    this.craftRefType = type
  }

  /**
   * 清空该行数据
   * @param {number} index 待清空index
   */
  @action clearIngredientByIndex(index) {
    this.skuDetail.ingredients[index] = { ...initIngredient }
  }

  /**
   * 获取物料出成率
   * @param {array} req ids list
   */
  fetchSkuPercentage(req) {
    return Request('/product/sku/percentage/get')
      .data({ ingredients: JSON.stringify(req) })
      .get()
      .then((json) => {
        runInAction(() => {
          const data = json.data
          _.each(data, () => {
            // 设置当前sku下每个物料的出成率
            _.each(this.skuDetail.ingredients, (ingredient) => {
              if (Object.keys(data).includes(ingredient.id)) {
                // 给当前物料id的数据赋值
                ingredient.ingredientRatioData = {
                  1: data[ingredient.id].week,
                  2: data[ingredient.id].half_month,
                  3: data[ingredient.id].month,
                }
              }
            })
          })
        })

        return json
      })
  }

  /**
   * 获取当前sku下所有物料出成率
   */
  fetchAllMaterialPercentage(index) {
    const ingredientIdList = []

    _.each(this.skuList[index].ingredients, (ingredient) => {
      ingredientIdList.push(ingredient.id)
    })

    return this.fetchSkuPercentage(ingredientIdList)
  }
}

export default new SkuDetailStore()
