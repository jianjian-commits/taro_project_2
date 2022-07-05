import { i18next } from 'gm-i18n'
import React from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { Select, Option } from '@gmfe/react'
import { observer } from 'mobx-react'
import { keyMap } from '../util'

const Name = observer(
  ({ original: { name, system_key, required }, systemKeys, onChange }) => {
    const keys = _.map(keyMap, (item, key) => {
      return { value: key, text: item }
    })
    return (
      <Select value={system_key} onChange={onChange} style={{ minWidth: 120 }}>
        {_.map(
          [
            {
              value: null,
              text: i18next.t('选择名称'),
            },
            ..._.filter(
              keys,
              (item) =>
                !systemKeys.includes(item.value) || system_key === item.value,
            ),
          ],
          (item) => (
            <Option key={item.value} value={item.value}>
              {item.text}
            </Option>
          ),
        )}
      </Select>
    )
  },
)

Name.propTypes = {
  original: PropTypes.object,
  onChange: PropTypes.func,
  relationships: PropTypes.array,
}

export default Name
