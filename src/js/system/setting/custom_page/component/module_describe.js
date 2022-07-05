import React from 'react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'

const ModuleDescribe = (props) => {
  const { type } = props
  const firstPart =
    type === 'coupon'
      ? t(
          '1. 商城首页将展示会员和店铺两种优惠券，若未创建客户领取的优惠券商城首页将不展示此模块；',
        )
      : t(
          '1. 商城首页将展示已创建有效的限时抢购商品，若无有效的限时抢购活动首页将不展示此模块；',
        )
  const secondPart =
    type === 'coupon'
      ? t('2. 如需设置优惠券，可至营销-优惠券新建领取方式为客户领取的优惠券。')
      : t('2. 如需设置限时抢购活动，可至营销-限时抢购模块新建活动。')

  return (
    <div className='gm-text-desc gm-margin-bottom-5 gm-padding-top-5'>
      {firstPart}
      <br />
      {secondPart}
    </div>
  )
}

ModuleDescribe.propTypes = {
  type: PropTypes.string,
}

export default ModuleDescribe
