import React from 'react'
import commonStore from '../store'
import { observer } from 'mobx-react'
import { Cascader } from '@gmfe/react'
import { toJS } from 'mobx'
@observer
class DriverSelect extends React.Component {
  render() {
    const { driverList } = commonStore
    const { onSelect, selected } = this.props
    return (
      <Cascader
        filtrable
        onlyChildSelectable
        data={toJS(driverList)}
        onChange={onSelect}
        value={toJS(selected)}
        valueRender={(value) => {
          let text =
            value && value.length > 0 ? value[value.length - 1].name : ''
          return text
        }}
      />
    )
  }
}

export default DriverSelect
