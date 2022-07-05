import { observable, action, runInAction } from 'mobx'
import _ from 'lodash'
import { Request } from '@gm-common/request'
import { System } from 'common/service'

class TagIndexStore {
  // 展示类型
  @observable show_method = ''
  // 活动状态
  @observable active = ''
  // 活动类型
  @observable type = ''
  // 文本输入框
  @observable search_text = ''
  // 分页
  @observable offset = 0
  @observable limit = 10
  // 数据 list
  @observable list = []

  // 下拉框状态选择
  @action
  handleSelectChange(name, value) {
    this[name] = value
  }

  // 文本输入框
  @action
  handleInputChange(value) {
    this.search_text = value
  }

  // search
  @action
  getSearchList(isSearch = false) {
    const temp = {
      active: this.active,
      type: this.type,
      show_method: this.show_method,
      search_text: this.search_text.trim(),
      offset: isSearch ? 0 : this.offset,
      limit: this.limit,
      is_retail_interface: System.isC() ? 1 : null,
    }
    const data = _.pickBy(temp, (val) => val !== '')

    return Request('/station/promotion/list')
      .data(data)
      .get()
      .then((json) => {
        runInAction(() => {
          this.list = json.data
        })
      })
  }

  @action
  setPageOffset(offset = 0) {
    this.offset = offset
  }

  @action
  setPageLimit(limit = 10) {
    this.limit = limit
  }
}

export default new TagIndexStore()
