import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex } from '@gmfe/react'
import AfterSalesHeader from './header'
import AfterSalesDetailList from './detail_list'
import afterSalesStore from './store'
import { withBreadcrumbs } from '../../common/service'
import TableListTips from 'common/components/table_list_tips'

@withBreadcrumbs([i18next.t('商品异常')])
class AfterSales extends React.Component {
  componentDidMount() {
    afterSalesStore.fetchReason().then(() => {
      afterSalesStore.get(this.props.location.query.id)
    })
  }

  componentWillUnmount() {
    afterSalesStore.clear()
  }

  render() {
    return (
      <Flex flex={1} column className='b-order col-md-12'>
        <AfterSalesHeader query={this.props.location.query} />
        <TableListTips
          tips={[
            i18next.t('* 更多售后信息请前往 [信息平台-订单管理-订单异常]'),
          ]}
        />
        <AfterSalesDetailList />
      </Flex>
    )
  }
}

export default AfterSales
