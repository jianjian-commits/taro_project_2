import React from 'react'
import PropTypes from 'prop-types'
import { Popover } from '@gmfe/react'
import SvgWarning from 'svg/warning-circle-o.svg'

function WarningTip(props) {
  const { tip = '' } = props

  return (
    <Popover
      showArrow
      top
      type='hover'
      popup={
        <div
          className='gm-border gm-padding-5 gm-bg gm-text-12'
          style={{ width: 'max-content' }}
        >
          {tip}
        </div>
      }
    >
      <SvgWarning className='b-warning-tips gm-margin-lr-5' />
    </Popover>
  )
}
WarningTip.propTypes = {
  tip: PropTypes.string.isRequired,
}
export default WarningTip
