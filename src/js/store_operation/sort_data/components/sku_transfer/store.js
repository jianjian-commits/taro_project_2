import { observable, action } from 'mobx'

import {
  getSpuList,
  getCategory1,
  getCategory2,
  getPinLeiList,
} from './service'

import { buildTree, sortList } from './utils'

class Store {
  @observable listTree = []

  @observable loading = false

  @action
  async getInitList() {
    this.loading = true
    const [
      { data: categoryList1 },
      { data: categoryList2 },
      { data: pinlei },
      { data: spuList },
    ] = await Promise.all([
      getCategory1(),
      getCategory2(),
      getPinLeiList(),
      getSpuList(),
    ])
    const allList = [categoryList1, categoryList2, pinlei, spuList]
    allList.forEach((list) => list.sort(sortList))
    buildTree(pinlei, spuList, 'pinlei_id')
    buildTree(categoryList2, pinlei)
    buildTree(categoryList1, categoryList2)

    this.listTree = categoryList1
    this.loading = false
  }
}

export default new Store()
