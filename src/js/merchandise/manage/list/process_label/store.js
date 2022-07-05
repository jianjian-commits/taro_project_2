import { observable, action, runInAction } from 'mobx'
import { Request } from '@gm-common/request'

const initFilter = {
  q: null,
}

class Store {
  // 筛选条件
  @observable filter = { ...initFilter }
  // 列表
  @observable list = []

  // 新建详情
  @observable newLabelDetail = { name: '' }

  @action
  clearNew() {
    this.newCategoryDetail = { name: '' }
  }

  /**
   * 改变筛选条件
   * @param {string}} name 字段名
   * @param {string} value 值
   */
  @action
  changeFilter(name, value) {
    this.filter[name] = value
  }

  @action.bound
  changeLabelDetail(name, value) {
    this.newLabelDetail[name] = value
  }

  /**
   * 获取工艺类型列表
   */
  @action.bound
  fetchList() {
    const req = { q: this.filter.q }

    return Request('/process/label/list')
      .data(req)
      .get()
      .then((json) => {
        runInAction(() => {
          this.list = json.data
        })
        return json
      })
  }

  @action
  newLabel() {
    const req = { name: this.newLabelDetail.name }

    return Request('/process/label/create').data(req).post()
  }

  /**
   *  删除工艺类型
   * @param {int} id 工艺id
   */
  @action
  deleteLabel(id) {
    const req = { id }

    return Request('/process/label/delete').data(req).post()
  }
}

export default new Store()
