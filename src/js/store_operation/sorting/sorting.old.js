import { i18next } from 'gm-i18n'
import React from 'react'
import { history } from '../../common/service'
import { returnDateByFlag } from '../../common/filter'
import ServiceTimeItem from '../common/service_time_item/index'
import { Loading } from '@gmfe/react'
import './actions.js'
import './reducer.js'
import actions from '../../actions'

import queryString from 'query-string'

class SortingOld extends React.Component {
  constructor(props) {
    super(props)
    this.renderServiceTime = ::this.renderServiceTime
  }

  async componentDidMount() {
    await actions.sorting_get_service_time()
    actions.sorting_change_loading(false)
  }

  componentWillUnmount() {
    actions.sorting_change_loading(true)
  }

  handleSelectServiceTime(itemId) {
    const query = {
      service_time: itemId,
    }
    history.push({
      pathname: '/supply_chain/sorting/task/sorting_list',
      search: '?' + queryString.stringify(query),
    })
  }

  /**
   * 渲染服务时间
   * @returns {Array}
   * @private
   */
  renderServiceTime() {
    const { sorting } = this.props
    const handleSelectServiceTime = this.handleSelectServiceTime
    const serviceTimeItems = []
    if (!sorting.serviceTime.length) {
      serviceTimeItems.push(
        <div className='alert alert-info fade in' key='no-service'>
          {i18next.t('暂时没有服务时间安排')}
        </div>
      )
      return serviceTimeItems
    }

    sorting.serviceTime.map((value, index) => {
      // 服务时间id:
      let itemId = value._id
      // 服务时间名称:
      let itemName = value.name
      // 下单时间
      let orderTime = i18next.t('KEY242', {
        VAR1: value.order_time_limit.start,
        VAR2: returnDateByFlag(value.order_time_limit.e_span_time),
        VAR3: value.order_time_limit.end,
      })
      // 配送时间
      let deliveryTime =
        returnDateByFlag(value.receive_time_limit.s_span_time) +
        (value.type !== 2 ? value.receive_time_limit.start : '') +
        '~' +
        returnDateByFlag(value.receive_time_limit.e_span_time) +
        (value.type !== 2 ? value.receive_time_limit.end : '')
      // 出库时间
      let distributionTime =
        value.type !== 2
          ? returnDateByFlag(value.final_distribute_time_span) +
            value.final_distribute_time
          : null
      // 新任务开启时间
      let newTaskTime = value.task_begin_time

      serviceTimeItems.push(
        <div key={index}>
          <ServiceTimeItem
            itemId={itemId}
            itemName={itemName}
            orderTime={orderTime}
            deliveryTime={deliveryTime}
            handleSelect={handleSelectServiceTime}
            distributionTime={distributionTime}
            newTaskTime={newTaskTime}
          />
          <div className='gm-padding-bottom-15' />
        </div>
      )
    })

    return serviceTimeItems
  }

  render() {
    const { sorting } = this.props
    if (sorting.loading) {
      return <Loading style={{ marginTop: '50px' }} />
    } else {
      return <div>{this.renderServiceTime()}</div>
    }
  }
}

export default SortingOld
