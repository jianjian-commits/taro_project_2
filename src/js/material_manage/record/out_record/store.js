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
import { Tip, Dialog } from '@gmfe/react'
import React from 'react'

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
        return [i18next.t('借出日期'), emptyRender(value, formatDateTime)]
      },
      sid: i18next.t('商户ID'),
      sname: i18next.t('商户名'),
      out_stock_sheet_id: ({ value }) => {
        return [i18next.t('关联出库单'), emptyRender(value)]
      },
      tname: i18next.t('周转物名称'),
      apply_amount: ({ value, row }) => {
        const text = value + row.unit_name
        return [i18next.t('预借出数'), text]
      },
      amount: ({ value, row }) => {
        const text = value + row.unit_name
        return [i18next.t('借出数'), text]
      },
      loan_type: ({ value, row }) => {
        let text = ''
        switch (value) {
          case 1:
            text = i18next.t('业务平台')
            break
          case 2:
            text = i18next.t('分拣')
            break
          case 3:
            text = i18next.t('司机')
            break
        }

        return [i18next.t('借出类型'), text]
      },
      operator: ({ value, row }) => {
        return [i18next.t('借出人'), value]
      },
      status: ({ value }) => {
        const curStatus = this.getStatus(value)
        return [i18next.t('状态'), curStatus.text]
      },
      driver_name: i18next.t('司机'),
    },
    fileName: i18next.t('周转物借出列表.xlsx'),
  }

  @observable
  isSelectAll = false

  @observable
  selectedRecord = []

  @observable
  filter = initFilter

  outRecordIndex = {}

  @observable selectAll = false

  // 保存 id -> record 的索引 map
  @observable
  outRecordList = []

  dateLabel = i18next.t('按借出日期')

  // 借出状态
  statusList = [
    { value: '', text: i18next.t('全部') },
    { value: 1, text: i18next.t('待借出') },
    { value: 2, text: i18next.t('已借出') },
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

  initNewRecord = () => {
    this.newOutRecord = observable({
      selectedAddress: null, // 商户
      selectedMaterial: null, // 周转物
      amount: '',
      out_stock_sheet_id: '', // 关联出库单 id
      selectedDriver: [], // 司机 cascader 需要是数组 第一项为 carrier
    })
  }

  getNewRecord() {
    const {
      selectedAddress,
      selectedMaterial,
      amount,
      selectedDriver,
      out_stock_sheet_id,
    } = this.newOutRecord
    return {
      address_id: selectedAddress.id,
      tid: selectedMaterial.id,
      amount,
      out_stock_sheet_id,
      driver_id: selectedDriver[1],
    }
  }

  validateQueryParams() {
    const params = this.getQueryParams()
    if (moment(params.start_date).add(31, 'd').isBefore(params.end_date)) {
      return i18next.t('时间范围不能超过31天')
    }
  }

  handleSearch = () => {
    const error = this.validateQueryParams()
    if (error) {
      Tip.warning(error)
      return
    }
    this.pagination.apiDoFirstRequest()
    this.resetSelected()
  }

  @action
  handleNewChange = (field, value) => {
    this.newOutRecord[field] = value
  }

  @action
  handleSelect = (selected) => {
    this.selectedRecord = selected
  }

  @action
  resetSelected = () => {
    this.isSelectAll = false
    this.selectedRecord = []
  }

  @action
  handleSelectAllRecord = (all) => {
    const selected = []
    if (all) {
      _.each(this.outRecordList, (record) => {
        // 待借出 才能勾选
        if (record.status === 1) {
          selected.push(record.id)
        }
      })
    }
    this.selectedRecord = selected
  }

  @action
  handleOutRecordListChange = async (index, field, value) => {
    const record = this.outRecordList[index]
    const {
      id,
      out_stock_sheet_id,
      _out_stock_sheet_id,
      is_sync_by_order,
      amount,
      _amount,
      status,
      _status,
      driver_id,
      _driver_id,
    } = record
    // 借出数有值时自动改变状态为已归还
    const change_status = _amount
      ? _.find(this.statusList, { text: i18next.t('已借出') }).value
      : _status
    // 如果两个状态相同，则不需要修改，赋值null，value为null的会在解构的时候被去掉
    const diff = {
      out_stock_sheet_id:
        out_stock_sheet_id === _out_stock_sheet_id || is_sync_by_order
          ? null
          : _out_stock_sheet_id,
      amount: amount === _amount ? null : _amount,
      status: status === change_status ? null : change_status,
      // eslint-disable-next-line prettier/prettier
      driver_id: driver_id === _driver_id ? null : _driver_id,
    }

    const params = {
      id,
      ...diff,
    }
    await Request('/station/turnover/loan_sheet/update').data(params).post()
    this.pagination.apiDoCurrentRequest()
    Tip.success(i18next.t('修改成功！'))
  }

  @action
  async createNewRecord() {
    const newParams = this.getNewRecord()
    await Request('/station/turnover/loan_sheet/create').data(newParams).post()
    this.initNewRecord()
    this.handleSearch()
  }

  handleBatchOut = () => {
    let params = null
    if (this.selectAll) {
      // 全选
      params = this.getQueryParams()
    } else {
      if (this.selectedRecord.length === 0) {
        Tip.warning(i18next.t('请选择借出条目'))
        return
      }
      const ids = JSON.stringify(this.selectedRecord)
      params = { ids }
    }
    return Request('/station/turnover/loan_sheet/batch_loan')
      .data(params)
      .post()
      .then((json) => {
        this.handleSearch()
        return json
      })
      .then(({ data }) => {
        const failReasons = {
          deleted: i18next.t('出库单被删除'),
          before_submit: i18next.t('出库单未出库'),
        }
        const failText = []
        let sum = 0
        _.each(failReasons, (text, key) => {
          const num = data[key]
          if (num > 0) {
            sum += num
            failText.push(
              <div>
                {text}：<span className='gm-text-red'>{num}</span>{' '}
              </div>,
            )
          }
        })
        if (failText.length === 0) {
          Tip.success(i18next.t('批量借出成功！'))
        } else {
          Dialog.alert({
            title: i18next.t('批量借出结果'),
            children: (
              <div className='gm-padding-lr-10'>
                <div>
                  {' '}
                  {i18next.t('成功数')}：{data.success}{' '}
                </div>
                <div className='gm-margin-top-5'>
                  {' '}
                  {i18next.t('失败数')}：
                  <span className='gm-text-red'>{sum}</span>{' '}
                </div>
                <ul className='gm-padding-left-20'>
                  {_.map(failText, (el) => (
                    <li> {el} </li>
                  ))}
                </ul>
              </div>
            ),
          })
        }
      })
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
      status,
    }
  }

  handleExport = async () => {
    const params = {
      export: 1,
      ...this.getQueryParams(),
    }
    const { data } = await Request('/station/turnover/loan_sheet/list')
      .data(params)
      .get()
    exportExcel(this.export, [data])
  }

  async handleDelete(index) {
    const { id } = this.outRecordList[index]
    await Request('/station/turnover/loan_sheet/delete').data({ id }).post()
    this.pagination.apiDoCurrentRequest()
  }

  _updateOutRecordIndex() {
    // 更新索引
    const map = {}
    this.outRecordList.forEach((item, index) => {
      map[item.id] = index
    })
    this.outRecordIndex = map
  }

  @action
  fetchOutRecordList = async (pagination = {}) => {
    const params = {
      ...this.getQueryParams(),
      ...pagination,
      count: 1,
    }
    const json = await Request('/station/turnover/loan_sheet/list')
      .data(params)
      .get()
    runInAction(() => {
      this.outRecordList = _.map(json.data, (v) => ({
        ...v,
        // selectTable对selectField为Number类型有BUG
        id: String(v.id),
        // 内部变量，用来记录正在编辑时的值
        _out_stock_sheet_id: v.out_stock_sheet_id, // 关联出库单
        _amount: v.amount, // 数量
        _status: v.status, // 状态
        _driver_id: v.driver_id, // 司机
      }))
    })
    this._updateOutRecordIndex()
    return json
  }

  @action
  toggleEditable = (index) => {
    const target = this.outRecordList[index]
    // 取消编辑，状态还原
    if (target._edit) {
      target._out_stock_sheet_id = target.out_stock_sheet_id
      target._amount = target.amount
      target._status = target.status
      target._driver_id = target.driver_id
    }
    this.outRecordList = _.map(this.outRecordList, (v, i) => {
      // _edit内部变量，控制编辑状态
      if (i === index) return { ...v, _edit: !target._edit }
      return v
    })
  }

  @action
  changeInnerStatus = (item, index) => {
    this.outRecordList = _.map(this.outRecordList, (v, i) => {
      if (i === index) return { ...v, ...item }
      return v
    })
  }

  @action
  handleChangeSelectAllType = (bool) => {
    this.selectAll = bool
  }

  @action
  handleReset = () => {
    this.filter = initFilter
  }
}

export default new Store()
