import React from 'react'
import { observer } from 'mobx-react'
import store from '../../store'
import { Flex, InputNumberV2 } from '@gmfe/react'
import { TableUtil } from '@gmfe/table'
import memoComponentWithDataHoc from './memo_component_with_data_hoc'

const { referOfWidth } = TableUtil

const SuggestPlanAmountCell = observer((props) => {
  const { data, index } = props
  const { suggest_plan_amount, sale_unit_name } = data

  const handleNumberChange = (value) => {
    store.changeRecommendListItem(index, {
      plan_amount: value,
      suggest_plan_amount: value,
    })
  }

  return (
    <Flex alignCenter>
      <InputNumberV2
        value={suggest_plan_amount}
        onChange={handleNumberChange}
        min={0}
        percision={2}
        className='form-control input-sm'
        style={{ width: referOfWidth.numberInputBox }}
      />
      <span className='gm-padding-5'>{sale_unit_name || '-'}</span>
    </Flex>
  )
})

export default memoComponentWithDataHoc(SuggestPlanAmountCell)
