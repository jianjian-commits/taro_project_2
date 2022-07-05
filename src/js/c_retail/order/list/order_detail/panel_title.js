import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import Big from 'big.js'

import TinyPrice from 'common/components/tiny_price'

import store from './store'

const PanelTitle = observer(({ total }) => {
  const { orderDetail } = store
  const {
    customer,
    details: skus,
    freightFromDatabase,
    fee_type,
    coupon_amount,
  } = orderDetail

  // 运费展示
  const freightCom = (feeType) => {
    return (
      <span>
        {i18next.t('含运费：')}
        <TinyPrice
          className='gm-text-bold gm-text-primary'
          value={freightFromDatabase ? +freightFromDatabase : 0}
          feeType={feeType}
        />
      </span>
    )
  }

  const orderListTitle = () => {
    const couponDiscount = Big(coupon_amount || 0).toFixed(2)
    return (
      <span>
        {i18next.t('商品列表：')}
        <span className='gm-text-bold gm-text-primary'>{skus.length}</span>
        {couponDiscount !== '0.00' && (
          <span>
            <span className='gm-padding-lr-10 gm-text-desc'>|</span>
            {i18next.t('优惠金额')}：-
            <TinyPrice
              className='gm-text-bold gm-text-primary'
              value={couponDiscount}
              feeType={fee_type}
            />
          </span>
        )}
        <span className='gm-padding-lr-10 gm-text-desc'>|</span>
        {freightCom(fee_type)}
      </span>
    )
  }

  const overCreditLimitTip = (total, customer) => {
    if (
      total &&
      customer &&
      customer.customer_credit_type === 12 &&
      total > +customer.customer_credit_info.available_credit
    ) {
      return (
        <div className='gm-margin-left-5 gm-text-red'>
          <i className='xfont xfont-warning-circle' />
          {i18next.t('已超出授信额度，请联系商户结清账单！')}
        </div>
      )
    } else {
      return null
    }
  }
  return (
    <span>
      {orderListTitle()}
      {overCreditLimitTip(total, customer)}
    </span>
  )
})

PanelTitle.propTypes = {
  total: PropTypes.string,
}

export default PanelTitle
