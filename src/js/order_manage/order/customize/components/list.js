import React from 'react'
import { i18next, t } from 'gm-i18n'
import { BoxTable, Button } from '@gmfe/react'
import { TableX, TableXUtil } from '@gmfe/table-x'
import TableTotalText from 'common/components/table_total_text'
import { observer } from 'mobx-react'
import store from '../store'
import { belongTypeMap, fieldTypeMap } from '../enum'
import { history } from 'common/service'
import OperationCell from './operation'
import globalStore from 'stores/global'

const List = () => {
  function handleCreate() {
    history.push('/order_manage/order/customize/create')
  }
  const canCreateOrderCustomizedField = globalStore.hasPermission(
    'create_order_customized_field',
  )

  const { list } = store
  return (
    <BoxTable
      info={
        <BoxTable.Info>
          <TableTotalText
            data={[
              {
                label: i18next.t('字段总数'),
                content: list.length,
              },
            ]}
          />
        </BoxTable.Info>
      }
      action={
        canCreateOrderCustomizedField ? (
          <Button type='primary' onClick={handleCreate}>
            {i18next.t('新建自定义字段')}
          </Button>
        ) : null
      }
    >
      <TableX
        data={list}
        columns={[
          {
            Header: t('序号'),
            accessor: 'index',
            Cell: ({ row }) => row.index + 1,
          },
          {
            Header: t('自定义字段名'),
            accessor: 'field_name',
          },
          {
            Header: t('所属对象'),
            id: 'object_type',
            accessor: (d) => belongTypeMap[d?.object_type] || '-',
          },
          {
            Header: t('字段格式'),
            id: 'field_type',
            accessor: (d) => fieldTypeMap[d?.field_type] || '-',
          },
          {
            Header: TableXUtil.OperationHeader,
            id: 'operation',
            accessor: (d) => {
              return <OperationCell original={d} />
            },
          },
        ]}
      />
    </BoxTable>
  )
}

export default observer(List)
