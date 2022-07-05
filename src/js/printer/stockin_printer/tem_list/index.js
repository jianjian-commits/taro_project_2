import { i18next } from 'gm-i18n'
import React from 'react'
import temListStore from './store'
import { observer } from 'mobx-react'
import TemList from '../../components/tem_list'
import globalStore from '../../../stores/global'

@observer
class StockInList extends React.Component {
  static editURL = '/system/setting/distribute_templete/stockin_editor'

  render() {
    const canEdit = globalStore.hasPermission('edit_in_stock_print_config')
    const canDelete = globalStore.hasPermission('delete_in_stock_print_config')
    const canCreate = globalStore.hasPermission('create_in_stock_print_config')

    const props = {
      title: i18next.t('入库模板列表'),
      editURL: StockInList.editURL,
      canCreate,
      canEdit,
      canDelete,
      setDefaultTemplate: false,
      temListStore,
    }

    return <TemList {...props} />
  }
}

export default StockInList
