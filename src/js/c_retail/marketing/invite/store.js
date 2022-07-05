import { observable, action, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import _ from 'lodash'

class Store {
  @observable setting = {
    is_invite: 1,
    invite_limit_time: new Date(),
    invite_coupon_id: ''
  }

  @observable couponList = []

  @action
  getCouponList() {
    return Request('/coupon/list')
      .data({ is_active: 1, audience_type: 26, is_retail_interface: 1 })
      .get()
      .then(json => {
        runInAction(() => {
          this.couponList = _.map(json.data, v => {
            return {
              value: v.id,
              text: v.name
            }
          })
        })
      })
  }

  @action
  getSetting() {
    return Request('/station/profile/get')
      .get()
      .then(json => {
        runInAction(() => {
          const { is_invite, invite_limit_time, invite_coupon_id } = json.data
          this.setting = {
            is_invite: is_invite,
            invite_limit_time: invite_limit_time || new Date(),
            invite_coupon_id: invite_coupon_id || ''
          }
        })
      })
  }

  @action
  changeSetting(name, value) {
    this.setting[name] = value
  }

  @action
  save() {
    const { is_invite, invite_limit_time, invite_coupon_id } = this.setting
    const req = {
      is_invite,
      invite_limit_time: moment(invite_limit_time).format('YYYY-MM-DD'),
      invite_coupon_id
    }
    return Request('/station/profile_cshop/update')
      .data(req)
      .post()
  }
}

export default new Store()
