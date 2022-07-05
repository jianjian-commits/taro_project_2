import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import React from 'react'
import _ from 'lodash'
import Big from 'big.js'
import classNames from 'classnames'
import { RightSideModal, Price } from '@gmfe/react'
import store from '../store'

class ColorBox extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activeStyle: {
        color: props.color,
        borderColor: props.color,
      },
      normalStyle: {
        color: 'inherit',
        borderColor: 'transparent',
      },
      isActive: props.active,
    }
  }

  componentWillUnmount() {
    this.__isUnmount = true
  }

  handleMouse(isActive) {
    if (!this.__isUnmount) {
      this.setState({ isActive })
    }
  }

  render() {
    const { isActive, normalStyle, activeStyle } = this.state
    const { children, onClick, style, active, ...rest } = this.props

    const currentStyle = active || isActive ? activeStyle : normalStyle
    const _style = { ...style, ...currentStyle }

    return (
      <div
        {...rest}
        className='b-driver-map-schedule'
        style={_style}
        onClick={onClick}
        onMouseEnter={this.handleMouse.bind(this, true)}
        onMouseLeave={this.handleMouse.bind(this, false)}
      >
        {children}
      </div>
    )
  }
}

@observer
class Schedule extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      driver_id: 'all',
    }
  }

  handleOrderByAllDriver = () => {
    this.setState({ driver_id: 'all' })
    store.getOrderList()
  }

  handleOrderByDriverId(driver_id, canClick) {
    if (canClick) {
      this.setState({ driver_id: driver_id })
      store.getOrderList(driver_id)
    }
  }

  render() {
    const { driver_id } = this.state
    const { pagination, distributeOrderList } = store
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
          className={classNames('b-driver-map-schedule-head', {
            active: driver_id === 'all',
          })}
          onClick={this.handleOrderByAllDriver}
        >
          <div>{i18next.t('总进度')}</div>
          <div>
            {carsCount} {i18next.t('车')} {assignedOrderLength}/
            {pagination.count}
            {i18next.t('(总)')}
          </div>
        </div>

        {_.map(distributeOrderList, (driver) => {
          return (
            <ColorBox
              key={driver.driver_id}
              color={driver.color}
              active={driver_id === driver.driver_id}
              className={classNames({ disable: driver.driver_status === 0 })}
              onClick={this.handleOrderByDriverId.bind(
                this,
                driver.driver_id,
                driver.driver_status !== 0
              )}
            >
              <div>
                {driver.driver_name}
                {driver.driver_status === 0 && i18next.t('(停用)')}
              </div>
              <div>
                <div className='b-driver-map-schedule-desc'>
                  {i18next.t('车型')}：
                  {driver.car_model_name ? driver.car_model_name : '-'}
                </div>
                <div className='b-driver-map-schedule-desc'>
                  {i18next.t('商家')}：{driver.distribute_count}{' '}
                  {i18next.t('家')}
                </div>
                <div className='b-driver-map-schedule-desc'>
                  {i18next.t('金额')}：
                  {Big(driver.distribute_total_price).div(100).toFixed(2)}
                  {Price.getUnit()}
                </div>
              </div>
            </ColorBox>
          )
        })}
      </div>
    )
  }
}

Schedule.render = (props) => {
  RightSideModal.render({
    onHide: RightSideModal.hide,
    title: i18next.t('进度'),
    style: { width: '300px', overflowY: 'auto' },
    opacityMask: true,
    children: <Schedule {...props} />,
  })
}

export default Schedule
