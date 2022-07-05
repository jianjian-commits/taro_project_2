import React from 'react'
import { Flex, Cascader, Button } from '@gmfe/react'
import classNames from 'classnames'
import { i18next } from 'gm-i18n'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import _ from 'lodash'
import moment from 'moment'
import Big from 'big.js'

const formatTime = (date) => moment(date).format('MM-DD HH:mm')

@inject('store')
@observer
class PoolBtn extends React.Component {
  render() {
    const { toggleOrderPool, isOrderPoolShow } = this.props.store

    return (
      <div className='b-driver-map-pool-btn' onClick={toggleOrderPool}>
        {isOrderPoolShow ? (
          <i className='xfont xfont-double-left' />
        ) : (
          <i className='xfont xfont-double-right' />
        )}
      </div>
    )
  }
}

@inject('store')
@observer
class PoolHeader extends React.Component {
  render() {
    const { orderPool } = this.props.store
    const total = _.sumBy(orderPool, 'total_price')
    const totalRealCount = Big(
      _.sumBy(orderPool, 'total_sku_quantity')
    ).toFixed(2)

    return (
      <div className='b-driver-map-pool-header'>
        <div>
          {i18next.t('已选中销售额')}: {Big(total).div(100).toFixed(2)}
        </div>
        <div>
          {i18next.t('已选中订单数')}: {orderPool.length}
        </div>
        <div>
          {i18next.t('商品下单数')}: {totalRealCount}
        </div>
      </div>
    )
  }
}

@inject('store')
@observer
class PoolBody extends React.Component {
  render() {
    const { orderPool, removeOrderFromOrderPool } = this.props.store

    return (
      <div className='b-driver-map-pool-body'>
        {_.map(orderPool, (item, index) => (
          <Flex
            justifyAround
            className='b-driver-map-pool-body-item'
            key={index}
          >
            <Flex flex={1} column className='gm-padding-10'>
              <Flex justifyBetween className='gm-text-16'>
                <div>{item.customer_name}</div>
                <div>{item.id}</div>
              </Flex>
              <Flex justifyBetween>
                <div>{i18next.t('收货时间')}</div>
                <div>{`${formatTime(item.receive_begin_time)} ~ ${formatTime(
                  item.receive_end_time
                )}`}</div>
              </Flex>
              <Flex justifyBetween>
                <div>{i18next.t('销售额')}</div>
                <div> {Big(item.total_price).div(100).toFixed(2)}</div>
              </Flex>
              <Flex justifyBetween>
                <div>{i18next.t('司机')}</div>
                <div>{item.driver_name || '-'}</div>
              </Flex>
            </Flex>
            <Flex alignCenter justifyCenter style={{ width: '20px' }}>
              <i
                className='xfont xfont-remove gm-cursor gm-text-16 gm-text-red'
                onClick={() => removeOrderFromOrderPool(index)}
              />
            </Flex>
          </Flex>
        ))}
      </div>
    )
  }
}

@inject('store')
@observer
class PoolFooter extends React.Component {
  state = {
    selected: [],
  }

  handleChange = (selected) => {
    this.setState({ selected })
  }

  handleSave = async () => {
    const { postDriverAssign, getOrderList } = this.props.store
    const driverId = this.state.selected[1]
    await postDriverAssign(driverId)
    getOrderList()
    this.setState({ selected: [] })
  }

  render() {
    const { carrierDriverList } = this.props.store
    const { selected } = this.state

    const optionList = toJS(carrierDriverList).slice(1)
    const isEnable =
      (selected.length === 1 && selected[0] === -1) || selected.length === 2

    return (
      <Flex alignCenter justifyBetween className='b-driver-map-pool-footer'>
        <span className='gm-text-14'>{i18next.t('分配司机')}</span>
        <Cascader
          filtrable
          name='selected'
          onChange={this.handleChange}
          value={selected}
          data={optionList}
          inputProps={{ placeholder: '请选择' }}
        />
        <Button type='primary' onClick={this.handleSave} disabled={!isEnable}>
          {i18next.t('保存')}
        </Button>
      </Flex>
    )
  }
}

@inject('store')
@observer
class OrderPool extends React.Component {
  render() {
    const { isOrderPoolShow } = this.props.store

    return (
      <div
        className={classNames('b-driver-map-pool', { active: isOrderPoolShow })}
      >
        <PoolBtn />
        <PoolHeader />
        <PoolBody />
        <PoolFooter />
      </div>
    )
  }
}

export default OrderPool
