import React from 'react'
import classNames from 'classnames'
import Big from 'big.js'
import PropTypes from 'prop-types'
import { KCInputNumberV2 } from '@gmfe/keyboard'
import { observer } from 'mobx-react'

import KCDisabledCell from '../../../common/components/kc_disabled_cell'
import { isAbnormalFun } from '../../util'

const RealQuantity = observer(
  ({ index, sku, isQuantityEditable, viewType, onChange, inputWidth }) => {
    if (viewType === 'create') {
      return '-'
    }

    if (sku.isNewItem && viewType !== 'view') {
      return (
        <KCDisabledCell>
          <span>-</span>
        </KCDisabledCell>
      )
    }

    let unit = null
    let renderValue = null
    let isAbnormal = false

    if (sku.real_quantity !== null) {
      unit = sku.sale_unit_name
      renderValue =
        sku.real_quantity === ''
          ? null
          : parseFloat(Big(sku.real_quantity).toFixed(2))
      // 判断当前商品是否存在异常，异常商品出库数不可编辑
      isAbnormal = isAbnormalFun(sku)
    }

    if (isQuantityEditable && viewType !== 'view') {
      return (
        <div>
          <KCInputNumberV2
            value={renderValue}
            disabled={Boolean(isAbnormal)}
            onChange={(v) =>
              onChange && onChange(index, 'real_quantity', v, sku.sale_ratio)
            }
            style={{ width: inputWidth }}
            min={0}
            className={classNames('form-control gm-inline')}
          />
          <span className='gm-padding-5'>{unit}</span>
        </div>
      )
    } else {
      return '-'
    }
  },
)

RealQuantity.displayName = 'RealQuantity'
RealQuantity.propTypes = {
  index: PropTypes.number,
  sku: PropTypes.object,
  cleanFoodStation: PropTypes.bool, // 净菜站点
  isQuantityEditable: PropTypes.bool,
  viewType: PropTypes.string,
  onChange: PropTypes.func,
}

export default RealQuantity
