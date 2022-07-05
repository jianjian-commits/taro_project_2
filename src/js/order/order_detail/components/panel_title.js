import { i18next } from 'gm-i18n'
import React from 'react'
import { Price } from '@gmfe/react'
import PropTypes from 'prop-types'
import Big from 'big.js'
import { observer } from 'mobx-react'
import _ from 'lodash'

import TinyPrice from 'common/components/tiny_price'
import { getSkusLength } from '../../util'
import globalStore from 'stores/global'
import orderDetailStore from '../../store'

const toFixed = (v) => parseFloat(Big(v).toFixed(2))

const HkTitle = observer(({ feeType }) => {
  const { orderDetail } = orderDetailStore
  const { dynamicFreight } = orderDetailStore.summary
  const {
    details: skus,
    total_actual_price,
    total_after_sale_outstock_price,
    total_self_acquisition_price,
    total_sale_outstock_price,
    viewType,
    fee_type,
    freightFromDatabase,
  } = orderDetail
  const isHKOrder = globalStore.isHuaKang()
  if (!isHKOrder) return null
  let dynamic = {
    totalActualPrice: 0,
    totalAfterSaleOutStockPrice: 0,
    totalSelfAcquisitionPrice: 0,
    totalSaleOutStockPrice: 0,
  }
  if (viewType === 'view') {
    dynamic = {
      totalActualPrice: total_actual_price || 0,
      totalAfterSaleOutStockPrice: total_after_sale_outstock_price || 0,
      totalSelfAcquisitionPrice: total_self_acquisition_price || 0,
      totalSaleOutStockPrice: total_sale_outstock_price || 0,
    }
  } else {
    dynamic = _.reduce(
      skus,
      (sum, v) => {
        const actualPrice = v.isCombineGoodsTop
          ? 0
          : Big(v.actual_quantity || 0).times(v.sale_price || 0)
        sum.totalActualPrice += parseFloat(actualPrice)
        sum.totalAfterSaleOutStockPrice += parseFloat(
          Big(v.after_sale_outstock_quantity || 0).times(v.sale_price || 0),
        )
        sum.totalSelfAcquisitionPrice += parseFloat(
          Big(v.self_acquisition_quantity || 0).times(v.sale_price || 0),
        )
        sum.totalSaleOutStockPrice += parseFloat(
          Big(v.self_acquisition_quantity || 0)
            .times(v.sale_price || 0)
            .plus(
              Big(v.after_sale_outstock_quantity || 0).times(v.sale_price || 0),
            ),
        )
        return sum
      },
      { ...dynamic },
    )
    const freight =
      viewType === 'create'
        ? dynamicFreight || 0
        : Big(freightFromDatabase || 0)
            .div(100)
            .toFixed(2)
    dynamic.totalSaleOutStockPrice = parseFloat(
      Big(dynamic.totalSaleOutStockPrice).plus(Big(freight)),
    )
  }
  return (
    <>
      <span>
        {i18next.t('验货金额: ')}
        <span className='gm-text-primary gm-text-bold'>
          {Price.getCurrency(fee_type) + toFixed(dynamic.totalActualPrice)}
        </span>
      </span>
      <span className='gm-padding-lr-10 gm-text-desc'>|</span>
      <span>
        {i18next.t('售后出库金额: ')}
        <span className='gm-text-primary gm-text-bold'>
          {Price.getCurrency(fee_type) +
            toFixed(dynamic.totalAfterSaleOutStockPrice)}
        </span>
      </span>
      <span className='gm-padding-lr-10 gm-text-desc'>|</span>
      <span>
        {i18next.t('自采金额: ')}
        <span className='gm-text-primary gm-text-bold'>
          {Price.getCurrency(fee_type) +
            toFixed(dynamic.totalSelfAcquisitionPrice)}
        </span>
      </span>
      <span className='gm-padding-lr-10 gm-text-desc'>|</span>
      <span>
        {i18next.t('销售出库金额（总）: ')}
        <span className='gm-text-primary gm-text-bold'>
          {Price.getCurrency(fee_type) +
            toFixed(dynamic.totalSaleOutStockPrice)}
        </span>
      </span>
      <span className='gm-padding-lr-10 gm-text-desc'>|</span>
    </>
  )
})

const PanelTitle = observer(({ isIdDetail }) => {
  const { total, dynamicFreight } = orderDetailStore.summary
  const { orderDetail } = orderDetailStore
  const {
    customer,
    details: skus,
    freightFromDatabase,
    viewType,
    fee_type,
    coupon_amount,
  } = orderDetail
  // 运费
  const freightCom = (feeType) => {
    if (viewType === 'view') {
      return freightFromDatabase ? (
        <span>
          {i18next.t('运费: ')}
          <TinyPrice
            className='gm-text-primary gm-text-bold'
            value={+freightFromDatabase}
            feeType={feeType}
          />
        </span>
      ) : (
        <span>
          {i18next.t('运费: ')}
          <TinyPrice
            className='gm-text-primary gm-text-bold'
            value={0}
            feeType={feeType}
          />
        </span>
      )
    } else {
      // 编辑的时候显示动态计算的运费
      return dynamicFreight ? (
        <span>
          {i18next.t('运费: ')}
          <span className='gm-text-primary gm-text-bold'>
            {Price.getCurrency(feeType) + dynamicFreight.toFixed(2)}
          </span>
        </span>
      ) : (
        <span>
          {i18next.t('运费: ')}
          <TinyPrice
            className='gm-text-primary gm-text-bold'
            value={0}
            feeType={feeType}
          />
        </span>
      )
    }
  }

  const orderListTitle = () => {
    // 过滤空行
    const len = getSkusLength(skus)
    if (!isIdDetail) {
      return (
        <span>
          {i18next.t('商品统计: ')}
          <span className='gm-text-primary gm-text-bold'>{len}</span>
          <span className='gm-padding-lr-10 gm-text-desc'>|</span>
          {i18next.t('合计: ')}
          <span className='gm-text-primary gm-text-bold'>
            {Price.getCurrency(fee_type)} {total}
          </span>
          <span className='gm-padding-lr-10 gm-text-desc'>|</span>
          <HkTitle />
          {freightCom(fee_type)}
        </span>
      )
    } else {
      const couponDiscount = Big(coupon_amount || 0).toFixed(2)
      return (
        <span>
          {i18next.t('商品列表: ')}
          <span className='gm-text-primary gm-text-bold'>{len}</span>
          {couponDiscount !== '0.00' && (
            <span>
              <span className='gm-padding-lr-10 gm-text-desc'>|</span>
              {i18next.t('优惠金额: ')}：-
              <TinyPrice
                className='gm-text-primary gm-text-bold'
                value={couponDiscount}
                feeType={fee_type}
              />
            </span>
          )}
          <span className='gm-padding-lr-10 gm-text-desc'>|</span>
          <HkTitle />
          {freightCom(fee_type)}
        </span>
      )
    }
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
  isIdDetail: PropTypes.string,
}

export default PanelTitle
