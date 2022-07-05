import { observable, action, autorun } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import _ from 'lodash'
import Big from 'big.js'
// import { t } from 'gm-i18n'

import { getSomeByChange } from '../util'
import globalStore from '../../stores/global'

const searchCache = {}

function getInitDetailItem() {
  return {
    id: null,
    quantity: null,
    unit_price: null,
    money: null,
    batch_number: null,
    remain: null,
    different_price: null,
    operator: globalStore.user.name,
    spu_remark: null, // 商品退货备注

    name: null,
    category: null,
    spu_id: null,
    std_unit: null,
    tax_rate: null,
    tax_money: null,
    return_money_no_tax: null,
  }
}

class Store {
  @observable
  loading = false

  @observable
  data = {
    batch_number: null,
    creator: null,
    date_time: null,
    delta_money: null,
    return_sheet_remark: '',
    details: [getInitDetailItem()], // 注意，设置 details 的时候请用 details[index] = {...item}
    discount: [],
    id: null,
    settle_supplier: null,
    sku_money: null,
    station_id: null,
    status: null,
    submit_time: new Date(),
    supplier_name: null,
    type: null,
    is_frozen: false, // 为true则为冻结，false为不冻结
  }

  @observable
  batchList = []

  @observable
  selectedBatchNum = []

  @observable
  settleSupplierList = []

  constructor() {
    /**
     * 自动计算商品金额
     */
    autorun(() => {
      // 计算商品金额，默认保留两位小数
      this.data.sku_money = (
        _.reduce(
          _.map(this.data.details, (item) => item.money || 0),
          (sum, n) => sum + n,
        ) || 0
      ).toFixed(2)
      // 计算折让金额，默认保留两位小数
      this.data.delta_money = (
        _.reduce(
          _.map(this.data.discount, (item) =>
            item.action === '1' ? Number(item.money) : -Number(item.money),
          ),
          (sum, n) => sum + n,
        ) || 0
      ).toFixed(2)
    })
  }

  @action
  fetchData(id) {
    this.loading = true
    return Request('/stock/return_stock_sheet/detail')
      .data({ id })
      .get()
      .then(
        action((json) => {
          const settle_supplier = this.settleSupplierList.find(
            (item) => item.value === json.data.settle_supplier_id,
          )
          this.data = { settle_supplier, ...json.data }

          // money 是字符串，需要转下
          _.each(this.data.details, (data) => {
            data.money = parseFloat(data.money)
          })

          if (this.data.details.length === 0) {
            // 还是不能偷懒
            this.data.details.push(getInitDetailItem())
          }

          return json
        }),
      )
      .finally(() => {
        this.loading = false
      })
  }

  @action
  fetchSettleSupplierList = () => {
    return Request('/stock/settle_supplier/get')
      .get()
      .then(({ data }) => {
        this.settleSupplierList =
          data?.[0].settle_suppliers.map((item) => ({
            value: item.settle_supplier_id,
            text: item.name,
          })) ?? []
      })
  }

  @action
  searchSkuList(name) {
    if (searchCache[name]) {
      return Promise.resolve(searchCache[name])
    }

    return Request('/stock/in_stock_sku/supply_sku_new')
      .data({
        name,
        settle_supplier_id: this.data.settle_supplier.value,
      })
      .get()
      .then((json) => {
        return json
      })
  }

  //  todo
  @action
  fetchSkuList(name) {
    return Request('/stock/in_stock_sku/supply_sku_new')
      .data({
        name,
        settle_supplier_id: this.data.settle_supplier.value,
      })
      .get()
      .then((json) => {
        return json
      })
  }

  @action
  setData(field, value) {
    this.data[field] = value
  }

  @action
  postData(is_submit, details, type) {
    const { settle_supplier, ...rest } = this.data
    return Request(`/stock/return_stock_sheet/${type}`)
      .data({
        ...rest,
        settle_supplier_id: settle_supplier.value,
        supplier_name: settle_supplier.text,
        details: JSON.stringify(details),
        discount: JSON.stringify(this.data.discount),
        is_submit,
      })
      .post()
  }

  @action
  addDetail(index) {
    if (index !== undefined) {
      this.data.details.splice(index + 1, 0, getInitDetailItem())
    } else {
      this.data.details.push(getInitDetailItem())
    }
  }

  @action
  removeDetail(index) {
    this.data.details.splice(index, 1)
  }

  @action
  setDetail(index, field, value) {
    const item = this.data.details[index]

    // 先赋值
    item[field] = value

    if (field === 'quantity' || field === 'unit_price' || field === 'money') {
      Object.assign(item, getSomeByChange(item, field))
    }
    if (item.money !== null) {
      item.return_money_no_tax = Big(item.money)
        .div(
          Big(item.tax_rate || 0)
            .div(10000)
            .plus(1),
        )
        .toFixed(2)
      item.tax_money = Big(item.money || 0)
        .times(Big(item.tax_rate || 0).div(10000))
        .div(
          Big(item.tax_rate || 0)
            .div(10000)
            .plus(1),
        )
        .toFixed(2)
    }

    // 还是不能偷懒
    // this.data.details[index] = { ...item }
  }

  @action
  setDetailBatch(index, data) {
    let newData = data

    if (globalStore.user.stock_method === 2) {
      Object.assign(this.data.details[index], newData)
      return
    }

    // 加权平均 选择商品后需要拉取商品的库存均价，设置为退货单价
    return Request('/stock/list')
      .data({ limit: 10, offset: 0, text: data.spu_id })
      .get()
      .then((json) => {
        let price = null
        if (json.data && json.data.length) {
          price = _.toNumber(Big(json.data[0].avg_price).div(100).toFixed(2))
        }
        newData = {
          ...data,
          unit_price: price,
        }
        Object.assign(this.data.details[index], newData)
      })
  }

  @action
  addDiscount(discount) {
    this.data.discount.push({
      ...discount,
      operate_time: moment(new Date()).format('YYYY-MM-DD'),
      creator: this.data.creator,
    })
  }

  @action
  removeDiscount(index) {
    this.data.discount.splice(index, 1)
  }

  @action
  fetchBatch(data) {
    return Request('/stock/get_batch_return')
      .data(data)
      .get()
      .then(
        action((json) => {
          this.batchList = json.data
        }),
      )
  }

  @action
  postCancel(id) {
    Request('/stock/return_stock_sheet/cancel').data({ id }).post()
  }

  @action
  setSelectedBatchNum(selected) {
    this.selectedBatchNum = selected
  }
}

export default new Store()
