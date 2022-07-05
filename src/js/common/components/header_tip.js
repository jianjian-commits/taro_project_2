import React from 'react'
import { Flex, ToolTip } from '@gmfe/react'
import PropTypes from 'prop-types'

const HeaderTip = ({ title, tip, right }) => {
  return (
    <Flex>
      {title}
      <ToolTip
        right={right}
        popup={
          <div className='gm-padding-5' style={{ minWidth: '170px' }}>
            {tip}
          </div>
        }
        className='gm-margin-left-5'
      />
    </Flex>
  )
}

HeaderTip.propTypes = {
  title: PropTypes.string,
  tip: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  right: PropTypes.bool,
}

export default HeaderTip
