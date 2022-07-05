import React, { useEffect, useRef } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { TableX } from '@gmfe/table-x'
import { BoxTable } from '@gmfe/react'
import { ManagePagination } from '@gmfe/business'
import TableTotalText from 'common/components/table_total_text'
import store from '../store'
import moment from 'moment'

const { Info } = BoxTable
const List = observer(() => {
  const paginationRef = useRef(null)
  const columns = [
    {
      Header: t('商户IDS'),
      Cell: ({ row: { original } }) => {
        return `S${original.shop_id}`
      },
    },
    { Header: t('商户名'), accessor: 'shop_name' },
    {
      Header: t('注册时间'),
      accessor: 'create_time',
      Cell: ({ row: { original } }) => {
        return `${moment(original.create_time).format('YYYY-MM-DD')}`
      },
    },
    { Header: t('结款联系人'), accessor: 'payment_name' },
    {
      Header: t('电话'),
      accessor: 'payment_telephone',
    },
    {
      Header: t('最近下单时间'),
      accessor: 'order_time_max',
      Cell: ({
        row: {
          original: { order_time_max },
        },
      }) => {
        return order_time_max
          ? moment(order_time_max).format('YYYY-MM-DD')
          : t('无')
      },
    },
    {
      Header: t('首次下单时间'),
      accessor: 'order_time_min',
      Cell: ({
        row: {
          original: { order_time_min },
        },
      }) => {
        return order_time_min
          ? moment(order_time_min).format('YYYY-MM-DD')
          : t('无')
      },
    },
  ]
  const { loading, list, paginationData, filter } = store
  const handleRequest = (pagination) => {
    const { handleSearch, closeLoading, setList, setPagination } = store
    return handleSearch(pagination)
      .then((res) => {
        closeLoading()
        const listData = res.data?.data.map((item) => ({
          ...item,
          row_edit: false,
        }))
        setList(listData)
        setPagination(res.data)
        return { data: listData, pagination: res.data }
      })
      .finally(() => closeLoading())
  }

  useEffect(() => {
    paginationRef.current && paginationRef.current.apiDoFirstRequest()
  }, [filter])
  return (
    <BoxTable
      info={
        <Info>
          <TableTotalText
            data={[
              {
                label: t('未下单的商户数'),
                content: paginationData.count || list.length,
              },
            ]}
          />
        </Info>
      }
    >
      <ManagePagination
        id='no_order_id'
        onRequest={handleRequest}
        ref={(ref) => (paginationRef.current = ref)}
      >
        <TableX columns={columns} data={list} loading={loading} />
      </ManagePagination>
    </BoxTable>
  )
})

export default List
