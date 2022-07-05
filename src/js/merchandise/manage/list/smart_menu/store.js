import { i18next } from 'gm-i18n'
import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import { Tip } from '@gmfe/react'

import { skuListAdapter, separateSkuIds } from 'common/util'

class SmartMenusStore {
  // 智能菜单列表
  @observable smartMenusList = []

  // 菜单搜索
  @observable listSearch_text = ''

  // 菜单状态： edit' , 'create'
  @observable viewType = ''

  // 菜单详情
  @observable smartMenuDetail = {
    name: '',
    id: null,
    selectedSkuValue: [],
  }

  // skuList 获取列表
  @observable skuListLoading = false

  // 普通商品列表
  @observable skuList = []

  // 组合商品列表
  @observable combineSkuList = []

  @action.bound
  changeSearchText(text) {
    this.listSearch_text = text
  }

  @action.bound
  getSmartMenus(pagination = {}) {
    const data = {
      search_text: this.listSearch_text,
      ...pagination,
    }
    return Request('/station/smart_menu/list')
      .data(data)
      .get()
      .then((json) => {
        this.smartMenusList = json.data
        // 返回给pagination组件获取数据及pagination字段
        return json
      })
  }

  @action.bound
  createSmartMenu(name, ids) {
    const { sku_ids, combine_good_ids } = separateSkuIds(ids)

    const data = {
      name,
      sku_ids: JSON.stringify(sku_ids),
      combine_good_ids: JSON.stringify(combine_good_ids),
    }

    Request('/station/smart_menu/create')
      .data(data)
      .post()
      .then((json) => {
        if (!json.code) {
          Tip.success(i18next.t('菜单创建成功'))
        }
      })
  }

  @action.bound
  delSmartMenu(id) {
    Request('/station/smart_menu/delete')
      .data({ id })
      .post()
      .then((json) => {
        if (!json.code) {
          Tip.success(i18next.t('菜单删除成功'))
        }
      })
    const indexList = _.map(this.smartMenusList.slice(), (item) => item.id)
    const _index = _.findIndex(indexList, (item) => {
      return item === id
    })
    this.smartMenusList.splice(_index, 1)
    this.clearMenuDetails()
    this.viewType = ''
  }

  @action
  editSmartMenu(id, name, ids) {
    const { sku_ids, combine_good_ids } = separateSkuIds(ids)

    const data = {
      id,
      name,
      sku_ids: JSON.stringify(sku_ids),
      combine_good_ids: JSON.stringify(combine_good_ids),
    }

    Request('/station/smart_menu/edit')
      .data(data)
      .post()
      .then((json) => {
        if (!json.code) {
          Tip.success(i18next.t('菜单更新成功'))
        }
      })
    this.clearMenuDetails()
    this.viewType = ''
  }

  @action.bound
  getSmartMenuDetail(id) {
    Request('/station/smart_menu/detail')
      .data({ id })
      .get()
      .then((json) => {
        const { skus, combine_goods, id, name } = json.data
        this.smartMenuDetail = {
          name: name,
          id: id,
          selectedSkuValue: [...skus, ...combine_goods].map((o) => o.id),
        }
        this.viewType = 'edit'
      })
  }

  @action.bound
  getSkuList() {
    this.skuListLoading = true

    Request('/station/promotion/sku/list')
      .get()
      .then((json) => {
        const list = json.data
        this.skuListLoading = false
        this.skuList = skuListAdapter(list)
      })
  }

  @action.bound
  getCombineSkuList() {
    this.skuListLoading = true

    Request('/station/promotion/combine_goods/list')
      .get()
      .then((res) => {
        this.skuListLoading = false
        this.combineSkuList = res.data.map((o) => ({ ...o, value: o.id }))
      })
  }

  @action.bound
  setSkuList(selected) {
    this.smartMenuDetail.selectedSkuValue = selected
  }

  @action.bound
  changeViewType(type) {
    this.viewType = type
  }

  @action.bound
  clearMenuDetails() {
    this.smartMenuDetail = {
      name: '',
      id: null,
      selectedSkuValue: [],
    }
  }

  @action.bound
  changeSmartMenuDetail(type, value) {
    this.smartMenuDetail[type] = value
  }
}

export default new SmartMenusStore()
