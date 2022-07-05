import React, { useState } from 'react'
import { KCMoreSelect } from '@gmfe/keyboard'
import _ from 'lodash'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'

const ProductNameCell = ({ index, data, onSelect, onRequest, disabled }) => {
  const { id, sku_name } = data
  const [skuList, setSkuList] = useState([{ label: '', children: [] }])

  const handleSelect = (selected) => {
    onSelect(selected, index)
  }

  const handleSearch = async (value) => {
    let list = null
    if (value.length > 0) {
      list = await onRequest(value)
    }

    setSkuList(
      _.map(list, (item, name) => ({
        label: name,
        children: item,
      })),
    )
  }

  let selected = null
  if (id && sku_name) {
    selected = {
      value: id,
      text: sku_name,
    }
  }

  const renderProductItem = (item) => {
    return (
      <div>
        <span style={{ color: '#798294' }}>{item.id} </span>
        {item.sku_name}
      </div>
    )
  }

  return (
    <KCMoreSelect
      style={{
        width: 300,
      }}
      isGroupList
      data={skuList}
      disabled={disabled}
      selected={selected}
      onSelect={handleSelect}
      onSearch={handleSearch}
      placeholder={t('请输入商品名搜索')}
      renderListItem={renderProductItem}
      renderListFilter={(data) => {
        return data
      }}
    />
  )
}

ProductNameCell.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
  onSelect: PropTypes.func,
  onRequest: PropTypes.func,
}

export default ProductNameCell
