import React from 'react'
import { Select, Option } from '@gmfe/react'
import _ from 'lodash'

const useSelect = (list) => (props) => {
  let { selected, onSelect } = props
  return (
    <Select value={selected} onChange={onSelect} size='sm'>
      {_.map(list, ({ id, name }) => {
        return (
          <Option key={id} value={id}>
            {name}
          </Option>
        )
      })}
    </Select>
  )
}

export default useSelect
