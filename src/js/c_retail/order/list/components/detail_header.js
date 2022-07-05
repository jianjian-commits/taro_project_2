import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex } from '@gmfe/react'
import { observer } from 'mobx-react'
import moment from 'moment'
import Big from 'big.js'
import PropTypes from 'prop-types'

import OrderStatus from './order_status'
import ReceiptHeaderDetail from 'common/components/receipt_header_detail'
import TinyPrice from 'common/components/tiny_price'
import DetailHeaderAction from './detail_header_action'
import AfterSalesHeaderAction from './after_sales_action'

const Header = observer(props => {
  const { orderDetail } = props
  const { customer, fee_type } = orderDetail

  const totalPay = Big(orderDetail.total_pay || 0).toFixed(2)
  const totalPrice = Big(orderDetail.total_price || 0).toFixed(2)
  const realPrice = Big(orderDetail.real_price || 0).toFixed(2)

  const { query, isOrderDetail } = props

  let price_block = []
  if (isOrderDetail) {
    price_block = [
      {
        text: i18next.t('下单金额'),
        value: <TinyPrice value={+totalPrice} feeType={fee_type} />
      },
      {
        text: i18next.t('出库金额'),
        value: <TinyPrice value={+realPrice} feeType={fee_type} />
      },
      {
        text: i18next.t('销售额'),
        value: <TinyPrice value={+totalPay} feeType={fee_type} />
      }
    ]
  }

  return (
    <ReceiptHeaderDetail
      className='b-order-detail-header'
      contentLabelWidth={55}
      contentCol={3}
      customeContentColWidth={[400, 400, 400]}
      totalData={isOrderDetail ? price_block : null}
      HeaderInfo={[
        {
          label: i18next.t('订单号'),
          item: (
            <div style={{ fontWeight: 400 }}>
              {orderDetail._id || '-'}&nbsp;&nbsp;
              <OrderStatus orderDetail={orderDetail} />
            </div>
          )
        },
        {
          label: i18next.t('客户'),
          item: (
            <div style={{ width: '500px' }}>
              {(customer && customer.extender && customer.extender.resname) ||
                '-'}
            </div>
          )
        }
      ]}
      // isOrderDetail 区分订单详情以及售后详情
      HeaderAction={
        isOrderDetail ? (
          <DetailHeaderAction query={query} />
        ) : (
          <AfterSalesHeaderAction query={query} />
        )
      }
      ContentInfo={[
        {
          label: i18next.t('收货时间'),
          item: customer
            ? `${customer.receive_begin_time}~${customer.receive_end_time}`
            : '-'
        },
        {
          label: i18next.t('订单备注'),
          item: (
            <Flex flex alignCenter style={{ wordBreak: 'break-all' }}>
              {orderDetail.remark || '-'}
            </Flex>
          )
        },
        {
          label: i18next.t('下单时间'),
          item: orderDetail.date_time
            ? moment(orderDetail.date_time).format('YYYY-MM-DD HH:mm:ss')
            : '-'
        },
        {
          label: i18next.t('收货人'),
          item: customer
            ? `${customer.receiver_name}（${customer.receiver_phone}）`
            : '-'
        },
        {
          label: i18next.t('收货地址'),
          item: customer ? customer.address : '-'
        },
        {
          label: i18next.t('最后操作'),
          item: (
            <div>
              {orderDetail.last_op_user || '-'}
              {orderDetail.last_op_time
                ? `（${moment(orderDetail.last_op_time).format(
                    'YYYY-MM-DD HH:mm:ss'
                  )}）`
                : '-'}
            </div>
          )
        }
      ]}
    />
  )
})

Header.propTypes = {
  isOrderDetail: PropTypes.bool
}

export default Header
