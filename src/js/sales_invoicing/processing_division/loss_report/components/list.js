import React, { useMemo } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { TableX } from '@gmfe/table-x'
import { BoxTable } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import store from '../store'
import Info from './info'
import Big from 'big.js'
import _ from 'lodash'
import Extend from './extend'

const List = () => {
  const { paginationRef, loading, list } = store

  const columns = useMemo(
    () => [
      { Header: t('分割日期'), accessor: 'split_time' },
      { Header: t('待分割品'), accessor: 'source_spu_name' },
      {
        Header: t('分割损耗'),
        id: 'split_loss',
        Cell: (cellProps) => {
          const { std_unit_name, split_loss } = cellProps.row.original
          const count = Big(
            _.isNil(split_loss.loss_quantity)
              ? split_loss
              : split_loss.loss_quantity
          ).toFixed(2) // todo 语法糖
          return `${count}${std_unit_name}`
        },
      },
    ],
    []
  )

  const handleRequest = (pagination) => {
    const { fetchList } = store
    return fetchList(pagination)
  }

  return (
    <BoxTable info={<Info />} action={<Extend />}>
      <ManagePaginationV2 ref={paginationRef} onRequest={handleRequest}>
        <TableX data={list.slice()} columns={columns} loading={loading} />
      </ManagePaginationV2>
    </BoxTable>
  )
}

export default observer(List)
