import React from 'react'
import { observer } from 'mobx-react'
import store from '../store/receipt_store'
import { Flex } from '@gmfe/react'
import { isInShare } from '../../util'
import { KCInputNumberV2 } from '@gmfe/keyboard'
import memoComponentWithDataHoc from './memo_component_with_data_hoc'
import PropTypes from 'prop-types'
import { TableXUtil } from '@gmfe/table-x'

const { TABLE_X } = TableXUtil

const StdTareQuantityCell = observer((props) => {
  const { stockInShareList } = store
  const { index, data } = props
  const { tare_quantity, std_unit, id } = data
  // const weigh_stock_in = globalStore.groundWeightInfo.weigh_stock_in // _.includes(permission, 'weigh_stock_in')

  const handleTareQuantityChange = (value) => {
    store.setTareQuantityChange(index, value)
  }

  return (
    <>
      {isInShare(stockInShareList, id) ? (
        tare_quantity + (std_unit || '-')
      ) : (
        <Flex alignCenter>
          <KCInputNumberV2
            value={tare_quantity}
            onChange={handleTareQuantityChange}
            min={0}
            precision={2}
            className='form-control input-sm'
            style={{ width: TABLE_X.WIDTH_NUMBER }}
          />
          <span className='gm-padding-5'>{std_unit || '-'}</span>
        </Flex>
      )}
    </>
  )
})

StdTareQuantityCell.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(StdTareQuantityCell)
