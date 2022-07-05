import { t } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import store from './store'
import globalStore from 'stores/global'
import Filter from './filter'
import List from './list'

@observer
class StockSetting extends React.Component {
  componentDidMount() {
    globalStore.setBreadcrumbs([t('库存设置')])
    store.getStockSettingList(store.searchData, this.props.location.query.id)
  }

  componentWillUnmount() {
    globalStore.setBreadcrumbs([])
  }

  render() {
    return (
      <React.Fragment>
        <Filter {...this.props.location} />
        <List {...this.props.location} />
      </React.Fragment>
    )
  }
}

export default StockSetting
