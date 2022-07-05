import { i18next } from 'gm-i18n'
import React, { Component } from 'react'
import { Request } from '@gm-common/request'
import PropTypes from 'prop-types'
import { FilterSelect } from '@gmfe/react'
import { transformSkuSelectedList } from '../util'
import { System } from '../../../../common/service'

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
    const { salemenu_id, price_rule, refPriceTypeFlag, uploadList } = this.props

    Request('/product/sku_salemenu/list')
      .data({ salemenu_id, text: search_text, is_retail_interface: System.isC() ? 1 : null })
      .get()
      .then((json) => {
        const list = transformSkuSelectedList(
          json.data,
          price_rule,
          refPriceTypeFlag,
          uploadList
        )
        !this.__isUnmount && this.setState({ list })
      })
  }

  render() {
    const { index, selected } = this.props
    // return <MoreSelect
    //   index={'__more_selector' + index}
    //   data={this.state.list}
    //   selected={selected}
    //   onSelect={this.handleSelect}
    //   onSearch={this.handleSearch}
    //   placeholder={i18next.t('搜索商品')}
    // />
    return (
      <FilterSelect
        id={'__more_selector' + index}
        list={this.state.list}
        selected={selected}
        onSelect={this.handleSelect}
        onSearch={this.handleSearch}
        placeholder={i18next.t('搜索商品')}
      />
    )
  }
}

SkuSearch.propTypes = {
  index: PropTypes.number.isRequired,
  salemenu_id: PropTypes.string,
  price_rule: PropTypes.object,
  uploadList: PropTypes.array,
  refPriceTypeFlag: PropTypes.string,
  selected: PropTypes.any,
  onSelect: PropTypes.func.isRequired,
}

export default SkuSearch
