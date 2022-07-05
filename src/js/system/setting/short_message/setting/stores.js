import { action, observable, runInAction } from 'mobx'
import { Request } from '@gm-common/request'

class SettingStore {
  @observable msgSetting = {
    sms_signature: '', //   短信签名
    is_open_sms_bshop_order: 0, // 是否开启商城下单提醒
    is_open_sms_station_order: 0, // 是否开启代下订单提醒
    is_open_sms_telephone_verify: 0, // 是否开启手机验证
  }

  @action
  async requestSetting() {
    let { data } = await Request('/sms/customized_info/get').get()
    runInAction(() => {
      this.msgSetting = data
    })
  }
  getMsgSetting() {
    return {
      is_open_sms_bshop_order: this.msgSetting.is_open_sms_bshop_order ? 1 : 0,
      is_open_sms_station_order: this.msgSetting.is_open_sms_station_order
        ? 1
        : 0,
      is_open_sms_telephone_verify: this.msgSetting.is_open_sms_telephone_verify
        ? 1
        : 0,
    }
  }
  @action
  setMsgSetting(field, value) {
    this.msgSetting[field] = value
  }

  updateSetting() {
    let params = this.getMsgSetting()
    return Request('/sms/customized_info/update').data(params).post()
  }
}

export default new SettingStore()
