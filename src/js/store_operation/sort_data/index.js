/*
 * @Description: 分拣资料tab
 */
import React from 'react'
import { t } from 'gm-i18n'
import { FullTabV2 } from '@gmfe/frame'

import Sorter from './sorter'
import SortSetting from './sort_setting'

import globalStore from 'stores/global'

function SortData(props) {
  // 查看分拣员权限
  const seeSorterInfo = globalStore.hasPermission('view_sorter_info')
  // 查看分拣方式
  const seeDispatchMethod = globalStore.hasPermission('get_dispatch_method')

  const tabs = [
    seeSorterInfo && {
      name: t('分拣员'),
      key: 'sorter',
      content: <Sorter />,
    },
    seeDispatchMethod && {
      name: '分拣方式',
      key: 'sortWay',
      content: <SortSetting {...props} />,
    },
  ].filter(Boolean)

  return <FullTabV2 tabs={tabs} />
}

export default SortData
