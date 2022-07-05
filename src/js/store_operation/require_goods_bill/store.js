import { i18next } from 'gm-i18n'
import { action, observable } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import _ from 'lodash'

class RequireGoodsStore {
  @observable start_time // 申请开始时间
  @observable end_time // 申请结束时间
  @observable sheet_no // 要货单据号
  @observable status // 单据状态
  @observable require_goods_list // 要货单据列表
  @observable require_goods_detail // 要货单据详情
  @observable selected = []

  @observable bill_status = [
    { value: '2', name: i18next.t('未报价') },
    { value: '3', name: i18next.t('已报价') },
    { value: '4', name: i18next.t('已删除') },
  ]

  @action
  init() {
    this.start_time = moment().startOf('day')
    this.end_time = moment().startOf('day')
    this.sheet_no = ''
    this.status = ''
    this.require_goods_list = []
    this.require_goods_detail = {
      details: [],
    }
  }

  @action
  setChangeDate(begin, end) {
    this.start_time = moment(begin).startOf('day')
    this.end_time = moment(end).startOf('day')
  }

  @action
  setSheetNo(sheet_no) {
    this.sheet_no = sheet_no
  }

  @action
  setBillStatus(status) {
    this.status = status
  }

  // 单据状态
  @action
  findBillStatus(status) {
    const billStatus = _.find(
      this.bill_status.slice(),
      (bs) => bs.value === status.toString()
    )
    return billStatus.name
  }

  @action
  getRequireGoodsSheetList(pagination = {}) {
    const params = {
      start_time: moment(this.start_time).format('YYYY-MM-DD'),
      end_time: moment(this.end_time).format('YYYY-MM-DD'),
      ...pagination,
    }
    this.status && (params.status = this.status)
    this.sheet_no && (params.sheet_no = this.sheet_no)
    return Request('/stock/require_goods_sheet/search')
      .data(params)
      .get()
      .then(
        action((json) => {
          this.require_goods_list = json.data
          return json
        })
      )
  }

  // 获取要货单据分享token
  @action
  getRequireGoodsShareToken(id) {
    return Request('/stock/require_goods_sheet/share_token')
      .data({ id: id })
      .get()
  }

  // 确认分拣报价 or 保存草稿
  @action
  saveEditConfirmQuotation(isConfirm) {
    const detail = Object.assign({}, this.require_goods_detail)
    const params = {
      id: detail.id, // 要货单据好
    }

    let details = []
    _.forEach(detail.details, (det) => {
      details.push({
        id: det.id,
        supply_purchase_amount: det.supply_purchase_amount,
        supply_std_price: det.supply_std_price,
      })
    })

    params.details = JSON.stringify(details)

    if (isConfirm) {
      return Request('/stock/require_goods_sheet/submit').data(params).post()
    } else {
      return Request('/stock/require_goods_sheet/edit').data(params).post()
    }
  }

  // 单据详情
  @action
  getRequireGoodsSheetDetail(id) {
    return Request('/stock/require_goods_sheet/detail')
      .data({ id: id })
      .get()
      .then(
        action((json) => {
          this.require_goods_detail = json.data
        })
      )
  }

  // 同步分拣数据
  @action
  synchronizedSortingData(id, detail_ids) {
    const params = { sheet_id: id, detail_ids: JSON.stringify(detail_ids) }
    return Request('/stock/require_goods_sheet/sync_sort_data')
      .data(params)
      .get()
      .then(
        action((json) => {
          const rgdt = this.require_goods_detail.details.slice()
          _.each(json.data, (value, key) => {
            _.each(rgdt, (rt) => {
              if (+key === rt.id) {
                rt.supply_purchase_amount = +value
              }
            })
          })
          this.require_goods_detail.details = rgdt
          this.selected = []
        })
      )
  }

  // 选择全部 or 选择单个
  @action
  setSelectRequireGoodsDetail(selected) {
    this.selected = selected
  }

  @action
  setSelectRequireGoodsDetailAll(checked) {
    const { details } = this.require_goods_detail
    this.selected = checked ? _.map(details.slice(), (item) => item.id) : []
  }

  // 修改
  @action
  setRequireGoodsDetailAmountAndPrice(index, name, value) {
    const inputValue = value || 0
    const list = this.require_goods_detail.details.slice()
    const detail = list[index]
    detail[name] = inputValue

    this.require_goods_detail.details = list
  }

  @action
  updateRequireGoodsBatchImport(id, file) {
    return Request('/stock/require_goods_sheet/detail/import')
      .data({ id, file })
      .post()
  }
}

export default new RequireGoodsStore()
