import React, { useState } from 'react'
import { Flex } from '@gmfe/react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { t } from 'gm-i18n'

import SVGDownUp from 'svg/down-up-circle.svg'

const Label = (props) => {
  const { label } = props
  // 构造成数组形式
  let labelList = label
  if (!_.isArray(label) && typeof label === 'string') {
    labelList = [label]
  }

  return (
    <Flex>
      {_.map(labelList, (labelItem, index) => {
        return (
          <span
            className={classNames('b-coupon-right-header-label', {
              'gm-margin-left-5': index !== 0,
            })}
            key={`label${index}`}
          >
            {labelItem}
          </span>
        )
      })}
    </Flex>
  )
}

Label.propTypes = {
  /** 优惠券标签展示文字，必传，不考虑为空的情况 */
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
}

// 不另外引gm-mobile,直接搬优惠券组件代码过来
const Coupon = (props) => {
  const {
    currency,
    discount,
    totalInfo,
    dateInfo,
    title,
    label,
    useInfo,
    className,
    disabled,
    hasUseInfo,
    couponAmount,
    ...rest
  } = props

  const [showUseInfo, setShowUseInfo] = useState(false)

  const renderUseInfo = () => {
    // 暂定往下撑开
    return useInfo
  }

  const handleShowInfo = () => {
    const show = !showUseInfo
    setShowUseInfo(show)
  }

  const isDisabled = disabled

  return (
    <div
      {...rest}
      className={classNames(
        'b-coupon-container',
        { disabled: isDisabled },
        className,
      )}
    >
      <div className='b-coupon'>
        <Flex justifyCenter alignCenter column className='b-coupon-left'>
          <Flex justifyCenter alignCenter>
            <Flex alignEnd className='b-coupon-left-currency'>
              {currency}
            </Flex>
            <span className='b-coupon-left-discount'>{discount}</span>
          </Flex>
          {totalInfo && (
            <span className='b-coupon-left-total'>{totalInfo}</span>
          )}
        </Flex>
        <Flex column flex className='b-coupon-right'>
          <Flex
            flex
            column
            alignStart
            justifyCenter
            className='b-coupon-right-header'
          >
            <span className='b-coupon-right-header-title gm-text-14'>
              {title}
            </span>
            {label && <Label label={label} />}
            <Flex
              alignCenter
              justifyBetween
              none
              className='b-coupon-right-header-date'
            >
              <Flex column>
                {dateInfo || ''}
                {couponAmount !== undefined
                  ? `${t('可领')}${couponAmount}${t('张')}`
                  : ''}
              </Flex>

              <span className='b-coupon-right-header-btn'>{t('立即使用')}</span>
            </Flex>
          </Flex>
          {hasUseInfo && (
            <Flex
              alignCenter
              className='b-coupon-right-footer'
              onClick={handleShowInfo}
            >
              <Flex flex justifyStart>
                {t('使用说明')}
              </Flex>
              <Flex
                flex
                justifyEnd
                className={classNames('b-coupon-right-footer-icon', {
                  active: showUseInfo,
                })}
              >
                <SVGDownUp className='b-coupon-right-footer-down-up' />
              </Flex>
            </Flex>
          )}
        </Flex>
      </div>
      {showUseInfo && (
        <div className='b-coupon-use-info'>{renderUseInfo()}</div>
      )}
    </div>
  )
}

Coupon.propTypes = {
  /** 折扣金额货币符号 */
  currency: PropTypes.string.isRequired,
  /** 折扣金额 */
  discount: PropTypes.number.isRequired,
  /** 满减说明 */
  totalInfo: PropTypes.string,
  /** 优惠券标签展示文字，不传不展示标签 */
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  /** 优惠券标题 */
  title: PropTypes.string,
  /** 是否有使用说明 */
  hasUseInfo: PropTypes.bool,
  /** 优惠券使用说明 */
  useInfo: PropTypes.element,
  /** 使用日期说明 */
  dateInfo: PropTypes.string,
  /** 立即使用回调函数 */
  onUse: PropTypes.func,
  /** 不可用状态 */
  disabled: PropTypes.bool,
  couponAmount: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
}

export default Coupon
