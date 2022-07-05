import React, { Component } from 'react'
import { FilterSelect } from '@gmfe/react'
import { Request } from '@gm-common/request'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import { i18next } from 'gm-i18n'

@inject('store')
@observer
class SkuSearch extends Component {
  state = {
    list: [],
  }

  __isUnmount = false
  componentWillUnmount() {
    this.__isUnmount = true
  }

  handleSelect = (obj) => {
    const { onSelect } = this.props
    onSelect(obj)
  }

  handleSearch = (search_text) => {
    const { address_id, time_config_id } = this.props.store.orderData
    const _this = this
    const req = {
      address_id,
      time_config_id,
      offset: 0,
      limit: 10,
      search_text,
      fetch_category: 1,
      active: 1,
      usual_type: 2,
    }

    Request('/station/skus/addr')
      .data(req)
      .get()
      .then((json) => {
        const list = json.data
        !_this.__isUnmount && _this.setState({ list })
      })
  }

  render() {
    return (
      <FilterSelect
        id={'search_sku' + this.props.id}
        list={this.state.list}
        selected={this.props.selected}
        onSelect={this.handleSelect}
        onSearch={this.handleSearch}
        placeholder={i18next.t('搜索商品')}
      />
    )
  }
}

SkuSearch.propTypes = {
  id: PropTypes.string.isRequired,
  selected: PropTypes.any,
  onSelect: PropTypes.func.isRequired,
}

export default SkuSearch
