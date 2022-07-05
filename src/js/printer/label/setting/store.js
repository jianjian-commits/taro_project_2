import { action, runInAction } from 'mobx'
import _ from 'lodash'
import { Request } from '@gm-common/request'
import SettingStore, { initialState } from '../../components/setting/store'
import { convertNumber2Sid, convertSid2Number } from 'common/filter'

class LabelSettingStore extends SettingStore {
  @action
  getDetail() {
    const ret = {}
    const pagination = {
      ...initialState.pagination,
    }
    const tag_bind = Request('/station/print_tag/tag_bind')
      .data({ id: this.id })
      .get()
      .then((json) => {
        json.data.addresses = _.map(json.data.addresses, (v) => {
          return {
            ...v,
            address_id: convertNumber2Sid(v.address_id),
          }
        })
        json.data.spus = _.map(json.data.spus, (v) => {
          return {
            ...v,
            category: `${v.category_name_1} / ${v.category_name_2}`,
          }
        })
        pagination.count = json.data.spus.length
        Object.assign(ret, json.data)
        return json.data
      })

    const tag_content = Request('/station/print_tag/tag_content')
      .data({ id: this.id })
      .get()
      .then((json) => {
        Object.assign(ret, json.data)
        return json.data
      })

    Promise.all([tag_bind, tag_content]).then(() => {
      runInAction(() => {
        this.detail = ret
        this.pagination = pagination
      })
    })
  }

  @action
  save() {
    const { spus, addresses } = this.detail
    // 后台的address_id要求是int类型，并且去掉S——仅用于展示
    const address_ids = _.map(addresses, (val) =>
      convertSid2Number(val.address_id),
    )

    const address_list = _.map(addresses, (val) => {
      return {
        address_id: convertSid2Number(val.address_id),
        color_code: val.color_code,
      }
    })
    const spu_ids = _.map(spus, 'spu_id')

    const postData = {
      id: this.id,
      address_list: JSON.stringify(address_list),
      // 暂时兼容老接口，防止只有后端灰度的分支报错
      address_ids: JSON.stringify(address_ids),
      spu_ids: JSON.stringify(spu_ids),
    }

    Request('/station/print_tag/update')
      .data(postData)
      .post()
      .then((json) => {
        if (json.code === 0) {
          runInAction(() => {
            this.getDetail()
            this.viewType = 'view'
            this.searchAddressData = { ...initialState.searchAddressData }
            this.searchSpuData = { ...initialState.searchSpuData }
          })
        }
      })
  }
}

export default new LabelSettingStore()
