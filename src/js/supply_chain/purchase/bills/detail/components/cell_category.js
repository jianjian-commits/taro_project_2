import React from 'react'
import { observer } from 'mobx-react'
import memoComponentWithDataHoc from './memo_with_data_hoc'
import PropTypes from 'prop-types'

const CellCategory = observer((props) => {
  const {
    data: { category_name_2, category_name_1 },
  } = props
  if (!category_name_2) return '-'

  return <div>{category_name_1 + '/' + category_name_2}</div>
})

CellCategory.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(CellCategory)
