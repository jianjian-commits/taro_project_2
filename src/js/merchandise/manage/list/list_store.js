import React from 'react'
import { i18next } from 'gm-i18n'
import { Tip, Storage } from '@gmfe/react'
import { observable, action, runInAction, autorun, computed } from 'mobx'
import { Request } from '@gm-common/request'
import { getActiveSkus, getBatchSkuFilter, getBatchSpuFilter } from './util'
import { getQueryFilterForList } from '../util'
import Big from 'big.js'
import _ from 'lodash'
import globalStore from '../../../stores/global'
import { pennyToYuan, getOverSuggestPrice } from '../../util'
import { System } from 'common/service'

const ROOT_KEY = 'list_sort_type_merchandise_manage_list'
const sortItem = Storage.get(ROOT_KEY)

const initFilter = {
  categoryFilter: {
    category1_ids: [],
    category2_ids: [],
    pinlei_ids: [],
  },
  query: '',
  salemenu_ids: [],
  has_images: -1, // 是否有图 -1-全部 0-关闭 1-开启
  is_price_timing: -1, // 是否时价 -1-全部 1-已激活
  formula: -1, // -1-全部 0-关闭 1-开启
  salemenu_is_active: -1, // -1-全部 1-已激活
  sort_direction: sortItem ? sortItem.sort_direction : null,
  sort_by: sortItem ? sortItem.sort_by : null,
  is_clean_food: -1, // -1-全部 0-关闭 1-开启
  process_label_id: 0, // 商品加工标签， 0-全部，1-无
}

const initPagination = {
  count: 0,
  offset: 0,
  limit: 10,
}

class MerchandiseListStore {
  @observable doFirstRequest = _.noop()
  @observable doCurrentRequest = _.noop()

  // 更多功能的 ref。 目前给 引导用
  @observable refMoreAction = React.createRef()

  @observable filter = initFilter

  @observable pagination = initPagination

  @observable list = []

  // 是否全选了所有页
  @observable isSelectAllPage = false

  // 所选id list「包含sku_id和spu_id」
  @observable selectedList = []

  // 所选id 树状结构
  // eslint-disable-next-line gm-react-app/no-observable-empty-object
  @observable selectedTree = {}

  // 智能定价
  @observable smartPriceFilter = {
    // 包含但不止限于以下几项
    price_type: 0,
    cal_type: 0,
    cal_num: 0,
  }

  @observable smartPriceData = []

  @observable smartPricePagination = Object.assign({}, initPagination, {
    limit: 20,
  })

  @observable checked = false

  @observable excel

  @observable pic

  @observable salemenus = []

  @observable step_price_table = [] // 阶梯价表格数据

  @computed
  get selectedSpuList() {
    return _.filter(this.selectedList, (id) => _.startsWith(id, 'C'))
  }

  @action
  setDoFirstRequest(func) {
    // doFirstRequest有ManagePagination提供
    this.doFirstRequest = func
  }

  @action
  setDoCurrentRequest(func) {
    this.doCurrentRequest = func
  }

  @action
  setRefMoreAction(ref) {
    this.refMoreAction = ref
  }

  @action setChecked(checked) {
    this.checked = checked
  }

  @action setExcel(excel) {
    this.excel = excel
  }

  @action setPic(pic) {
    this.pic = pic
  }

  @action setSalemenus(list) {
    this.salemenus = list
  }

  constructor() {
    autorun(() => {
      _.forEach(this.list, (l) => {
        l.children =
          this.filter.salemenu_is_active === 1 ? getActiveSkus(l.skus) : l.skus
      })
    })
  }

  @action
  initStepPriceTable(value) {
    this.step_price_table = _.map(value, (e) => {
      return {
        ...e,
        step_sale_price: Big(e.step_sale_price).div(100).toFixed(2),
        step_std_price: Big(e.step_std_price).div(100).toFixed(2),
      }
    })
  }

