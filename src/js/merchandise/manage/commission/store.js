import { observable, action, computed } from 'mobx'
import { i18next } from 'gm-i18n'
import { Request } from '@gm-common/request'
import ObservableFilter from 'common/observable_filter'

class Store {
  statusList = [
    { value: ObservableFilter.NULL, text: i18next.t('全部状态') },
    { value: 0, text: i18next.t('无效') },
    { value: 1, text: i18next.t('有效') },
  ]

  @observable
  filter = new ObservableFilter([
    {
      key: 'status',
      initial_value: 1,
    },
    {
      key: 'search_text',
      initial_value: '',
      value_for_request: (val) => val.trim(), // 发送请求需要转化的数据
    },
  ])

  @observable
  isLoading = false

  @observable
  detail = null

  @observable
  selectedSales = []

  @observable
  editIndex = -1

  @observable
  editStatus = 0

  @observable
  list = []

  @observable
  saleList = []

  // 分佣规则详情
  @observable
  ruleName = ''

  @observable
  ruleStatus = 1

  @observable
  searchIndex = -1

  @action
  init() {
    this.ruleName = ''
    this.searchIndex = -1
    this.ruleStatus = 1
    this.detail = null
    this.selectedSales = []
  }

  @action
  getList = (pagination) => {
    const req = {
      ...this.filter.requestParams,
      ...pagination,
    }
    return Request('/station/employee_rule/list')
      .data(req)
      .get()
      .then(
        action((json) => {
          this.list = json.data
          return json
        }),
      )
  }

  @action
  getSales = () => {
    Request('/station/employee/list')
      .get()
      .then(
        action((json) => {
          this.saleList = json.data.map(({ name, id, employee_rule_name }) => ({
            employee_rule_name,
            name,
            value: id,
          }))
        }),
      )
  }

  @action
  getDetail = (id) => {
    this.isLoading = true
    return Request('/station/employee_rule/get')
      .data({ id })
      .get()
      .then(
        action((json) => {
          const { name, status } = json.data
          this.detail = json.data
          this.ruleName = name
          this.ruleStatus = status
          this.selectedSales = json.data.employee_list.map((id) => ({
            value: id,
          }))
          this.isLoading = false
          return json.data
        }),
      )
  }

  @computed get leftSales() {
    return this.saleList.filter(
      (item) => !this.selectedSales.find((v) => v.value === item.value),
    )
  }

  @computed get rightSales() {
    return this.selectedSales
      .map((v) => this.saleList.find((item) => item.value === v.value))
      .filter((o) => o) // 把undefined,null等无效的值过滤掉
  }

  @action
  createEmployeeRule = (data) => {
    return Request('/station/employee_rule/create').data(data).post()
  }

  @action
  updateEmployeeRule = (req) => {
    return Request('/station/employee_rule/update').data(req).post()
  }

  @action
  changeSaleMenuGroup = (newRight) => {
    this.selectedSales = newRight
  }

  @action
  handleEdit = (index) => {
    this.editIndex = index
    if (index > -1) this.editStatus = this.list[index].status
  }

  @action
  handleSave = async (id) => {
    this.editIndex = -1
    await this.updateEmployeeRule({ id, status: this.editStatus })
    this.getList()
  }

  @action
  handleChange = (v, key) => {
    this[key] = v
  }

  @action
  handleChangeList = (v) => {
    this.editStatus = v
  }
}

export default new Store()
