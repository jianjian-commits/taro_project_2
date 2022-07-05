import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import store from '../store'
import { doNumberDigitFixed } from 'common/util'

const AmountCell = ({ index }) => {
  const { receiveMaterialList } = store
  const { real_recv_amount, unit_name } = receiveMaterialList[index]

  return (
    <span>
      {real_recv_amount
        ? `${doNumberDigitFixed(real_recv_amount)}${unit_name}`
        : '-'}
    </span>
  )
}

AmountCell.propTypes = {
  index: PropTypes.number,
}

export default observer(AmountCell)
