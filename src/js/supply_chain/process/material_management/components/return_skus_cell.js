import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import store from '../store'
import { Flex, InputNumberV2 } from '@gmfe/react'

const ReturnSkusCell = observer(({ index, disabled }) => {
  const { returnSkus } = store
  const { std_unit_name } = returnSkus[index]
  const [amount, changeAmount] = useState('')

  const handleChange = (value) => {
    changeAmount(value)
    store.setReturnSkusItem(index, { new_amount: value })
  }

  return (
    <Flex alignCenter>
      <InputNumberV2
        onChange={(value) => handleChange(value)}
        className='form-control'
        style={{ minWidth: '90px' }}
        value={amount}
        disabled={disabled}
      />
      {std_unit_name}
    </Flex>
  )
})

ReturnSkusCell.propTypes = {
  index: PropTypes.number,
  disabled: PropTypes.bool,
}

export default ReturnSkusCell
