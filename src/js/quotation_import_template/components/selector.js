import React from 'react'
import PropTypes from 'prop-types'
import { Select, Option } from '@gmfe/react'
import _ from 'lodash'
import { observer } from 'mobx-react'

const Selector = observer(({ original: { col_index }, list, onChange }) => (
  <Select
    disabled={list.length <= 1}
    value={col_index}
    onChange={onChange}
    style={{ minWidth: 150 }}
  >
    {_.map(list, (item) => (
      <Option key={item.value} value={item.value}>
        {item.text}
      </Option>
    ))}
  </Select>
))

Selector.propTypes = {
  list: PropTypes.array,
  original: PropTypes.object,
  onChange: PropTypes.func,
}

export default Selector
