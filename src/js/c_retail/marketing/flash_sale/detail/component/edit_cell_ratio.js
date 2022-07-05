import React from 'react'
import PropTypes from 'prop-types'
import memoComponentWithDataHoc from './memo_hoc'
import { observer } from 'mobx-react'

const EditCellRatio = observer(props => {
  const { data } = props
  const {
    sku_id,
    sale_ratio,
    std_unit_name_forsale,
    unit_name,
    sale_unit_name
  } = data
  if (!sku_id) return '-'

  return (
    <span>
      {sale_ratio + (std_unit_name_forsale || unit_name) + '/' + sale_unit_name}
    </span>
  )
})

EditCellRatio.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired
}

export default memoComponentWithDataHoc(EditCellRatio)
