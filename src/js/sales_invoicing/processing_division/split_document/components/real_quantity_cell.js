import React, { useContext } from 'react'
import { observer } from 'mobx-react'
import { KCInputNumberV2 } from '@gmfe/keyboard'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import { isNil } from 'lodash'

import { storeContext } from './details_component'

const RealQuantityCell = ({ index }) => {
  const { viewType, gainSpus, setGainSpusItem } = useContext(storeContext)
  const { real_quantity, remain_quantity } = gainSpus[index]

  const handleChangeQuantity = (value) => {
    setGainSpusItem(index, { real_quantity: value })
  }

  return viewType === 'details' ? (
    real_quantity
  ) : (
    <KCInputNumberV2
      placeholder={t('填写数量')}
      onChange={handleChangeQuantity}
      className='form-control'
      value={real_quantity}
      min={0}
      disabled={isNil(remain_quantity)}
      precision={2}
    />
  )
}

RealQuantityCell.propTypes = {
  index: PropTypes.number.isRequired,
}

export default observer(RealQuantityCell)
