// 暂时应用于移动端，后续废弃
import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import { Flex, Modal } from '@gmfe/react'
import _ from 'lodash'
import Big from 'big.js'
import classNames from 'classnames'
import moment from 'moment'
import { isNoAvailReceiveTime } from '../util'
import { isOrderInvalidOld } from './util'
import { history } from '../../common/service'
import { observer } from 'mobx-react'
import orderDetailStore from './detail_store_old'

@observer
class OrderBatchSidebar extends React.Component {
  constructor(props) {
    super(props)

    this.handleSave = ::this.handleSave
    this.handleScrollErrorOrderIntoView = ::this.handleScrollErrorOrderIntoView
    this.handleCancel = ::this.handleCancel
  }

  handleOrderSelect(index) {
    this.props.onOrderChange(index)
  }

  handleScrollErrorOrderIntoView() {
    const orders = orderDetailStore.orderBatch.details
    const valideIndex = _.findIndex(orders, (order) => isOrderInvalidOld(order))

    if (valideIndex > -1) {
      const orderItem = ReactDOM.findDOMNode(this[`refOrder_${valideIndex}`])
      orderItem.scrollIntoViewIfNeeded()
      this.props.onOrderChange(valideIndex)
    }
  }

  handleSave() {
    orderDetailStore.batchOrderSubmit().then(() => {
      Modal.warning({
        children: i18next.t('数据处理中,请在任务栏查看进度！'),
        title: i18next.t('提示'),
        onOk() {
          history.push('/order_manage/order')
        },
      })
    })
  }

  handleCancel() {
    Modal.confirm({
      title: i18next.t('警告'),
      children: i18next.t('若取消则丢失所有修改，是否继续？'),
      onOk() {
        history.push('/order_manage/order')
      },
    })
  }

  render() {
    const orders = orderDetailStore.orderBatch.details
    const { orderIndex } = this.props
    const orderItmes = []
    let inValidNum = 0

    _.forEach(orders, (order, index) => {
      const { time_config_info } = order
      const isInvalid =
        isOrderInvalidOld(order) ||
        isNoAvailReceiveTime(time_config_info, moment())

      if (isInvalid) {
        inValidNum++
      }

      let { resname = '' } = order
      if (resname.length > 9) {
        resname = `${resname.slice(0, 4)}...${resname.slice(-4)}`
      }

      const moneySum = _.reduce(
        order.details,
        (sum, sku) =>
          sum.plus(Big(sku.sale_price || 0).times(sku.quantity || 0)),
        Big(0)
      )

      orderItmes.push(
        <Flex
          key={index}
          column
          alignCenter
          ref={(ref) => {
            this[`refOrder_${index}`] = ref
          }}
          onClick={this.handleOrderSelect.bind(this, index)}
          className={classNames(
            'b-order-add-side-resinfo-item gm-padding-5 gm-border-bottom gm-cursor',
            {
              active: orderIndex === index,
            }
          )}
        >
          <Flex
            className={classNames({
              'text-primary': !isInvalid,
              'gm-text-red': isInvalid,
            })}
          >
            {isInvalid && '！'}
            {resname}
          </Flex>
          <Flex className='b-order-add-sidebar-resinfo'>
            {i18next.t('商品数')}:{order.details.length}&nbsp;
            {i18next.t('金额')}:{+moneySum.toFixed(2)}
          </Flex>
        </Flex>
      )
    })

    return (
      <Flex column className='b-order-add-sidebar gm-border'>
        <Flex
          column
          justifyCenter
          alignCenter
          className='b-order-add-sidebar-title'
        >
          <span>{i18next.t('待提交订单列表')}</span>
          <span className='b-order-add-sidebar-resinfo'>
            {i18next.t('总数')}:{orders.length}&nbsp;{i18next.t('错误')}：
            <span
              onClick={this.handleScrollErrorOrderIntoView}
              className={classNames('gm-cursor', { 'gm-text-red': inValidNum })}
            >
              {inValidNum}
            </span>
          </span>
        </Flex>
        <Flex flex className='gm-border-top'>
          <div className='b-order-batch-item-wrap'>{orderItmes}</div>
        </Flex>
        <Flex className='b-order-add-sidebar-footer gm-cursor'>
          <Flex
            flex
            justifyCenter
            alignCenter
            className='b-order-add-sidebar-footer_cancel'
            onClick={this.handleCancel}
          >
            {i18next.t('取消')}
          </Flex>
          <Flex
            flex
            justifyCenter
            alignCenter
            className={classNames('b-order-add-sidebar-footer_save', {
              disabled: inValidNum > 0,
            })}
            onClick={inValidNum === 0 ? this.handleSave : _.noop}
          >
            {i18next.t('全部保存')}
          </Flex>
        </Flex>
      </Flex>
    )
  }
}

OrderBatchSidebar.propTypes = {
  onOrderChange: PropTypes.func.isRequired,
  orderIndex: PropTypes.number.isRequired,
}

OrderBatchSidebar.defaultProps = {}

export default OrderBatchSidebar
