import { observable, action, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import { Storage } from '@gmfe/react'
import _ from 'lodash'

const now = new Date()
const initFilter = {
  type: 2,
  begin: now,
  end: now,
  search_text: '',
  status: '5',
  is_print: -1, // -1:全部 0:未打印 1:已打印
  pagination: {
    offset: 0,
    limit: 10,
  },
}
class InStock {
  @observable filter = { ...initFilter }
  @observable list = []
  @observable loading = false
  @observable in_query = false
  @observable in_query_search_text = ''

  @observable isCurrentPage = true
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

  @action
  clear() {
    this.filter = { ...initFilter }
    this.list = []
    this.loading = false
    this.in_query = false
    this.in_query_search_text = ''
  }

  @action.bound
  setSheetSelectType(bool) {
    this.isCurrentPage = bool
  }

  @action
  changeFilter(name, value) {
    this.filter[name] = value
  }

  @action.bound
  setTemplate(val) {
    Storage.set('in_stock_tem', val)
    this.templateID = val
  }

  @action
  getSearchData(pagination = this.filter.pagination) {
    const { type, begin, end, status, search_text, is_print } = this.filter
    return Object.assign(
      { type },
      { is_print: is_print === -1 ? undefined : is_print },
      { status },
      { start: moment(begin).format('YYYY-MM-DD') },
      { end: moment(end).format('YYYY-MM-DD') },
      { search_text },
      pagination
    )
  }

  @action
  search(searchData) {
    return Request('/stock/in_stock_sheet/material/list')
      .data(searchData)
      .get()
      .then((json) => {
        runInAction(() => {
          const { in_stock_list, in_query, search_text } = json.data
          this.list = in_stock_list || []
          this.in_query = in_query || false
          this.in_query_search_text = search_text || ''
        })
        return json
      })
  }

  @action.bound
  selectListItem(check, index) {
    this.list[index] = {
      ...this.list[index],
      _gm_select: check,
    }
  }

  @action.bound
  selectListAllItem(check) {
    this.list = this.list.map((o) => ({
      ...o,
      _gm_select: check,
    }))
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
}

export default new InStock()
