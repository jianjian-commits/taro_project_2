import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { Price } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { Table } from '@gmfe/table'
import store from './store'
import SearchFilter from './search_filter'
import { adjustType } from '../../../common/filter'
import _ from 'lodash'

@observer
class AdjustmentRecord extends React.Component {
  constructor(props) {
    super(props)
    store.initList()
  }

  handleSearchRequest = (pagination) => {
    return store.fetchData(pagination)
  }

  componentDidMount() {
    store.pagination && store.pagination.doFirstRequest()
  }

  render() {
    const { list } = store
    return (
      <div>
        <SearchFilter />
        <ManagePaginationV2
          id='pagination_in_product_adjustment_cost_detail_list'
          onRequest={this.handleSearchRequest}
          ref={(ref) => {
            ref && store.setPagination(ref)
          }}
        >
          <Table
            data={list}
            columns={[
              {
                Header: i18next.t('调整时间'),
                accessor: 'modify_time',
              },
              {
                Header: i18next.t('商品ID'),
                accessor: 'spu_id',
              },
              {
                Header: i18next.t('商品名称'),
                accessor: 'name',
              },
              {
                Header: i18next.t('商品分类'),
                accessor: 'category_2_name',
              },
              {
                Header: i18next.t('调整类型'),
                id: 'adjust_type',
                Cell: ({ original }) => {
                  const { adjust_type } = original
                  return <div>{adjustType(adjust_type)}</div>
                },
              },
              {
                Header: i18next.t('关联调整单号'),
                accessor: 'adjust_sheet_number',
              },
              {
                Header: i18next.t('调整前均价'),
                id: 'old_avg_price',
                Cell: ({ original }) => {
                  const { old_avg_price, unit_name } = original
                  const oldAvgPrice = _.isNil(old_avg_price)
                    ? '-'
                    : old_avg_price
                  return (
                    <div>{`${oldAvgPrice}${Price.getUnit()}/${
                      unit_name || '-'
                    }`}</div>
                  )
                },
              },
              {
                Header: i18next.t('调整后均价'),
                id: 'new_avg_price',
                Cell: ({ original }) => {
                  const { new_avg_price, unit_name } = original
                  const newAvgPrice = _.isNil(new_avg_price)
                    ? '-'
                    : new_avg_price
                  return (
                    <div>{`${newAvgPrice}${Price.getUnit()}/${
                      unit_name || '-'
                    }`}</div>
                  )
                },
              },
            ]}
          />
          <div className='gm-gap-20' />
        </ManagePaginationV2>
      </div>
    )
  }
}
export default AdjustmentRecord
