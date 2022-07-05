import React from 'react'
import PropTypes from 'prop-types'
import { Flex } from '@gmfe/react'
import SvgNext from 'svg/next.svg'

class PurchaseOverviewTitle extends React.Component {
  rightContent = () => {
    const { rightChildren, type, linkRoute, linkText } = this.props
    if (rightChildren) {
      return rightChildren
    } else if (type === 'more') {
      // 查看更多
      return (
        <a
          href={'#' + linkRoute}
          className='gm-text-12 gm-flex gm-flex-align-center'
        >
          {linkText}&nbsp;
          <SvgNext />
        </a>
      )
    } else {
      return null
    }
  }

  render() {
    const {
      title,
      className,
      rightChildren,
      leftChildren,
      type,
      linkRoute,
      linkText,
      ...rest
    } = this.props

    return (
      <Flex {...rest} className='gm-text-14' alignStart>
        <Flex className='b-purchase-common-title-icon' />
        <Flex
          justifyBetween
          flex
          className={
            type === 'fullScreen'
              ? 'b-purchase-full-screen-link'
              : 'b-purchase-common-link'
          }
        >
          <Flex>
            {title}
            {leftChildren || null}
          </Flex>
          <Flex>{this.rightContent()}</Flex>
        </Flex>
      </Flex>
    )
  }
}

PurchaseOverviewTitle.propTypes = {
  title: PropTypes.string,
  className: PropTypes.string,
  rightChildren: PropTypes.element,
  leftChildren: PropTypes.element,
  type: PropTypes.string, // 类型
  linkRoute: PropTypes.string, // 链接
  linkText: PropTypes.string, // 右边按钮文案
}

export default PurchaseOverviewTitle