  changeTieredPrice(listIndex, sku_id, index, key, value) {
    const sku = this.list[listIndex].skus.find((e) => e.sku_id === sku_id)
    const sale_ratio = sku?.sale_ratio
    const tiered_price = this.step_price_table[index]
    if (!tiered_price) return
    if (key === 'step_sale_price') {
      const new_step_std_price = Big(value || 0)
        .div(sale_ratio)
        .toFixed(2)
      this.step_price_table[index] = {
        ...tiered_price,
        step_sale_price: value,
        step_std_price: new_step_std_price,
      }
    } else if (key === 'step_std_price') {
      const new_step_sale_price = Big(value || 0)
        .times(sale_ratio)
        .toFixed(2)
      this.step_price_table[index] = {
        ...tiered_price,
        step_sale_price: new_step_sale_price,
        step_std_price: value,
      }
    } else {
      this.step_price_table[index] = {
        ...tiered_price,
        [key]: Number(value),
      }
    }

    if (key === 'max' && index < this.step_price_table.length - 1) {
      this.step_price_table[index + 1].min = Number(value)
    }
  }

  @action
  changeFilter(name, value) {
    this.filter[name] = value
  }

  @action
  initFilter() {
    this.filter = initFilter
  }

  @action
  export(export_fields) {
    const params = {
      ...getQueryFilterForList(this.filter),
      export_fields,
      export: 1,
    }
    return Request('/product/sku/export').data(params).get()
  }

  @action
  sort(name) {
    const { sort_direction, sort_by } = this.filter
    let direction = null
    if (!sort_direction) {
      direction = 'desc'
    } else {
      if (sort_by === name) {
        direction = sort_direction === 'desc' ? 'asc' : null
      } else {
        direction = 'desc'
      }
    }

    this.filter.sort_by = name
    this.filter.sort_direction = direction

    Storage.set(ROOT_KEY, { sort_by: name, sort_direction: direction })
  }

  @action
  getMerchandiseList(page = initPagination) {
    const { sort_by, sort_direction } = this.filter
    let params = getQueryFilterForList(this.filter)
    params = Object.assign({}, params, {
      offset: page.offset,
      limit: page.limit,
      is_merchandise_used: 1,
    })

    if (sort_by && sort_direction) {
      params = Object.assign({}, params, {
        sort_by,
        sort_direction,
      })
    }
    if (System.isC()) params.is_retail_interface = 1

    return Request('/merchandise/spu/index')
      .data(params)
      .get()
      .then((json) => {
        runInAction(() => {
          const list = json.data
          _.forEach(list, (l) => {
            _.forEach(l.skus, (s) => {
              s.std_sale_price_forsale = Big(s.std_sale_price_forsale)
                .div(100)
                .toFixed(2)
              s.sale_price = Big(s.sale_price).div(100).toFixed(2)

              if (s.formula_info) {
                s.formula_info.cal_num = Big(s.formula_info.cal_num)
                  .div(100)
                  .toFixed(2)
              }
            })

            l.children = l.skus
          })
          this.pagination = json.pagination
          this.list = list
          this.selectedList = []
          this.selectedTree = {}
          this.isSelectAllPage = false
        })
        return json
      })
  }

  @action
  updateSpu(name, id, value) {
    return Request('/merchandise/spu/update')
      .data({
        id,
        name: value,
        is_retail_interface: System.isC() ? 1 : null,
      })
      .post()
      .then(
        action(() => {
          Tip.success(i18next.t('修改成功'))
          _.forEach(this.list, (v) => {
            if (v.spu_id === id) {
              v[name] = value
            }
          })
        }),
      )
  }

  transformStepPriceTable() {
    return _.map(this.step_price_table, (e) => {
      return {
        ...e,
        step_sale_price: Big(e.step_sale_price || 0)
          .times(100)
          .toFixed(0),
        step_std_price: Big(e.step_std_price || 0)
          .times(100)
          .toFixed(0),
      }
    })
  }

