import React, { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { t } from 'gm-i18n'
import { setTitle } from 'gm-util'
import { observer } from 'mobx-react'

import store from './store'

import TotalSalaryTable from './components/total_salary_table'
import TotalSalaryAndDetailTable from './components/total_salary_and_detail_table'

function Print() {
  const {
    query,
    query: { type },
  } = useLocation()

  const { salaries } = store

  const salariesJS = salaries.slice()

  const hasPrintRef = useRef(false)

  useEffect(() => {
    store.getDetails({
      ...query,
      user_ids: query.user_ids?.split(',').map(Number),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (salariesJS.length && !hasPrintRef.current) {
      setTitle(t(type === '1' ? '绩效工资总表' : '绩效工资总表及明细表'))
      window.print()
      hasPrintRef.current = true
    }
  }, [salariesJS.length, type])

  const C = type === '1' ? TotalSalaryTable : TotalSalaryAndDetailTable

  return <C salaries={salariesJS} />
}

export default observer(Print)
