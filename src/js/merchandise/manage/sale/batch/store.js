import { observable, action, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import Big from 'big.js'
import { System } from '../../../../common/service'

const initCategories = {
  loading: true,
  spuList: [],
  spuIdList: [],
}

class MerchandiseBtachCreateStore {
  @observable categories = { ...initCategories }
  @observable saleSpuList = []
  @observable salemenuList = []
  @observable salemenuList = []
  @observable supplierList = []
  @observable allSupplierMap = {}

  @action
  setLoading(loading = true) {
    this.categories.loading = loading
  }

  @action
  fetchAllSupplier() {
    return Request('/stock/settle_supplier/get')
      .data({ fetch_merchandise: 1 })
      .get()
      .then(
        action((json) => {
          // 转换下，和 product/batchsku/details 一致
          const map = {}
          const list = []

          _.each((json.data[0] && json.data[0].settle_suppliers) || [], (v) => {
            const item = {
              text: v.name,
              value: v._id,
              merchandise: v.merchandise,
            }

            list.push(item)

            map[v._id] = item

            this.allSupplierMap = map
            this.allSupplier = list
          })
        }),
      )
  }

  @action
  getTree() {
    Request('/merchandise/get_tree')
      .get()
      .then((json) => {
        runInAction(() => {
          this.categories = {
            ...this.categories,
            loading: false,
            spuList: json.data,
          }
        })
      })
  }

  @action
  setSpuIdList(idList = []) {
    this.categories.spuIdList = idList
  }

  @action
  getBatchSkuList(data) {
    if (System.isC()) data.is_retail_interface = 1
    return Request('/product/batchsku/details')
      .data(data)
      .timeout(60000)
      .post()
      .then((json) => {
        runInAction(() => {
          _.forEach(json.data, (val) => {
            val.is_price_timing = 0
            val.sale_price = Big(val.sale_price).div(100).toFixed(2)
            val.sale_ratio =
              val.sale_unit_name === val.std_unit_name_forsale &&
              val.ratio === 1
                ? 1
                : 2

            // 默认一个供应商
            val.supplier_id = val.supplier_id || null
            val.supplier_name = val.supplier_name || null
          })
          this.saleSpuList = json.data
        })
      })
  }

  @action
  changeSpuListInfo(field, value, index) {
    this.saleSpuList[index][field] = value
  }

  @action
  deleteSpu(index) {
    this.saleSpuList.splice(index, 1)
  }

  @action
  batchCreateSpu(data) {
    if (System.isC()) data.is_retail_interface = 1
    return Request('/product/batchsku/create').data(data).post()
  }

  @action
  batchChangeStatus(field, value) {
    _.forEach(this.saleSpuList, (saleInfo) => {
      saleInfo[field] = value
    })
  }

  @action
  getSaleMenuList(data) {
    return Request('/salemenu/list')
      .data(data)
      .get()
      .then(
        action((json) => {
          this.salemenuList = _.map(json.data, (v) => ({
            text: v.name,
            value: v.id,
            ..._.omit(v, ['name', 'id']),
          }))
          return json
        }),
      )
  }

  @action
  getSupplierList(search_text) {
    return Request('/supplier/merchandise_search')
      .data({ search_text })
      .get()
      .then(
        action((json) => {
          this.supplierList = _.map(json.data, (item) => {
            return {
              text: item.name,
              value: item.id,
            }
          })
          return json
        }),
      )
  }
}

export default new MerchandiseBtachCreateStore()
