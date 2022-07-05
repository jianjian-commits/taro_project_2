/* eslint-disable react/prop-types */
import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Price } from '@gmfe/react'

const SortTriangle = (props) => (
  <div
    className='gm-inline-block'
    style={{ cursor: 'pointer' }}
    onClick={props.onSortClick}
  >
    <div style={{ display: 'inline-block' }}>{props.content || '-'}</div>
    <div className='b-triangle-sort' style={props.style}>
      <div
        className={classNames('triangle-sort-top', {
          dark: props.name + '_asc' === props.sortType,
        })}
      />
      <div
        className={classNames('triangle-sort-bottom', {
          dark: props.name + '_desc' === props.sortType,
        })}
      />
    </div>
  </div>
)

const CustomerMsg = ({ customer, feeType = null }) => {
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
}

export default CustomerMsg
