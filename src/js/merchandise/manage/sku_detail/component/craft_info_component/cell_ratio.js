import React from 'react'
import { observer } from 'mobx-react'
import memoComponentWithDataHoc from './memo_hoc'
import PropTypes from 'prop-types'

const CellRatio = observer((props) => {
  const { id, std_unit_name, sale_unit_name, ratio } = props.data

  return id
    ? std_unit_name === sale_unit_name
      ? `${ratio}${std_unit_name}`
      : `${ratio}${std_unit_name}/${sale_unit_name}`
    : '-'
})

CellRatio.propTypes = {
  index: PropTypes.number.isRequired,
  data: PropTypes.object,
}

export default memoComponentWithDataHoc(CellRatio)
