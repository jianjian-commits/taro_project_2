import React from 'react'
import { observer } from 'mobx-react'
import { get } from 'mobx'
import { KCInputNumberV2 } from '@gmfe/keyboard'
import goodStore from '../goods_store'
import PropTypes from 'prop-types'

const PercentageCell = ({ sku, skuProperty, index }) => {
  return (
    <div>
      <KCInputNumberV2
        className='form-control gm-inline'
        style={{ width: '50px' }}
        max={100}
        min={0}
        value={get(sku, skuProperty)}
        onChange={(value) =>
          goodStore.handleSkuItemChange(skuProperty, value, index)
        }
      />{' '}
      %
    </div>
  )
}

PercentageCell.propTypes = {
  sku: PropTypes.object.isRequired,
  skuProperty: PropTypes.string,
  index: PropTypes.number.isRequired,
}

export default React.memo(observer(PercentageCell))
