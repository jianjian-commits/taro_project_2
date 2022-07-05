import React from 'react'
import { i18next } from 'gm-i18n'
import { FilterSearchSelect } from '@gmfe/react-deprecated'
import store from './store'
import { pinYinFilter } from '@gm-common/tool'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'

@observer
class SupplierSelector extends React.Component {
  componentDidMount() {
    store.init()
  }

  render() {
    const { list } = store
    const { id, selected, onSelect } = this.props
    const key = '__supplierSelector' + id + (selected ? selected.id : '')
    return (
      <FilterSearchSelect
        key={key}
        list={list.slice()}
        selected={selected}
        onSelect={onSelect}
        onFilter={(list, query) =>
          pinYinFilter(list, query, (item) => item.name)
        }
        placeholder={i18next.t('全部供应商')}
      />
    )
  }
}

SupplierSelector.propTypes = {
  id: PropTypes.string.isRequired,
  selected: PropTypes.any,
  onSelect: PropTypes.func.isRequired,
}

export default SupplierSelector
