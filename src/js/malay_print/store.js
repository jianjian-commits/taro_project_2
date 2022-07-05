import { observable, action, computed } from 'mobx'
import invoice from './invoice.js'
import delivery from './delivery.js'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import moment from 'moment'
import Big from 'big.js'
import { Storage } from '@gmfe/react'

const MALAY_PAGE_SIZE = 'MALAY_PAGE_SIZE'
const MALAY_PRINT = 'MALAY_PRINT'

const config = {
  delivery,
  // invoice 和 delivery的区别是, header和bottom不一样
  invoice: {
    ...delivery,
    ...invoice,
  },
}

const pageSizeMap = {
  A4: {
    width: '210mm',
    height: '297mm',
  },
  IN9: {
    width: '8.27in',
    height: '11in',
  },
}

const getPayMethod = (obj = {}) => {
  switch (obj.pay_method) {
    case 1:
      return 'C.O.D'
    case 2:
      return '7 days'
    case 3:
      return '31 days'
    case 4:
      return +obj.cycle_length === 1 ? 'C.O.D' : `${obj.cycle_length} days`
    default:
      return '-'
  }
}

class MalayPrintStore {
  constructor() {
    this.pageSize = Storage.get(MALAY_PAGE_SIZE) || 'A4'
    this.printSomething = Storage.get(MALAY_PRINT) || 'invoice'
    this.debouncedRender = _.debounce(this.reRender, 1000)
  }

  @observable orderData = []

  @observable tableData = []

  @observable printSomething = 'invoice'

  @observable pageSize = 'A4'

  @observable reRenderKey = 0

  @observable isBatch = false

  @observable order_ids = []

  @computed
  get printConfig() {
    const printConfig = config[this.printSomething]
    printConfig.page.size = pageSizeMap[this.pageSize]
    return printConfig
  }

  @action
  reRender() {
    this.reRenderKey = Math.random()
  }

  @action
  toPrintSomething(something) {
    this.printSomething = something
    Storage.set(MALAY_PRINT, something)
  }

  @action
  setPageSize(size) {
    this.pageSize = size
    Storage.set(MALAY_PAGE_SIZE, size)
  }

  @action
  setOrderYourRef(i, yourRef) {
    if (this.isBatch) {
      this.orderData[i].your_ref = yourRef
    } else {
      this.orderData.your_ref = yourRef
    }
    this.debouncedRender()
  }

  @action.bound
  getOrderData(order_ids, filter) {
    // 是否批量打印
    this.isBatch = _.isArray(order_ids) || !!filter
    const ids = JSON.stringify(this.isBatch ? order_ids : [order_ids])

    // 全选所有页 传搜索条件, 非全选，传ids
    const query = order_ids ? { ids } : { ...JSON.parse(filter) }

    return Request('/station/distribute/get_order_by_id')
      .data(query)
      .get()
      .then(
        action((json) => {
          const orderDataArray = []
          const tableOfOrderDataArray = []
          _.each(json.data, (obj) => {
            // 数据, 和 表格数据
            const { details = [], ...data } = obj
            // 除表格以外的所有数据
            const itemData = {
              ...data,
              receive_time: moment(data.receive_begin_time).format(
                'MM/DD/YYYY'
              ),
              real_price: Big(data.real_price).toFixed(2),
              terms: getPayMethod(data.pay_method),
              your_ref: '', // 用户自己输入
            }
            // 表格数据
            const itemTableData = _.map(details, (sku, index) => {
              const discount = -Big(sku.real_weight)
                .times(sku.std_sale_price)
                .sub(sku.real_item_price)
                .toFixed(2)
              sku.no = index + 1
              sku.qty = sku.real_weight.toFixed(2) + sku.std_unit_name // 出库数(基本单位)
              sku.std_sale_price = sku.std_sale_price.toFixed(2) // 单价(基本单位)
              sku.discount = +discount !== 0 ? discount : ''
              sku.real_item_price = sku.real_item_price.toFixed(2)
              return sku
            })

            orderDataArray.push(itemData)
            tableOfOrderDataArray.push(itemTableData)
          })
          // 全选所有页打印: 前端不会传order_ids, 需从后台接口中获取数据
          this.order_ids = _.map(json.data, (item) => item.id)
          // 批量打印,接受数组
          if (this.isBatch) {
            this.orderData = orderDataArray
            this.tableData = tableOfOrderDataArray
            // 单个打印
          } else {
            this.orderData = orderDataArray[0]
            this.tableData = tableOfOrderDataArray[0]
          }
        })
      )
  }
}

export default new MalayPrintStore()
