import React from 'react'
import { observer } from 'mobx-react'
import { Flex } from '@gmfe/react'
import { KCInputNumberV2 } from '@gmfe/keyboard'
import { TableUtil } from '@gmfe/table'
import { t } from 'gm-i18n'
import store from '../store'
import planMemoComponentWithDataHoc from './plan_memo_component_with_data_hoc'
import ValidateCom from 'common/components/validate_com'

const { referOfWidth } = TableUtil
const PlanAmountCell = observer((props) => {
  const { data, index } = props
  const { plan_amount, sale_unit_name, emptyError, zeroPlanAmountError } = data
  const { startCheck } = store

  const handleNumberChange = (value) => {
    store.changeProcessPlanListItem(index, { plan_amount: value })
  }

  let errorTip
  // 只显示一个error tip
  if (emptyError.plan_amount) {
    errorTip = t('请填写计划生产数')
  } else if (zeroPlanAmountError) {
    errorTip = t('计划生产数不能为0')
  }

  return (
    <Flex alignCenter>
      <ValidateCom
        warningText={errorTip}
        isInvalid={
          startCheck && (emptyError.plan_amount || zeroPlanAmountError)
        }
      >
        <KCInputNumberV2
          value={plan_amount}
          onChange={handleNumberChange}
          min={0}
          max={10000000}
          className='form-control input-sm'
          style={{ width: referOfWidth.numberInputBox }}
        />
      </ValidateCom>
      <span className='gm-padding-5'>{sale_unit_name || '-'}</span>
    </Flex>
  )
})

export default planMemoComponentWithDataHoc(PlanAmountCell)
