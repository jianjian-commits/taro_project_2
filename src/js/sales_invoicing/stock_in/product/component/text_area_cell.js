import React from 'react'
import { observer } from 'mobx-react'
import memoComponentWithDataHoc from './memo_component_with_data_hoc'
import PropTypes from 'prop-types'

const TextAreaCell = observer((props) => {
  const { data, field } = props
  let showText = data[field]

  if (field === 'category') {
    showText = data.category_name_2
      ? data.category_name_1 + '/' + data.category_name_2
      : '-'
  }

  return <span>{showText || '-'}</span>
})

TextAreaCell.propTypes = {
  data: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
}

export default memoComponentWithDataHoc(TextAreaCell)
