import moment from 'moment'
import { action, computed, observable } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'

const date = moment().startOf('day')

const initFilter = {
  begin_time: date,
  end_time: date,
  q: '',
  status: 0,
}

const initDetail = {
  sheet_no: '',
  status: '',
  creator: '',
  submit_time: '-',
  details: [],
}

class AdjustmentSheet {
  @observable filter = { ...initFilter }

  @observable list = []

  @observable skuList = [] // 可调整商品列表

  @observable detail = { ...initDetail }

  @observable BatchList = []

  @action
  initList() {
    this.filter = { ...initFilter }
    this.list = []
  }

  @action
  initDetail() {
    this.detail = { ...initDetail }
  }

  @action
  setFilter(field, value) {
    this.filter[field] = value
  }

  @action
  setFilterDate(begin, end) {
    this.filter.begin_time = begin
    this.filter.end_time = end
  }

  @computed
  get getFilterParam() {
    const { begin_time, end_time, status, q } = this.filter
    const params = {
      begin_time: moment(begin_time).format('YYYY-MM-DD'),
      end_time: moment(end_time).format('YYYY-MM-DD'),
    }

    if (status !== 0) {
      params.status = status
    }

    if (q) {
      params.q = q
    }
    return params
  }

  // 搜索调整单列表
  @action
  fetchData(pagination = {}) {
    const params = {
      ...this.getFilterParam,
      ...pagination,
    }
    return Request('/stock/in_stock_adjust_sheet/list')
      .data(params)
      .get()
      .then(
        action((json) => {
          this.list = json.data
          return json
        })
      )
  }

  // 调整单详情
  @action
  getDetail(id) {
    return Request('/stock/in_stock_adjust_sheet/detail')
      .data({ sheet_no: id })
      .get()
      .then(
        action((json) => {
          this.detail = json.data
          return json
        })
      )
  }

  // 调整单冲销
  @action
  cancelAdjustSheet(id) {
    return Request('/stock/in_stock_adjust_sheet/cancel')
      .data({ sheet_no: id })
      .post()
      .then(() => {
        this.getDetail(id)
      })
  }

  // 可调整商品列表
  @action
  getSkuList(q) {
    return Request('/stock/in_stock_adjust_sheet/sku_supply')
      .data({ q })
      .get()
      .then(
        action((json) => {
          this.skuList = _.map(json.data, (sku) => {
            return {
              value: sku.spec_id,
              text: sku.name,
              category_2_name: sku.category_2_name,
            }
          })
          return json
        })
      )
  }

  // 保存，提交调整单
  @action
  submitOrSave(is_submit) {
    const { sheet_no, details } = this.detail
    const params = {
      is_submit,
      details: JSON.stringify(
        _.map(
          _.filter(details, (sku) => !_.isEmpty(sku)),
          (d) => {
            return {
              spec_id: d.spec_id,
              batch_number: d.batch_number,
              in_stock_number: d.in_stock_number,
              new_price: Number(d.new_price),
            }
          }
        )
      ),
    }
    if (sheet_no) {
      params.sheet_no = sheet_no
    }

    return Request('/stock/in_stock_adjust_sheet/modify').data(params).post()
  }

  @action
  clearSkuList() {
    this.skuList = []
  }

  @action
  addSku(index) {
    this.detail.details.splice(index + 1, 0, 1)
  }

  @action
  deleteSku(index) {
    this.detail.details.splice(index, 1)
  }

  @action
  changeSku(index, field, value) {
    const sku = { ...this.detail.details[index] }
    sku[field] = value
    this.detail.details[index] = sku
  }

  @action
  changeSkuSelected(index, selected) {
    const sku = { ...this.detail.details[index] }
    sku.name = selected && selected.text
    sku.spec_id = selected && selected.value
    sku.category_2_name = selected && selected.category_2_name
    this.detail.details[index] = sku
  }

  @action
  changeBatchSelected(index, selected) {
    const sku = { ...this.detail.details[index] }
    sku.batch_number = selected.batch_number
    sku.in_stock_number = selected.in_stock_number
    sku.quantity = selected.quantity
    sku.old_price = selected.price
    sku.unit_name = selected.unit_name
    this.detail.details[index] = sku
  }

  @action
  clearBatchSelected(index) {
    const sku = { ...this.detail.details[index] }
    sku.batch_number = ''
    sku.in_stock_number = ''
    sku.quantity = ''
    sku.old_price = ''
    sku.unit_name = ''
    this.detail.details[index] = sku
  }

  setPagination(pagination) {
    this.pagination = pagination
  }
}

export default new AdjustmentSheet()
