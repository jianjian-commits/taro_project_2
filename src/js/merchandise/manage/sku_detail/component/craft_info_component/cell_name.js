import React, { useState } from 'react'
import { observer } from 'mobx-react'
import { Flex } from '@gmfe/react'
import { KCMoreSelect } from '@gmfe/keyboard'
import _ from 'lodash'
import skuStore from '../../sku_store'
import memoComponentWithDataHoc from './memo_hoc'
import PropTypes from 'prop-types'
import { TableXUtil } from '@gmfe/table-x'
import { t } from 'gm-i18n'
import Big from 'big.js'
import { remarkType } from '../../../../../common/filter'
const { TABLE_X } = TableXUtil

const CellName = observer((props) => {
  const { index, data } = props
  const { id, name } = data
  const [skuList, setSkuList] = useState([])

  let selectedSku = null
  if (id && name) {
    selectedSku = {
      value: id,
      text: name,
    }
  }

  const handleSelect = (selected) => {
    if (selected) {
      skuStore.changeIngredients(index, {
        ...selected,
        sale_proportion: parseFloat(
          Big(props.data.proportion || 0)
            .div(selected.ratio)
            .toFixed(2),
        ), // 选择物料后需要更新包装单位
        process_unit_name: '',
        supplier_id: '', // 切换物料时清空供应商
      })

      // 选择物料后需要获取该物料的出成率
      skuStore.fetchSkuPercentage([selected.id])
    } else {
      skuStore.clearIngredientByIndex(index)
    }
  }

  const handleSearch = (value) => {
    const { sku_id } = skuStore.skuDetail
    if (_.trim(value)) {
      return skuStore.getIngredientSkuList(sku_id, value).then((json) =>
        setSkuList(
          _.map(json.data, (d) => {
            return {
              label: `${d.category1_name}/${d.category2_name}`,
              children: _.map(d.ingredients, (v) => {
                return {
                  ...v,
                  value: v.id,
                  text: v.name,
                }
              }),
            }
          }),
        ),
      )
    }
  }

  const renderProductItem = (item) => (
    <Flex alignCenter>
      <div
        style={{
          backgroundColor: 'pink',
          borderRadius: '5px',
        }}
        className='gm-padding-lr-5 gm-margin-right-5'
      >
        {remarkType(item.remark_type)}
      </div>
      <div>{`${item.name}|${item.ratio}${item.std_unit_name}/${item.sale_unit_name}`}</div>
    </Flex>
  )

  return (
    <KCMoreSelect
      style={{
        width: TABLE_X.WIDTH_SEARCH,
      }}
      data={skuList}
      isGroupList
      selected={selectedSku}
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

CellName.propTypes = {
  index: PropTypes.number.isRequired,
  data: PropTypes.object,
}

export default memoComponentWithDataHoc(CellName)
