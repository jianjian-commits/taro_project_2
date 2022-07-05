import Big from 'big.js'
import { Price } from '@gmfe/react'
import memoComponentHoc from './memo_component'
import { observer } from 'mobx-react'

const SalePriceCell = observer((props) => {
  const {
    data: { sale_price, std_unit_name },
  } = props
  if (!sale_price && +sale_price !== 0) {
    return '-'
  }
  return (
    Big(sale_price || 0)
      .div(100)
      .toFixed(2) +
    Price.getUnit() +
    '/' +
    std_unit_name
  )
})

export default memoComponentHoc(SalePriceCell)
