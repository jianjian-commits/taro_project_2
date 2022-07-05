import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { Flex, Price } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { Table } from '@gmfe/table'
import store from './store'
import SearchFilter from './search_filter'
import { productDefaultImg } from 'common/service'
import moment from 'moment'
import _ from 'lodash'

const formatTime = (date) => moment(date).format('MM月DD日 HH时mm分')

@observer
class ExchangeDetail extends React.Component {
  constructor(props) {
    super(props)
    store.initList()
  }

  handleSearchRequest = (pagination) => {
    return store.fetchData(pagination)
  }

  componentDidMount() {
    store.getServiceTime().then(() => {
      store.pagination && store.pagination.doFirstRequest()
    })
  }

  render() {
    const { list } = store
    return (
      <div>
        <SearchFilter />
        <ManagePaginationV2
          id='pagination_in_merchandise_points_exchange_detail_list'
          onRequest={this.handleSearchRequest}
          ref={(ref) => {
            ref && store.setPagination(ref)
          }}
        >
          <Table
            data={list.slice()}
            columns={[
              {
                Header: i18next.t('积分商品图片'),
                id: 'image',
                accessor: (original) => (
                  <Flex
                    alignCenter
                    style={{ width: '40px', height: '40px' }}
                    className='gm-border'
                  >
                    <img
                      src={original.image || productDefaultImg}
                      style={{
                        maxWidth: '40px',
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  </Flex>
                ),
              },
              {
                Header: i18next.t('积分商品名称'),
                accessor: 'sku_name',
              },
              {
                Header: i18next.t('规格'),
                accessor: 'sale_unit',
              },
              {
                Header: i18next.t('兑换数'),
                accessor: 'quantity',
              },
              {
                Header: i18next.t('成本价'),
                id: 'sku_cost',
                accessor: (original) => (
                  <div>
                    {_.isNil(original.sku_cost) ? '-' : original.sku_cost}
                    {Price.getUnit()}
                  </div>
                ),
              },
              {
                Header: i18next.t('订单号/分拣序号'),
                id: 'order_id',
                accessor: (original) => (
                  <div>
                    {original.order_id || '-'}/{original.sort_num || '-'}
                  </div>
                ),
              },
              {
                Header: i18next.t('司机'),
                accessor: 'driver',
              },
              {
                Header: i18next.t('线路'),
                accessor: 'route',
              },
              {
                Header: i18next.t('商户名'),
                accessor: 'address_name',
              },
              {
                Header: i18next.t('收货时间'),
                id: 'receive_begin_time',
                accessor: (original) => (
                  <div>
                    {formatTime(original.receive_begin_time)}～
                    {formatTime(original.receive_end_time)}
                  </div>
                ),
              },
            ]}
          />
        </ManagePaginationV2>
      </div>
    )
  }
}
export default ExchangeDetail
