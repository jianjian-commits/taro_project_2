import React from 'react'
import { KCInputNumberV2 } from '@gmfe/keyboard'
import PropTypes from 'prop-types'

import memoComponentWithDataHoc from '../common/memo_component_with_data_hoc'

const StockEditCell = ({ data, onChange, index }) => {
  const handleSelected = (value) => {
    onChange(value, index)
  }

  return <KCInputNumberV2 value={data.stock_num} onChange={handleSelected} />
}

StockEditCell.propTypes = {
  data: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  index: PropTypes.number,
}

export default memoComponentWithDataHoc(StockEditCell, 'one')
