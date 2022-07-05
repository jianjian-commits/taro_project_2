import React from 'react'
import { observer } from 'mobx-react'

import { KCInputNumberV2 } from '@gmfe/keyboard'
import KCDisabledCell from '../../../common/components/kc_disabled_cell'

const SelfAcquisitionQuantityCell = observer(
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
          value={sku.self_acquisition_quantity}
          onChange={(val) =>
            onChange && onChange(index, 'self_acquisition_quantity', val)
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

SelfAcquisitionQuantityCell.displayName = 'SelfAcquisitionQuantityCell'

export default SelfAcquisitionQuantityCell
