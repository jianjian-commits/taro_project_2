import React from 'react'
import commonStore from '../store'
import { observer } from 'mobx-react'
import { Select, Option } from '@gmfe/react'
import _ from 'lodash'
import PropTypes from 'prop-types'

@observer
class UnitSelect extends React.Component {
  render() {
    const { materialUnitNameList } = commonStore
    const { onSelect, selected } = this.props

    return (
      <Select value={selected} onChange={onSelect}>
        {_.map(materialUnitNameList, ({ text, value }) => {
          return (
            <Option key={value} value={value}>
              {text}
            </Option>
          )
        })}
      </Select>
    )
  }
}

UnitSelect.propTypes = {
  onSelect: PropTypes.func,
  selected: PropTypes.any,
}

export default UnitSelect