  @action
  changeSku(index, sku_id, name, value, flag) {
    const params = {
      id: sku_id,
      [name === 'sku_name' ? 'name' : name]: _.includes(
        ['std_sale_price_forsale', 'sale_price'],
        name,
      )
        ? Big(value).times(100).toFixed(0)
        : value,
    }
    if (name === 'step_price_table') params.is_step_price = 1
    if (System.isC()) params.is_retail_interface = 1
    if (flag === 'put_shelf') params.put_shelf = 1
    return Request('/product/sku/update')
      .data(params)
      .post()
      .then((json) => {
        runInAction(() => {
          if (json.code === 0) {
            Tip.success(i18next.t('修改成功'))

            const list = this.list
            _.forEach(list[index].skus, (s) => {
              if (s.sku_id === sku_id) {
                s[name] = value

                // 联动修改其他数据
                if (name === 'std_sale_price_forsale') {
                  if (globalStore.otherInfo.showSuggestPrice) {
                    // 如果修改了单价，且开了建议定价区间，则判断所改价格是否在建议定价区间内
                    s.over_suggest_price = getOverSuggestPrice(
                      value,
                      s.suggest_price_min,
                      s.suggest_price_max,
                    )
                  }
                  s.sale_price = Big(value).times(s.sale_ratio).toFixed(2)
                } else if (name === 'sale_price') {
                  const price = Big(value || 0)
                    .div(s.sale_ratio)
                    .toFixed(2)
                  if (globalStore.otherInfo.showSuggestPrice) {
                    // 如果修改了销售价，且开了建议定价区间，则判断所对应的单价是否在建议定价区间内
                    s.over_suggest_price = getOverSuggestPrice(
                      price,
                      s.suggest_price_min,
                      s.suggest_price_max,
                    )
                  }

                  s.std_sale_price_forsale = price
                } else if (name === 'step_price_table') {
                  s.step_price_table = JSON.parse(value)
                }
              }
            })
            this.list = list
          }
        })
        return json
      })
  }

  @action
  updateSpuImages(index, images) {
    const spu = this.list[index]
    const query = {
      id: spu.spu_id,
      images: JSON.stringify(
        _.map(images, (img) => {
          return img.id
        }),
      ),
    }

    return Request('/merchandise/spu/update').data(query).post()
  }

  collectSmartPriceListParams(info) {
    const { formula_type, price_region_min, price_region_max, cal_num } = info
    let params = getBatchSkuFilter(
      this.isSelectAllPage,
      this.selectedList,
      this.list,
      this.filter,
      true, // 返回全部数据做判断
    ) // 需要对待提交数据进行判断是否全部都是净菜，因此要返回

    let isAllCleanFood = true
    _.each(params.sku_list, (item) => {
      if (!item.clean_food) {
        isAllCleanFood = false
      }
    })

    // 全部都是净菜,需要提示，不能提交，全部页不判断
    if (params.all === 0 && isAllCleanFood) {
      Tip.warning(
        i18next.t(
          '开启加工商品暂不支持定价设置，请至少选择一个未开启加工商品规格进行定价设置',
        ),
      )
      return Promise.reject(new Error(i18next.t('不允许全部是净菜商品')))
    }

    // 提交sku_id
    params = Object.assign({}, params, {
      sku_list: JSON.stringify(_.map(params.sku_list, (v) => v.sku_id)),
    })

    if (formula_type === 1) {
      params = Object.assign({}, params, { formula_type })
    } else if (formula_type === 2) {
      params = Object.assign({}, params, {
        ...info,
        price_region_min: pennyToYuan(price_region_min),
        price_region_max: pennyToYuan(price_region_max),
        cal_num: pennyToYuan(cal_num),
      })
    } else if (formula_type === 3) {
      params = Object.assign({}, params, { formula_type })
    }
    return params
  }

  /**
   * 智能定价，下一步
   * @param info {Object}
   */
  @action
  editSmartPriceNext(info) {
    const params = this.collectSmartPriceListParams(info)

    return Request('/product/sku/smart_pricing/list')
      .data(params)
      .post()
      .then((json) => {
        runInAction(() => {
          this.smartPriceData = json.data
          this.smartPriceFilter = params
          this.smartPricePagination = json.pagination
        })
        return json
      })
  }

  /**
   * 批量设置定价公式
   * @param info {Object} 定价公式详情
   */
  @action
  batchSaveFormulaSetting(info) {
    const { price_region_min, price_region_max, cal_num } = info
    let params = getBatchSkuFilter(
      this.isSelectAllPage,
      this.selectedList,
      this.list,
      this.filter,
      true, // 返回全部数据做判断
    )

    let isAllCleanFood = true
    _.each(params.sku_list, (item) => {
      if (!item.clean_food) {
        isAllCleanFood = false
      }
    })

    // 全部都是净菜,需要提示，不能提交，全部页不判断
    if (params.all === 0 && isAllCleanFood) {
      Tip.warning(
        i18next.t(
          '开启加工商品暂不支持定价设置，请至少选择一个未开启加工商品规格进行定价设置',
        ),
      )
      return Promise.reject(new Error(i18next.t('不允许全部是净菜商品')))
    }

    params = Object.assign({}, params, {
      ...info,
      price_region_min: pennyToYuan(price_region_min),
      price_region_max: pennyToYuan(price_region_max),
      cal_num: pennyToYuan(cal_num),
      sku_list: JSON.stringify(_.map(params.sku_list, (v) => v.sku_id)), // 提交sku_id
    })
    return Request('/product/sku/smart_formula_pricing/update')
      .data(params)
      .post()
  }

