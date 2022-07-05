import { observable, action, computed } from 'mobx'
import { isInvalidLocation } from 'common/util'
import { Request } from '@gm-common/request'
import { Tip } from '@gmfe/react'
import { t } from 'gm-i18n'

const initDetail = {
  id: '',
  username: '', // 账号
  wx_name: '', // 微信名
  community_name: '', // 社区店名称
  history_sale_money: '', // 团长销售额 用来判断可选的团长等级范围
  level_id: '', // 团长等级ID
  name: '', // 姓名
  district_code: '',
  area_id_2: '',
  area_id_3: '',
  address: '', // 地理位置
  lat: null,
  lng: null,
  service_type: 1, // 服务能力: 1跟随平台, 2自提, 3配送, 5自提+配送, 没4的原因是后台好做加法
  commanderServiceType: [2], // 2为自提, 3配送
  bank_account_name: '', // 收款人
  bank_branch_name: '', // 开户银行支行
  bank_name: '', // 银行名称
  bank_account: '', // 银行账号
}
class Store {
  constructor(props) {
    this.type = props.type
  }

  @observable id = ''

  @observable detail = { ...initDetail }

  @observable loading = false

  @computed get centerPoint() {
    const { lat, lng } = this.detail
    return isInvalidLocation(lat, lng)
      ? {}
      : { center: { latitude: lat, longitude: lng } }
  }

  @action
  init() {
    this.detail = { ...initDetail }
  }

  @action
  getDetail(id) {
    this.loading = true
    return Request('/community/distributor/get')
      .data({ id })
      .get()
      .then(
        action((json) => {
          this.loading = false
          this.detail = {
            ...json.data,
            area_id_2: json.data.area_id_2 + '',
            area_id_3: json.data.area_id_3 + '',
            service_type: json.data.service_type !== 1 ? 2 : 1,
            // 团长服务类型
            commanderServiceType:
              json.data.service_type === 2 || json.data.service_type === 1
                ? [2] // 自提
                : json.data.service_type === 3
                ? [3] // 配送
                : [2, 3], // 自提+配送
          }
        })
      )
  }

  @action.bound
  setDetailFields(selected, key) {
    this.detail[key] = selected
  }

  @action
  setUnbindWeChat(id) {
    return Request('/community/distributor/wx/unbind').data({ id }).get()
  }

  @action.bound
  submit(id) {
    const {
      service_type,
      commanderServiceType,
      level_id,
      ...rest
    } = this.detail
    if (service_type === 2 && commanderServiceType.length === 0) {
      Tip.warning(t('请完善服务能力信息'))
      return Promise.reject(new Error())
    }

    if (!this.detail.area_id_2 || !this.detail.area_id_3) {
      Tip.warning(t('请选择完整的地理标签'))
      return Promise.reject(new Error())
    }

    let new_service_type
    if (service_type === 1) {
      new_service_type = 1
    } else if (commanderServiceType.length === 2) {
      new_service_type = 5
    } else {
      new_service_type = commanderServiceType[0]
    }

    return Request(`/community/distributor/${this.type}`)
      .data({
        service_type: new_service_type,
        id,
        level_id: level_id ? +level_id : null,
        ...rest,
      })
      .post()
  }
}
export default Store
