import { action, computed, observable, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import Big from 'big.js'

class OverviewStore {
  @observable sms_balance = 0 // 短信余额

  @observable overviewDetailList = [] // "send_date": 发送日期  "total_send_nums":   该日发送短信数量   "send_success_nums": 90  该日发送成功数量

  dateRange = {
    start_date: moment().subtract(30, 'day').format('YYYY-MM-DD'),
    end_date: moment().format('YYYY-MM-DD'),
  }

  @computed
  get nums() {
    let total_send_nums = 0 //  近xx天发送量
    let total_bill_nums = 0 //  近xx天计费量

    for (let dayData of this.overviewDetailList.slice()) {
      total_send_nums += dayData['total_send_nums']
      total_bill_nums += dayData['send_success_nums']
    }
    let success_rate = 0
    if (total_send_nums !== 0) {
      success_rate = Big(total_bill_nums * 100)
        .div(total_send_nums)
        .toFixed(2)
    }

    return {
      total_send_nums,
      total_bill_nums,
      success_rate,
    }
  }

  @action
  async requestBalance() {
    let { data } = await Request('/sms/balance/get').get()
    runInAction(() => {
      this.sms_balance = data.sms_balance
    })
  }
  @action
  async requestOverviewDetailList() {
    let json = await Request('/sms/data_center/get').data(this.dateRange).get()
    runInAction(() => {
      this.overviewDetailList = json.data
    })
    return json
  }
}

export default new OverviewStore()
