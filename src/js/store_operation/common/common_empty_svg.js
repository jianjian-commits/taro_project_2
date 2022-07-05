import React from 'react'
import { Flex } from '@gmfe/react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import SVGEmpty from '../../../svg/empty.svg'
import SVGFullScreenEmpty from '../../../svg/full_screen_empty.svg'

const CommonEmptySvg = (props) => {
  const { text, isFullScreen, className, ...rest } = props

  return (
    <Flex
      alignCenter
      justifyCenter
      column
      className={classNames('', className)}
      {...rest}
    >
      <Flex>
        {isFullScreen ? (
          <SVGFullScreenEmpty style={{ width: '70px', height: '70px' }} />
        ) : (
          <SVGEmpty style={{ width: '70px', height: '70px' }} />
        )}
      </Flex>
      <div style={{ textAlign: 'center', opacity: '0.5' }}>{text}</div>
    </Flex>
  )
}

CommonEmptySvg.propTypes = {
  text: PropTypes.string,
  isFullScreen: PropTypes.bool, // 是否在分拣投屏页
  className: PropTypes.string,
}

export default CommonEmptySvg
