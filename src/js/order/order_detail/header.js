import { i18next } from 'gm-i18n'
import React from 'react'
import _ from 'lodash'
import { Flex } from '@gmfe/react'
import PropTypes from 'prop-types'
import { observer, Observer } from 'mobx-react'
import { getFiledData, Customize } from 'common/components/customize'

import DetailHeaderAction from './components/detail_header_action'
import HeaderNav from './components/detail_header_nav'
import Customer from './components/customer'
import ServiceTimeSelector from './components/service_time_selector'
import ServiceTimeError from './components/service_time_error'
import ReceiveTimeAll from './components/receive_time_all'
import OrderComment from './components/order_comment'
import OrderTime from './components/order_time'
import OrderStatus from './components/order_status'
import Sign from './components/sign'
import OrderType from './components/order_type'
import ReceiveWay from './components/receive_way'
import PickupStation from './components/pickup_station'
import SettleMentTime from './components/settlement_time'
import {
  receiver,
  last_operation,
  addressEditable,
} from './components/detail_header_two'
import UnReceiveTime from '../components/un_receive_times'

import ReceiptHeaderDetail from '../../common/components/receipt_header_detail'
import orderDetailStore from '../store'
import TinyPrice from '../../common/components/tiny_price'
import globalStore from 'stores/global'
import { isLK, isNoAvailReceiveTime } from '../util'
import { getSignWay } from '../../common/filter'
import moment from 'moment'
const Header = observer((props) => {
  const { query, repair, copyData } = props
  const { orderDetail, pickUpList } = orderDetailStore
  const { viewType } = orderDetail

  // 是否是详情页
  const isIdDetail = props.query && props.query.id
  // 华康定制
  const isHKOrder = globalStore.isHuaKang()
  const headConfigs =
    isIdDetail && isLK(props.query.id)
      ? []
      : globalStore.customizedInfoConfigs.filter((v) =>
          viewType === 'view'
            ? v.permission.read_station_order
            : v.permission.write_station,
        )
  let price_block = []

  if (isIdDetail) {
    // todo
    price_block = [
      {
        text: i18next.t('下单金额'),
        value: (
          <Observer>
            {() => {
              const { fee_type } = orderDetail
              const { totalPrice } = orderDetailStore.summary
              return <TinyPrice value={+totalPrice} feeType={fee_type} />
            }}
          </Observer>
        ),
      },
      {
        text: i18next.t('出库金额'),
        value: (
          <Observer>
            {() => {
              const { fee_type } = orderDetail
              const { realPrice } = orderDetailStore.summary
              return <TinyPrice value={+realPrice} feeType={fee_type} />
            }}
          </Observer>
        ),
      },
      {
        text: i18next.t('销售额'),
        value: (
          <Observer>
            {() => {
              const { fee_type } = orderDetail
              const { totalPay } = orderDetailStore.summary
              return <TinyPrice value={+totalPay} feeType={fee_type} />
            }}
          </Observer>
        ),
      },
    ]
  }

  return (
    <ReceiptHeaderDetail
      className='b-order-detail-header'
      contentLabelWidth={70}
      contentCol={4}
      customeContentColWidth={
        viewType !== 'view' ? [430, 430, 430, 430] : [360, 330, 330, 330]
      }
      totalData={isIdDetail ? price_block : null}
      HeaderInfo={[
        {
          label: i18next.t('订单号'),
          item: (
            <div style={{ fontWeight: 400 }}>
              {orderDetail._id || '-'}
              &nbsp;&nbsp;
              <OrderStatus repair={repair} />
              &nbsp;&nbsp;
              <Sign signature_image_url={orderDetail.signature_image_url} />
            </div>
          ),
        },
        {
          label: i18next.t('商户'),
          item: (
            <div style={{ width: '500px' }}>
              <Customer copyData={copyData} />
            </div>
          ),
        },
      ]}
      HeaderAction={
        <Flex row justifyEnd alignCenter>
          <DetailHeaderAction query={query} repair={repair} />
          {viewType === 'view' && (
            <div
              style={{ height: '20px' }}
              className='gm-padding-left-15 gm-margin-right-5 gm-border-right'
            />
          )}
          <HeaderNav query={query} viewType={viewType}>
            <div className='gm-padding-5' />
          </HeaderNav>
        </Flex>
      }
      ContentInfo={[
        {
          label: i18next.t('运营时间'),
          item: (
            <div className='gm-padding-right-5' style={{ width: '100%' }}>
              <ServiceTimeSelector />
              <ServiceTimeError repair={repair} />
            </div>
          ),
        },
        {
          label: (
            <Observer>
              {() => {
                const { time_config_info } = orderDetail
                return (
                  <div>
                    {i18next.t('收货时间')}
                    <UnReceiveTime
                      unReceiveTimes={(
                        (time_config_info &&
                          time_config_info.undelivery_times) ||
                        []
                      ).slice()}
                    />
                  </div>
                )
              }}
            </Observer>
          ),
          item: <ReceiveTimeAll repair={repair} />,
        },
        isHKOrder && {
          label: i18next.t('结款时间'),
          item: <SettleMentTime />,
        },
        {
          label: i18next.t('订单备注'),
          item: <OrderComment repair={repair} />,
        },
        {
          label: i18next.t('订单类型'),
          item: <OrderType repair={repair} />,
        },
        {
          label: i18next.t('下单时间'),
          item: <OrderTime repair={repair} />,
        },
        {
          label: i18next.t('收货方式'),
          item: <ReceiveWay repair={repair} />,
        },
        orderDetail.receive_way === 2 && {
          label: i18next.t('自提点'),
          item: (
            <PickupStation
              repair={repair}
              onChange={(value) => {
                const { customer } = orderDetail
                const pickObj = _.find(pickUpList, (item) => {
                  return value === item.value
                })
                customer.pick_up_st_id = pickObj.value
                customer.pickAddress = pickObj.address
                orderDetailStore.receiveChange({ pick_up_st_id: value })
              }}
            />
          ),
        },
        {
          label: i18next.t('收货人'),
          item: (
            <Observer>
              {() => {
                const { customer } = orderDetail
                return receiver(customer)
              }}
            </Observer>
          ),
        },
        {
          label: i18next.t('收货地址'),
          item: (
            <Observer>
              {() => {
                const { customer } = orderDetail
                return addressEditable(pickUpList, orderDetail, (e) => {
                  const address = e.target.value
                  customer.address = address
                })
              }}
            </Observer>
          ),
        },
        {
          label: i18next.t('最后操作'),
          item: (
            <Observer>
              {() => {
                const { last_op_user, last_op_time } = orderDetail
                return last_operation({ last_op_user, last_op_time })
              }}
            </Observer>
          ),
        },
        {
          label: i18next.t('签收方式'),
          item: (
            <Observer>
              {() => {
                return (
                  <>
                    <div>{getSignWay(orderDetail.sign_way)}</div>
                    <div>
                      {orderDetail.receive_time
                        ? `(${moment(orderDetail.receive_time).format(
                            'YYYY-MM-DD HH:mm:ss',
                          )})`
                        : ''}
                    </div>
                  </>
                )
              }}
            </Observer>
          ),
        },
        // 自定义字段
        ..._.map(headConfigs, (v) => ({
          label: v.field_name,
          item: (
            <Observer>
              {() => {
                const handleChange = (value) => {
                  const { customized_field } = orderDetailStore.orderDetail
                  const customizedField = { ...customized_field, [v.id]: value }
                  orderDetailStore.receiveChange({
                    customized_field: customizedField,
                  })
                }
                const radioList = (v.radio_list || []).map((v) => ({
                  value: v.id,
                  text: v.name,
                }))
                radioList.unshift({
                  value: undefined,
                  text: i18next.t('无'),
                })
                const {
                  viewType,
                  customized_field,
                  time_config_info,
                  date_time,
                } = orderDetail
                const disabled =
                  !time_config_info ||
                  (!repair && isNoAvailReceiveTime(time_config_info, date_time))
                if (viewType === 'view') {
                  return <div>{getFiledData(v, customized_field)}</div>
                } else {
                  return (
                    <Customize
                      type={v.field_type}
                      value={customized_field[v.id]}
                      onChange={handleChange}
                      data={radioList}
                      disabled={disabled}
                    />
                  )
                }
              }}
            </Observer>
          ),
        })),
      ].filter((v) => v)}
    />
  )
})

Header.propTypes = {
  query: PropTypes.object,
  repair: PropTypes.bool,
  copyData: PropTypes.object,
}

export default Header
