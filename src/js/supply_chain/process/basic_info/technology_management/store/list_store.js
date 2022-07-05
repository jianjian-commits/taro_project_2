import { action, observable, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import { createRef } from 'react'
import _ from 'lodash'
import { i18next } from 'gm-i18n'

class Store {
  pagination = createRef()

  // 工艺列表
  @observable list = []

  // 搜索条件
  @observable filter = { q: '', technic_category_id: 0 }

  // 工艺类型
  @observable technicCategoryList = []

  @action
  changeFilter(name, value) {
    this.filter[name] = value
  }

  @action
  fetchTechnologyList(pagination) {
    const { q, technic_category_id } = this.filter

    const data = {
      limit: 10,
      q,
      technic_category_id:
        technic_category_id !== 0 ? technic_category_id : undefined,
      ...pagination,
    }

    return Request('/process/technic/list')
      .data(data)
      .get()
      .then((json) => {
        runInAction(() => {
          this.list = json.data.technic_data
        })

        return json
      })
  }

  /**
   * 获取工艺类型列表
   */
  @action
  fetchTechnicCategoryList(query = { limit: 1000 }) {
    return Request('/process/technic_category/list')
      .data(query)
      .get()
      .then((json) => {
        runInAction(() => {
          const data = _.map(json.data, (technic_category) => ({
            value: technic_category.id,
            text: technic_category.name,
          }))

          data.unshift({ value: 0, text: i18next.t('全部工艺类型') })
          data.push({ value: -1, text: i18next.t('无') })
          this.technicCategoryList = data
        })
        return json
      })
  }
}

export default new Store()
