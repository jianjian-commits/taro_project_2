import { i18next } from 'gm-i18n'
import React from 'react'
import { FullTab } from '@gmfe/frame'

import CouponList from './coupon_list'
import CouponUsageList from './usage_list'

class Coupon extends React.Component {
  render() {
    return (
      <FullTab tabs={[i18next.t('优惠券列表'), i18next.t('使用概况')]}>
        <CouponList />
        <CouponUsageList />
      </FullTab>
    )
  }
}

export default Coupon
