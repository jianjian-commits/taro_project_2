import { i18next } from 'gm-i18n'
import { observable, action, runInAction, computed } from 'mobx'
import { Request } from '@gm-common/request'
import {
  getQueryFilter,
  getBatchFilter,
  priceDateList,
  transformList,
} from './util'
import { pennyToYuan, getOverSuggestPrice } from '../../../util'
import moment from 'moment'
import { System } from '../../../../common/service'
import _ from 'lodash'
import Big from 'big.js'
import globalStore from 'stores/global'
import { Tip, Storage } from '@gmfe/react'

const ROOT_KEY = 'list_sort_type_merchandise_manage_sale_list'
const sortItem = Storage.get(ROOT_KEY)

const initFilter = {
  categoryFilter: {
    category1_ids: [],
    category2_ids: [],
    pinlei_ids: [],
  },
  text: '',
  state: '-1',
  has_images: -1, // 是否有图 -1-全部 0-关闭 1-开启
  is_price_timing: -1, // 是否时价 -1-全部 1-已激活
  formula: -1, // -1-全部 0-关闭 1-开启
  sort_direction: sortItem ? sortItem.sort_direction : null,
  sort_by: sortItem ? sortItem.sort_by : null,
  is_clean_food: -1, // 是否开启加工，-1-全部 0-关闭 1-开启
  process_label_id: 0, // 商品加工标签， 0-全部，1-无
}
const initPagination = {
  count: 0,
  offset: 0,
  limit: 10,
}

const initPriceModal = {
  sku_id: '',
  start_time: moment().subtract(6, 'days').format('YYYY-MM-DD'),
  end_time: moment().format('YYYY-MM-DD'),
  dateSelected: 7,
  priceList: [],
}

class SaleListFilterStore {
  @observable doFirstRequest = _.noop()

  @observable filter = initFilter

  @observable list = []

  @observable isSelectAllPage = false

  @observable selectedList = []

  @observable pagination = initPagination

  @observable priceModal = initPriceModal

  // 智能定价
  @observable smartPriceFilter = {
    // 不止限于以下几项
    price_type: 0,
    cal_type: 0,
    cal_num: 0,
  }

  @observable smartPriceData = []

  @observable smartPricePagination = Object.assign({}, initPagination, {
    limit: 20,
  })

  @observable step_price_table = []

  setDoFirstRequest(func) {
    // doFirstRequest有ManagePagination提供
    this.doFirstRequest = func
  }

  @action
  changeFilter(name, value) {
    this.filter[name] = value
  }

  @action
  getSaleList(id, pagination = initPagination) {
    const { sort_by, sort_direction } = this.filter
    let params = getQueryFilter(this.filter, id)
    params = Object.assign({}, params, {
      offset: pagination.offset,
      limit: pagination.limit,
      is_salemenu_used: 1,
    })

    if (sort_by && sort_direction) {
      params = Object.assign({}, params, {
        sort_by,
        sort_direction,
      })
    }
    if (System.isC()) params.is_retail_interface = 1

    return Request('/product/sku_salemenu/list')
      .data(params)
      .get()
      .then((json) => {
        runInAction(() => {
          this.list = _.map(json.data, (v, i) => {
            v.std_sale_price_forsale = Big(v.std_sale_price_forsale)
              .div(100)
              .toFixed(2)
            v.sale_price = Big(v.sale_price).div(100).toFixed(2)
            if (v.formula_info)
              v.formula_info.cal_num = Big(v.formula_info.cal_num)
                .div(100)
                .toFixed(2)

            return { ...v, _skuId: i }
          })
          this.pagination = json.pagination
          this.isSelectAllPage = false
          this.selectedList = []
        })
        return json
      })
  }

  initStepPriceTable(value) {
    this.step_price_table = _.map(value, (e) => {
      return {
        ...e,
        step_sale_price: Big(e.step_sale_price).div(100).toFixed(2),
        step_std_price: Big(e.step_std_price).div(100).toFixed(2),
      }
    })
  }

