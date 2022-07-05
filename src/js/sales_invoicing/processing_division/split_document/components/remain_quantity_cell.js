import { useContext } from 'react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import { isNil } from 'lodash'
import { storeContext } from './details_component'

const RemainQuantityCell = ({ index }) => {
  const { gainSpus } = useContext(storeContext)
  const { remain_quantity } = gainSpus[index]

  return isNil(remain_quantity) ? '-' : remain_quantity // todo 语法糖
}

RemainQuantityCell.propTypes = {
  index: PropTypes.number.isRequired,
}

export default observer(RemainQuantityCell)
