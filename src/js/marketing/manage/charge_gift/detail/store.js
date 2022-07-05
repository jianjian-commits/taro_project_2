import { observable, action, computed } from 'mobx'
import { Request } from '@gm-common/request'

const init_section_data = [
  {
    start: null,
    end: null,
    gift: null,
  },
  {
    start: null,
    end: null,
    gift: null,
  },
  {
    start: null,
    end: null,
    gift: null,
  },
  {
    start: null,
    end: null,
    gift: null,
  },
  {
    start: null,
    end: null,
    gift: null,
  },
  {
    start: null,
    gift: null,
  },
]

class DetailStore {
  @observable name = ''
  @observable status = 0 // 0:无效，1:有效
  @observable gift_type = 1 // 1:余额，2:积分
  @observable rule_type = 2 // 1:比例，2:固定值
  @observable gift_rate = 0 // 当rule_type为1时，必传
  // 当rule_tyoe为2时，必传,固定数目为 5
  @observable gift_section = init_section_data

  @action
  initData() {
    this.name = ''
    this.status = 0
    this.gift_type = 1
    this.rule_type = 2
    this.gift_rate = 0
    this.gift_section = init_section_data
  }

  @action
  changeDetail(name, val) {
    this[name] = val
  }

  @action.bound
  getDetail(id) {
    return Request('/station/charge_gift/detail')
      .data({ id })
      .get()
      .then(
        action('getDetail', (json) => {
          this.name = json.data.name
          this.status = json.data.status
          this.gift_type = json.data.gift_type
          this.rule_type = json.data.rule_type
          this.gift_rate = json.data.gift_rate
          // 过滤 end = inf
          this.gift_section = json.data.gift_section.map((item) => {
            return item.end === 'inf'
              ? { start: item.start, gift: item.gift }
              : item
          })
        })
      )
  }

  @computed
  get ChargeGifyInfo() {
    return {
      name: this.name,
      gift_type: this.gift_type,
      rule_type: this.rule_type,
      gift_rate: this.gift_rate,
      status: this.status ? 1 : 0,
      gift_section: JSON.stringify(this.gift_section),
    }
  }

  @action
  save() {
    return Request('/station/charge_gift/create')
      .data(this.ChargeGifyInfo)
      .post()
  }

  @action
  edit(id) {
    const req = Object.assign({}, this.ChargeGifyInfo, { id })
    return Request('/station/charge_gift/update').data(req).post()
  }

  @action
  checkStatus() {
    return Request('/station/charge_gift/check_status')
      .data()
      .get()
      .then((json) => {
        return json.data.has_valid_status
      })
  }
}

export default new DetailStore()
