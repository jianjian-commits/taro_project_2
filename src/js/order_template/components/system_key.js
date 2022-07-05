import { i18next } from 'gm-i18n'
import React from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { Select, Option } from '@gmfe/react'
import { observer } from 'mobx-react'
import globalStore from 'stores/global'

import { keysFun } from '../util'

const Name = observer(
  ({
    type,
    original: { name, system_key, required },
    systemKeys,
    onChange,
  }) => {
    const customizedConfigs = globalStore.customizedDetailConfigs
      .filter((v) => v.is_active)
      .map((v) => ({ value: v.id, text: v.field_name }))
    const keys = [...keysFun(type), ...customizedConfigs]

    return (
      <Select value={system_key} onChange={onChange} style={{ minWidth: 90 }}>
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
