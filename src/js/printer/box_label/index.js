import React from 'react'
import TemList from '../components/tem_list'
import temListStore from './store'
import { i18next } from 'gm-i18n'
import qs from 'query-string'
import { observer } from 'mobx-react'
import { history } from '../../common/service'
import globalStore from '../../stores/global'

const BoxLabel = observer(() => {
  const editURL = '/system/setting/distribute_templete/box_label_editor'

  const handleCustomerSetting = (item) => {
    history.push(
      `/system/setting/distribute_templete/box_label_setting?${qs.stringify({
        id: item.id,
      })}`
    )
  }

  const canCreate = globalStore.hasPermission('add_box_template')
  const canEdit = globalStore.hasPermission('edit_box_template')
  const canDelete = globalStore.hasPermission('delete_box_template')

  const props = {
    title: i18next.t('装箱标签模板列表'),
    canEdit,
    canDelete,
    canCreate,
    editURL,
    handleCustomerSetting: handleCustomerSetting, // 商户设置
    temListStore,
  }

  return <TemList {...props} />
})

export default BoxLabel
