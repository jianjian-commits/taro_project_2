import _ from 'lodash'
import Big from 'big.js'
import { isNumber } from 'common/util'
import { observer } from 'mobx-react'
import memoComponentHoc from './memo_component'

const QuantityStdCell = observer((props) => {
  const { data } = props
  const {
    clean_food,
    quantity,
    sale_ratio,
    std_ratio,
    std_unit_name,
    batch_details,
  } = data

  let amount = 0

  if (clean_food) {
    _.forEach(batch_details, (l) => {
      amount = Big(amount || 0)
        .plus(l.out_stock_base)
        .toFixed(2)
    })
  } else {
    amount = parseFloat(
      Big(quantity || 0)
        .times(sale_ratio)
        .times(std_ratio)
        .toFixed(2)
    )
  }

  return isNumber(amount) && std_unit_name ? amount + std_unit_name : '-'
})

export default memoComponentHoc(QuantityStdCell)
