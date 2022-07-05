import { observable, action, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import BaseStore from './base_store'
import { Storage } from '@gmfe/react'
import { isEndOfDay } from 'common/util'

class Store extends BaseStore {
  @observable filter = { ...this.initFilter }

  @observable list = []
  @observable loading = false
  @observable in_query = false
  @observable in_query_search_text = ''

  // 表格选择
  @observable tableSelected = []

  // 是否全选所有页
  @observable isAllPageSelect = false

  // 入库单模板
  @observable templateID = null
  /**
   * Array<template: {
   * id: number,
   * content: object,
   * create_time: Date,
   * is_default: bool,
   * creator: string
   * }>
   */
  @observable templateList = []

  @observable apiDoFirstRequest = _.noop

  /**
   * 设置页码改变时触发的请求方法
   * @param {func} requestFunc 页码开放的请求api
   */
  @action
  setRequestPaginationFunc(requestFunc) {
    this.apiDoFirstRequest = requestFunc
  }

  @action
  clear() {
    this.filter = { ...this.initFilter }
    this.list = []
    this.loading = false
    this.in_query = false
    this.in_query_search_text = ''
  }

  @action.bound
  setTemplate(val) {
    Storage.set('in_stock_tem', val)
    this.templateID = val
  }

  @action.bound
  async getTemplateList() {
    const data = await Request('/fe/stock_in_tpl/list')
      .get()
      .then((res) => res.data)
    runInAction(() => {
      const temID = Storage.get('in_stock_tem')
      this.templateID =
        temID && _.find(data, (item) => item.id === temID)
          ? temID
          : data[0]
          ? data[0].id
          : null
      this.templateList = data
    })
  }

  @action
  changeFilter(name, value) {
    this.filter[name] = value
  }

  @action
  changeSelected(selected) {
    this.tableSelected = selected
  }

  // 设置全选当前页还是全部页的全选
  @action
  setCurrentAllSelect(bool) {
    this.isAllPageSelect = bool
  }

  /**
   * 搜索后要重置table选择
   */
  @action
  clearTableSelected() {
    this.tableSelected = []
    this.isAllPageSelect = false
  }

  // 选择表格的全选
  @action
  setTableAllSelect(isSelect) {
    if (!isSelect) {
      this.tableSelected = []
    } else {
      this.tableSelected = _.map(this.list, (v) => v.id)
    }
  }

  @action.bound
  getSearchData() {
    const {
      type,
      begin,
      end,
      status,
      search_text,
      is_print,
      search_type,
    } = this.filter

    return Object.assign(
      { type, search_type },
      {
        is_print: is_print === -1 ? undefined : is_print,
        status,
        start_date_new: isEndOfDay(begin),
        end_date_new: isEndOfDay(end),
        search_text,
      },
    )
  }

  @action.bound
  fetchStockInList(pagination = {}) {
    const searchData = { ...this.getSearchData(), ...pagination }
    this.loading = true

    return Request('/stock/in_stock_sheet/material/list')
      .data(searchData)
      .get()
      .then((json) => {
        runInAction(() => {
          const { in_stock_list, in_query, search_text } = json.data
          this.list = in_stock_list || []
          this.in_query = in_query || false
          this.in_query_search_text = search_text || ''

          this.clearTableSelected()
          this.loading = false
        })

        // 适配页码组件，返回data为数据
        const paginationData = {
          data: json.data.in_stock_list || [],
        }

        return paginationData
      })
  }
}

export default new Store()
