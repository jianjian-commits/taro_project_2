import { i18next, t } from 'gm-i18n'
import React from 'react'
import temListStore from './store'
import { observer } from 'mobx-react'
import TemList from '../../components/tem_list'
import globalStore from '../../../stores/global'

@observer
class SalemenusList extends React.Component {
  static editURL = '/system/setting/distribute_templete/salemenus_editor'

  render() {
    const canEdit = globalStore.hasPermission('edit_salemenu_templates')
    const canDelete = globalStore.hasPermission('delete_salemenu_templates')
    const canCreate = globalStore.hasPermission('add_salemenu_templates')

    const props = {
      title: i18next.t('报价单模板列表'),
      editURL: SalemenusList.editURL,
      canCreate,
      canEdit,
      canDelete,
      setDefaultTemplate: false,
      temListStore,
      deleteConfirmText: t('是否确定删除?'),
    }

    return <TemList {...props} />
  }
}

export default SalemenusList
