import { observable, action, computed, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import { Tip } from '@gmfe/react'

class ListStore {
  @observable filter = {
    state: '', // 销售状态 0下架 1上架 ''全部状态
    search_text: '',
  }

  @observable combineGoodsList = []

  @observable selectedList = [] // 组合商品id
  @observable isSelectAllPage = false // 是否全选所有页
  @observable pagination = ''

  @computed get fetchFilterData() {
    const filter = { ...this.filter }
    if (filter.state === '') {
      delete filter.state
    }

    if (filter.search_text === '') {
      delete filter.search_text
    }
    return filter
  }

  @action
  changeFilter(name, val) {
    this.filter[name] = val
  }

  @action.bound
  handleCombineGoodsList(pagination) {
    return Request('/combine_goods/list')
      .data({ ...this.fetchFilterData, ...pagination, count: 1 })
      .get()
      .then((json) => {
        this.combineGoodsList = _.map(json.data, (item) => {
          return {
            ...item,
          }
        })
        this.pagination = json.pagination
        return json
      })
  }

  @action.bound
  export() {
    return Request('/combine_goods/export').data(this.fetchFilterData).get()
  }

  @action
  selected(selected) {
    this.selectedList = selected
  }

  @action
  selectAll(isSelectAll) {
    if (isSelectAll) {
      this.selectedList = _.map(this.combineGoodsList, (v) => v.id)
    } else {
      this.selectedList.clear()
    }
  }

  @action
  selectAllPage(bool) {
    this.isSelectAllPage = bool
    if (bool) {
      this.selectedList = _.map(this.combineGoodsList, (v) => v.id)
    }
  }

  // 删除组合商品
  @action.bound
  delete(id) {
    this.combineGoodsList = _.filter(
      this.combineGoodsList,
      (item) => item.id !== id
    )

    return Request('/combine_goods/delete').data({ id }).post()
  }

  @action.bound
  async changeState(index, id, checked) {
    await Request('/combine_goods/edit_state')
      .data({
        state: checked,
        id,
      })
      .post()
      .then((json) => {
        runInAction(() => {
          if (json.code === 0) {
            const combineGoodsList = _.map(this.combineGoodsList, (item, i) => {
              item.state = index === i ? checked : item.state
              return item
            })
            this.combineGoodsList = combineGoodsList
            Tip.success('修改销售状态成功！')
          }
        })
      })
  }
}

export default new ListStore()
