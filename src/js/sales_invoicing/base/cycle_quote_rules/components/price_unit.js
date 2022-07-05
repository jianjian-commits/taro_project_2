/*
 * @Description: 价格单位
 */
import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { Price } from '@gmfe/react'

function PriceUnit(props) {
  const { unit_name } = props

  return (
    <span style={{ whiteSpace: 'nowrap' }}>
      {Price.getUnit() + '/' + unit_name}
    </span>
  )
}

PriceUnit.propTypes = {
  unit_name: PropTypes.string,
}

export default memo(PriceUnit)
