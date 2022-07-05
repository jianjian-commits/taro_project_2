import React from 'react'
import { observer } from 'mobx-react'
import memoComponentWithDataHoc from './memo_with_data_hoc'
import PropTypes from 'prop-types'
import { KCInputNumberV2 } from '@gmfe/keyboard'
import { Flex } from '@gmfe/react'
import store from '../store'

// 新建时 单位为sale_unit_name
// 编辑时 单位为purchase_unit_name
const CellSaleAmount = observer((props) => {
  const { index, data } = props
  const { purchase_sale_amount, sale_unit_name, purchase_unit_name } = data

  const handleChange = (value) => {
    store.changeEditTask(true)
    store.changeListItemPurchaseSaleAmount(index, value)
  }

  return (
    <Flex alignCenter>
      <KCInputNumberV2
        autocomplete='off'
        id={index}
        value={purchase_sale_amount}
        onChange={handleChange}
        min={0}
        max={999999999}
        style={{ width: '85px' }}
        className='input-sm'
      />
      <span style={{ wordBreak: 'normal' }}>
        {sale_unit_name || purchase_unit_name || '-'}
      </span>
    </Flex>
  )
})

CellSaleAmount.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(CellSaleAmount)
