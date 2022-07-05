import React, { useState } from 'react'
import { observer } from 'mobx-react'
import { KCMoreSelect } from '@gmfe/keyboard'
import { TableUtil } from '@gmfe/table'
import { formatProductSelectList } from '../util'
import _ from 'lodash'
import store from '../store'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import planMemoComponentWithDataHoc from './plan_memo_component_with_data_hoc'
import { Flex, Tip } from '@gmfe/react'
import MaterialDetail from './material_detail'
import ValidateCom from 'common/components/validate_com'

const { referOfWidth } = TableUtil

const ProductNameCell = observer((props) => {
  const { data, index } = props
  const { sku_id, sku_name, emptyError } = data
  const { startCheck } = store
  const [skuList, setSkuList] = useState([])

  const hasSameSelected = (selected) => {
    const { processPlanList } = store

    return (
      _.filter(processPlanList, (item) => {
        return item.sku_id === selected.id
      }).length > 0
    )
  }

  const handleSelect = (selected) => {
    // 若已存在则提示
    if (selected && hasSameSelected(selected)) {
      Tip.info(t('所选商品已存在'))
    } else {
      store.changeProductNameSelect(index, selected)
    }
  }

  const handleSearch = (value) => {
    if (_.trim(value)) {
      return store
        .fetchSkuList({ q: value })
        .then((json) =>
          setSkuList(
            formatProductSelectList(
              store.getFilterExistProduct(json.data, sku_id)
            )
          )
        )
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
    <Flex alignCenter>
      <ValidateCom
        warningText={t('请选择成品')}
        isInvalid={startCheck && emptyError.sku_id}
      >
        <KCMoreSelect
          style={{ width: referOfWidth.searchBox }}
          data={skuList}
          selected={selected}
          onSelect={handleSelect}
          onSearch={handleSearch}
          placeholder={t('请输入商品名搜索')}
          renderListFilter={(data) => {
            return data
          }}
        />
      </ValidateCom>
      <MaterialDetail index={index} data={data} />
    </Flex>
  )
})

ProductNameCell.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default planMemoComponentWithDataHoc(ProductNameCell)
