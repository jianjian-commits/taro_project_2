import { observable, action, toJS } from 'mobx'
import { Tip } from '@gmfe/react'
import { t } from 'gm-i18n'

import { getSorterDetail, editSorter } from './service'

import { formatSubmatData } from './utils'

const initDetail = {
  username: '',
  phone: '',
  name: '',
  task_scope: 1,
  id: '',
  alloc_type: 1,
  address_kind: 1,
  spu_ids: [],
  route_address_ids: [],
  merchant_address_ids: [],
}

class Store {
  @observable sorterDetail = { ...initDetail }

  @action
  getSorterDetail(user_id = '') {
    getSorterDetail({ user_id }).then((res) => {
      const { code, data } = res
      if (code === 0) {
        const {
          id: user_id,
          alloc_type = 1,
          address_kind = 1,
          address_ids = [],
        } = data
        const addressIdsKey = this.getAddressIdsKey(address_kind)
        this.sorterDetail = {
          ...data,
          user_id,
          alloc_type,
          address_kind,
          [addressIdsKey]: address_ids,
        }
      }
    })
  }

  @action
  onSubmit() {
    const submitData = formatSubmatData(toJS(this.sorterDetail))
    submitData &&
      editSorter(submitData).then((res) => {
        if (res?.code === 0) {
          Tip.success(t('保存成功'))
        }
      })
  }

  @action
  changeDetailData(obj) {
    this.sorterDetail = {
      ...this.sorterDetail,
      ...obj,
    }
  }

  getAddressIdsKey(address_kind) {
    return `${address_kind === 1 ? 'route' : 'merchant'}_address_ids`
  }
}

export default new Store()
