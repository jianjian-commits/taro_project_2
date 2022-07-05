import { useContext } from 'react'
import { observer } from 'mobx-react'
import { isNil } from 'lodash'
import { storeContext } from './details_component'
import Big from 'big.js'

const GainCountItem = () => {
  const { stdUnitName, gainCount } = useContext(storeContext)

  if (isNil(gainCount)) {
    return '-'
  }

  return `${Big(gainCount).toFixed(2)}${stdUnitName}`
}

export default observer(GainCountItem)
