import { i18next } from 'gm-i18n'
import React, { useEffect, useRef } from 'react'
import { observer } from 'mobx-react'
import { BoxTable, Button } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { TableX } from '@gmfe/table-x'
import store from './store'
import SearchFilter from './product_search_filter'
import TableTotalText from 'common/components/table_total_text'
import moment from 'moment'
import { FINISHED_PRODUCT_STATUS } from 'common/enum'

const MaterialInStock = () => {
  const paginationRef = useRef(null)
  const { list } = store

  useEffect(() => {
    store.setDoFirstRequest(paginationRef.current.apiDoFirstRequest)
    paginationRef.current.apiDoFirstRequest()
  }, [])

  const fetchList = (pagination) => {
    return store.fetchList(pagination)
  }

  return (
    <>
      <SearchFilter />

      <BoxTable
        title={i18next.t('商品列表')}
        info={
          <BoxTable.Info>
            <TableTotalText
              data={[
                {
                  label: i18next.t('入库单列表'),
                  content: store.pagination.count || 0,
                },
              ]}
            />
          </BoxTable.Info>
        }
        action={
          <Button
            type='primary'
            onClick={() =>
              window.open('#/sales_invoicing/stock_in/product/add')
            }
          >
            {i18next.t('新建入库单')}
          </Button>
        }
      >
        <ManagePaginationV2
          onRequest={fetchList}
          ref={paginationRef}
          id='product_stock_list'
        >
          <TableX
            data={list.slice()}
            columns={[
              {
                Header: i18next.t('入库时间'),
                accessor: 'submit_time',
                show: store.filter.date_type === 1,
                Cell: (cellProps) => {
                  const { submit_time } = cellProps.row.original
                  return submit_time === '-'
                    ? submit_time
                    : moment(submit_time).format('YYYY-MM-DD HH:mm')
                },
              },
              {
                Header: i18next.t('建单时间'),
                accessor: 'date_time',
                show: store.filter.date_type === 2,
                Cell: ({ row: { original } }) =>
                  moment(original.date_time).format('YYYY-MM-DD HH:mm'),
              },
              {
                Header: i18next.t('入库单号'),
                accessor: 'id',
                Cell: (cellProps) => (
                  <a
                    onClick={() =>
                      window.open(
                        `#/sales_invoicing/stock_in/product/add?id=${cellProps.row.original.id}`,
                      )
                    }
                  >
                    {cellProps.row.original.id}
                  </a>
                ),
              },
              {
                Header: i18next.t('入库金额'),
                accessor: 'all_price',
                Cell: ({
                  row: {
                    original: { all_price },
                  },
                }) => all_price + i18next.t('元'),
              },
              {
                Header: i18next.t('单据状态'),
                accessor: 'status',
                Cell: ({
                  row: {
                    original: { status },
                  },
                }) => FINISHED_PRODUCT_STATUS[status],
              },
              {
                Header: i18next.t('建单人'),
                accessor: 'creator',
              },
            ]}
          />
        </ManagePaginationV2>
      </BoxTable>
    </>
  )
}

export default observer(MaterialInStock)
