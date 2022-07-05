import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { Table } from '@gmfe/table'

import { completedTaskListGet } from '../api'

const CompletedTaskList = ({ batch_num }) => {
  const [taskList, setTaskList] = useState([])

  useEffect(() => {
    completedTaskListGet({ batch_num: batch_num }).then((res) => {
      setTaskList(res)
    })
  }, [])

  return (
    <Table
      data={taskList}
      columns={[
        {
          Header: t('工艺名'),
          accessor: 'name',
        },
        {
          Header: t('操作人'),
          accessor: 'worker',
        },
        {
          Header: t('完成时间'),
          accessor: 'finish_time',
        },
      ]}
    />
  )
}

CompletedTaskList.propTypes = {
  batch_num: PropTypes.string,
}

export default CompletedTaskList
