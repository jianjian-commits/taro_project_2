import React, { useState } from 'react'
import { observer } from 'mobx-react'
import { KCMoreSelect } from '@gmfe/keyboard'
import _ from 'lodash'
import { t } from 'gm-i18n'
import store from '../goods_store'
import memoComponentWithDataHoc from '../memo_component_with_data_hoc'
import PropTypes from 'prop-types'

const ProductNameCell = observer((props) => {
  const { index, data } = props
  const { id, name } = data
  const [skuList, setSkuList] = useState([{ label: '', children: [] }])

  const handleSelect = (selected) => {
    store.setSkusListItem(index, selected)
  }

  const handleSearch = async (value) => {
    let res = null
    if (value.length > 0) {
      res = await store.getSearchSku(_.toString(value))
    }

    // 获取已添加的数据id
    const id_list = _.map(store.skus.slice(), (item) => item.id)

    // 根据二级分类
    const list = {}
    _.forEach(res.data, (item, key) => {
      const arr = list[item.category_2_name] || []
      // 过滤已添加的数据
      if (!_.includes(id_list, item.sku_id)) {
        list[item.category_2_name] = _.concat(arr, {
          ...item,
          id: item.sku_id,
          value: item.sku_id,
          name: item.sku_name,
          text: `${item.sku_id} ${item.sku_name}`,
        })
      }
    })

    setSkuList(
      _.map(list, (item, name) => ({
        label: name,
        children: item,
      })),
    )
  }

  let selected = null
  if (id && name) {
    selected = {
      value: id,
      text: name,
    }
  }

  const renderProductItem = (item) => {
    return (
      <div>
        <span style={{ color: '#798294' }}>{item.id} </span>
        {item.name}
        <span className='gm-text-desc'>{`(${item.salemenu_name})`}</span>
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
})

ProductNameCell.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(ProductNameCell)
