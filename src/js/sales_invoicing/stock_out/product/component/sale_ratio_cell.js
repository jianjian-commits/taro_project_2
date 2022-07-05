import React from 'react'
import { observer } from 'mobx-react'
import memoComponentHoc from './memo_component'
import Big from 'big.js'

const SaleRatioCell = observer((props) => {
  const {
    data: { sale_ratio, std_unit_name, sale_unit_name, std_ratio },
  } = props
  return (
    <span>
      {!sale_ratio
        ? '-'
        : parseFloat(Big(std_ratio).mul(sale_ratio).toFixed(2)) +
          std_unit_name +
          '/' +
          sale_unit_name}
    </span>
  )
})

export default memoComponentHoc(SaleRatioCell)
