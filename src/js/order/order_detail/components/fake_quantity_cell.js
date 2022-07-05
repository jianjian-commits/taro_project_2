import { i18next } from 'gm-i18n'
import React from 'react'
import Big from 'big.js'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import store from '../../store'

import { isLK } from '../../util'
import { KCInputNumberV2 } from '@gmfe/keyboard'
import KCDisabledCell from '../../../common/components/kc_disabled_cell'

const FakeQuantityCell = observer(({ index, sku, onChange, inputWidth }) => {
  const { viewType, _id } = store.orderDetail

  const isLKOrder = isLK(_id)
  const fakeQuantity = sku.fake_quantity

  let renderValue = null

  if (sku.code) {
    return (
      <KCDisabledCell>
        <span> - </span>
      </KCDisabledCell>
    )
  }

  renderValue = fakeQuantity

  if (viewType !== 'view') {
    if (sku.is_combine_goods && !sku.isCombineGoodsTop) {
      return (
        <KCDisabledCell>
          <span>
            {parseFloat(Big(fakeQuantity || 0).toFixed(2)) + sku.sale_unit_name}
          </span>
        </KCDisabledCell>
      )
    }

    if (isLKOrder) {
      return parseFloat(Big(fakeQuantity || 0).toFixed(2)) + sku.sale_unit_name
    } else {
      return (
        <div>
          <KCInputNumberV2
            value={renderValue}
            onChange={(val) =>
              onChange && onChange(index, 'fake_quantity', val)
            }
            onFocus={(e) => {
              const target = e.target
              setTimeout(() => {
                target && target.select()
              }, 10)
            }}
            style={{ width: inputWidth }}
            placeholder={i18next.t('预下单数')}
            min={0}
          />
          <span className='gm-padding-left-5'>
            {fakeQuantity === null ? '-' : sku.sale_unit_name}
          </span>
        </div>
      )
    }
  }
  return parseFloat(Big(fakeQuantity || 0).toFixed(2)) + sku.sale_unit_name
})

FakeQuantityCell.displayName = 'FakeQuantityCell'
FakeQuantityCell.propTypes = {
  index: PropTypes.number,
  order: PropTypes.object,
  onChange: PropTypes.func,
  inputWidth: PropTypes.number,
}

export default FakeQuantityCell
