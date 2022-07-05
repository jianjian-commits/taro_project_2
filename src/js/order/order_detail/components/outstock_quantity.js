import React from 'react'
import { observer } from 'mobx-react'

import { KCInputNumberV2 } from '@gmfe/keyboard'
import KCDisabledCell from '../../../common/components/kc_disabled_cell'

const OutStockQuantityCell = observer(
  ({ index, sku, onChange, inputWidth, disabled }) => {
    if (sku.code || sku.isCombineGoodsTop) {
      return (
        <KCDisabledCell>
          <span> - </span>
        </KCDisabledCell>
      )
    }

    return (
      <div>
        <KCInputNumberV2
          value={sku.after_sale_outstock_quantity_fe}
          onChange={(val) =>
            onChange && onChange(index, 'after_sale_outstock_quantity_fe', val)
          }
          disabled={disabled}
          className='form-control gm-inline'
          style={{ width: inputWidth }}
        />
        <span className='gm-padding-left-5'>{sku?.sale_unit_name || '-'}</span>
      </div>
    )
  },
)

OutStockQuantityCell.displayName = 'OutStockQuantityCell'

export default OutStockQuantityCell
