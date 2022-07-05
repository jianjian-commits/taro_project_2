import React from 'react'
import { observer } from 'mobx-react'
import boxManageStore from './box_manage_store'
import BoxManageTableList from './components/box_manage_table_list'
import BoxManageListFilter from './components/filter'
import { Provider } from 'mobx-react'
import { TplStore } from 'common/components/tpl'
import ACTION_STORAGE_KEY_NAMES from 'common/action_storage_key_names'

@observer
class BoxManage extends React.Component {
  tplStore = TplStore(ACTION_STORAGE_KEY_NAMES.TPL_BOX_MANAGE)

  componentDidMount() {
    boxManageStore.getRouteList()
    boxManageStore.getDriverList()
  }

  render() {
    return (
      <Provider tplStore={this.tplStore}>
        <BoxManageListFilter />
        <BoxManageTableList />
      </Provider>
    )
  }
}

export default BoxManage
