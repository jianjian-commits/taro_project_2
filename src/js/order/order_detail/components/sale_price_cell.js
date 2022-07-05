import { i18next, t } from 'gm-i18n'
import React from 'react'
import { Price } from '@gmfe/react'
import PropTypes from 'prop-types'
import Big from 'big.js'
import { observer } from 'mobx-react'

import { isLK } from '../../util'
import { KCInputNumberV2 } from '@gmfe/keyboard'
import KCDisabledCell from '../../../common/components/kc_disabled_cell'
import orderDetailStore from '../../store'

const SalePriceCell = observer(
  ({
    sale_price,
    index,
    isPriceEditable,
    sku,
    onEdit,
    inputWidth,
    disabled,
  }) => {
    const { viewType, _id } = orderDetailStore.orderDetail

    const isLKOrder = isLK(_id)
    let totalItemPrice = null
    let renderValue = null

    if (sale_price !== null) {
      totalItemPrice = sku.total_item_price || 0
      renderValue = sale_price === '' ? null : sale_price * 1.0
    }

    if (!isPriceEditable) {
      return `${parseFloat(Big(sale_price || 0).toFixed(2))}${
        Price.getUnit(sku.fee_type) + '/'
      }
    ${sku.sale_unit_name}`
    }

    let isTiming = false

    const onChange = (value) => {
      const { yx_price, rule_type } = sku
      orderDetailStore.onRowChange(index, 'sale_price', value)
      // orderDetailStore.onRowChange(index, 'init_value', false)
      if (yx_price && rule_type) {
        const before_change_price_forsale = Big(value || 0)
          .div(yx_price)
          .times(100)
          .toFixed(2)

        orderDetailStore.onRowChange(
          index,
          'before_change_price_forsale',
          Number(before_change_price_forsale),
        )
      }
    }

    if (viewType !== 'view') {
      if (sku.is_combine_goods && sku.isCombineGoodsTop) {
        return (
          <KCDisabledCell>
            <span>
              {`${parseFloat(Big(sale_price || 0).toFixed(2))}${Price.getUnit(
                sku.fee_type,
              )}/${sku.sale_unit_name}`}
              ({t('参考价格')})
            </span>
          </KCDisabledCell>
        )
      }
      if (sale_price !== null) {
        isTiming = sku.is_price_timing
      }
      if (isLKOrder) {
        if (sku.is_price_timing && !totalItemPrice) {
          return i18next.t('时价')
        } else {
          return `${sale_price}${Price.getUnit(sku.fee_type) + '/'}
        ${sku.sale_unit_name}`
        }
      } else {
        if (sku.code) {
          return (
            <KCDisabledCell>
              <span> - </span>
            </KCDisabledCell>
          )
        }

        if (isTiming) {
          return (
            <KCDisabledCell>
              <div
                className='gm-inline-block'
                style={{ cursor: 'pointer' }}
                onClick={(e) => onEdit && onEdit(index, e)}
              >
                <span className=' gm-margin-right-5'>{i18next.t('时价')}</span>
                <i className='glyphicon glyphicon-pencil text-primary' />
              </div>
            </KCDisabledCell>
          )
        } else {
          return (
            <div>
              <KCInputNumberV2
                value={renderValue}
                disabled={disabled}
                onChange={onChange}
                style={{ width: inputWidth }}
                placeholder={i18next.t('单价')}
                min={0}
                max={999999}
                className='form-control gm-inline'
              />
              <span className='gm-padding-left-5'>
                {sale_price === null ? '-' : Price.getUnit(sku.fee_type)}
                {'/'}
                {sale_price === null ? '-' : sku.sale_unit_name}
              </span>
            </div>
          )
        }
      }
    } else {
      // 时价
      if (sku.is_price_timing && !totalItemPrice) {
        return i18next.t('时价')
      } else {
        return `${sale_price}${Price.getUnit(sku.fee_type) + '/'}
      ${sku.sale_unit_name}`
      }
    }
  },
)

SalePriceCell.displayName = 'SalePriceCell'
SalePriceCell.propTypes = {
  sale_price: PropTypes.string,
  index: PropTypes.number,
  order: PropTypes.object,
  isPriceEditable: PropTypes.bool,
  disabled: PropTypes.bool,
  onEdit: PropTypes.func,
}

export default SalePriceCell
