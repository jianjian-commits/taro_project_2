import { i18next } from 'gm-i18n'
import { Price } from '@gmfe/react'
import { action, observable, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import { exportExcel } from '../util'
import Big from 'big.js'

const exportOptions = {
  recharge_date: i18next.t('日期'),
  combo_name: i18next.t('短信套餐包'),
  recharge_money: ({ value }) => [i18next.t('金额'), value + Price.getUnit()],
  recharge_nums: ({ value }) => [
    i18next.t('实购条数'),
    value + i18next.t('条'),
  ],
  unit_price: ({ row }) => [
    i18next.t('每条单价'),
    Big(row.recharge_money).div(row.recharge_nums).toFixed(3) +
      Price.getUnit() +
      '/' +
      i18next.t('条'),
  ],
}
class RechargeStore {
  @observable queryFilter = {
    start_date: new Date(),
    end_date: new Date(),
  }

  @observable comboList = []

  @observable rechargeRecordList = []

  getQueryFilter() {
    return {
      start_date: moment(this.queryFilter.start_date).format('YYYY-MM-DD'),
      end_date: moment(this.queryFilter.end_date).format('YYYY-MM-DD'),
    }
  }

  @action
  setQuerytFilter(field, value) {
    this.queryFilter[field] = value
  }

  async requestComboList() {
    const { data } = await Request('/sms/combo/get').get()
    runInAction(() => {
      this.comboList = data
    })
  }

  @action.bound
  async requestRechargeRecordList(pagination = {}) {
    const filter = {
      ...this.getQueryFilter(),
      ...pagination,
    }
    const json = await Request('/sms/recharge_record/get').data(filter).get()
    runInAction(() => {
      this.rechargeRecordList = json.data
    })
    return json
  }

  async export() {
    const json = await Request(
      '/sms/recharge_record/export'
    ) /* /sms/recharge_record/export */
      .data(this.getQueryFilter())
      .get()
    exportExcel(exportOptions, json.data, i18next.t('充值记录.xlsx'))
  }
}

export default new RechargeStore()
