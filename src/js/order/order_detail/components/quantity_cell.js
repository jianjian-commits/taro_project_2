import { i18next } from 'gm-i18n'
import React from 'react'
import Big from 'big.js'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { observer } from 'mobx-react'
import classNames from 'classnames'

import { isLK, isQuantityInvalid } from '../../util'
import { KCInputNumberV2 } from '@gmfe/keyboard'
import KCDisabledCell from '../../../common/components/kc_disabled_cell'
import orderDetailStore from '../../store'
import { useKCInputNumber } from '../../../common/hooks'

const QuantityCell = observer(
  ({ index, sku, onChange, inputWidth, disabled }) => {
    const { orderDetail: order, skusQuantity } = orderDetailStore
    const { viewType } = order

    const isLKOrder = isLK(order._id)
    let renderValue = null
    let isSkuQuantityInvalid = false
    let sale_num_least = null
    let validText = ''
    const quantity = sku.quantity
    const { onFocus, onBlur } = useKCInputNumber()

    const handleInputChange = (val) => {
      onChange && onChange(index, 'quantity', val)
      if (!sku?.detail_id && sku?.is_step_price === 1) {
        const step_price_table = sku?.step_price_table || []
        const obj = _.find(
          step_price_table,
          (e) => val >= e.min && (!e.max || val < e.max),
        )
        if (obj && onChange) {
          onChange(
            index,
            'sale_price',
            Big(obj.step_sale_price).div(100).toFixed(2),
          )
          onChange(
            index,
            'backup_sale_price',
            Big(obj.step_sale_price).div(100).toString(),
          )
        }
      }
    }

    if (sku.code) {
      return (
        <KCDisabledCell>
          <span> - </span>
        </KCDisabledCell>
      )
    }

    if (quantity !== null) {
      renderValue = quantity === '' ? null : _.toNumber(quantity)
    }

    if (sku.id !== null) {
      sale_num_least = sku.sale_num_least
    }

    if (viewType === 'view') {
      return parseFloat(Big(quantity || 0).toFixed(2)) + sku.sale_unit_name
    }

    // 获取当前商品的总下单数，进行最小下单数校验
    if (viewType !== 'view') {
      if (sku.id !== null && !sku.isCombineGoodsTop) {
        const nowSku = _.find(skusQuantity, (item) => item.id === sku.id)
        const totalQuantity = (nowSku && nowSku.totalQuantity) || quantity
        isSkuQuantityInvalid = isQuantityInvalid(totalQuantity, sale_num_least)
        if (isSkuQuantityInvalid) {
          // validText = i18next.t('KEY104', { VAR1: sale_num_least })
          validText = i18next.t(
            /* src:`下单数须大于0，最多两位小数，且不小于最小下单数${sku.sale_num_least}` => tpl:下单数须大于0，最多两位小数，且不小于最小下单数${VAR1} */ 'KEY104',
            { VAR1: sale_num_least },
          )
        }
      }

      if (isLKOrder) {
        return parseFloat(Big(quantity || 0).toFixed(2)) + sku.sale_unit_name
      } else {
        return (
          <div>
            <KCInputNumberV2
              disabled={disabled}
              value={renderValue}
              onChange={(val) => handleInputChange(val)}
              onFocus={onFocus}
              onBlur={onBlur}
              className={classNames('form-control gm-inline', {
                'b-bg-warning': isSkuQuantityInvalid,
              })}
              title={validText}
              style={{ width: inputWidth }}
              placeholder={i18next.t('下单数')}
              min={0}
            />
            <span className='gm-padding-left-5'>
              {quantity === null ? '-' : sku.sale_unit_name}
            </span>
          </div>
        )
      }
    }
  },
)

QuantityCell.displayName = 'QuantityCell'
QuantityCell.propTypes = {
  index: PropTypes.number,
  onChange: PropTypes.func,
  inputWidth: PropTypes.number,
  disabled: PropTypes.bool,
}

export default QuantityCell
