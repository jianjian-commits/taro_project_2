import { observable, action, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import moment from 'moment'
import { t } from 'gm-i18n'

const initFilter = {
  date_type: 6,
  q: '',
  begin: moment(),
  end: moment(),
  status: 0,
  technic_category_ids: [], // 工艺类型id
  workshop_ids: [], //  车间id
  only_get_proc_id: 0, // 用于获取全部加工单的id，0 否 1是，默认0
}

class Store {
  @observable filter = { ...initFilter }

  // 工艺类型列表
  @observable technicCategoryList = []
  // 工艺类型选择
  @observable technicCategorySelected = []

  // 车间列表
  @observable workShopList = []
  // 车间选择
  @observable workShopSelected = []

  // 列表
  @observable list = []

  @observable loading = false

  @observable doFirstRequest = _.noop

  // 表格选择
  @observable listSelected = []

  @observable isSelectAllPage = false

  _filterCache = {}

  @action
  setFirstRequestFunc(func) {
    this.doFirstRequest = func
  }

  @action.bound
  clearTableSelected() {
    this.listSelected = []
    this.isSelectAllPage = false
  }

  @action
  changeFilter(name, value) {
    this.filter[name] = value
  }

  @action
  changeListSelected(selected) {
    if (selected.length !== this.list.length) {
      this.isSelectAllPage = false
    }
    this.listSelected = selected
  }

  @action
  changeSelectAll(bool) {
    this.isSelectAllPage = bool
    if (this.isSelectAllPage) {
      this.selected = _.map(this.list, (v) => v.id)
    }
  }

  @action
  changeWorkShopSelected(selected) {
    this.workShopSelected = selected
    this.filter.workshop_ids = _.map(selected, (item) => item.value)
  }

  @action
  changeTechnicCategorySelected(selected) {
    this.technicCategorySelected = selected
    this.filter.technic_category_ids = _.map(selected, (item) => item.value)
  }

  @action
  getFilter() {
    const { begin, end, workshop_ids, technic_category_ids } = this.filter
    return {
      ...this.filter,
      workshop_ids:
        workshop_ids.length > 0 ? JSON.stringify(workshop_ids) : undefined,
      technic_category_ids:
        technic_category_ids.length > 0
          ? JSON.stringify(technic_category_ids)
          : undefined,
      end: moment(end).format('YYYY-MM-DD'),
      begin: moment(begin).format('YYYY-MM-DD'),
    }
  }

  // 获取表格选择的id,taskID
  @action
  getTableSelectedIds() {
    const idList = []
    const taskIds = []
    // selected是list的index，因此需要重新获取数据
    _.each(this.listSelected, (selected) => {
      console.log(selected, 'selected')
      const id = this.list[selected].id
      taskIds.push(this.list[selected].task_id)
      if (!idList.includes(id)) {
        idList.push(id)
      }
    })

    return { idList, taskIds }
  }

  /**
   * 获取工艺类型列表
   */
  @action
  fetchTechnicCategoryList() {
    return Request('/process/technic_category/list')
      .data({ limit: 1000 })
      .get()
      .then((json) => {
        runInAction(() => {
          const list = _.map(json.data, (item) => {
            return {
              ...item,
              text: item.name,
              value: item.id,
            }
          })

          list.push({ text: t('无'), value: 0 })
          this.technicCategoryList = list
        })

        return json
      })
  }

  /**
   * 获取车间列表
   * @returns {Promise<object>}
   */
  @action fetchWorkShopList() {
    return Request('/process/workshop/list')
      .data({ limit: 1000 })
      .get()
      .then((result) => {
        runInAction(() => {
          const { data } = result
          const list = _.map(data, (item) => {
            return {
              ...item,
              text: item.name,
              value: item.workshop_id,
            }
          })

          list.push({ text: t('无'), value: 0 })

          this.workShopList = list
        })
        return result
      })
  }

  /**
   * 获取列表页数据
   * @param {object} pagination 分页信息
   */
  @action.bound fetchList(pagination = {}) {
    this.loading = true
    const filter = this.getFilter()

    return Request('/stock/process/process_order/list_by_technic')
      .data({ ...pagination, ...filter })
      .get()
      .then((result) => {
        runInAction(() => {
          const { data } = result
          const listData = _.map(data, (item, index) => {
            return { ...item, _index: index }
          })
          // 记录一下搜索后的筛选条件，打印需要
          this._filterCache = { ...this.filter }
          this.list = listData
        })
        return result
      })
      .finally(() => {
        runInAction(() => {
          this.loading = false
        })
      })
  }

  @action fetchListAllIds = () => {
    const req = { ...this.getFilter(), only_get_proc_id: 1 }
    return Request('/stock/process/process_order/list_by_technic')
      .data(req)
      .get()
      .then((json) => {
        return json
      })
  }
}

export default new Store()
