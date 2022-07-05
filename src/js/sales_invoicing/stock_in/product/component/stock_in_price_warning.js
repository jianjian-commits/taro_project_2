import { i18next } from 'gm-i18n'
import React from 'react'
import { Popover, Price } from '@gmfe/react'
import Big from 'big.js'
import { observer } from 'mobx-react'
import store from '../store/receipt_store'
import globalStore from '../../../../stores/global'
import PropTypes from 'prop-types'

const StockInPriceWarning = observer((props) => {
  const { index } = props
  const {
    otherInfo: { inStockPriceWarning },
  } = globalStore
  const {
    supplier_stock_avg_price,
    std_unit,
    unit_price,
    max_stock_unit_price,
    ratio,
  } = store.stockInReceiptList[index]

  const purchase_unit_price = Big(unit_price || 0)
    .times(ratio || 0)
    .toFixed(2)

  if (
    inStockPriceWarning === 1 &&
    supplier_stock_avg_price &&
    Big(supplier_stock_avg_price).lt(unit_price || 0)
  ) {
    return (
      <Popover
        showArrow
        type='hover'
        popup={
          <div className='gm-padding-5' style={{ minWidth: '100px' }}>
            <div className='gm-text-red gm-text-12 gm-padding-5'>
              {`${i18next.t(
                '近七天入库均价'
              )}=${supplier_stock_avg_price}${Price.getUnit()}/${std_unit}`}
            </div>
            <div className='gm-padding-5 gm-padding-top-0'>
              {i18next.t('当前入库单价已超出，请关注预警商品')}
            </div>
          </div>
        }
      >
        <i className='ifont xfont-warning-circle gm-text-red' />
      </Popover>
    )
  } else if (
    inStockPriceWarning === 2 &&
    max_stock_unit_price !== null &&
    max_stock_unit_price !== undefined &&
    Big(max_stock_unit_price).lt(purchase_unit_price)
  ) {
    return (
      <Popover
        showArrow
        type='hover'
        popup={
          <div className='gm-padding-10' style={{ minWidth: '100px' }}>
            {i18next.t('商品入库单价已超所设置的最高入库单价')}
          </div>
        }
      >
        <i className='ifont xfont-warning-circle gm-text-red' />
      </Popover>
    )
  }

  return null
})

StockInPriceWarning.propTypes = {
  index: PropTypes.number.isRequired,
}

export default StockInPriceWarning
