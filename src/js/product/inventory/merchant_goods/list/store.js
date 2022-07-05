import { action, observable, toJS } from 'mobx'
import _ from 'lodash'
import api from './api'
import { i18next } from 'gm-i18n'
// TODO: move to common
import { exportExcel } from '../../../../material_manage/util'
// TODO: remove
import { RightSideModal } from '@gmfe/react'
import TaskList from '../../../../task/task_list'
import React from 'react'
import { convertNumber2Sid } from '../../../../common/filter'

class Store {
  export = {
    sheetNames: [i18next.t('商户货值统计'), i18next.t('商品货值统计')],
    options: [
      {
        address_id: ({ value }) => {
          return [i18next.t('商户ID'), convertNumber2Sid(value)]
        },
        address_name: i18next.t('商户名称'),
        stock_value: i18next.t('当前货值'),
      },
      {
        address_id: ({ value }) => {
          return [i18next.t('商户ID'), convertNumber2Sid(value)]
        },
        address_name: i18next.t('商户名称'),
        category1_id: i18next.t('一级分类ID'),
        category1_name: i18next.t('一级分类名称'),
        category2_id: i18next.t('二级分类ID'),
        category2_name: i18next.t('二级分类名称'),
        spu_id: 'SPU_ID',
        spu_name: i18next.t('商品名称'),
        std_unit_name: i18next.t('基本单位'),
        stock: i18next.t('当前库存'),
        avg_price: i18next.t('当前库存均价'),
        stock_value: i18next.t('当前货值'),
      },
    ],
  }
  @observable
  filter = {
    search: '',
  }
  @observable
  amountInfo = {
    address_count: 0,
    total_stock_value: 0,
  }

  @observable
  merchantList = []
  setPagination(p) {
    // 重新拉取 list 需要
    this.pagination = p
  }
  @action.bound
  handleFilterChange(field, value) {
    if (value === undefined) {
      Object.assign(this.filter, field)
    } else {
      this.filter[field] = value
    }
  }
  @action
  handleExpand = (index) => {
    const list = this.merchantList.slice()
    list[index].__gm_expanded = !list[index].__gm_expanded
    this.merchantList = list
  }

  @action
  handleAllExpand = () => {
    const __gm_expanded = _.some(
      this.merchantList,
      (item) => !item.__gm_expanded
    )
    this.merchantList = _.map(this.merchantList, (merchant) =>
      Object.assign({}, merchant, { __gm_expanded })
    )
  }
  @action.bound
  handleSearch() {
    api.fetchSummaryApi(this.getQueryParams()).then(
      action((json) => {
        this.amountInfo = json.data
      })
    )
    this.pagination.apiDoFirstRequest()
  }
  @action.bound
  handleExport() {
    api.exportListAPi(this.getQueryParams(true)).then(({ data }) => {
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
        const { stock_value_list, address_stock_details } = output_data
        exportExcel({ ...this.export, fileName: filename }, [
          stock_value_list,
          address_stock_details,
        ])
      }
    })
  }
  @action
  fetchList = (pagination = {}) => {
    let params = {
      ...this.getQueryParams(),
      ...pagination,
    }

    return api.fetchStockListApi(params).then(
      action((json) => {
        this.merchantList = json.data
        return json
      })
    )
  }

  getQueryParams(isExport = false) {
    let params = toJS(this.filter)
    if (isExport) {
      params.export = 1
    }
    return params
  }
}

export default new Store()
