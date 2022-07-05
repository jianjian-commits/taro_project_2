import React from 'react'
import { observer } from 'mobx-react'
import memoComponentWithDataHoc from './plan_memo_component_with_data_hoc'
import PropTypes from 'prop-types'
import Big from 'big.js'
import _ from 'lodash'

const TextAreaCell = observer((props) => {
  const { data, field } = props

  const renderText = () => {
    const {
      sale_ratio,
      std_unit_name,
      sale_unit_name,
      suggest_plan_amount,
      sale_remain,
    } = data
    let showText = data[field]

    const isLigalData = !_.isNil(showText)

    if (field === 'sale_ratio') {
      showText = isLigalData
        ? sale_ratio + std_unit_name + '/' + sale_unit_name
        : '-'
    } else if (field === 'suggest_plan_amount') {
      showText = isLigalData ? suggest_plan_amount + sale_unit_name : '-'
    } else if (field === 'sale_remain') {
      const std_remain = Big(sale_remain || 0).times(sale_ratio || 0)
      showText = isLigalData
        ? sale_remain + sale_unit_name + '(' + std_remain + std_unit_name + ')'
        : '-'
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
