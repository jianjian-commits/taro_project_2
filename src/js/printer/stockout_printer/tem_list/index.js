import { i18next } from 'gm-i18n'
import React from 'react'
import temListStore from './store'
import { observer } from 'mobx-react'
import TemList from '../../components/tem_list'
import globalStore from '../../../stores/global'

@observer
class StockOutList extends React.Component {
  static editURL = '/system/setting/distribute_templete/stockout_editor'

  render() {
    const canEdit = globalStore.hasPermission('edit_out_stock_print_config')
    const canDelete = globalStore.hasPermission('delete_out_stock_print_config')
    const canCreate = globalStore.hasPermission('create_out_stock_print_config')

    const props = {
      title: i18next.t('出库模板列表'),
      editURL: StockOutList.editURL,
      canCreate,
      canEdit,
      canDelete,
      setDefaultTemplate: false,
      temListStore,
    }

    return <TemList {...props} />
  }
}

export default StockOutList
