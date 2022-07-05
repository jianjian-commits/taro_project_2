import React from 'react'
import PropTypes from 'prop-types'
import { Popover } from '@gmfe/react'

class FloatTip extends React.Component {
  render() {
    // tip: 自定义编码   skuId: sku_id showCustomer: 是否直接显示自定义编码
    const { tip, skuId, showCustomer, ...rest } = this.props

    // 若有skuID, 则显示popover的三角
    const shouldBeShowArrow =
      !!(showCustomer && skuId) || !!(!showCustomer && tip)

    return (
      <Popover
        popup={
          showCustomer ? (
            skuId ? (
              <div className='gm-padding-5'>{skuId}</div>
            ) : (
              <span />
            )
          ) : tip ? (
            <div className='gm-padding-5'>{tip}</div>
          ) : (
            <span />
          )
        }
        type='hover'
        top
        left
        showArrow={shouldBeShowArrow}
        {...rest}
      >
        <div className='gm-inline-block gm-padding-right-5'>
          {(showCustomer ? tip : skuId) || '-'}
        </div>
      </Popover>
    )
  }
}
FloatTip.propTypes = {
  tip: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  skuId: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  showCustomer: PropTypes.bool,
}

FloatTip.defaultProps = {
  showCustomer: false,
}
export default FloatTip
