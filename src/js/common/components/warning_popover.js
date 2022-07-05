import React from 'react'
import PropTypes from 'prop-types'
import { Popover } from '@gmfe/react'
import { SvgWarningCircle } from 'gm-svg'

const WarningPopover = ({ text }) => {
  return (
    <Popover showArrow component={<div />} type='hover' popup={text}>
      <span>
        <SvgWarningCircle style={{ color: 'red' }} />
      </span>
    </Popover>
  )
}

WarningPopover.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
}

export default WarningPopover
