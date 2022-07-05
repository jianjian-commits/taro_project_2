import { runInAction, action } from 'mobx'
import { Request } from '@gm-common/request'
import SettingStore, { initialState } from '../../components/setting/store'
import _ from 'lodash'
import { convertNumber2Sid, convertSid2Number } from 'common/filter'


class Store extends SettingStore {
  getDetail() {
    return Request('/box_template/detail')
      .data({
        id: this.id,
      })
      .get()
      .then((json) => {
        this.detail = {
          ...json.data,
          addresses: _.map(json.data.address_list, (v) => {
            return {
              ...v,
              address_id: convertNumber2Sid(v.address_id),
            }
          }),
        }

        return json
      })
  }

  @action
  save() {
    const { addresses } = this.detail
    // 后台的address_id要求是int类型，并且去掉S——仅用于展示
    const address_list = _.map(addresses, (val) => {
      return {
        address_id: convertSid2Number(val.address_id),
        color_code: val.color_code,
      }
    })

    const postData = {
      id: this.id,
      address_list: JSON.stringify(address_list),
    }

    Request('/box_template/update')
      .data(postData)
      .post()
      .then((json) => {
        if (json.code === 0) {
          runInAction(() => {
            this.getDetail()
            this.viewType = 'view'
            this.searchAddressData = { ...initialState.searchAddressData }
          })
        }
      })
  }
}

export default new Store()
