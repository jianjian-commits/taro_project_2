import { observable, action, computed } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import _ from 'lodash'
import { pinYinFilter } from '@gm-common/tool'

const initFilter = {
  start: new Date(),
  end: new Date(),
  supplySelected: { value: '', name: '' }, // 搜索
  statusSelected: '5', // 状态筛选
  time_type: '2',
  sheet_nos: [],
  pay_method: '',
}

const initPagination = {
  count: 0,
  offset: 0,
  limit: 10,
  page_obj: null,
}

const modalPaymentSlipSupplier = {
  id: '', // 供应商ID
  name: '', // 供应商名称
  customer_id: '', // 供应商自定义编号
  pay_method: 0,
}

class Store {
  @observable doFirstRequest = _.noop()

  @observable paymentSelected = []

  @observable doPaymentModalRequest = _.noop()

  @observable filter = initFilter

  @observable list = []

  @observable pagination = initPagination

  @observable isSelectAll = false

  @observable selectedList = []

  @observable dataList = []

  @observable loading = false

  @observable supplyGroup = []

  @observable paymentSlipList = []

  @observable totalMoney = 0

  @observable modalPaymentSlipSupplier = modalPaymentSlipSupplier

  @action
  setDoFirstRequest = (func) => {
    // apiDoFirstRequest有ManagePaginationV2提供

    this.doFirstRequest = func
  }

  @action
  setPaymentModalRequest = (func) => {
    this.doPaymentModalRequest = func
  }

  @action
  getTotalMoney = () => {
    let sum = 0
    if (this.isSelectAll) {
      const params = {
        ...this.getFilter,
        select_all: 1,
      }
      Request('/stock/settle_sheet/unsettled')
        .data(params)
        .get()
        .then((res) => {
          this.totalMoney = res.data
        })
    } else {
      Array.from(this.dataList).forEach((item) => {
        Array.from(this.selectedList).forEach((s) => {
          if (s === item.id) {
            if (item.type === 1) sum += item.total_price
            if (item.type === 2) sum -= item.total_price
          }
        })
      })
      this.totalMoney = sum
    }
  }

  @action
  fetchList = (pagination = initPagination) => {
    this.loading = true
    const params = {
      ...this.getFilter,
      ...pagination,
    }

    const _params = _.omit(params, ['more'])

    return Request('/stock/settle_sheet/unsettled')
      .data(_params)
      .get()
      .then((res) => {
        this.loading = false
        const { code, data, pagination } = res
        if (code === 0) {
          this.dataList = data
          this.pagination = pagination
          this.selectedList = []
          this.isSelectAll = false
        }
        return res
      })
      .catch(() => {
        this.loading = false
      })
  }

  @action
  querySupplierGroup = () => {
    return Request('/stock/settle_supplier/get')
      .get()
      .then((json) => {
        if (json.code === 0) {
          const sGMapping = _.map(json.data, (sg) => {
            return {
              label: sg.name,
              children: _.map(sg.settle_suppliers, (ss) => {
                return {
                  value: ss._id,
                  name: ss.name,
                }
              }),
            }
          })
          this.supplyGroup = sGMapping
        }
      })
  }

  @action
  queryExistPaymentList = (id, pagination = null) => {
    const filter = _.omit(this.getFilter, [
      'end',
      'start',
      'receipt_type',
      'pay_method',
      'type',
    ])

    const params = {
      ...filter,
      start_time: moment(new Date()).subtract(1, 'months').format('YYYY-MM-DD'),
      end_time: moment().startOf('day').format('YYYY-MM-DD'),
      settle_supplier_id: id,
      limit: 10,
      offset: 0,
      reverse: 0,
      ...pagination,
    }

    return Request('/stock/settle_sheet/can_merge')
      .data(params)
      .get()
      .then(
        action((json) => {
          this.paymentSlipList = json?.data?.settle_sheets || []
          this.modalPaymentSlipSupplier = json?.data?.supplier
          return json
        }),
      )
  }

  @action
  mergeFilter = (filter) => {
    Object.assign(this.filter, filter)
  }

  @action.bound
  handlePaymentSelect = (selected) => {
    this.paymentSelected = selected
  }

  @action
  handleChangeFilter = (name, val) => {
    this.filter[name] = val
  }

  @action
  handleSelected = (val) => {
    if (val.length !== this.dataList.length) {
      this.isSelectAll = false
    }
    this.selectedList = val
    this.getTotalMoney()
  }

  @action
  handleSelectAll = (bool) => {
    this.isSelectAll = bool
    this.getTotalMoney()
    if (bool) {
      this.selectedList = this.dataList.map((item) => item.id)
    }
  }

  @action
  handleFilter = (list, query) => {
    if (this.supplySelected && query === this.filter.supplySelected.name)
      return list
    const result = []
    _.each(list, (eList) => {
      const children = pinYinFilter(
        eList.children,
        query,
        (supplier) => supplier.name,
      )

      if (children && children.length > 0) {
        result.push({
          ...eList,
          children,
        })
      }
    })
    return result
  }

  @action
  handleSettleCount = (data) => {
    let params = data
    if (this.isSelectAll) {
      params = {
        ...this.getFilter,
        op: data.op,
        id: data.id,
        settle_supplier_id: data.settle_supplier_id || '',
      }
    }

    return Request('/stock/settle_sheet/add').data(params).post()
  }

  // 全选所有页时掉接口获取所有单据的总金额
  @action
  gettotalMoney = () => {}

  @computed
  get getFilter() {
    const {
      start,
      end,
      supplySelected,
      statusSelected,
      time_type,
      pay_method,
    } = this.filter

    return {
      type: time_type,
      start: moment(start).format('YYYY-MM-DD'),
      end: moment(end).format('YYYY-MM-DD'),
      receipt_type: statusSelected, // 状态筛选
      settle_supplier_id: supplySelected?.value || '', // 搜索供应商
      pay_method: pay_method, // 结款周期
    }
  }
}

export default new Store()
