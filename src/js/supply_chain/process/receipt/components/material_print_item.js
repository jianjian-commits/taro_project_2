import React from 'react'
import PropTypes from 'prop-types'
import { remarkType } from 'common/filter'
import Big from 'big.js'

const MaterialPrintItem = ({ item, planAmount }) => {
  return (
    <>
      <td className='text-center'>{item.sku_name}</td>
      <td className='text-center'>{remarkType(item.type)}</td>
      <td className='text-center'>
        {parseFloat(Big(item.ratio).toFixed(2))}
        {item.std_unit_name}
      </td>
      <td className='text-center'>
        {parseFloat(Big(planAmount).times(item.ratio).toFixed(2))}
        {item.std_unit_name}
      </td>
      <td className='text-center'>
        {item.sale_ratio}
        {item.std_unit_name}/{item.sale_unit_name}
      </td>
      <td className='text-center'>
        {+Big(planAmount).times(item.ratio).div(item.sale_ratio).toFixed(2)}
        {item.sale_unit_name}
      </td>
    </>
  )
}

MaterialPrintItem.propTypes = {
  item: PropTypes.object,
  planAmount: PropTypes.number,
}

export default MaterialPrintItem
