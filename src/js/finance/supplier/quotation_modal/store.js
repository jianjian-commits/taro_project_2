import { observable, action, computed } from 'mobx'
import { Request } from '@gm-common/request'
import Big from 'big.js'
import _ from 'lodash'
import moment from 'moment'

const initReqData = {
  purchase_unit_price: 0,
  std_unit_price: 0,
  remark: '',
  origin_place: '',
}

class QuotationStore {
  @observable supplierFetchByCategory2 = []

  // 供应商列表按二级分类分组
  @observable purchase_spec = {
    purchase_unit: '',
    std_unit: '',
    name: '',
    id: '',
    last_quoted_price: '',
    ratio: 1,
    last_quoted_detail: [],
  }

  @observable activeRow = -1

  // eslint-disable-next-line gmfe/no-observable-empty-object
  @observable reqData = {}

  @computed
  get invalidData() {
    const { purchase_unit_price, std_unit_price } = this.reqData
    return {
      purchase_unit_price: !purchase_unit_price,
      std_unit_price: !std_unit_price,
      all: !purchase_unit_price || !std_unit_price,
    }
  }

  @computed
  get sheetArray() {
    // last_quoted_detail 和 supplierFetchByCategory2 数据结合
    return this.supplierFetchByCategory2.map((val) => {
      const { last_quoted_detail = [], id: spec_id } = this.purchase_spec
      const lastQuoted =
        last_quoted_detail.find((v) => v.supplier_id === val.supplier_id) || {}

      const {
        purchase_price,
        price,
        remark,
        origin_place,
        time,
        quoted_from_supplier,
      } = lastQuoted

      return {
        spec_id,
        settle_supplier_id: val.supplier_id,
        customer_id: val.customer_id,
        name: val.name,
        purchase_unit_price: _.isNumber(purchase_price)
          ? Big(purchase_price).div(100).toFixed(2)
          : '',
        std_unit_price: _.isNumber(price) ? Big(price).div(100).toFixed(2) : '',
        origin_place: origin_place || '',
        remark: remark || '',
        last_time: time && moment(time).format('YYYY-MM-DD HH:mm:ss'),
        quoted_from_supplier,
      }
    })
  }

  @action
  init(purchase_spec) {
    this.purchase_spec = purchase_spec
    this.activeRow = -1
  }

  @action
  setActiveRow(index) {
    this.reqData = this.sheetArray[index] || initReqData
    this.activeRow = index
  }

  @action
  reqDataChange(field, val) {
    const { ratio } = this.purchase_spec

    if (field === 'purchase_unit_price') {
      this.reqData.std_unit_price = Number(
        Big(val || 0)
          .div(ratio)
          .toFixed(2),
      )
    } else if (field === 'std_unit_price') {
      this.reqData.purchase_unit_price = Number(
        Big(val || 0)
          .times(ratio)
          .toFixed(2),
      )
    }

    this.reqData[field] = val
  }

  @action
  async getSupplier() {
    const { category_2 } = this.purchase_spec
    const req = {
      category_id_2: category_2,
      limit: 200,
      offset: 0,
    }
    const json = await Request('/supplier/search').data(req).get()
    this.supplierFetchByCategory2 = json.data
  }

  @action.bound
  async sendReqData() {
    const { id } = this.purchase_spec
    const {
      settle_supplier_id,
      origin_place,
      remark,
      purchase_unit_price,
    } = this.reqData

    const req = {
      spec_id: id, // 采购规格id
      settle_supplier_id,
      purchase_price: Big(purchase_unit_price).times(100),
      origin_place: origin_place || null,
      remark: remark || null,
    }
    const json = await Request('/purchase/quote_price/edit').data(req).post()
    if (json.code === 0) {
      // 成功后再次拉取该采购规格的信息
      const {
        data: { purchase_spec },
      } = await Request('/purchase_spec/search').data({ search_text: id }).get()
      this.purchase_spec = purchase_spec[0]
      this.activeRow = -1
      return purchase_spec
    }
  }
}

export default new QuotationStore()
