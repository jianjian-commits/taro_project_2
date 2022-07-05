import React from 'react'
import { observer } from 'mobx-react'
import memoComponentWithDataHoc from './memo_with_data_hoc'
import PropTypes from 'prop-types'
import { KCInputNumberV2 } from '@gmfe/keyboard'
import { Flex, Price } from '@gmfe/react'
import store from '../store'
import PriceWarning from './price_warning'

const CellPrice = observer((props) => {
  const { index, data } = props
  const { purchase_price, std_unit_name, supplier_purchase_avg_price } = data

  const handleChange = (value) => {
    store.changeEditTask(true)
    store.changeListItemPrice(index, value)
  }

  return (
    <Flex alignCenter>
      <KCInputNumberV2
        autocomplete='off'
        id={index}
        value={purchase_price}
        onChange={handleChange}
        min={0}
        max={999999999}
        style={{ width: '85px' }}
        className='input-sm'
      />
      <span style={{ whiteSpace: 'nowrap' }}>
        {Price.getUnit() + '/' + std_unit_name}
      </span>
      <PriceWarning
        std_unit_name={std_unit_name}
        purchase_price={purchase_price}
        supplier_purchase_avg_price={supplier_purchase_avg_price}
      />
    </Flex>
  )
})

CellPrice.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(CellPrice)
