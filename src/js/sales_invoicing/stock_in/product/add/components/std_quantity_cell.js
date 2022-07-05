import React from 'react'
import { observer } from 'mobx-react'
import store from '../store'
import { Flex } from '@gmfe/react'
import { KCInputNumberV2 } from '@gmfe/keyboard'
import Big from 'big.js'
import memoComponentWithDataHoc from './memo_component_with_data_hoc'
import PropTypes from 'prop-types'
import { TableXUtil } from '@gmfe/table-x'

const { TABLE_X } = TableXUtil

const StdQuantityCell = observer((props) => {
  const { status, itemDetailList } = store
  const { index, data } = props
  const { sale_quantity, sale_unit_name, ratio } = data

  const handleQuantityChange = (value) => {
    const { unit_price } = itemDetailList[index]
    const rowData = {
      sale_quantity: value,
      money:
        +Big(value || 0)
          .times(unit_price || 0)
          .times(ratio || 1)
          .toFixed(2) || null,
    }
    store.onRowDataChange(index, rowData)
  }

  return (
    <>
      {status === 'detail' ? (
        sale_quantity + (sale_unit_name || '-')
      ) : (
        <Flex alignCenter>
          <KCInputNumberV2
            value={sale_quantity}
            onChange={handleQuantityChange}
            min={0}
            precision={2}
            className='form-control input-sm'
            style={{ width: TABLE_X.WIDTH_NUMBER }}
          />
          <span className='gm-padding-5'>{sale_unit_name || '-'}</span>
        </Flex>
      )}
    </>
  )
})

StdQuantityCell.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(StdQuantityCell)
