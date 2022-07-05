import { observable, action, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import { Tip } from '@gmfe/react'
import { t } from 'gm-i18n'
import { conflictAlert } from './util'
import _ from 'lodash'
import globalStore from '../../../stores/global'

class Store {
  @observable filter = {
    status: 3,
    q: '',
  }

  @observable list = []

  @action
  getList(pagination = {}) {
    const { status, q } = this.filter
    const req = {
      status,
      q,
      is_retail_interface: globalStore.otherInfo.isCStation ? null : 1,
      ...pagination,
    }
    return Request('/flash_sale/list')
      .data(req)
      .get()
      .then((json) => {
        runInAction(() => {
          this.list = _.map(json.data, (item) => ({
            ...item,
            edit: false,
            edit_begin: item.begin,
            edit_end: item.end,
            edit_status: item.status,
          }))
        })
        return json
      })
  }

  @action
  changeFilter(name, value) {
    this.filter[name] = value
  }

  @action
  init() {
    this.filter = {
      status: 3,
      q: '',
    }
    this.list = []
  }

  @action
  edit(index) {
    const target = this.list[index]

    target.edit = !target.edit
    target.edit_begin = target.begin
    target.edit_end = target.end
    target.edit_status = target.status
  }

  @action
  editSave(data, index) {
    if (!globalStore.otherInfo.isCStation) data.is_retail_interface = 1

    return Request('/flash_sale/edit')
      .code([0, 1, 10])
      .data(data)
      .post()
      .then((json) => {
        // 存在冲突
        if (json.code === 10) {
          conflictAlert(json)
        } else if (json.code === 0) {
          Tip.success(t('修改成功'))

          if (index !== undefined) {
            const target = this.list[index]
            target.edit = false
            target.begin = target.edit_begin
            target.end = target.edit_end
            target.status = target.edit_status
          }
        } else {
          Tip.danger(json.msg)
        }

        return json
      })
  }

  @action
  changeEditData(index, name, value) {
    this.list[index][name] = value
  }
}

export default new Store()
