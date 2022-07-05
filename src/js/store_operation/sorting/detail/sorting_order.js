import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { BoxTable, Tip, RightSideModal, Button } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import Big from 'big.js'
import moment from 'moment'
import { Request } from '@gm-common/request'

import SortingOrderFilter from './sorting_order_filter'
import TaskList from '../../../task/task_list'
import TableTotalText from '../../../common/components/table_total_text'
import SortingOrderExpandTable from './sorting_order_expand_table'

import orderStore from './order_store'
import store from '../store'
import { getOrderTypeId } from '../../../common/deal_order_process'

@observer
class SortingOrder extends React.Component {
  constructor(props) {
    super(props)
    orderStore.init()
  }

  async componentDidMount() {
    await store.getServiceTime().then((serviceTime) => {
      // 设置搜索条件的值为第一个运营周期
      const time_config_id = (serviceTime[0] && serviceTime[0]._id) || ''
      orderStore.setFilter('time_config_id', time_config_id)
    })
    orderStore.pagination && orderStore.pagination.doFirstRequest()
  }

  handleSearchRequest = (pagination) => {
    return orderStore.fetchData(pagination)
  }

  handleExport = (value) => {
    const {
      start_date,
      end_date,
      time_config_id,
      orderType,
    } = orderStore.orderFilter

    let params = {
      time_config_id,
      start_date: moment(start_date).format('YYYY-MM-DD'),
      end_date: moment(end_date).format('YYYY-MM-DD'),
      export: value,
    }

    const order_process_type_id = getOrderTypeId(orderType)
    if (order_process_type_id !== null) {
      params = {
        ...params,
        order_process_type_id,
      }
    }

    Request('/weight/skus/export')
      .data(params)
      .get()
      .then((json) => {
        Tip.success(i18next.t('正在异步导出报表...'))
        RightSideModal.render({
          children: <TaskList />,
          onHide: RightSideModal.hide,
          style: { width: '300px' },
        })
      })
  }

  render() {
    const { orderData } = orderStore

    return (
      <>
        <SortingOrderFilter />
        <BoxTable
          info={
            <BoxTable.Info>
              <TableTotalText
                data={[
                  {
                    label: i18next.t('全部订单数'),
                    content: orderData.total,
                  },
                  {
                    label: i18next.t('完成订单数'),
                    content: orderData.finished,
                  },
                  {
                    label: i18next.t('未完成订单数'),
                    content: Big(orderData.total)
                      .minus(orderData.finished)
                      .toFixed(0),
                  },
                ]}
              />
            </BoxTable.Info>
          }
          action={
            <div>
              <Button
                type='primary'
                onClick={this.handleExport.bind(this, 1)}
                className='gm-margin-right-10'
              >
                {i18next.t('绩效导出')}
              </Button>
              <Button
                type='primary'
                plain
                onClick={this.handleExport.bind(this, 2)}
              >
                {i18next.t('缺货导出')}
              </Button>
            </div>
          }
        >
          <ManagePaginationV2
            id='pagination_in_sorting_order_detail_list'
            onRequest={this.handleSearchRequest}
            ref={(ref) => {
              ref && orderStore.setPagination(ref)
            }}
            disablePage
          >
            <SortingOrderExpandTable />
          </ManagePaginationV2>
        </BoxTable>
      </>
    )
  }
}

export default SortingOrder
