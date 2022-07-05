import { t } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'

import Header from '../../list/components/detail_header'
import List from './list'
import { withBreadcrumbs } from 'common/service'

import store from '../store'

@withBreadcrumbs([t('订单售后')])
@observer
class SkusAfterSales extends React.Component {
  componentDidMount() {
    store.get(this.props.location.query.id)
  }

  render() {
    const { orderDetail } = store
    return (
      <>
        <Header
          orderDetail={orderDetail}
          query={this.props.location.query}
          isDetail={false}
        />
        <List />
      </>
    )
  }
}

export default SkusAfterSales
