import React, { useState } from 'react'
import _ from 'lodash'
import { FormItem, FormBlock, CheckboxGroup, Checkbox } from '@gmfe/react'

import { sortWithKey } from '../util'
import { toJS } from 'mobx'

const ItemBase = ({ action, width }) => {
  /** For checkbox action */
  const [checked, updateChecked] = useState(toJS(action.value))
  if (action.type === 'select') {
    return (
      <FormItem label={action.title} required>
        <select
          className='input-sm'
          defaultValue={action.value}
          style={{ width: width || '167px', height: '30px' }}
          id={action.name}
        >
          {_.map(action.options, (v) => (
            <option key={v} value={v}>
              {action.template[v]}
            </option>
          ))}
        </select>
      </FormItem>
    )
  } else if (action.type === 'input') {
    return (
      <FormBlock inline>
        {_.map(
          sortWithKey(action.template, ['name', 'passwd']),
          (value, key) => {
            const isPassword = key.indexOf('pass') > -1
            let defaultValue =
              typeof action.value === 'string' ? action.value : ''
            if (typeof action.value === 'object')
              defaultValue = (action.value && action.value[key]) || ''
            return (
              <FormItem label={value} required key={key}>
                <input
                  name={key}
                  type={isPassword ? 'password' : 'text'}
                  autoComplete={isPassword.toString()}
                  defaultValue={defaultValue}
                  style={{ width: width || '167px' }}
                  id={key}
                />
              </FormItem>
            )
          },
        )}
      </FormBlock>
    )
  } else if (action.type === 'checkbox') {
    return (
      <FormItem label={action.title} required>
        <CheckboxGroup
          inline
          name={action.name}
          id={action.name}
          value={checked}
          onChange={(value, key) => updateChecked(value)}
          data-values={checked}
        >
          {_.map(action.options, (v, i) => {
            return (
              <Checkbox key={v} value={v}>
                {action.template[v]}
              </Checkbox>
            )
          })}
        </CheckboxGroup>
      </FormItem>
    )
  } else {
    return null
  }
}

export default ItemBase
