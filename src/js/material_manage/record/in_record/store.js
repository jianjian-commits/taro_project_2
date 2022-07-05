import { action, observable, runInAction, toJS } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import _ from 'lodash'
import {
  exportExcel,
  emptyRender,
  formatDate,
  formatDateTime,
} from '../../util'
import { i18next } from 'gm-i18n'
import { Tip } from '@gmfe/react'

const initFilter = {
  start_date: moment().subtract(7, 'days'),
  end_date: moment(),
  status: '',
  q: '',
}
class Store {
  export = {
    options: {
      finish_time: ({ value }) => {
        return [i18next.t('归还日期'), emptyRender(value, formatDateTime)]
      },
      sid: i18next.t('商户ID'),
      sname: i18next.t('商户名'),
      tid: i18next.t('周转物ID'),
      tname: i18next.t('周转物名称'),
      apply_amount: ({ value, row }) => {
        const text = value + row.unit_name
        return [i18next.t('申请归还数'), text]
      },
      amount: ({ value, row }) => {
        const text = value + row.unit_name
        return [i18next.t('实际归还数'), text]
      },
      return_type: ({ value, row }) => {
        let text = ''
        switch (value) {
          case 1:
            text = i18next.t('业务平台')
            break
          case 2:
            text = i18next.t('司机')
            break
        }

        return [i18next.t('归还类型'), text]
      },
      operator: ({ value, row }) => {
        return [i18next.t('归还人'), value]
      },
      status: ({ value }) => {
        const curStatus = this.getStatus(value)
        return [i18next.t('状态'), curStatus.text]
      },
      driver_name: i18next.t('司机'),
    },
    fileName: i18next.t('周转物归还列表.xlsx'),
  }

  @observable
  filter = initFilter

  @observable
  inRecordList = []

  dateLabel = i18next.t('按归还日期')

  // 归还状态
  statusList = [
    { value: '', text: i18next.t('全部') },
    { value: 1, text: i18next.t('待归还') },
    { value: 2, text: i18next.t('已归还') },
    { value: 3, text: i18next.t('已删除') },
  ]

  validStatusList = this.statusList.slice(1, 3)

  constructor() {
    this.initNewRecord()
  }

  getStatus = (statusId) => {
    const status = _.find(this.statusList, ({ value }) => {
      if (value === statusId) {
        return true
      }
    })
    return status
  }

  setPagination(p) {
    // 重新拉取 list 需要
    this.pagination = p
  }

  initNewRecord() {
    this.newInRecord = observable({
      selectedAddress: null, // 商户
      selectedMaterial: null, // 周转物
      amount: '',
      selectedDriver: [], // 司机 cascader 需要是数组 第一项为 carrier
      max: null,
    })
  }

  getNewRecord() {
    const {
      selectedAddress,
      selectedMaterial,
      amount,
      selectedDriver,
    } = this.newInRecord
    return {
      address_id: selectedAddress.id,
      tid: selectedMaterial.id,
      amount,
      driver_id: selectedDriver[1],
    }
  }

  handleSearch = () => {
    const error = this.validateQueryParams()
    if (error) {
      Tip.warning(error)
      return
    }
    this.pagination.apiDoFirstRequest()
  }

  @action
  handleNewChange = (field, value) => {
    this.newInRecord[field] = value
  }

  @action
  handleInRecordListChange = async (index, field, value) => {
    const record = this.inRecordList[index]
    const {
      id,
      amount,
      _amount,
      status,
      _status,
      driver_id,
      _driver_id,
    } = record
    // 实际归还数有值时自动改变状态为已归还
    const change_status = _amount
      ? _.find(this.statusList, { text: i18next.t('已归还') }).value
      : _status
    // 如果两个状态相同，则不需要修改，赋值null，value为null的会在解构的时候被去掉
    const diff = {
      amount: amount === _amount ? null : _amount,
      status: status === change_status ? null : change_status,
      // eslint-disable-next-line prettier/prettier
      driver_id: driver_id === _driver_id ? null : _driver_id,
    }
    const params = {
      id,
      ...diff,
    }
    await Request('/station/turnover/return_sheet/update').data(params).post()
    this.pagination.apiDoCurrentRequest()
    Tip.success(i18next.t('修改成功！'))
  }

  @action
  async createNewRecord() {
    const newParams = this.getNewRecord()
    console.log('newParams', newParams)
    await Request('/station/turnover/return_sheet/create')
      .data(newParams)
      .post()
    this.initNewRecord()
    this.pagination.apiDoFirstRequest()
  }

  @action.bound
  handleFilterChange(field, value) {
    this.filter[field] = value
  }

  getQueryParams() {
    const params = toJS(this.filter)
    let { start_date, end_date, status } = this.filter
    // 状态为全部的时候不传status
    if (status === '') status = null
    start_date = formatDate(start_date)
    end_date = formatDate(end_date)
    return {
      ...params,
      start_date,
      end_date,
    }
  }

  validateQueryParams() {
    const params = this.getQueryParams()
    if (moment(params.start_date).add(31, 'd').isBefore(params.end_date)) {
      return i18next.t('时间范围不能超过31天')
    }
  }

  handleExport = async () => {
    const params = {
      export: 1,
      ...this.getQueryParams(),
    }
    const { data } = await Request('/station/turnover/return_sheet/list')
      .data(params)
      .get()
    exportExcel(this.export, [data])
  }

  async handleDelete(index) {
    const { id } = this.inRecordList[index]
    await Request('/station/turnover/return_sheet/delete').data({ id }).post()
    this.handleSearch()
  }

  @action
  fetchInRecordList = (pagination = {}) => {
    const params = {
      count: 1,
      ...this.getQueryParams(),
      ...pagination,
    }

    return Request('/station/turnover/return_sheet/list')
      .data(params)
      .get()
      .then((json) => {
        runInAction(() => {
          this.inRecordList = _.map(json.data, (v) => ({
            ...v,
            // 内部变量，用来记录正在编辑时的值
            _amount: v.amount, // 数量
            _status: v.status, // 状态
            _driver_id: v.driver_id, // 司机
          }))
        })
        return json
      })
  }

  @action
  toggleEditable = (index) => {
    const target = this.inRecordList[index]
    // 取消编辑，状态还原
    if (target._edit) {
      target._amount = target.amount
      target._status = target.status
      target._driver_id = target.driver_id
    }
    this.inRecordList = _.map(this.inRecordList, (v, i) => {
      // _edit内部变量，控制编辑状态
      if (i === index) return { ...v, _edit: !target._edit }
      return v
    })
  }

  @action
  changeInnerStatus = (item, index) => {
    this.inRecordList = _.map(this.inRecordList, (v, i) => {
      if (i === index) return { ...v, ...item }
      return v
    })
  }

  @action
  handleReset() {
    this.filter = initFilter
  }

  @action
  changeInRecord(value) {
    const { selectedAddress, selectedMaterial, max } = value
    this.newInRecord = observable({
      selectedAddress,
      selectedMaterial,
      max,
      amount: '',
      selectedDriver: [],
    })
  }
}

export default new Store()
