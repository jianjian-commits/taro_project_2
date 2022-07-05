import React, { useContext } from 'react'
import { observer } from 'mobx-react'
import { KCInputNumberV2 } from '@gmfe/keyboard'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'

import { storeContext } from './details_component'

const IN_STOCK_MAX = 1000000 // 测试规定

const InStockPriceCell = ({ index }) => {
  const { viewType, gainSpus, setGainSpusItem } = useContext(storeContext)
  const { in_stock_price } = gainSpus[index]

  const handleChange = (value) => {
    setGainSpusItem(index, { in_stock_price: value })
  }

  return viewType === 'details' ? (
    in_stock_price
  ) : (
    <KCInputNumberV2
      onChange={handleChange}
      value={in_stock_price}
      className='form-control'
      placeholder={t('填写价格')}
      precision={2}
      min={0}
      max={IN_STOCK_MAX}
    />
  )
}

InStockPriceCell.propTypes = {
  index: PropTypes.number.isRequired,
}

export default observer(InStockPriceCell)
