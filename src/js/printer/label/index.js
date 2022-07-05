import { i18next } from 'gm-i18n'
import React from 'react'
import qs from 'query-string'
import temListStore from './store'
import { observer } from 'mobx-react'
import { history } from '../../common/service'
import globalStore from '../../stores/global'
import TemList from '../components/tem_list'

@observer
class LabelList extends React.Component {
  static editURL = '/system/setting/distribute_templete/label_editor'

  handleCustomerSetting = (item) => {
    history.push(
      `/system/setting/distribute_templete/label_setting?${qs.stringify({
        id: item.id,
      })}`
    )
  }

  render() {
    const canEdit = globalStore.hasPermission('edit_print_tag')
    const canDelete = globalStore.hasPermission('delete_print_tag')
    const canCreate = globalStore.hasPermission('add_print_tag')

    const props = {
      title: i18next.t('分拣标签模板列表'),
      editURL: LabelList.editURL,
      canEdit,
      canDelete,
      canCreate,
      handleCustomerSetting: this.handleCustomerSetting, // 商户设置
      temListStore,
    }

    return <TemList {...props} />
  }
}

export default LabelList
