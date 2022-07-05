import { observer } from 'mobx-react'
import { useContext } from 'react'
import { storeContext } from './details_component'
import { isNil } from 'lodash'
import Big from 'big.js'

const SplitLossItem = () => {
  const { stdUnitName, gainCount, sourceQuantity } = useContext(storeContext)
  if (isNil(sourceQuantity)) {
    return '-'
  }

  if (isNil(gainCount)) {
    return '-'
  }
  return `${Big(sourceQuantity).minus(gainCount).toFixed(2)}${stdUnitName}`
}

export default observer(SplitLossItem)
