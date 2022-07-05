import React from 'react'
import { observer } from 'mobx-react'
import Header from './header'
import EditTable from './edit_table'
import store from './store'

@observer
class Create extends React.Component {
  componentDidMount() {
    store.getSupplyList()
  }

  componentWillUnmount() {
    store.clear()
  }

  render() {
    const {
      billDetail: { settle_supplier_id },
    } = store
    return (
      <div>
        <Header />
        {!!settle_supplier_id && <EditTable />}
      </div>
    )
  }
}

export default Create
