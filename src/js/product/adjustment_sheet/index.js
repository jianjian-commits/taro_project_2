import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { BoxTable, Flex, Button } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { Table } from '@gmfe/table'
import store from './store'
import { adjustSheetStatus } from '../../common/filter'
import SearchFilter from './search_filter'
import globalStore from '../../stores/global'
import TableTotalText from 'common/components/table_total_text'

@observer
class InStockBatch extends React.Component {
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

  handleCreate = () => {
    window.open('#/sales_invoicing/stock_in/adjust_sheet/detail')
  }

  render() {
    const { list } = store
    const canAddAdjust = globalStore.hasPermission('add_in_stock_adjust')
    const tableInfo = [
      {
        label: i18next.t('入库调整单列表'),
        content: list.length,
      },
    ]

    return (
      <>
        <SearchFilter />
        <BoxTable
          info={
            <BoxTable.Info>
              <TableTotalText data={tableInfo} />
            </BoxTable.Info>
          }
          action={
            canAddAdjust && (
              <div>
                <Button type='primary' onClick={this.handleCreate}>
                  {i18next.t('新建入库调整单')}
                </Button>
              </div>
            )
          }
        >
          <ManagePaginationV2
            id='pagination_in_product_adjustment_sheet'
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
                  Header: i18next.t('入库调整单号'),
                  id: 'sheet_no',
                  accessor: (original) => (
                    <a
                      target='_blank'
                      rel='noopener noreferrer'
                      href={`#/sales_invoicing/stock_in/adjust_sheet/detail?sheet_no=${original.sheet_no}`}
                    >
                      {original.sheet_no}
                    </a>
                  ),
                },
                {
                  Header: <Flex justifyCenter>{i18next.t('建单人')}</Flex>,
                  id: 'creator',
                  accessor: (original) => (
                    <Flex justifyCenter>{original.creator}</Flex>
                  ),
                },
                {
                  Header: <Flex justifyCenter>{i18next.t('单据状态')}</Flex>,
                  accessor: 'status',
                  Cell: ({ original }) => {
                    return (
                      <Flex justifyCenter>
                        {adjustSheetStatus(original.status)}
                      </Flex>
                    )
                  },
                },
              ]}
            />
          </ManagePaginationV2>
        </BoxTable>
      </>
    )
  }
}
export default InStockBatch