  changeTieredPrice(listIndex, index, key, value) {
    const sale_ratio = this.list[listIndex].sale_ratio
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
  initFilter() {
    this.filter = initFilter
  }

  @action
  export(id, export_fields, type) {
    const filterParams = getQueryFilter(this.filter, id)
    const params = {
      export_fields,
      ...filterParams,
      salemenu_ids: JSON.stringify([filterParams.salemenu_id]),
      q: filterParams.text,
      export_by_salemenu: 1,
      category_sort: type,
    }
    if (System.isC()) params.is_retail_interface = 1
    // window.open(`/product/sku_salemenu/list?${urlToParams(params)}`)
    return Request('/product/sku/export')
      .data(_.omit(params, ['salemenu_id', 'text']))
      .get()
  }

  @action
  onSelectSku(selected) {
    this.isSelectAllPage = false
    this.selectedList = selected
  }

  @action
  toggleSelectAllSku(isSelectAll) {
    if (isSelectAll) {
      this.selectedList = _.map(this.list, (v) => v.sku_id)
    } else {
      this.selectedList = []
    }
  }

  @action
  toggleIsSelectAllPage(bool) {
    this.isSelectAllPage = bool
    if (bool) {
      this.selectedList = _.map(this.list, (v) => v.sku_id)
    }
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
  updateSku(name, value, sku_id, flag) {
    const data = {
      id: sku_id,
      [name === 'sku_name' ? 'name' : name]: _.includes(
        ['std_sale_price_forsale', 'sale_price'],
        name,
      )
        ? Big(value).times(100).toFixed(0)
        : value,
    }
    if (name === 'step_price_table') data.is_step_price = 1
    if (flag === 'put_shelf') data.put_shelf = 1 // flag 为 put_shelf 说明是在列表操作销售状态按钮，后台需要
    if (System.isC()) data.is_retail_interface = 1
    return Request('/product/sku/update')
      .data(data)
      .post()
      .then((json) => {
        runInAction(() => {
          if (json.code === 0) {
            Tip.success(i18next.t('修改成功'))
            const list = this.list
            _.forEach(list, (v) => {
              if (v.sku_id === sku_id) {
                v[name] = value
                // 联动修改其他数据
                if (name === 'std_sale_price_forsale') {
                  if (globalStore.otherInfo.showSuggestPrice) {
                    // 如果修改了销售单价，且开了建议定价区间，则判断所改价格是否在建议定价区间内
                    v.over_suggest_price = getOverSuggestPrice(
                      value,
                      v.suggest_price_min,
                      v.suggest_price_max,
                    )
                  }
                  v.sale_price = Big(value).times(v.sale_ratio).toFixed(2)
                } else if (name === 'sale_price') {
                  const price = Big(value || 0)
                    .div(v.sale_ratio)
                    .toFixed(2)
                  if (globalStore.otherInfo.showSuggestPrice) {
                    // 如果修改了销售价，且开了建议定价区间，则判断所对应的销售单价是否在建议定价区间内
                    v.over_suggest_price = getOverSuggestPrice(
                      price,
                      v.suggest_price_min,
                      v.suggest_price_max,
                    )
                  }

                  v.std_sale_price_forsale = price
                } else if (name === 'step_price_table') {
                  v.step_price_table = JSON.parse(value)
                }
              }
            })
            this.list = list
          }
        })
      })
  }

  @action
  sort(name) {
    const { sort_direction, sort_by } = this.filter
    let direction = 'asc'
    this.filter.sort_by = name
    if (!sort_direction || (sort_by === name && sort_direction === 'desc')) {
      direction = 'asc'
    } else {
      direction = 'desc'
    }

    this.filter.sort_direction = direction
    Storage.set(ROOT_KEY, { sort_by: name, sort_direction: direction })
  }

  @action
  batchUpload(file, stationId, salemenuId) {
    const url = `/station/skuproducts/import/${stationId}/${salemenuId}/sku/`
    return Request(url, { timeout: 60000 })
      .data({
        import_file: file,
        is_retail_interface: System.isC() ? 1 : null,
        async: 1,
      })
      .post()
  }

  collectSmartPriceListParams(id, info) {
    const { price_region_min, price_region_max, cal_num, formula_type } = info
    let params = getBatchFilter(
      this.filter,
      this.isSelectAllPage,
      this.selectedList,
      id,
    )

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
   * @param id {string} 报价单id
   * @param info {Object}
   */
  @action
  editSmartPriceNext(id, info) {
    const params = this.collectSmartPriceListParams(id, info)

    return Request('/product/sku/smart_pricing/list')
      .data(params)
      .post()
      .then((json) => {
        runInAction(() => {
          // 记录请求信息和返回的sku_list 二次确认页面需要
          this.smartPriceFilter = params
          this.smartPriceData = json.data
          this.smartPricePagination = json.pagination
        })
        return json
      })
  }

  @action
  importSku(data) {
    if (System.isC()) data.is_retail_interface = 1
    return Request('/product/sku/import', {
      timeout: 30000,
    })
      .data(data)
      .post()
  }

  /**
   * 设置定价公式
   * @param salemenu_id {string} 报价单id
   * @param info {Object} 定价公式详情
   */
  @action
  batchSaveFormulaSetting(salemenu_id, info) {
    let data = getBatchFilter(
      this.filter,
      this.isSelectAllPage,
      this.selectedList,
      salemenu_id,
    )
    data = Object.assign({}, data, {
      ...info,
      price_region_min: pennyToYuan(info.price_region_min),
      price_region_max: pennyToYuan(info.price_region_max),
      cal_num: pennyToYuan(info.cal_num),
    })
    return Request('/product/sku/smart_formula_pricing/update')
      .data(data)
      .post()
  }

  /**
   * 设置定价公式
   * @param sku_id {string} sku_id
   * @param info {{formulaStatus:boolean,formulaText:string}} 定价公式详情
   */
  @action
  saveFormulaSetting(sku_id, info) {
    const data = {
      all: 0,
      sku_list: JSON.stringify([sku_id]),
      formula_status: +info.formulaStatus,
      formula_text: info.formulaText,
    }
    return Request('/product/sku/smart_formula_pricing/update')
      .data(data)
      .post()
  }

  /**
   * 批量删除sku
   * 商品库和报价单共用一个接口，search_from区分： 1-报价单 2-商品库
   * @param salemenu_id {string} 报价单id
   */
  @action
  batchDeleteSku(salemenu_id) {
    const data = getBatchFilter(
      this.filter,
      this.isSelectAllPage,
      this.selectedList,
      salemenu_id,
    )
    data.search_from = 1
    if (System.isC()) data.is_retail_interface = 1

    return Request('/product/sku/batch_delete').data(data).post()
  }

  /**
   * 批量上架、下架、设置库存
   * 商品库和报价单共用一个接口，search_from区分： 1-报价单 2-商品库
   */
  batchUpdateSku(salemenu_id, params) {
    const data = getBatchFilter(
      this.filter,
      this.isSelectAllPage,
      this.selectedList,
      salemenu_id,
    )
    data.search_from = 1
    data.update_data = JSON.stringify({ ...params })
    return Request('/product/sku/batch/update').data(data).post()
  }

  @action
  updateTechnic(data) {
    return Request('/product/sku/technic_import').data(data).post()
  }

  @action
  getTechnicTemp(data) {
    return Request('/product/sku/technic_export').data(data).get()
  }

  @action
  initPriceModalData() {
    this.priceModal = initPriceModal
  }

  @action
  setSelectedPriceModalDate(v) {
    this.priceModal.dateSelected = v
  }

  @action
  setPriceModal(data) {
    this.priceModal = Object.assign(this.priceModal, data)
  }

  // 获取商品历史报价
  @action
  getSkuHistoryPriceList() {
    const { sku_id, dateSelected } = this.priceModal
    const { start_time, end_time } = priceDateList[dateSelected]
    const params = {
      sku_ids: JSON.stringify([sku_id]),
      start_time: moment(start_time).format('YYYY-MM-DD HH:mm:ss'),
      end_time: moment(end_time).add(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
      is_filter: 1, // 按字段去重
    }

    return Request('/product/sku_snapshot/detail')
      .data(params)
      .get()
      .then(
        action((json) => {
          // 产品说要默认一个空item的样式
          const empty = {
            modify_time: moment(start_time).format('YYYY-MM-DD'),
            next_modify_time: moment(end_time).format('YYYY-MM-DD'),
          }
          // 图表数据
          this.priceModal.priceList = json.data.length
            ? transformList({
                dateSelected,
                data: json.data,
                start_time,
                end_time,
              })
            : [empty]
          // 获取到数据后，更新图表区间
          this.priceModal.start_time = start_time
          this.priceModal.end_time = end_time
          return json
        }),
      )
  }

  @computed
  get maxPrice() {
    const list = _.sortBy(this.priceModal.priceList, (v) => _.toNumber(v.price))
    return _.last(list)?.price || 0
  }

  @computed
  get minPrice() {
    const list = _.sortBy(this.priceModal.priceList, (v) => _.toNumber(v.price))
    return _.head(list)?.price || 0
  }

  @computed
  get averagePrice() {
    const { priceList } = this.priceModal
    const sum = _.reduce(priceList, (res, v) => res + _.toNumber(v.price), 0)

    // 图表无数据
    if (priceList.length === 0) {
      return 0
    }

    return Big(sum).div(priceList.length).toFixed(2)
  }
}

export default new SaleListFilterStore()
