// 暂时应用于移动端，后续废弃
import { i18next } from 'gm-i18n'
import React from 'react'
import { Price } from '@gmfe/react'
import PropTypes from 'prop-types'

// 信用额度提醒
const OverCreditLimitTip = ({ total, customer }) => {
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

const CustomerMsg = ({ customer, feeType = '' }) => {
  let msg = i18next.t('KEY98', {
    VAR1: customer.msg,
  }) /* src:`账户状态: ${customer.msg}` => tpl:账户状态: ${VAR1} */

  // 如果是信用额度内
  if (customer.customer_credit_type === 12) {
    const { credit_limit, available_credit } = customer.customer_credit_info
    msg = (
      <div>
        <div>
          {i18next.t('当前可用额度:') + Price.getCurrency(feeType)}
          {available_credit.toFixed(2)}
        </div>
        <div>
          {i18next.t('(授信额度:') + Price.getCurrency(feeType)}
          {credit_limit.toFixed(2)})
        </div>
      </div>
    )
  }

  if (customer.customer_credit_type === 13) {
    const { credit_limit, over_credit } = customer.customer_credit_info
    msg = (
      <div>
        <div>
          {i18next.t('当前已超出额度:') + Price.getCurrency(feeType)}
          {over_credit.toFixed(2)}
          {i18next.t(',不可下单')}
        </div>
        <div>
          {i18next.t('(授信额度:') + Price.getCurrency(feeType)}
          {credit_limit.toFixed(2)})
        </div>
      </div>
    )
  }

  return (
    <div className='gm-bg gm-border gm-padding-5' style={{ width: '180px' }}>
      {msg}
    </div>
  )
}

CustomerMsg.propTypes = {
  customer: PropTypes.object,
  feeType: PropTypes.string,
}

export { OverCreditLimitTip, CustomerMsg }
