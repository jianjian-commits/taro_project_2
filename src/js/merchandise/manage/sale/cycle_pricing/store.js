import { action, observable } from 'mobx'
import _ from 'lodash'
import moment from 'moment'
import { formatPostData } from '../../../../common/util'
import {
  cyclePriceListReq,
  deleteCyclePriceReq,
  salemenuListReq,
} from './service'
import { reqTimeFormat } from './utils'

// 初始筛选数据
const INITIAL_FILTER = {
  rule_id: '',
  rule_name: '',
  rule_status: 1,
  salemenu_id: '',
  salemenu_name: '',
  start_time: new Date(moment().add(-1, 'M')),
  end_time: new Date(),
  offset: 0,
  limit: 10,
}

// 新建/编辑规则初始值
const INITIAL_RULE = {
  rule_name: '',
  salemenu_id: '',
  salemenu_name: '',
  effective_time: null,
  file: null,
}

class Store {
  // 周期定价规则筛选数据
  @observable cyclePriceFilter = INITIAL_FILTER

  // 周期定价列表数据
  @observable cyclePriceData = {
    data: [],
    pagination: {},
  }

  // 加载状态
  @observable loading = false

  // 是否全选所有页面
  @observable isAllPageSelect = false

  // 被选定的规则列表
  @observable tableSelected = []

  // 周期定价规则
  @observable cyclePriceRule = INITIAL_RULE

  // 报价单列表
  @observable salemenuList = []

  @observable doCyclePriceFirstRequest = _.noop()

  @observable doCyclePriceCurrentRequest = _.noop()

  // 通过下面方法将分页数据更新到组件内部
  @action
  setDoFirstRequest(firstfunc, currentfunc) {
    // 请求列表第一页数据
    this.doCyclePriceFirstRequest = firstfunc
    // 请求当前页数据
    this.doCyclePriceCurrentRequest = currentfunc
  }

  // 获取列表数据
  @action
  getCyclePriceList() {
    this.loading = true
    const { start_time, end_time } = this.cyclePriceFilter
    return cyclePriceListReq({
      ...this.cyclePriceFilter,
      start_time: start_time ? reqTimeFormat(start_time) : '',
      end_time: end_time ? reqTimeFormat(end_time) : '',
    }).then((json) => {
      this.isAllPageSelect = false
      this.selectAll(false)
      this.loading = false
      this.cyclePriceData = json
      if (this.cyclePriceFilter.rule_id && !this.cyclePriceFilter.rule_name) {
        if (this.cyclePriceData.data.length) {
          this.cyclePriceFilter.rule_name = this.cyclePriceData.data[0]?.rule_name
        } else {
          this.cyclePriceFilter.rule_id = ''
        }
      }
      return json
    })
  }

  // 筛选信息变更
  @action
  filterChange(obj) {
    this.cyclePriceFilter = {
      ...this.cyclePriceFilter,
      ...obj,
    }
  }

  // 选择列表数据
  @action
  onTableSelect(selected) {
    this.tableSelected = selected
  }

  // 设置是否选择所有变量
  @action
  setIsAllPageSelect(isAllPageSelect) {
    this.isAllPageSelect = isAllPageSelect
    this.selectAll(true)
  }

  // 选中页面内所有数据
  @action
  selectAll(isSelectAll) {
    this.tableSelected = isSelectAll
      ? _.map(this.cyclePriceData.data, (v) => v.rule_id)
      : []
  }

  // 清除列表选项
  @action
  clearSelect() {
    this.tableSelected = []
  }

  @action
  // 初始化规则弹窗数据
  clearCyclePriceRule() {
    this.cyclePriceRule = INITIAL_RULE
  }

  // 数据初始化
  @action
  clearStore() {
    this.cyclePriceFilter = INITIAL_FILTER
    this.data = {
      list: [],
    }
    this.loading = false
    this.tableSelected = []
  }

  // 获取报价单列表
  @action
  getSalemenuList() {
    salemenuListReq({ type: -1, with_sku_num: 1, q: '' }).then((json) => {
      this.salemenuList = json.data.map((salemenuItem) => {
        return {
          value: salemenuItem.id,
          text: salemenuItem.name,
        }
      })
    })
  }

  // 修改周期定价规则
  @action
  changeCyclePriceRule(obj) {
    this.cyclePriceRule = {
      ...this.cyclePriceRule,
      ...obj,
    }
  }

  // 删除周期定价规则
  @action
  deleteCyclePriceRule(params, isBatch) {
    if (!params.all) {
      params.all = 0
    }
    deleteCyclePriceReq(formatPostData(params)).then(() => {
      if (
        params.all ||
        this.tableSelected.length === this.cyclePriceData.data.length
      ) {
        this.doCyclePriceFirstRequest()
      } else {
        this.doCyclePriceCurrentRequest()
      }
      if (isBatch) {
        this.tableSelected = []
        this.isAllPageSelect = false
      }
    })
  }
}

export default new Store()
