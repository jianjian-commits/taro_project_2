import React from 'react'
import { MoreSelect } from '@gmfe/react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import globalStore from 'stores/global'

const UnitSearchSelector = (props) => {
  const handleSelect = (obj) => {
    obj && props.onSelect(obj.value)
  }

  const unitNameList = _.map(globalStore.unitName, (v) => ({
    value: v.id,
    text: v.name,
  }))

  return (
    <MoreSelect
      data={unitNameList}
      selected={_.find(unitNameList, (v) => v.value === props.selected)}
      onSelect={handleSelect}
      renderListFilterType='pinyin'
    />
  )
}

UnitSearchSelector.propTypes = {
  selected: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
}

export default observer(UnitSearchSelector)
