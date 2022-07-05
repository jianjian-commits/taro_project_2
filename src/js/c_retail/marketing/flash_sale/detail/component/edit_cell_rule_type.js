import React from 'react'
import { observer } from 'mobx-react'
import store from '../store'
import Big from 'big.js'
import memoComponentWithDataHoc from './memo_hoc'
import PropTypes from 'prop-types'
import { RULE_TYPE } from '../../../../../common/enum'
import SelectInputEdit from '../../../../../marketing/manage/price_rule/components/select_input_edit'
import { legitimate } from '../../util'
import { Price } from '@gmfe/react'

const EditCellRule = observer(props => {
  const { index, data } = props
  const {
    sku_id,
    yx_price,
    rule_type,
    sale_price,
    fee_type,
    sale_unit_name
  } = data
  if (!sku_id) return '-'

  const isWarning = Big(sale_price || 0)
    .plus(legitimate(yx_price))
    .lt(0)
  const suffixText = Price.getUnit(fee_type) + '/' + sale_unit_name

  const handleRuleTypeChange = (rule_type, index, yx_price) => {
    store.changeListItem(index, { rule_type })
    // 由于乘的时候是4位小数，固定和加都只是两位小数，所以切换计算规则类型时，yx_price都统一为两位小数
    store.changeListItem(index, { yx_price: Big(yx_price || 0).toFixed(2) })
  }

  const handleYxPriceChange = (yx_price, index) => {
    store.changeListItem(index, { yx_price })
  }
  let precision = yx_price.split('.')[1]
  precision = precision === undefined ? 0 : precision.length

  return (
    <SelectInputEdit
      isWarning={isWarning}
      id={index}
      selected={rule_type}
      inputValue={precision === 4 ? Big(yx_price).toFixed(2) : yx_price}
      options={RULE_TYPE}
      onSelect={rule_type => handleRuleTypeChange(rule_type, index, yx_price)}
      onInputChange={yx_price => handleYxPriceChange(yx_price, index)}
      suffixText={suffixText}
    />
  )
})

EditCellRule.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired
}

export default memoComponentWithDataHoc(EditCellRule)
