import React from 'react'
import { observer } from 'mobx-react'
import globalStore from 'stores/global'
import Filter from './component/filter'
import List from './list'
import InitSaleCheck from '../../../../guides/init/guide/init_sale_check'
import store from './store'
import manageStore from '../../store'

@observer
class SaleList extends React.Component {
  componentDidMount() {
    const { name } = this.props.location.query
    globalStore.setBreadcrumbs([name])
    manageStore.fetchProcessLabelList()
  }

  componentWillUnmount() {
    globalStore.setBreadcrumbs([])
  }

  render() {
    return (
      <>
        <Filter {...this.props.location} />
        <List {...this.props} />
        <InitSaleCheck ready={store.list.length > 0} />
      </>
    )
  }
}

export default SaleList
