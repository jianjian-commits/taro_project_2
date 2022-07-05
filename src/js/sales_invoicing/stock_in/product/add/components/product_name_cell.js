import React, { useState } from 'react'
import { observer } from 'mobx-react'
import { Flex } from '@gmfe/react'
import { KCMoreSelect } from '@gmfe/keyboard'
import _ from 'lodash'
import { t } from 'gm-i18n'
import store from '../store'
import memoComponentWithDataHoc from './memo_component_with_data_hoc'
import PropTypes from 'prop-types'
import { TableXUtil } from '@gmfe/table-x'

const { TABLE_X } = TableXUtil

const ProductNameCell = observer((props) => {
  const { index, data } = props
  const { status } = store
  const { sku_id, sku_name, proc_order_custom_id } = data

  const [skuList, setSkuList] = useState([])

  const formatSkusData = (list) => {
    return _.map(list, (item) => {
      return {
        label: `${item.category_name_1}/${item.category_name_2}/${item.spu_name}`,
        children: _.map(item.skus, (o) => {
          return {
            ...o,
            value: o.id,
            text: `${o.name}(${o.id})`,
          }
        }),
      }
    })
  }

  const handleSelect = (selected) => {
    store.changeProductNameSelected(index, selected)

    setSkuList([])
  }

  const handleSearch = (value) => {
    if (_.trim(value)) {
      return store.fetchSkuList(value).then((json) => {
        setSkuList(formatSkusData(json.data))
      })
    }
  }

  let selected = null

  if (sku_id && sku_name) {
    selected = {
      value: sku_id,
      text: sku_name,
    }
  }

  return (
    <Flex row alignCenter>
      {status === 'detail' ? (
        sku_name
      ) : (
        <KCMoreSelect
          style={{
            width: TABLE_X.WIDTH_SEARCH,
          }}
          data={skuList}
          isGroupList
          selected={selected}
          onSelect={handleSelect}
          onSearch={handleSearch}
          placeholder={t('请输入商品名搜索')}
          // renderListItem={renderProductItem}
          renderListFilter={(data) => data}
          disabled={!!proc_order_custom_id}
        />
      )}
    </Flex>
  )
})

ProductNameCell.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(ProductNameCell)
