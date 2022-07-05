import { action, observable } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import { withMobxStorage } from 'gm-service/src/action_storage'
import ACTION_STORAGE_KEY_NAMES from 'common/action_storage_key_names'
import { getDateRangeByType } from 'common/util'

const initPurchaseFilter = {
  q_type: 1,
  begin_time: moment().subtract(7, 'day').format('YYYY-MM-DD'),
  end_time: moment().format('YYYY-MM-DD'),
}

@withMobxStorage({
  name: ACTION_STORAGE_KEY_NAMES.PURCHASE_OVERVIEW_FILTER_TIME,
  selector: ['dateType'],
})
class Store {
  @observable
  purchaseFilter = { ...initPurchaseFilter } // 采购总览

  @observable
  overview = {
    plan_sum_money: 0.0, //     预采购金额
    count: 0.0, //     采购金额
    stock_sum_money: 0.0, //     入库金额
    purchase_kinds: 0.0, //     采购商品种类数
  }

  @observable
  trend = []

  @observable
  purchaserProportion = []

  @observable
  purchaseCommodity = []

  @observable
  suppliersProportion = []

  @observable
  isFullScreen = false

  @observable dateType = '3' // 1-今天 2-昨天 3-近7天 3-近30天

  @action
  init() {
    this.purchaseFilter = { ...initPurchaseFilter }
    this.overview = {}
    this.trend = []
    this.purchaserProportion = []
    this.purchaseCommodity = []
    this.suppliersProportion = []
    this.isFullScreen = false
  }

  @action
  setFilterParams(obj) {
    this.purchaseFilter.begin_time = obj.begin_time
    this.purchaseFilter.end_time = obj.end_time
    this.dateType = obj.type
  }

  getFetchData() {
    // 获取begin_time end_time
    const time = getDateRangeByType(this.dateType)
    const params = { ...time, q_type: 1 }

    this.getPurchaseOverViewAndTrend(params)
    this.getPurchaseProportionData(params)
    this.getPurchaseCommodityRankData(params)
    this.getSuppliersProportionData(params)
  }

  // 采购概况和采购趋势
  @action
  getPurchaseOverViewAndTrend(params) {
    Request('/purchase/analyse/overview')
      .data(params)
      .get()
      .then(
        action((json) => {
          this.overview = json.data.overview
          this.trend = json.data.trend
        }),
      )
  }

  // 采购员占比
  @action
  getPurchaseProportionData(params) {
    return Request('/purchase/analyse/purchaser/top')
      .data(params)
      .get()
      .then(
        action((json) => {
          this.purchaserProportion = json.data
        }),
      )
  }

  // 采购商品TOP10
  @action
  getPurchaseCommodityRankData(params) {
    Request('/purchase/analyse/spec/top')
      .data(params)
      .get()
      .then(
        action((json) => {
          this.purchaseCommodity = json.data
        }),
      )
  }

  // 供应商占比
  @action
  getSuppliersProportionData(params) {
    Request('/purchase/analyse/supplier/top')
      .data(params)
      .get()
      .then(
        action((json) => {
          this.suppliersProportion = json.data
        }),
      )
  }

  @action
  setFullScreen(value) {
    this.isFullScreen = value
  }
}

export default new Store()
