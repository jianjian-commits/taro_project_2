import { i18next } from 'gm-i18n'
import { Price } from '@gmfe/react'
import React from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import Big from 'big.js'
import classNames from 'classnames'

class DistributeSchedule extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      driver_id: 'all',
    }

    this.handleOrderByAllDriver = ::this.handleOrderByAllDriver
  }

  handleOrderByAllDriver() {
    this.setState({
      driver_id: 'all',
    })
    this.props.getOrderByAllDriver()
  }

  handleOrderByDriverId(driver_id) {
    this.setState({
      driver_id: driver_id,
    })
    this.props.getOrderByDriverId(driver_id)
  }

  render() {
    const { driver_id } = this.state
    const { pagination, distributeOrderList } = this.props
    // 已分配数量
    const assignedOrderLength = _.reduce(
      distributeOrderList,
      (sum, driver) => sum + driver.distribute_count,
      0
    )
    // 出了多少车
    const carsCount = distributeOrderList.length

    return (
      <div>
        <div
          className={classNames('b-purchase-suppliers-distance', {
            'b-purchase-suppliers-distance active': driver_id === 'all',
          })}
          onClick={this.handleOrderByAllDriver}
        >
          <div className='b-purchase-suppliers-name'>{i18next.t('总进度')}</div>
          <div>
            {carsCount} {i18next.t('车')} {assignedOrderLength}/
            {pagination.count}
            {i18next.t('(总)')}
          </div>
        </div>
        <div>
          {_.map(distributeOrderList, (driver) => {
            return (
              <div
                key={driver.driver_id}
                className={classNames('b-purchase-suppliers-distance', {
                  'b-purchase-suppliers-distance active':
                    driver_id === driver.driver_id,
                  'b-purchase-suppliers-distance disable':
                    driver.driver_status === 0,
                })}
                onClick={() => {
                  driver.driver_status !== 0 &&
                    this.handleOrderByDriverId(driver.driver_id)
                }}
              >
                <div className='b-purchase-suppliers-distance-wrap'>
                  <div className='b-purchase-suppliers-name'>
                    {driver.driver_name}
                    {driver.driver_status === 0 && i18next.t('(停用)')}
                  </div>
                  <div className='b-clearfix'>
                    <span className='b-purchase-suppliers-block-50'>
                      {i18next.t('车型')}：
                      {driver.car_model_name ? driver.car_model_name : '-'}
                    </span>
                    <span className='b-purchase-suppliers-block-50'>
                      {i18next.t('商家')}：{driver.distribute_count}{' '}
                      {i18next.t('家')}
                    </span>
                    <span className='b-purchase-suppliers-block-50'>
                      {i18next.t('金额')}：
                      {Big(driver.distribute_total_price).div(100).toFixed(2)}
                      {Price.getUnit()}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}

DistributeSchedule.propTypes = {
  distributeOrderList: PropTypes.array,
  pagination: PropTypes.object,
  getOrderByAllDriver: PropTypes.func,
  getOrderByDriverId: PropTypes.func,
}

export default DistributeSchedule
