import { action, observable } from 'mobx'
import moment from 'moment'
import globalStore from 'stores/global'
import { getList, update } from '../service'

/**
 * 初始的筛选条件
 */
const initFilterRules = {
  status: 3,
  limit: 10,
  offset: 0,
}

/**
 * 初始的分页规则
 */
const initPagination = {
  count: 0,
  offset: 0,
  limit: 10,
}

/**
 * 报价规则的Store类，用于供应商周期报价规则相关操作
 */
class Store {
  @observable filterRules = {
    ...initFilterRules,
  }

  @observable data = []
  @observable loading = false
  @observable pagination = { ...initPagination }

  /**
   * 获取供应商周期报价规则列表
   * @param  {Object} pagination 分页规则
   * @return {Object}            供应商周期报价规则数据
   */
  @action
  getList(pagination = {}) {
    this.loading = true
    const params = { ...this.filterRules, ...pagination, count: 1 }
    if (globalStore.isSettleSupply()) {
      // 如果是供应商登录，需要加上该供应商id
      params.settle_supplier_id = globalStore.user.station_id
    }
    return getList(params).then((json) => {
      this.loading = false
      const { data, pagination } = json
      this.data = data
      this.pagination = pagination
      return json
    })
  }

  /**
   * 更新筛选条件
   * @param  {Object} obj 新的筛选条件
   */
  @action
  filterChange(obj) {
    this.filterRules = {
      ...this.filterRules,
      ...obj,
    }
  }

  /**
   * 编辑周期报价规则数据
   * @param  {number} index    报价规则的行编号
   * @param  {Object} original 原始的报价规则数据
   */
  @action
  editRow(index, original) {
    const { status, begin_time, end_time } = original
    this.data[index] = {
      ...original,
      updated: {
        status: status,
        begin_time: begin_time,
        end_time: end_time,
      },
    }
  }

  /**
   * 保存周期报价规则数据
   * @param  {number}   index    报价规则的行编号
   * @param  {Object}   original 原始的报价规则数据
   * @param  {function} callback 保存后执行的回调函数
   */
  @action
  saveRow(index, original, callback) {
    const { quote_rule_id, updated } = original
    const { begin_time, end_time, status } = updated
    const submitParams = {
      quote_rule_id,
      begin_time: moment(begin_time).format('YYYY-MM-DD HH:mm:ss'),
      end_time: moment(end_time).format('YYYY-MM-DD HH:mm:ss'),
      status,
    }
    update(submitParams).then((res) => {
      if (res?.code === 0) {
        callback()
      }
    })
  }

  /**
   * 取消编辑周期报价规则数据
   * @param  {number} index    报价规则的行编号
   * @param  {Object} original 原始的报价规则数据
   */
  @action
  cancelEdit(index, original) {
    delete original.updated
    this.data[index] = { ...original }
  }

  /**
   * 更新周期报价规则数据
   * @param  {number} index    报价规则的行编号
   * @param  {Object} original 原始的报价规则数据
   * @param  {Object} newData  更新的报价规则数据
   */
  @action
  changeRow(index, original, newData) {
    this.data[index] = { ...original, ...newData }
  }

  /**
   * 初始化Store
   */
  @action
  clearStore() {
    this.filterRules = {
      ...initFilterRules,
    }

    this.data = []

    this.pagination = { ...initPagination }
  }
}

export default new Store()
