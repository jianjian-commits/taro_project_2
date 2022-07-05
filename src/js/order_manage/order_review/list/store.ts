import moment from 'moment'
import { action, observable, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import { createRef } from 'react'

interface FilterOptions {
  begin: moment.Moment
  end: moment.Moment
  text: string
  /**
   * 审核状态
   * 全部 0
   * 待审核 1
   * 审核通过 2
   * 驳回 3
   * 系统驳回 4
   */
  auditStatus: 0 | 1 | 2 | 3 | 4
}

interface ParamsOptions {
  begin_time: string
  end_time: string
  search_text: string
  audit_status?: number
  export: number
}

interface ListOptions {
  id: number
  order_id: string
  edit_time: string
  address_name: string
  address_id: string
  skus_num: number
  status: number
  audit_status: 1 | 2 | 3
  reason: ''
  order_remark: string
  applicant: string
  row_edit: boolean
}

interface UpdateParams {
  id?: number
  ids?: number[]
  begin_time?: string
  end_time?: string
  /**
   * 审核状态
   * 待审核 1
   * 审核通过 2
   * 驳回 3
   */
  audit_status?: 1 | 2 | 3 | 4
  update_audit_status: 1 | 2 | 3 | 4
  search_text?: string
  reason?: string
  details?: { sku_id: string; purchase_quantity: number }[]
}

class Store {
  pagination = createRef()

  @observable filter: FilterOptions = {
    begin: moment().startOf('date'),
    end: moment().endOf('date'),
    text: '',
    auditStatus: 0,
  }

  @action mergeFilter = (options: Partial<FilterOptions>) => {
    this.filter = Object.assign(this.filter, options)
  }

  @observable loading = false

  @observable list: ListOptions[] = []

  @action setListItem = (index: number, value: Partial<ListOptions>) => {
    Object.assign(this.list[index], value)
  }

  @observable selected: string[] = []

  @action setSelected = (selected: string[]) => {
    this.selected = selected
  }

  @observable isSelectAll = false

  @action setIsSelectAll = () => {
    this.isSelectAll = !this.isSelectAll
  }

  handleGetParams(isExport?: boolean) {
    const { begin, end, text, auditStatus } = this.filter
    const params: ParamsOptions = {
      begin_time: begin.format('YYYY-MM-DD HH:mm:ss'),
      end_time: end.format('YYYY-MM-DD HH:mm:ss'),
      search_text: text,
      export: +!!isExport,
    }
    if (auditStatus) {
      params.audit_status = auditStatus
    }
    return params
  }

  handleSearch = (pagination: any) => {
    const params = Object.assign({}, this.handleGetParams(), pagination)
    this.loading = true
    return Request<ListOptions[]>('/station/order_edit_audit/list')
      .data(params)
      .get()
      .then((result) => {
        runInAction(() => {
          this.list = result.data.map((item) => ({ ...item, row_edit: false }))
        })
        return result
      })
      .finally(() => (this.loading = false))
  }

  handleExport = () => {
    const params = this.handleGetParams(true)
    return Request('/station/order_edit_audit/list').data(params).get()
  }

  @observable updateParams: UpdateParams = {
    update_audit_status: 2,
    reason: '',
  }

  @action mergeUpdateParams = (value: Partial<UpdateParams>) => {
    this.updateParams = Object.assign(this.updateParams, value)
  }

  handleUpdate = (params: UpdateParams) => {
    return Request('/station/order_edit_audit/update').data(params).post()
  }
}

export default new Store()
