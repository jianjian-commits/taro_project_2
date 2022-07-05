import { action, observable } from 'mobx'
import { Request } from '@gm-common/request'
import { dealRankData } from 'common/deal_rank_data'
import moment from 'moment'
import { withMobxStorage } from 'gm-service/src/action_storage'
import ACTION_STORAGE_KEY_NAMES from 'common/action_storage_key_names'
import { getDateRangeByType } from 'common/util'

const initFilter = {
  q_type: 1,
  begin_time: moment().subtract(7, 'day').format('YYYY-MM-DD'),
  end_time: moment().format('YYYY-MM-DD'),
  rank_type: 1,
}

const initPurchaserRankData = {
  beforeThirdData: [],
  restData: [],
}
@withMobxStorage({
  name: ACTION_STORAGE_KEY_NAMES.PURCHASE_PERFORMANCE_FILTER_TIME,
  selector: ['dateType', 'filter.rank_type'],
})
class Store {
  @observable
  filter = { ...initFilter }

  @observable
  isFullScreen = false

  @observable dateType = '2' // '1'-今天 '2'-近7天 '3'-近30天

  @observable
  purchaserRankData = { ...initPurchaserRankData }

  @action
  init() {
    this.isFullScreen = false
    this.purchaserRankData = { ...initPurchaserRankData }
  }

  @action
  setFilterParams(obj) {
    this.filter.begin_time = obj.begin_time
    this.filter.end_time = obj.end_time
    this.dateType = obj.type
  }

  @action
  setFullScreen(value) {
    this.isFullScreen = value
  }

  @action
  setRankTypeData(value) {
    this.filter.rank_type = value
  }

  // 采购员数据排行
  @action
  getPurchaserRankData() {
    const time = getDateRangeByType(this.dateType)
    const params = {
      ...time,
      q_type: 1,
      rank_type: this.filter.rank_type,
    }

    Request('/purchase/analyse/purchaser/rank')
      .data(params)
      .get()
      .then(
        action((json) => {
          this.purchaserRankData = dealRankData(
            'purchaser',
            json.data,
            this.filter.rank_type,
          )
        }),
      )
  }
}

export default new Store()
