import { Request } from '@gm-common/request'
import { action, observable, runInAction } from 'mobx'
import Row from './Row'

class Store {
  constructor() {
    this.newItem()
  }

  /**
   * Table列表
   * @type {Row[]}
   *  */
  @observable list = []

  /**
   * @type {string[]}
   */
  @observable selected = []

  /**
   *
   * @param {Array<string>} batchNumbers
   * @returns
   */
  @action fetchList(batchNumbers) {
    return Request('/stock/batch/search/food_security_food')
      .data({
        query_type: 3,
        batch_numbers: JSON.stringify(batchNumbers),
      })
      .get()
      .then(({ data: list }) => {
        runInAction(() => {
          this.list = []
          list.forEach((data) => {
            const row = new Row(data)
            this.newItem(row)
          })
        })
      })
  }

  @action newItem(row) {
    this.list.push(row || new Row())
  }

  @action removeItem(index) {
    this.list.splice(index, 1)
  }

  @action removeSelected() {
    this.selected.forEach((id) => {
      const index = this.list.findIndex((item) => item.id === id)
      if ([-1].includes(index)) return
      this.list.splice(index, 1)
    })
    this.selected = []
    if (!this.list.length) {
      this.newItem()
    }
  }

  /**
   *
   * @param {number} index
   * @param {Row} item
   */
  @action setItem(index, item) {
    this.list.splice(index, 1, item)
  }

  /**
   * 设置已选中的table列表
   * @param {Array<Object>} selected
   *  */
  @action setSelected(selected) {
    this.selected = selected
  }
}
const store = new Store()
export default store
