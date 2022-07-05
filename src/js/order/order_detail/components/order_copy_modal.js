import { i18next } from 'gm-i18n'
import React, { useState, useEffect } from 'react'
import { Drawer } from '@gmfe/react'
import { Table } from '@gmfe/table'
import moment from 'moment'
import orderDetailStore from '../../store'
import { Request } from '@gm-common/request'
import { gioTrackEvent } from '../../../common/service'
import { observer } from 'mobx-react'
import globalStore from 'stores/global'
import { copyOrderTip } from '../../util'
const Component = observer(() => {
  const [copyOrders, setCopyOrders] = useState([])
  const isHuaKang = globalStore.isHuaKang()

  const fetchData = () => {
    const {
      customer: { address_id },
      time_config_info: { _id },
    } = orderDetailStore.orderDetail
    Request('/station/order/recent_order/get')
      .data({ address_id, time_config_id: _id })
      .get()
      .then((json) => {
        setCopyOrders(json.data)
      })
  }

  const handleOrderCopy = (order) => {
    copyOrderTip(true, (isCopyOrderSyncGoodsPrice) => {
      gioTrackEvent('order_copy')
      orderDetailStore.copyOrder(order.id, isCopyOrderSyncGoodsPrice)
      Drawer.hide()
    })
  }

  useEffect(() => {
    fetchData()
  }, [])

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
            '注：显示该商户此运营时间的近 50 条历史订单，仅能复制订单中的有效商品',
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
              width: 140,
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
            isHuaKang && {
              maxWidth: 100,
              Header: i18next.t('销售出库金额'),
              accessor: 'sale_outstock_price',
            },
            {
              width: 80,
              Header: i18next.t('操作'),
              Cell: (d) => (
                <a onClick={() => handleOrderCopy(d.original)}>
                  <i className='xfont xfont-copy gm-text-16' />
                </a>
              ),
            },
          ].filter((v) => v)}
        />
      </div>
    </div>
  )
})

export default Component
