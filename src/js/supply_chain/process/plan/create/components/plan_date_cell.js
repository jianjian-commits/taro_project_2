import React from 'react'
import { observer } from 'mobx-react'
import { KCDatePicker } from '@gmfe/keyboard'
import store from '../store'
import moment from 'moment'
import planMemoComponentWithDataHoc from './plan_memo_component_with_data_hoc'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import styled from 'styled-components'
import ValidateCom from 'common/components/validate_com'

const DateStyled = styled(KCDatePicker)`
  width: 120px;
`

const PlanDateCell = observer((props) => {
  const { index, data, field } = props
  const { plan_finish_time, plan_start_time, emptyError } = data
  const { startCheck } = store

  const handleChangeDateTime = (value) => {
    const changeData = {}
    changeData[field] = value ? moment(value).format('YYYY-MM-DD') : value

    store.changeProcessPlanListItem(index, changeData)
  }

  const value = data[field]
  // 完成时间才有最小值
  const minValue = field === 'plan_finish_time' ? plan_start_time : undefined
  // 开始时间才有最大值
  const maxValue = field === 'plan_start_time' ? plan_finish_time : undefined
  const errorTip =
    t('请选择') +
    (field === 'plan_finish_time' ? t('计划完成时间') : t('计划开始时间'))
  return (
    <ValidateCom
      warningText={errorTip}
      isInvalid={startCheck && emptyError[field]}
    >
      <DateStyled
        date={value ? moment(value) : null}
        onChange={handleChangeDateTime}
        placeholder={t('请选择日期')}
        min={minValue ? moment(minValue) : null}
        max={maxValue ? moment(maxValue) : null}
      />
    </ValidateCom>
  )
})

PlanDateCell.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  field: PropTypes.string.isRequired,
}

export default planMemoComponentWithDataHoc(PlanDateCell)
