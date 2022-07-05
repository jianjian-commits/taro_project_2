import React, { useEffect } from 'react'
import { BoxPanel } from '@gmfe/react'
import { t } from 'gm-i18n'
import PlanEditTable from './components/edit_table'
import { observer } from 'mobx-react'
import store from './store'
import OperationButton from './components/operation_button'

const ErrorList = observer((props) => {
  useEffect(() => {
    if (props.location.query.task_id) {
      store.fetchErrorProcessPlanList({ task_id: props.location.query.task_id })
    }
    store.changeStartCheck(true) // 错误列表直接展示错误
  }, [props.location.query.task_id])

  return (
    <BoxPanel title={t('预生产计划错误列表')}>
      <PlanEditTable />
      <OperationButton />
    </BoxPanel>
  )
})

export default ErrorList
