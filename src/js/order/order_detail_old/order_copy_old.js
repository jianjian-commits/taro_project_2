// 暂时应用于移动端，后续废弃
import { i18next } from 'gm-i18n'
import React from 'react'
import { Dialog, Drawer } from '@gmfe/react'
import { Table } from '@gmfe/table'
import moment from 'moment'
import orderDetailStore from './detail_store_old'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import { gioTrackEvent } from '../../common/service'

@observer
class OrderCopyModal extends React.Component {
  componentDidMount() {
    const {
      customer: { address_id },
      time_config_info: { _id },
    } = toJS(orderDetailStore.orderDetail)
    // 获取最近十条订单
    orderDetailStore.getCopyOrders(address_id, _id)
  }

  handleOrderCopy = (order) => {
    Dialog.confirm({
      title: `${i18next.t('提示')}`,
      children: i18next.t(
        '点击确定将复制此订单内的有效商品，但会清空商品列表原有商品！'
      ),
    }).then(
      () => {
        gioTrackEvent('order_copy')
        orderDetailStore.copyOrder(order.id)
        Drawer.hide()
      },
      () => {}
    )
  }

  render() {
    const { copyOrders } = orderDetailStore
    return (
      <div style={{ overflowY: 'scroll', maxHeight: '100%' }}>
        <div className='gm-back-bg gm-padding-tb-10 gm-padding-lr-20'>
          <strong
            className='gm-padding-left-5'
            style={{ borderLeft: '3px solid rgb(54, 173, 58)' }}
          >
            {i18next.t('复制订单')}（{copyOrders.length}）
          </strong>
        </div>
        <div className='gm-padding-tb-10 gm-padding-lr-20'>
          <p className='gm-text-desc'>
            {i18next.t(
              '注：显示该商户此运营时间的近 50 条历史订单，仅能复制订单中的有效商品'
            )}
          </p>
          <Table
            data={copyOrders}
            columns={[
              {
                Header: i18next.t('下单时间'),
                id: 'date_time_str',
                accessor: (d) =>
                  moment(d.date_time_str).format('YYYY-MM-DD HH:mm:ss'),
              },
              {
                width: 120,
                Header: i18next.t('订单号'),
                accessor: 'id',
              },
              {
                maxWidth: 100,
                Header: i18next.t('商品数'),
                accessor: 'merchandise_count',
              },
              {
                maxWidth: 100,
                Header: i18next.t('下单金额'),
                accessor: 'origin_total_price',
              },
              {
                width: 80,
                Header: i18next.t('操作'),
                Cell: (d) => (
                  <a onClick={() => this.handleOrderCopy(d.original)}>
                    <i className='xfont xfont-copy gm-text-16' />
                  </a>
                ),
              },
            ]}
          />
        </div>
      </div>
    )
  }
}

export default OrderCopyModal
