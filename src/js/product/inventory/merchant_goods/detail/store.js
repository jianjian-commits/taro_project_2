import moment from 'moment'
import { action, observable } from 'mobx'
import { i18next } from 'gm-i18n'
import _ from 'lodash'
import { Tip, RightSideModal } from '@gmfe/react'
import api from './api'
import { convertNumber2Sid } from '../../../../common/filter'
// TODO: move to common
import { exportExcel } from '../../../../material_manage/util'

// TODO: remove
import TaskList from '../../../../task/task_list'
import React from 'react'

const extraGetter = (title) => ({ field, extra }) => {
  return [title, extra[field]]
}

class Store {
  export = {
    sheetNames: [i18next.t('商品变动明细')],
    options: [
      {
        op_time: i18next.t('操作时间'),
        address_id: ({ field, extra }) => {
          return [i18next.t('商户ID'), convertNumber2Sid(extra[field])]
        },
        address_name: extraGetter(i18next.t('商户名称')),
        category1_id: extraGetter(i18next.t('一级分类ID')),
        category1_name: extraGetter(i18next.t('一级分类名称')),
        category2_id: extraGetter(i18next.t('二级分类ID')),
        category2_name: extraGetter(i18next.t('二级分类名称')),
        spu_id: extraGetter('SPU_ID'),
        spu_name: extraGetter(i18next.t('商品名称')),
        std_unit_name: extraGetter(i18next.t('基本单位')),
        op_type: ({ value }) => {
          return [i18next.t('变动类型'), this.getOperationName(value)]
        },
        delta_stock: i18next.t('变动数量'),
        std_unit_price: i18next.t('单价'),
        amount: i18next.t('金额'),
        old_stock: i18next.t('变动前库存'),
        stock: i18next.t('变动后库存'),
        op_user: i18next.t('操作人'),
      },
    ],
  }

  operationTypes = [
    { value: -1, name: i18next.t('全部') },
    { value: 1, name: i18next.t('入库') },
    { value: 2, name: i18next.t('出库') },
    { value: 3, name: i18next.t('盘点') },
    { value: 4, name: i18next.t('删除') },
  ]

  @observable
  list = []
  @observable // eslint-disable-line
  summary = {}

  @observable
  filter = {
    start_time: moment().subtract(7, 'days'),
    end_time: moment(),
    op_type: -1,
  }

  query = null
  constructor(query) {
    this.query = query
  }

  getOperationName = (value) => {
    const o = _.find(this.operationTypes, (item) => item.value === value)
    return o.name
  }

  setPagination(p) {
    // 重新拉取 list 需要
    this.pagination = p
  }

  getQueryParams(isExport) {
    const { start_time, end_time, ...rest } = this.filter
    const params = {
      start_time: moment(start_time).format('YYYY-MM-DD'),
      end_time: moment(end_time).format('YYYY-MM-DD'),
      ...rest,
      ...this.query,
    }
    if (isExport) {
      params.export = 1
    }
    return params
  }

  validateQueryParams() {
    const params = this.getQueryParams()
    if (moment(params.start_time).add(31, 'd').isBefore(params.end_time)) {
      return i18next.t('时间范围不能超过31天')
    }
  }

  @action.bound
  handleSearch() {
    const error = this.validateQueryParams()
    if (error) {
      Tip.warning(error)
      return
    }
    api.fetchSpuSummaryApi(this.getQueryParams()).then(
      action((json) => {
        this.summary = json.data
      }),
    )
    this.pagination.apiDoFirstRequest()
  }

  @action.bound
  handleFilterChange(field, value) {
    if (value === undefined) {
      Object.assign(this.filter, field)
    } else {
      this.filter[field] = value
    }
  }

  handleExport = () => {
    api.fetchListApi(this.getQueryParams(true)).then((json) => {
      const { data } = json
      if (data.async) {
        // TODO: replace showTaskPanel
        RightSideModal.render({
          children: <TaskList />,
          onHide: RightSideModal.hide,
          style: {
            width: '300px',
          },
        })
      } else {
        const { filename, output_data } = data
        const { stock_log_details } = output_data
        exportExcel(
          { ...this.export, fileName: filename },
          [stock_log_details],
          output_data,
        )
      }
    })
  }

  @action
  fetchList = (pagination = {}) => {
    const params = {
      ...this.getQueryParams(),
      ...pagination,
    }
    this.isLoading = true
    return api.fetchListApi(params).then(
      action((json) => {
        this.list = json.data
        this.isLoading = false
        return json
      }),
    )
  }
}

export default new Store()
export { Store }
