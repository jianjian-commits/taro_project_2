import React, { useContext, useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { Request } from '@gm-common/request'

import { storeContext } from './details_component'
import { MoreSelect } from '@gmfe/react'
const SplitPlanSelect = () => {
  const [plans, setPlans] = useState([])
  const store = useContext(storeContext)
  const { splitPlan, viewType } = store

  useEffect(() => {
    if (viewType === 'create') {
      Request('/stock/split/plan/list')
        .data({ offset: 0, limit: 10000 })
        .get()
        .then(({ data }) => {
          setPlans(
            data
              .filter((item) => !item.has_deleted_spu)
              .map((item) => {
                const { name, id } = item
                return { ...item, value: id, text: name }
              })
          )
        })
    }
  }, [viewType])

  if (splitPlan) {
    return splitPlan.text
  }

  const handleSelect = (value) => {
    const { setSplitPlan } = store
    setSplitPlan(value)
  }

  return (
    <MoreSelect
      style={{ width: '100%' }}
      selected={splitPlan}
      data={plans}
      onSelect={handleSelect}
    />
  )
}

export default observer(SplitPlanSelect)
