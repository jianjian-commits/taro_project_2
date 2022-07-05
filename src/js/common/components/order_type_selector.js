import React from 'react'
import { Select } from '@gmfe/react'
import classNames from 'classnames'
import PropTypes from 'prop-types'

import { getOrderTypeList } from '../deal_order_process'

const OrderTypeSelector = (props) => {
  const { onChange, orderType, className, style } = props
  const orderTypeList = getOrderTypeList()

  return (
    <Select
      className={classNames('', className || '')}
      style={style || {}}
      value={orderType}
      data={orderTypeList}
      onChange={(value) => onChange(value)}
    />
  )
}

OrderTypeSelector.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  orderType: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default OrderTypeSelector
