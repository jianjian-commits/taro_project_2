import React from 'react'
import { observer } from 'mobx-react'
import memoComponentWithDataHoc from './memo_component_with_data_hoc'
import PropTypes from 'prop-types'
import _ from 'lodash'

const TextAreaCell = observer((props) => {
  const { data, field } = props

  const renderText = () => {
    const {
      sale_ratio,
      std_unit_name,
      sale_unit_name,
      sale_remain,
      sku_name,
      sku_id,
      category1_name,
      category2_name,
      pinlei_name,
    } = data

    let showText

    if (field === 'product') {
      // 商品
      const isLigalData = !_.isNil(sku_name)
      showText = isLigalData ? (
        <>
          {sku_name} <br /> {sku_id}
        </>
      ) : (
        '-'
      )
    } else if (field === 'category') {
      // 分类
      const isLigalData = !_.isNil(category1_name)

      showText = isLigalData
        ? `${category1_name}/${category2_name}/${pinlei_name}`
        : '-'
    } else if (field === 'sale_ratio') {
      // 销售规格
      const isLigalData = !_.isNil(sale_ratio)

      showText = isLigalData
        ? `${sale_ratio}${std_unit_name}/${sale_unit_name}`
        : '-'
    } else if (field === 'sale_remain') {
      // 成品库存数
      const isLigalData = !_.isNil(sale_remain)

      showText = isLigalData ? sale_remain + sale_unit_name : '-'
    }

    return showText
  }

  return <span>{renderText()}</span>
})

TextAreaCell.propTypes = {
  data: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
}

export default memoComponentWithDataHoc(TextAreaCell)
