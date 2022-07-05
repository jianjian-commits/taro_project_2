import React, { memo } from 'react'
import PropTypes from 'prop-types'

import { Flex } from '@gmfe/react'

import WarningTip from './warning_tip'

function CellPrice(props) {
  const { sku_id, msg } = props

  return (
    <Flex alignCenter>
      {sku_id}
      {msg && <WarningTip tip={msg} />}
    </Flex>
  )
}

CellPrice.propTypes = {
  sku_id: PropTypes.string.isRequired,
  msg: PropTypes.string,
}

export default memo(CellPrice)
