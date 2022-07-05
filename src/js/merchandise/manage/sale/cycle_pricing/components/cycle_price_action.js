/**
 * @description 周期定价列表上方按钮
 */
import React from 'react'
import { observer } from 'mobx-react'
import { TableUtil } from '@gmfe/table'
import { Dialog } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import store from '../store'
import { reqTimeFormat } from '../utils'

function CyclePriceAction() {
  const { tableSelected, isAllPageSelect } = store

  // 批量删除
  function handleDelete() {
    Dialog.confirm({
      children: i18next.t('确定要删除所选规则吗？'),
      title: i18next.t('批量删除定价规则'),
    }).then(() => {
      let params = {
        rule_ids: tableSelected,
        all: isAllPageSelect ? 1 : 0,
      }
      // 删除所有项补充参数
      if (isAllPageSelect) {
        const { start_time, end_time } = store.cyclePriceFilter
        params = {
          ...params,
          ...store.cyclePriceFilter,
          start_time: start_time ? reqTimeFormat(start_time) : '',
          end_time: end_time ? reqTimeFormat(end_time) : '',
        }
      }
      store.deleteCyclePriceRule(params, true)
    })
  }

  return (
    <TableUtil.BatchActionBar
      onClose={() => store.clearSelect()}
      toggleSelectAll={() => store.setIsAllPageSelect(!isAllPageSelect)}
      batchActions={[
        {
          name: i18next.t('删除定价规则'),
          onClick: handleDelete,
          type: 'delete',
        },
      ]}
      count={isAllPageSelect ? null : tableSelected.length}
      isSelectAll={isAllPageSelect}
    />
  )
}

export default observer(CyclePriceAction)
