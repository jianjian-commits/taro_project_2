import store from './store'
import { RightSideModal, Tip } from '@gmfe/react'
import TaskList from '../../../task/task_list'
import React from 'react'
import { i18next } from 'gm-i18n'

class Utils {
  handleSearch = () => {
    // doFirstRequest有paginationBox提供
    store.doFirstRequest()
  }

  handleSelect = (val) => {
    store.setFilterChangeType(val)
  }

  handleChangeText = (e, q_type) => {
    const text = e.target.value
    store.setFilterQ(text, q_type)
  }

  handleChangeRangePick = (begin, end) => {
    store.setFilterTime(begin, end)
  }

  handleExport = () => {
    store.asyncExportExcel().then(() => {
      Tip.success(i18next.t('正在异步导出报表...'))
      RightSideModal.render({
        children: <TaskList />,
        onHide: RightSideModal.hide,
        style: {
          width: '300px',
        },
      })
    })
  }
}

export const utils = new Utils()
