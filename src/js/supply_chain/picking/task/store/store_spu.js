import BaseStore from '../base_store'
import { action, observable } from 'mobx'
import { Request } from '@gm-common/request'
import commonQuery from '../config/search_query_common'
import { Storage } from '@gmfe/react'

const initQuery = {
  ...commonQuery,
  categoryFilter: {
    category1_ids: [],
    category2_ids: [],
    pinlei_ids: [],
  },
  shelf_ids: [],
}
const printTemplateKey = 'PICK_SPU_PRINT_TEMPLATE_KEY'
const printTemplate = Storage.get(printTemplateKey) || 1
class Store extends BaseStore {
  @observable searchQuery = initQuery
  @observable shelfs = []
  // 1：商品汇总）；2：商品汇总-明细（展示每个商品的订单信息）
  @observable printTemplate = printTemplate

  @action
  changePrintTemplate = (type) => {
    this.printTemplate = type
    Storage.set(printTemplateKey, type)
  }

  @action
  reset = () => {
    this.searchQuery = initQuery
  }

  @action
  getPickTasks = (data) => {
    this.isLoading = true
    Request('/picking/task/sku/list')
      .data({ ...data, ...this.formatDate() })
      .get()
      .then((json) => {
        this.pickTasks = json.data.sku_task_list
        this.pagination = json.pagination
      })
      .finally(() => (this.isLoading = false))
  }

  // 导出
  @action
  handleExport = (data) => {
    return Request('/picking/task/sku/list')
      .data({ ...data, ...this.formatDate() })
      .get()
  }

  formatShelf = (shelf, res, shelfs) => {
    const newVal = {}
    shelf.forEach((s) => {
      const v = {
        name: s.name,
        value: s.shelf_id,
        parent_id: s.parent_id,
      }
      newVal[v.value] = v
      if (shelfs) {
        shelfs.push(v)
      } else {
        const p = res[v.parent_id]
        if (!p.children) p.children = []
        p.children.push(v)
      }
    })
    return newVal
  }

  @action
  getStock = () => {
    Request('/stock/shelf/get')
      .get()
      .then((json) => {
        const shelfs = []
        json.data.reduce((res, d) => {
          if (Object.keys(res).length) {
            return this.formatShelf(d.shelf, res)
          } else {
            return this.formatShelf(d.shelf, res, shelfs)
          }
        }, {})
        this.shelfs = shelfs
      })
  }
}

export default new Store()
