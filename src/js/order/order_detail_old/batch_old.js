// 暂时应用于移动端，后续废弃
import React from 'react'
import { history } from '../../common/service'
import OrderBatchSideBar from './order_batch_sidebar_old'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import globalStore from '../../stores/global'

import OrderDetailListOld from './order_detail_list'
import orderDetailStoreOld from './detail_store_old'
import OrderDetailHeaderOld from './order_detail_header'

@observer
class OrderBatchOld extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isSaving: false,
      orderIndex: 0,
      amendTaskId: orderDetailStoreOld.orderBatch.task_id,
    }
  }

  async componentDidMount() {
    const { task_id, async_task_id } = this.props.location.query
    const { orderIndex } = this.state

    // 当批量导入存在失败数目时，任务列表点进来需要查看错误信息
    if (async_task_id) {
      await orderDetailStoreOld.batchErrorListFetch(async_task_id)
    }

    if (!task_id && !orderDetailStoreOld.orderBatch.task_id) {
      // 如果没有订单数据，如刷新页面
      history.replace('/order_manage/order/list')
    } else if (task_id) {
      this.setState({ amendTaskId: task_id })
      orderDetailStoreOld.batchSetTaskId(task_id)
    }

    const orderList = toJS(orderDetailStoreOld.orderBatch.details)
    orderList.length && orderDetailStoreOld.fixBatchReceiveTime()
    this.fetchCurOrderCustomerAndFreight(orderList, orderIndex)
  }

  fetchCurOrderCustomerAndFreight(orderList, orderIndex) {
    const orderDetail = orderList[orderIndex]
    if (orderDetail) {
      const { customer } = orderDetail
      const { address_id } = customer
      orderDetailStoreOld.customerStatusRefesh(address_id, orderIndex)
      orderDetailStoreOld.getFreight(address_id, orderIndex)
    }
  }

  componentWillUnmount() {
    orderDetailStoreOld.clear('orderBatch')
  }

  handleOrderRemove = async (orderId) => {
    const orders = toJS(orderDetailStoreOld.orderBatch.details)
    const len = orders.length
    const { orderIndex, amendTaskId } = this.state
    const orderDetail = orderDetailStoreOld.orderBatch.details[orderIndex]

    amendTaskId &&
      orderDetailStoreOld.batchOrderAmend(
        amendTaskId,
        orderDetail.customer.address_id,
        orderId
      )
    await orderDetailStoreOld.batchSigleOrderDelete(orderIndex)
    this.handleOrderChange(orderIndex === len - 1 ? orderIndex - 1 : orderIndex)

    if (len === 1) {
      history.replace('/order_manage/order/list')
    }
  }

  // 刷新商户状态
  handleOrderChange = (index) => {
    this.setState({ orderIndex: index })
    const orderList = orderDetailStoreOld.orderBatch.details

    this.fetchCurOrderCustomerAndFreight(orderList, index)
  }

  render() {
    // 暂时应用于移动端，后续废弃
    const { orderIndex } = this.state
    const orderBatch = toJS(orderDetailStoreOld.orderBatch)
    const orderDetail = toJS(orderBatch.details[orderIndex])
    const searchSkus = toJS(orderDetailStoreOld.searchSkus)

    if (!orderDetail) return null

    const isPriceEditable = globalStore.hasPermission('edit_product_unit_price')

    return (
      <div
        className='b-order b-order-add col-md-12'
        style={{ paddingRight: '170px' }}
      >
        <OrderDetailHeaderOld
          orderDetail={orderDetail}
          orderBatch={orderBatch}
          batch
          batchOrderIndex={orderIndex}
          onSingleOrderCancel={this.handleOrderRemove}
        />

        <OrderDetailListOld
          order={orderDetail}
          isPriceEditable={isPriceEditable}
          showOuterId={globalStore.otherInfo.showSkuOuterId}
          batch
          batchOrderIndex={orderIndex}
          searchSkus={searchSkus}
        />

        <OrderBatchSideBar
          orderIndex={this.state.orderIndex}
          onOrderChange={this.handleOrderChange}
        />
      </div>
    )
  }
}

export default OrderBatchOld
