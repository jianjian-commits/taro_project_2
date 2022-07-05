import { action, toJS, observable, computed } from 'mobx'
import moment from 'moment'
import {
  processPlanListGet,
  getTaskList,
  getRoleList,
  getUserList,
  submitProcessOrder,
} from '../api'
import _ from 'lodash'

const date = moment().startOf('day')

const addDefaultDateToTaskList = (list) => {
  const ret = _.map(list, (item) => {
    item.plan_start_time = item.create_time
    item.userList = []
    return item
  })

  return ret || []
}

class PlanListStore {
  @observable doFirstRequest = _.noop()

  @observable dateType = 5

  @observable beginDate = date

  @observable endDate = date

  @observable searchContent = ''

  // 状态筛选
  @observable status = ''

  // 列表
  @observable list = []

  @observable taskList = []

  // 所有角色列表
  @observable roleList = []

  // 所有工人列表
  @observable userList = []

  // 选中计划列表
  @observable selectedPlanList = []

  // 选中计划列表所有页
  @observable isSelectAllPage = false

  // 采购来源
  @observable source_type = 0

  @action
  setDoFirstRequest(func) {
    // doFirstRequest有ManagePaginationV2提供
    this.doFirstRequest = func
  }

  @action
  clearTableSelect() {
    this.selectedPlanList = []
    this.isSelectAllPage = false
  }

  @action
  setFilterDetail(name, value) {
    this[name] = value
  }

  @action
  setDateRangeDetail(begin, end) {
    this.beginDate = begin
    this.endDate = end
  }

  @computed
  get detail() {
    const data = {
      date_type: this.dateType,
      begin: moment(this.beginDate).format('YYYY-MM-DD'),
      end: moment(this.endDate).format('YYYY-MM-DD'),
      q: this.searchContent === '' ? null : this.searchContent,
      status: this.status === '' ? null : this.status,
      source_type: this.source_type,
    }
    return data
  }

  @action
  getSearchList(pagination = {}) {
    // need_unrelease区分是加工计划还是加工单据的接口
    const data = Object.assign({}, toJS(this.detail), pagination, {
      need_unrelease: 1,
    })
    return processPlanListGet(data)
  }

  @action
  getProcessTaskList(idList) {
    if (idList && idList.length > 0) {
      return getTaskList(JSON.stringify(idList)).then((json) => {
        const data = json.data
        const tasks = addDefaultDateToTaskList(data)
        this.taskList = tasks
      })
    } else {
      return Promise.resolve(null)
    }
  }

  // 获取所有角色
  @action
  getRoleList() {
    return getRoleList().then((json) => {
      const data = json.data
      this.roleList = data.roles
    })
  }

  // 获取所有员工
  @action
  getUserList() {
    return getUserList().then((json) => {
      this.userList = json.data.users
      return json.data.users
    })
  }

  // 根据角色获取员工
  @action
  getUserListAndSetTask(index, role_id) {
    const userList = this.userList

    if (!role_id) {
      this.taskList[index].userList = []
      this.taskList[index].worker_id = ''
    } else {
      this.taskList[index].userList = _.filter(
        userList,
        (item) => !!_.find(toJS(item.roles), (role) => role.id === role_id)
      )
      this.taskList[index].worker_id = ''
    }
  }

  // taskList set
  @action
  setTaskListByIndex(index, name, value) {
    this.taskList[index][name] = value
  }

  // taskList submit
  @action
  submitProcessOrder(list) {
    const postList = _.map(list, (item) => {
      const postItem = {}
      postItem.id = item.id
      postItem.proc_order_id = item.proc_order_id
      item.role_id && (postItem.role_id = item.role_id)
      item.worker_id && (postItem.worker_id = item.worker_id)
      if (item.plan_start_time) {
        postItem.plan_start_time = moment(item.plan_start_time).format(
          'YYYY-MM-DD'
        )
      }
      if (item.plan_finish_time) {
        postItem.plan_finish_time = moment(item.plan_finish_time).format(
          'YYYY-MM-DD'
        )
      }
      return postItem
    })
    return submitProcessOrder(JSON.stringify(postList))
  }

  @action
  setSelectedList(selected) {
    this.selectedPlanList = selected

    const allCanSelect = this.list
      .slice()
      .filter((item) => item.status !== 2 && item.status !== 3)
      .map((item) => item.id)
    if (selected.length < allCanSelect.length) {
      this.isSelectAllPage = false
    }
  }

  @action
  toggleIsSelectAllPage(bool) {
    this.isSelectAllPage = bool
    this.selectedPlanList = this.list
      .slice()
      .filter((item) => item.status !== 2 && item.status !== 3)
      .map((item) => item.id)
  }
}

export default new PlanListStore()
