import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { BoxTable, RightSideModal, Tip, Button } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import moment from 'moment'
import { Request } from '@gm-common/request'
import Big from 'big.js'

import SortingMerchandiseFilter from './sorting_merchandise_filter'
import SortingMerchandiseExpandTable from './sorting_merchandise_expand_table'
import TaskList from '../../../task/task_list'
import TableTotalText from '../../../common/components/table_total_text'

import merchandiseStore from './merchandise_store'
import store from '../store'
import { getOrderTypeId } from '../../../common/deal_order_process'

@observer
class SortingMerchandise extends React.Component {
  constructor(props) {
    super(props)
    merchandiseStore.init()
  }

  async componentDidMount() {
    await store.getServiceTime().then((serviceTime) => {
      // 设置搜索条件的值为第一个运营周期
      const time_config_id = (serviceTime[0] && serviceTime[0]._id) || ''
      merchandiseStore.setFilter('time_config_id', time_config_id)
    })
    merchandiseStore.pagination && merchandiseStore.pagination.doFirstRequest()
  }

  handleSearchRequest = (pagination) => {
    return merchandiseStore.fetchData(pagination).then((json) => {
      merchandiseStore.resetSelected()
      return json
    })
  }

  handleExport = (value) => {
    const {
      start_date,
      end_date,
      time_config_id,
      orderType,
    } = merchandiseStore.merchandiseFilter
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
    const { merchandiseData } = merchandiseStore

    return (
      <>
        <SortingMerchandiseFilter />
        <BoxTable
          info={
            <BoxTable.Info>
              <TableTotalText
                data={[
                  {
                    label: i18next.t('全部商品'),
                    content: merchandiseData.total,
                  },
                  {
                    label: i18next.t('完成商品数'),
                    content: merchandiseData.finished,
                  },
                  {
                    label: i18next.t('未完成商品数'),
                    content: Big(merchandiseData.total)
                      .minus(merchandiseData.finished)
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
            id='pagination_in_sorting_merchandise_detail_list'
            onRequest={this.handleSearchRequest}
            ref={(ref) => {
              ref && merchandiseStore.setPagination(ref)
            }}
            disablePage
          >
            <SortingMerchandiseExpandTable />
          </ManagePaginationV2>
        </BoxTable>
      </>
    )
  }
}

export default SortingMerchandise
