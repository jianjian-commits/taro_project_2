import Big from 'big.js'
import { Price } from '@gmfe/react'
import memoComponentHoc from './memo_component'
import { observer } from 'mobx-react'

const MoneyCell = observer((props) => {
  const {
    data: { money },
  } = props
  if (!money && +money !== 0) {
    return '-'
  }
  return (
    Big(money || 0)
      .div(100)
      .toFixed(2) + Price.getUnit()
  )
})

export default memoComponentHoc(MoneyCell)
