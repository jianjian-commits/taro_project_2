import Big from 'big.js'
import { isNumber } from 'common/util'

const Percentage = (props) => {
  const { value } = props
  return isNumber(value) ? Big(value).toFixed(2) + '%' : '-'
}

export default Percentage
