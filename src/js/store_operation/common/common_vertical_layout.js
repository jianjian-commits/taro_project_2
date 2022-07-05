import React from 'react'
import classNames from 'classnames'
import { Flex, ToolTip } from '@gmfe/react'
import PropTypes from 'prop-types'

const CommonVerticalLayout = (props) => {
  const {
    name,
    tipContent,
    symbol,
    value,
    className,
    color,
    numberClassName,
    ...rest
  } = props
  return (
    <Flex flex justifyCenter alignCenter className={classNames('', className)}>
      <Flex column jusifyStart>
        <Flex alignCenter>
          <Flex>{name}</Flex>
          {tipContent ? (
            <ToolTip
              style={{ fontSize: '1.2em' }}
              popup={
                <div className='gm-padding-5' style={{ width: '180px' }}>
                  {tipContent}
                </div>
              }
              className='gm-margin-left-5'
            />
          ) : null}
        </Flex>
        <Flex
          className='b-purchase-overview-amount-number gm-text-bold'
          style={{ color: color }}
          {...rest}
          alignCenter
        >
          {symbol ? (
            <span className='b-purchase-overview-amount-unit'>{symbol}</span>
          ) : null}
          <span className={classNames('gm-number-family', numberClassName)}>
            {value}
          </span>
        </Flex>
      </Flex>
    </Flex>
  )
}

CommonVerticalLayout.propTypes = {
  name: PropTypes.string,
  tipContent: PropTypes.string, // 提示内容
  symbol: PropTypes.string, // 数字单位
  value: PropTypes.number, // 数字
  className: PropTypes.string, // title样式
  color: PropTypes.string, // value的颜色
  numberClassName: PropTypes.string, // number 自定义样式
}

export default CommonVerticalLayout
