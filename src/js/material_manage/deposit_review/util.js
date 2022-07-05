import _ from 'lodash'
import Big from 'big.js'

const fixedNumber = (num) => {
  return _.isNil(num) ? '-' : Big(num).toFixed(2)
}

export { fixedNumber }
