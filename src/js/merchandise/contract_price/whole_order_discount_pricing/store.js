import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import Big from 'big.js'
import globalStore from 'stores/global'

const initFilter = {
  address_text: '',
  status: 3, // 3：有效 1：无效
  rule_object_type: 4, // 3：上浮定价 4：整单折扣定价
}
const {
  orderInfo: { contract_rate_format },
} = globalStore
const isPercent = contract_rate_format === 1
const initPagination = {
  count: 0,
  offset: 0,
  limit: 10,
}

class Store {
  @observable filter = initFilter

  @observable dataList = []

  @observable loading = false

  @observable doFirstRequest = _.noop()

  @observable pagination = initPagination

  /**
   * 设置页码改变时触发的请求方法
   * @param {func} func 页码开放的请求api
   */
  @action
  setDoFirstRequest(func) {
    this.doFirstRequest = func
  }

  @action
  onChangeFilter = (name, value) => (this.filter[name] = value)

  @action
  onRowChange = (index, key, value) => {
    const list = this.dataList.slice()
    const target = list[index]
    list[index] = {
      ...target,
      [key]: value,
    }
    this.dataList = list
  }

  @action
  fetchList = (pagination = initPagination) => {
    this.loading = true
    const params = {
      ...this.filter,
      cur_page: pagination.offset / pagination.limit || 0,
      cnt_per_page: pagination.limit || 10,
    }

    return Request('/station/price_rule/search')
      .data(params)
      .get()
      .then((res) => {
        const {
          data: { list, pagination },
        } = res
        this.dataList = list
        this.pagination = pagination
        this.loading = false
        return { data: list, pagination }
      })
      .finally(() => {
        this.loading = false
      })
  }

  @action
  onSave = (rowData) => {
    const {
      _id,
      rule_object_type,
      addresses,
      edit_status,
      status,
      edit_rate,
      change_rate,
    } = rowData
    let changeRate = 0
    if (typeof edit_rate === 'number') {
      changeRate = isPercent
        ? Big(edit_rate).plus(100)
        : Big(edit_rate).times(100)
    } else {
      changeRate = change_rate
    }

    const params = {
      price_rule_id: _id,
      rule_object_type,
      address_ids: JSON.stringify(addresses),
      status: edit_status || status,
      change_rate: changeRate,
    }

    return Request('/station/price_rule/edit').data(params).post()
  }

  /**
   *
   * @param {object} rowData 当前行的数据
   */
  @action
  onDelete = (rowData) => {
    const { _id, change_rate, addresses } = rowData
    const params = {
      price_rule_id: _id,
      address_ids: JSON.stringify(addresses),
      change_rate,
      rule_object_type: 4,
      status: 0,
    }

    return Request('/station/price_rule/edit').data(params).post()
  }
}

export default new Store()
