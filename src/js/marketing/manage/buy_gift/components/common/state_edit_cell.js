import React from 'react'
import { KCSelect } from '@gmfe/keyboard'
import PropTypes from 'prop-types'

import { STATE_DATA } from '../../utils'

const StateEditCell = ({ data, onChange, list, index }) => {
  const handleSelected = (value) => {
    onChange(value, index)
  }

  return (
    <KCSelect
      data={STATE_DATA}
      value={data.status === undefined ? 1 : data.status}
      onChange={handleSelected}
    />
  )
}

StateEditCell.propTypes = {
  data: PropTypes.object.isRequired,
  list: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  index: PropTypes.number,
}

export default StateEditCell