  /**
   * 单个设置定价公式
   * @param info {{formulaStatus:boolean,formulaText:string}} 定价公式详情
   * @param sku_id {String} sku_id
   */
  @action
  saveFormulaSetting(info, sku_id) {
    const params = {
      all: 0,
      sku_list: JSON.stringify([sku_id]),
      formula_status: +info.formulaStatus,
      formula_text: info.formulaText,
    }
    return Request('/product/sku/smart_formula_pricing/update')
      .data(params)
      .post()
  }

  @action
  batchDeleteSpu() {
    const params = getBatchSpuFilter(
      this.isSelectAllPage,
      this.list,
      this.filter,
      this.selectedList,
    )
    if (System.isC()) params.is_retail_interface = 1
    return Request('/merchandise/spu/batch_delete').data(params).post()
  }

  /**
   * 批量删除sku
   * 报价单和商品库的批量删除sku，后台共用一个接口，search_from区分： 1-报价单 2-商品库
   */
  @action
  batchDeleteSku() {
    const params = getBatchSkuFilter(
      this.isSelectAllPage,
      this.selectedList,
      this.list,
      this.filter,
    )
    params.search_from = 2
    if (System.isC()) params.is_retail_interface = 1
    return Request('/product/sku/batch_delete').data(params).post()
  }

  /**
   * 批量上架、下架、设置库存
   * 报价单和商品库后台共用一个接口，search_from区分： 1-报价单 2-商品库
   */
  batchUpdateSku(params) {
    const data = getBatchSkuFilter(
      this.isSelectAllPage,
      this.selectedList,
      this.list,
      this.filter,
    )
    data.search_from = 2
    data.update_data = JSON.stringify(params)
    return Request('/product/sku/batch/update').data(data).post()
  }

  batchAsyncSpuImage() {
    const params = getBatchSkuFilter(
      this.isSelectAllPage,
      this.selectedList,
      this.list,
      this.filter,
    )
    params.search_from = 2
    return Request('/product/sku/batch/sync_image_from_spu').data(params).post()
  }

  /**
   * 批量设置投框方式
   */
  @action
  batchUpdateDispatchMedthod(params) {
    const { filter, isSelectAllPage, setSelected, selectedList } = this
    let query
    if (isSelectAllPage) {
      query = getQueryFilterForList(filter)
    } else {
      query = {
        spu_ids: JSON.stringify(
          selectedList.slice().filter((id) => id[0] === 'C'),
        ),
      }
    }
    query.update_dict = JSON.stringify(params)
    return Request('/merchandise/spu/bulk_update')
      .data(query)
      .post()
      .finally(() => setSelected([], []))
  }

  @action
  batchUpload(import_file) {
    // toc的批量修改商品（导入)多加两个字段标识 -- export_type为2标识toc
    const { salemenu_ids } = this.filter
    const salemenu_id = _.map(salemenu_ids, (v) => v.id)[0]
    const export_type = 2
    let data = { import_file }

    if (System.isC()) {
      data = {
        ...data,
        salemenu_id,
        export_type,
        is_retail_interface: 1,
      }
    }

    return Request('/product/sku/batch_import_update/async').data(data).post()
  }

  @action
  toggleIsSelectAllPage(bool) {
    this.isSelectAllPage = bool
  }

  @action
  setSelected = (selected, selectedTree) => {
    this.selectedList = selected
    this.selectedTree = selectedTree
    this.isSelectAllPage = false
  }

  // 分拣模块
  @observable pickType = 1
  @action
  setPickType = (v) => (this.pickType = v)
}

export default new MerchandiseListStore()
