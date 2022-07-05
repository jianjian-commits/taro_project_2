import { i18next } from 'gm-i18n'
import React from 'react'
import { Popover, Dialog, Tip, FunctionSet, Button } from '@gmfe/react'
import { connect } from 'react-redux'
import globalStore from '../../../stores/global'
import moment from 'moment'
import _ from 'lodash'
import './reducer.js'
import './actions.js'
import actions from '../../../actions'
import PropTypes from 'prop-types'

class TableAction extends React.Component {
  handleAutoAssign() {
    Dialog.confirm({
      children: i18next.t('确认按最近一次的规划方式来快速规划司机吗？'),
      onOK: async () => {
        const orderList = await actions.distribute_order_get_all_order_list()

        const isAllHasDriverId = _.every(
          orderList,
          (order) => order.driver_id !== null
        )
        if (isAllHasDriverId) {
          Tip.warning('没有需要智能规划的订单！')
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

        await actions.distribute_order_auto_assign(query)

        actions.distribute_order_get_order_list()
        Tip.success(i18next.t('智能规划成功'))
      },
    })
  }

  renderAutoAssignBtn() {
    const { begin_time, end_time } = this.props.distributeOrder
    // 允许两天内的智能规划
    const canAutoAssign = moment(begin_time).add(2, 'd').isAfter(end_time)
    const assignBtn = (
      <Button type='primary' onClick={this.handleAutoAssign}>
        {i18next.t('智能规划')}
      </Button>
    )
    const popup = (
      <div style={{ width: '200px' }} className='gm-padding-10'>
        搜索时间跨度超过2天，无法使用智能规划，请调整搜索时间跨度在2天之内。
      </div>
    )
    const popover = (
      <Popover top right showArrow type='hover' popup={popup}>
        <Button
          type='primary'
          style={{ cursor: 'not-allowed', opacity: '0.65' }}
        >
          {i18next.t('智能规划')}
        </Button>
      </Popover>
    )

    return canAutoAssign ? assignBtn : popover
  }

  render() {
    // 查看编辑记录
    const canViewEditLog = globalStore.hasPermission(
      'distribution_order_search'
    )

    return (
      <>
        <Button onClick={this.props.onSwitchOrderTabKey}>
          {i18next.t('可视化调度')}
        </Button>
        <div className='gm-gap-5' />
        {this.renderAutoAssignBtn()}
        <div className='gm-gap-5' />
        <FunctionSet
          data={[
            {
              text: i18next.t('查看编辑单据'),
              onClick: () =>
                window.open('#/supply_chain/distribute/task/delivery_log'),
              show: canViewEditLog,
            },
            {
              text: i18next.t('查看编辑记录(旧)'),
              onClick: () =>
                window.open('#/supply_chain/distribute/task/edit_log'),
              show: canViewEditLog,
            },
          ]}
          right
        />
      </>
    )
  }
}

TableAction.propTypes = {
  onSwitchOrderTabKey: PropTypes.func,
  onBatchModifyDriver: PropTypes.func,
  distributeOrder: PropTypes.object,
}

export default connect((state) => ({
  distributeOrder: state.distributeOrder,
}))(TableAction)
