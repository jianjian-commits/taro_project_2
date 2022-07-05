import { i18next } from 'gm-i18n'
import React from 'react'
import temListStore from './store'
import { observer } from 'mobx-react'
import TemList from '../../components/tem_list'
import globalStore from '../../../stores/global'

@observer
class PreSortList extends React.Component {
  static editURL = '/system/setting/distribute_templete/pre_sort_editor'

  render() {
    const canEdit = globalStore.hasPermission('edit_pre_sort_template')
    const canDelete = globalStore.hasPermission('delete_pre_sort_template')
    const canCreate = globalStore.hasPermission('create_pre_sort_template')

    const props = {
      title: i18next.t('预分拣模板列表'),
      editURL: PreSortList.editURL,
      canCreate,
      canEdit,
      canDelete,
      setDefaultTemplate: true,
      temListStore,
    }

    return <TemList {...props} />
  }
}

export default PreSortList
