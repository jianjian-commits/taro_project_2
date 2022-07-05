import React from 'react'
import { i18next } from 'gm-i18n'
import { inject, observer } from 'mobx-react'
import { Dialog, Tip, Flex, Button } from '@gmfe/react'
import classNames from 'classnames'
import _ from 'lodash'

@inject('store')
@observer
class BtnGroup extends React.Component {
  handleAutoAssign = () => {
    const { getOrderList, autoAssign } = this.props.store

    Dialog.confirm({
      children: i18next.t('确认按最近一次的规划方式来快速规划司机吗？'),
    }).then(
      async () => {
        const json = await getOrderList({}, false)
        const orderList = json.data.order
        const isAllHasDriverId = _.every(
          orderList,
          (order) => order.driver_id !== null
        )
        if (isAllHasDriverId) {
          Tip.warning(i18next.t('没有需要智能规划的订单'))
          return
        }
        // 没有分配司机的订单
        const order_ids = _.reduce(
          orderList,
          (order_ids, driver) => {
            if (!driver.driver_id) {
              order_ids.push(driver.id)
            }
            return order_ids
          },
          []
        )

        const query = {
          order_ids: JSON.stringify(order_ids),
        }

        await autoAssign(query)

        getOrderList()
        Tip.success(i18next.t('智能规划成功'))
      },
      () => {}
    )
  }

  handleSwitch = () => {
    this.props.store.toggleDraggable()
  }

  render() {
    const { isMouseToolOpen } = this.props.store

    return (
      <Flex alignCenter className='b-driver-map-btn-group gm-text-16'>
        <Flex
          alignCenter
          justifyCenter
          onClick={this.handleSwitch}
          className={classNames('b-driver-map-switch-btn', {
            active: isMouseToolOpen,
          })}
          title='拉框选择'
        >
          <i className='xfont xfont-drag-selection' />
        </Flex>
        <div className='gm-gap-10' />
        <Button type='primary' onClick={this.handleAutoAssign}>
          {i18next.t('智能规划')}
        </Button>
        <div className='gm-gap-10' />
        <Button type='primary' onClick={this.props.switchOrderTabKey}>
          {i18next.t('按订单排车')}
        </Button>
      </Flex>
    )
  }
}

export default BtnGroup
