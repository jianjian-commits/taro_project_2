import React, { useEffect, useMemo, useRef, useState } from 'react'
import { t } from 'gm-i18n'
import { BoxTable } from '@gmfe/react'
import { TableX } from '@gmfe/table-x'
import { Request } from '@gm-common/request'
import { ManagePaginationV2 } from '@gmfe/business'

import { WithBreadCrumbs } from 'common/service'
import TableTotalText from 'common/components/table_total_text'

const ErrorList = (props) => {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(0)
  const columns = useMemo(
    () => [
      { Header: t('订单号'), accessor: 'order_id' },
      { Header: t('改单日期'), accessor: 'edit_time' },
      {
        Header: t('商户名/ID'),
        id: 'address',
        Cell: (cellProps) => {
          const { address_name, address_id } = cellProps.row.original
          return `${address_name}${address_id}`
        },
      },
      { Header: t('失败原因'), accessor: 'reason' },
    ],
    [],
  )
  const pagination = useRef(null)
  const taskId = useRef(props.location.query.task_id)

  useEffect(() => {
    pagination.current.apiDoFirstRequest()
  }, [])

  const handleRequest = (pagination) => {
    setLoading(true)
    return Request('/station/order_edit_audit_result/list')
      .data({
        count: 1, // 默认值
        ...pagination,
        task_id: taskId.current,
      })
      .get()
      .then((result) => {
        setList(result.data)
        setCount(result.pagination.count)
        return result
      })
      .catch(() => setCount(0))
      .finally(() => setLoading(false))
  }

  return (
    <>
      <WithBreadCrumbs
        breadcrumbs={[t('订单'), t('订单'), t('改单审核'), t('失败列表')]}
      />
      <BoxTable
        info={
          <TableTotalText data={[{ label: t('失败列表'), content: count }]} />
        }
      >
        <ManagePaginationV2 onRequest={handleRequest} ref={pagination}>
          <TableX data={list} columns={columns} loading={loading} />
        </ManagePaginationV2>
      </BoxTable>
    </>
  )
}

export default ErrorList
