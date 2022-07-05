import { i18next } from 'gm-i18n'
import React from 'react'
import temListStore from './store'
import { observer } from 'mobx-react'
import TemList from '../../components/tem_list'
import globalStore from '../../../stores/global'

@observer
class PurchaseList extends React.Component {
  static editURL = '/system/setting/distribute_templete/purchase_editor'

  render() {
    const canEdit = globalStore.hasPermission('edit_purchase_print_template')
    const canDelete = globalStore.hasPermission(
      'delete_purchase_print_template'
    )
    const canCreate = globalStore.hasPermission(
      'create_purchase_print_template'
    )

    const props = {
      title: i18next.t('采购模板列表'),
      editURL: PurchaseList.editURL,
      canCreate,
      canEdit,
      canDelete,
      temListStore,
    }

    return <TemList {...props} />
  }
}

export default PurchaseList
