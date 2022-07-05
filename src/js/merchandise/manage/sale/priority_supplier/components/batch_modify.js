import React from 'react'
import { i18next } from 'gm-i18n'
import _ from 'lodash'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import { FilterSelect } from '@gmfe/react'
import store from '../store'
import { toJS } from 'mobx'

@observer
class Component extends React.Component {
  componentDidMount() {
    store.getSuppliers()
  }

  componentWillUnmount() {
    store.clearSuppliers()
  }

  handleWithFilter = (list, query) => {
    return _.filter(list, (v) => {
      return v.name.indexOf(query) > -1
    })
  }

  handleSelect = (selected) => {
    store.setSupplier(selected)
  }

  render() {
    let {
      suppliers: { list, selected },
    } = store
    if (this.props.cancel) {
      list = toJS(list)
      list.unshift({ name: i18next.t('取消优先供应商') })
    }
    const { statistics } = this.props
    return (
      <div>
        <p>
          {i18next.t('set_priority_supplier', {
            VAR1: statistics.address_num,
            VAR2: statistics.sku_num,
          })}
        </p>
        <p className='gm-text-desc'>
          {i18next.t('请确保供应商供应对应的商品，否则可能分配失败')}
        </p>
        <div className='gm-inline-block' style={{ width: '150px' }}>
          <FilterSelect
            id='supplier'
            list={list}
            selected={selected}
            withFilter={this.handleWithFilter}
            onSelect={this.handleSelect}
            placeholder={i18next.t('选择供应商')}
          />
        </div>
      </div>
    )
  }
}

Component.propTypes = {
  /** 显示取消优先供应商 */
  cancel: PropTypes.bool,
  statistics: PropTypes.object,
}

export default Component
