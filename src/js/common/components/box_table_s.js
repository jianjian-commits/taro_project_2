import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Flex } from '@gmfe/react'

/**
 * 功能跟BoxTable一样，样式有一点区别，用在:
 * 商品 - 锁价、税率规则、标签模板配置
 * 分拣标签
 */
const Info = (props) => {
  return (
    <div
      {...props}
      className={classNames('gm-box-table-info', props.className)}
    />
  )
}

Info.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
}

const BoxTableS = (props) => {
  const { info, action, children, className, ...rest } = props

  return (
    <div {...rest} className={classNames('gm-box gm-box-table', className)}>
      <Flex
        style={{ height: '46px' }}
        className='gm-padding-lr-10 bg-white'
        alignCenter
      >
        <Flex>{info}</Flex>
        <Flex flex />
        <Flex>{action}</Flex>
      </Flex>
      <div>{children}</div>
    </div>
  )
}

BoxTableS.Info = Info

BoxTableS.propTypes = {
  info: PropTypes.element,
  action: PropTypes.element,
  className: PropTypes.string,
  style: PropTypes.object,
}

export default BoxTableS
