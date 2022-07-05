import { observable, runInAction, action, computed } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import moment from 'moment'
import globalStore from '../../../stores/global'

import { getAreaDict } from './util'

const initPagination = {
  count: 1,
  offset: 0,
  limit: 10,
}

class ListStore {
  constructor() {
    this.doMemberFirstRequest = _.noop()
    this.doLabelFirstRequest = _.noop()
  }

  // 客户管理
  @observable user_list = []
  @observable user_list_select = []
  @observable isSelectAllPage = false
  @observable count = 0
  @observable fliter_label = []
  @observable list_label = []
  // 标签列表
  @observable user_label_list = []
  @observable user_filter = {
    search_text: '',
    begin: null,
    end: null,
    user_label: -1,
    area_data: [],
  }

  // 标签管理
  @observable label_filter = {
    search_text: '',
  }

  @action
  setUserFilter(name, value) {
    this.user_filter[name] = value
  }

  @action
  setLabelFilter(name, value) {
    this.label_filter[name] = value
  }

  @action
  setSelectAllPage(bool) {
    this.isSelectAllPage = bool
    if (bool) {
      this.user_list_select = _.map(this.user_list, (v) => v.id)
    }
  }

  @action
  setDoMemberFirstRequest(func) {
    // doMemberFirstRequest有ManagePaginationV2提供
    this.doMemberFirstRequest = func
  }

  @action
  setDoLabelFirstRequest(func) {
    // doLabelFirstRequest有ManagePaginationV2提供
    this.doLabelFirstRequest = func
  }

  @action
  changeUserLabelListItem(index, data) {
    this.user_label_list[index] = data
  }

  @action
  addUserLabelListItem(index) {
    this.user_label_list = _.concat(
      { edit: true },
      this.user_label_list.slice()
    )
  }

  @action
  changeUserInfoListSelected(data) {
    this.user_list_select = data
  }

  @action
  deleteUserLabelListItem(index) {
    this.user_label_list.remove(this.user_label_list[index])
  }

  // 批量修复客户标签
  @action
  changeBatchUserLabel(req) {
    const postData = Object.assign({}, this.userFilter, req)
    return Request('/station/consumer/c_label/batch_update')
      .data(postData)
      .post()
  }

  // 获取客户标签
  @action
  getUserLabelList(page = initPagination) {
    const req = Object.assign({}, page, {
      search_text: this.label_filter.search_text,
    })
    // limit 传0表示返回所有数据
    return Request('/station/c_label/list')
      .data(req)
      .get()
      .then((json) => {
        runInAction(() => {
          this.user_label_list = json.data
          this.list_label = _.map(json.data, (item) => ({
            value: item.id,
            text: item.name,
          }))
          this.fliter_label = _.concat(
            [{ value: -1, text: '全部客户标签' }],
            this.list_label.slice()
          )
        })
        return json
      })
  }

  @action
  deleteUserLabel(id) {
    return Request('/station/c_label/delete').data({ id }).post()
  }

  @action
  addUserLabel(name) {
    return Request('/station/c_label/create').data({ name }).post()
  }

  @action
  changeUserInforListItem(index, value) {
    this.user_list[index] = value
  }

  // 获取客户列表
  @action
  getUserInfoList(page = initPagination) {
    const postData = Object.assign({}, this.userFilter, {
      ...page,
      count: 1,
    })

    return Request('/station/consumer/list')
      .data(postData)
      .get()
      .then((json) => {
        runInAction(() => {
          this.user_list = json.data
          this.count = json.pagination.count
          this.user_list_select = []
        })
        return json
      })
  }

  // 导出
  @action
  exportUserInfoList() {
    const postData = Object.assign({}, this.userFilter, {
      export: 1,
    })

    return Request('/station/consumer/list').data(postData).get()
  }

  // 修改客户昵称
  @action
  changeUserNickName(id, new_nickname) {
    return Request('/station/consumer/info/update')
      .data({
        id,
        new_nickname,
        is_retail_interface: globalStore.otherInfo.isCStation ? null : 1,
      })
      .post()
  }

  @computed
  get userFilter() {
    const { search_text, begin, end, user_label, area_data } = this.user_filter
    let filter = {
      search_text,
      start_date: begin && moment(begin).format('YYYY-MM-DD HH:mm:ss'),
      end_date: end && moment(end).format('YYYY-MM-DD HH:mm:ss'),
      c_label_id: user_label === -1 ? null : user_label,
    }
    const area = getAreaDict(area_data.slice())
    filter = Object.assign({}, filter, area)

    return filter
  }
}

export default new ListStore()
