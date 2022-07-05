import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'
import { Tip } from '@gmfe/react'
import { i18next } from 'gm-i18n'
class Store {
  @observable rate = {
    HKD: '',
    MOP: '',
  }

  @action
  setRate(value = '', key = '') {
    this.rate[key] = value
  }

  @action
  save() {
    if (this.rate.HKD) {
      Request('/fee/rate/save')
        .data({
          from_fee_type: 'HKD',
          to_fee_type: 'CNY',
          value: this.rate.HKD,
        })
        .post()
        .then(() => Tip.success(i18next.t('提交成功')))
    }
    if (this.rate.MOP) {
      Request('/fee/rate/save')
        .data({
          from_fee_type: 'MOP',
          to_fee_type: 'CNY',
          value: this.rate.MOP,
        })
        .post()
        .then(() => Tip.success(i18next.t('提交成功')))
    }
  }

  @action
  getHKD() {
    Request('/fee/rate/list')
      .data({
        from_fee_type: 'HKD',
        to_fee_type: 'CNY',
      })
      .get()
      .then((json) => {
        const rate = json.data[0] || ''
        this.setRate(rate.value, 'HKD')
      })
  }

  @action
  getMOP() {
    Request('/fee/rate/list')
      .data({
        from_fee_type: 'MOP',
        to_fee_type: 'CNY',
      })
      .get()
      .then((json) => {
        const rate = json.data[0] || ''
        this.setRate(rate.value, 'MOP')
      })
  }

  @action
  get() {
    Promise.all([this.getHKD(), this.getMOP()])
  }
}

export default new Store()
