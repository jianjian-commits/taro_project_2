import { i18next } from 'gm-i18n'
import React from 'react'
import { Price } from '@gmfe/react'
import { SvgPriceRule } from 'gm-svg'
import PropTypes from 'prop-types'
import TextTip from '../../../common/components/text_tip'
import { isAbnormalFun } from '../../util'
import { isLockPriceSku } from '../../../common/filter'

const SkuName = ({ value, index, sku }) => {
  if (sku.is_combine_goods) {
    return <span>{value}</span>
  }

  return (
    <span>
      {value}
      {sku.code ? <span className='gm-text-red'>({sku.msg})</span> : null}
      {isAbnormalFun(sku) ? (
        <TextTip
          content={
            <div className='gm-inline-block gm-bg'>
              {i18next.t('当前商品存在售后异常，无法进行修改')}
            </div>
          }
          style={{
            marginLeft: '-2px',
            marginTop: '2px',
            fontSize: '12px',
          }}
        >
          <i className='glyphicon glyphicon-warning-sign text-danger gm-padding-left-5' />
        </TextTip>
      ) : null}
      {isLockPriceSku(sku.price_origin) ? (
        <TextTip
          content={
            <div className='gm-inline-block gm-bg'>
              {i18next.t('order_price_rule', {
                price: `${sku.lock_price}${Price.getUnit(sku.fee_type) + '/'}${
                  sku.sale_unit_name
                }`,
              })}
            </div>
          }
        >
          <span>
            <SvgPriceRule />
          </span>
        </TextTip>
      ) : null}
    </span>
  )
}

SkuName.displayName = 'SkuName'
SkuName.propTypes = {
  value: PropTypes.string,
  index: PropTypes.number,
  sku: PropTypes.object,
}

export default SkuName
