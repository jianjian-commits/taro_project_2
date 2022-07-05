import React, { useEffect } from 'react'
import { BoxPanel, Button } from '@gmfe/react'
import { t } from 'gm-i18n'
import PlanEditTable from './components/edit_table'
import { observer } from 'mobx-react'
import store from './store'
import OperationButton from './components/operation_button'
import { WithBreadCrumbs } from 'common/service'

const ProcessPlanCreate = observer((props) => {
  const { processPlanList } = store
  useEffect(() => {
    if (props.location.query.taskId) {
      store.fetchErrorProcessPlanList({ task_id: props.location.query.taskId })
    }
  }, [])

  return (
    <>
      <WithBreadCrumbs breadcrumbs={[t('新建计划')]} />
      <BoxPanel
        collapse
        title={t('预生产计划列表')}
        summary={[{ text: t('合计'), value: processPlanList.length }]}
        right={
          <Button
            type='primary'
            onClick={() => {
              window.location.href =
                '#/supply_chain/process/plan/create/recommend_setting'
            }}
          >
            {t('智能推荐')}
          </Button>
        }
      >
        <PlanEditTable />
        <OperationButton />
      </BoxPanel>
    </>
  )
})

export default ProcessPlanCreate
