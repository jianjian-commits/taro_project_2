import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { ManagePaginationV2 } from '@gmfe/business'
import { Table } from '@gmfe/table'
import store from './store'
import SearchFilter from './search_filter'

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
          id='pagination_in_product_out_stock_adjustment_record'
          onRequest={this.handleSearchRequest}
          ref={(ref) => {
            ref && store.setPagination(ref)
          }}
        >
          <Table
            data={list}
            columns={[
              {
                Header: i18next.t('建单时间'),
                accessor: 'create_time',
              },
              {
                Header: i18next.t('出库调整单号'),
                id: 'sheet_no',
                accessor: (d) => (
                  <a
                    target='_blank'
                    rel='noopener noreferrer'
                    href={`#/sales_invoicing/stock_out/adjust_record/detail?sheet_no=${d.sheet_no}`}
                  >
                    {d.sheet_no}
                  </a>
                ),
              },
              {
                Header: i18next.t('建单人'),
                accessor: 'operator',
              },
            ]}
          />
        </ManagePaginationV2>
      </div>
    )
  }
}
export default AdjustmentRecord
