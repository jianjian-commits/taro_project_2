import React from 'react'
import { observer } from 'mobx-react'
import store from '../store'
import { KCInputNumberV2 } from '@gmfe/keyboard'
import { Flex, Price } from '@gmfe/react'
import classNames from 'classnames'
import memoComponentWithDataHoc from './memo_component_with_data_hoc'
import PropTypes from 'prop-types'
import { TableXUtil } from '@gmfe/table-x'
import Big from 'big.js'

const { TABLE_X } = TableXUtil

const StdPriceCell = observer((props) => {
  const { index, data } = props
  const { itemDetailList, status } = store
  const { std_unit_name, unit_price, ratio } = data

  const handleStdUnitPriceChange = (value) => {
    const { sale_quantity } = itemDetailList[index]
    const rowData = {
      unit_price: value,
      money:
        +Big(value || 0)
          .times(sale_quantity || 0)
          .times(ratio || 1)
          .toFixed(2) || null,
    }
    store.onRowDataChange(index, rowData)
  }
  return (
    <Flex alignCenter>
      {status === 'detail' ? (
        unit_price
      ) : (
        <KCInputNumberV2
          value={unit_price}
          onChange={handleStdUnitPriceChange}
          min={0}
          precision={2}
          className='form-control input-sm'
          style={{ width: TABLE_X.WIDTH_NUMBER }}
        />
      )}

      <span className={classNames({ 'gm-padding-5': status !== 'detail' })}>
        {Price.getUnit() + '/'}
        {std_unit_name || '-'}
      </span>
    </Flex>
  )
})

StdPriceCell.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(StdPriceCell)
