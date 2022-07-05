import { observable, action, runInAction } from 'mobx'
import { Request } from '@gm-common/request'

const initFilter = {
  q: null,
}

class Store {
  // 筛选条件
  @observable filter = { ...initFilter }
  // 工艺类型列表
  @observable technicCategoryList = []

  // 工艺类型列表
  @observable newCategoryDetail = { name: '' }

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

  @action
  changeCategoryDetail(name, value) {
    this.newCategoryDetail[name] = value
  }

  /**
   * 获取工艺类型列表
   */
  @action
  fetchTechnicCategoryList(query = { limit: 1000 }) {
    const req = { q: this.filter.q, ...query }

    return Request('/process/technic_category/list')
      .data(req)
      .get()
      .then((json) => {
        runInAction(() => {
          this.technicCategoryList = json.data
        })
        return json
      })
  }

  @action
  newTechnicCategory() {
    const req = { name: this.newCategoryDetail.name }

    return Request('/process/technic_category/create').data(req).post()
  }

  /**
   *  删除工艺类型
   * @param {int} id 工艺id
   */
  @action
  deleteTechnicCategory(id) {
    const req = { id }

    return Request('/process/technic_category/delete').data(req).post()
  }
}

export default new Store()
