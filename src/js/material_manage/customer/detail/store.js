import { action, observable, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import _ from 'lodash'
import {
  exportExcel,
  emptyRender,
  formatDate,
  formatDateTime,
  formatPrice,
} from '../../util'
import { i18next } from 'gm-i18n'
class Store {
  export = {
    options: {
      sid: i18next.t('商户ID'),
      sname: i18next.t('商户名'),
      tid: i18next.t('周转物ID'),
      tname: i18next.t('周转物名称'),
      finish_time: ({ value }) => {
        return [i18next.t('操作时间'), emptyRender(value, formatDateTime)]
      },
      loan_sheet_id: ({ value }) => {
        return [i18next.t('关联单据'), emptyRender(value)]
      },
      op_type: ({ value }) => {
        const type = this.getOperationType(value)
        return [i18next.t('操作类型'), type.text]
      },
      amount: ({ value, row }) => {
        const text = value + row.unit_name
        return [i18next.t('变动数量'), text]
      },
      price: ({ value }) => {
        const text = formatPrice(value)
        return [i18next.t('变动货值'), text]
      },
      driver_name: i18next.t('司机'),
    },
    fileName: i18next.t('周转物借出归还明细.xlsx'),
  }

  initFilter(args) {
    Object.assign(this.filter, args)
  }

  @observable
  filter = {
    sid: '', // 商户id
    tid: '', // 周转物id
    start_date: moment().subtract(7, 'days'),
    end_date: moment(),
    op_type: '',
  }

  @observable materialDetail = {}

  // 操作类型
  operationType = [
    { value: '', text: i18next.t('全部') },
    { value: 1, text: i18next.t('借出') },
    { value: 2, text: i18next.t('归还') },
    { value: 3, text: i18next.t('借出已删除') },
    { value: 4, text: i18next.t('归还已删除') },
  ]

  validStatusList = this.operationType.slice(1) // 似乎没用到validStatusList

  getOperationType = (typeId) => {
    const type = _.find(this.operationType, ({ value }) => {
      if (value === typeId) {
        return true
      }
    })
    return type
  }

  setPagination(p) {
    // 重新拉取 list 需要
    this.pagination = p
  }

  @action.bound
  handleFilterChange(field, value) {
    this.filter[field] = value
  }

  getQueryParams() {
    let { start_date, end_date, op_type } = this.filter
    start_date = formatDate(start_date)
    end_date = formatDate(end_date)
    // 操作类型为全部的时候，不传op_type
    if (op_type === '') op_type = null
    return {
      ...this.filter,
      start_date,
      end_date,
      op_type,
    }
  }

  handleExport = async () => {
    const params = {
      export: 1,
      ...this.getQueryParams(),
    }
    const { data } = await Request('/station/turnover/history/list')
      .data(params)
      .get()
    const list = data.op_list
    _.each(list, (row) => {
      row.sid = data.sid
      row.sname = data.sname
      row.tid = data.tid
      row.tname = data.tname
      row.unit_name = data.unit_name
    })
    exportExcel(this.export, [list])
  }

  @action
  fetchMaterialDetailList = async (pagination = {}) => {
    const params = {
      ...this.getQueryParams(),
      ...pagination,
    }
    const json = await Request('/station/turnover/history/list')
      .data(params)
      .get()
    runInAction(() => {
      this.materialDetail = json.data
    })
    return json
  }
}

export default new Store()
