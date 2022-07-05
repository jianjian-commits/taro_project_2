import { observable, action, computed } from 'mobx'
import { Request } from '@gm-common/request'
import { Tip } from '@gmfe/react'
import moment from 'moment'
import qs from 'query-string'
import { t } from 'gm-i18n'
import _ from 'lodash'

const initFilter = {
  date_type: 2,
  search_type: 1,
  begin: moment().startOf('day'),
  end: moment().endOf('day'),
  q: '',
  status: 0,
}

const initPagination = {
  count: 0,
  offset: 0,
  limit: 10,
  page_obj: null,
}

class Store {
  @observable doFirstRequest = _.noop()

  @observable filter = initFilter

  @observable list = []

  @observable pagination = initPagination

  @observable loading = false

  @action
  setDoFirstRequest(func) {
    // doFirstRequest有paginationBox提供
    this.doFirstRequest = func
  }

  @action
  changeFilter = (name, value) => (this.filter[name] = value)

  @action
  fetchList = async (pagination) => {
    const params = { ...this.getFilter, ...pagination }
    this.loading = true
    const res = await Request('/stock/in_stock_sheet/product/list')
      .data(params)
      .get()
    const { code, data } = res
    if (code === 0) {
      this.list = data
      this.pagination = res?.pagination
    }
    this.loading = false
    return res
  }

  @action
  handleDelete = async (id) => {
    const res = await Request('/stock/in_stock_sheet/product/delete_new')
      .data({
        id,
      })
      .post()

    if (res.code === 0) {
      Tip.success(t('删除成功'))
    }
  }

  @action
  handleExport = () => {
    const params = { ...this.getFilter, ...this.pagination }

    window.open(
      `/stock/in_stock_sheet/product/list?${qs.stringify(params)}&export=1`,
    )
  }

  @computed
  get getFilter() {
    const { date_type, search_type, begin, end, q, status } = this.filter

    return {
      date_type,
      search_type,
      begin_time: moment(begin).format('YYYY-MM-DD HH:mm:ss'),
      end_time: moment(end).format('YYYY-MM-DD HH:mm:ss'),
      q,
      status: status || '',
    }
  }
}

export default new Store()
