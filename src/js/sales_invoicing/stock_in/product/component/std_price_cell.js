/*
 * @Autor: xujiahao
 * @Date: 2021-05-14 10:18:40
 * @LastEditors: xujiahao
 * @LastEditTime: 2021-11-11 14:16:56
 * @FilePath: /gm_static_stationv2/src/js/sales_invoicing/stock_in/product/component/std_price_cell.js
 */
import React from 'react'
import { observer } from 'mobx-react'
import store from '../store/receipt_store'
import { KCInputNumberV2 } from '@gmfe/keyboard'
import { Flex, Price } from '@gmfe/react'
import StockInPriceWarning from './stock_in_price_warning'
import { isInShare } from '../../util'
import memoComponentWithDataHoc from './memo_component_with_data_hoc'
import PropTypes from 'prop-types'
import { TableXUtil } from '@gmfe/table-x'

const { TABLE_X } = TableXUtil

const StdPriceCell = observer((props) => {
  const { index, data } = props
  const { stockInShareList } = store

  const { std_unit, unit_price, id } = data

  const handleStdUnitPriceChange = (value) => {
    store.setUnitPriceChange(index, value)
  }
  return isInShare(stockInShareList, id) ? (
    unit_price + Price.getUnit() + '/' + (std_unit || '-')
  ) : (
    <Flex alignCenter>
      <KCInputNumberV2
        autocomplete='off'
        value={unit_price}
        onChange={handleStdUnitPriceChange}
        min={0}
        precision={2}
        className='form-control input-sm'
        style={{ width: TABLE_X.WIDTH_NUMBER }}
      />
      <span className='gm-padding-5'>
        {Price.getUnit() + '/'}
        {std_unit || '-'}
      </span>
      <StockInPriceWarning index={index} />
    </Flex>
  )
})

StdPriceCell.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(StdPriceCell)
