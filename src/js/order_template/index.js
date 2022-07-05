import { i18next } from 'gm-i18n'
import React, { useEffect } from 'react'
import { BoxTable, Tip } from '@gmfe/react'
import { Table, TableUtil } from '@gmfe/table'
import { Link } from 'react-router-dom'
import qs from 'query-string'
import store from './store'
import moment from 'moment'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { ORDER_IMPORT_TYPE } from '../common/enum'
import globalStore from '../stores/global'
import TableTotalText from 'common/components/table_total_text'
import { Button } from '@gmfe/react'

const Action = () => (
  <div>
    <Button
      type='primary'
      onClick={() => {
        window.location.href =
          '#/system/setting/distribute_templete/order_batch'
      }}
    >
      {i18next.t('新建模板')}
    </Button>
  </div>
)

export default observer(() => {
  const fetchList = async () => {
    await store.getList()
  }

  const handleDel = (id) => {
    store.del(id).then(() => {
      fetchList()
      Tip.success(i18next.t('删除成功'))
    })
  }

  useEffect(() => {
    fetchList()
  }, [])

  const { list, loading } = store
  const addPermission = globalStore.hasPermission('add_order_import_template')
  const deletePermission = globalStore.hasPermission(
    'delete_order_import_template',
  )
  const tableInfo = [{ label: '订单导入模板列表', content: list.length }]

  return (
    <div className='b-order-printer-list'>
      <BoxTable
        headerProps={{ style: { backgroundColor: '#fff' } }}
        info={
          <BoxTable.Info>
            <TableTotalText data={tableInfo} />
          </BoxTable.Info>
        }
        action={addPermission ? <Action /> : null}
      >
        <Table
          loading={loading}
          data={list.slice()}
          columns={[
            {
              Header: i18next.t('创建时间'),
              accessor: 'create_time',
              Cell: ({ value }) => moment(value).format('YYYY-MM-DD HH:mm:ss'),
            },
            {
              Header: i18next.t('模板名称'),
              accessor: 'name',
            },
            {
              Header: i18next.t('模板类型'),
              accessor: 'type',
              Cell: ({ value }) => {
                const target = _.find(
                  ORDER_IMPORT_TYPE,
                  (item) => item.value === value,
                )
                return target ? target.text : '-'
              },
            },
            {
              Header: i18next.t('创建人'),
              accessor: 'creator',
            },
            {
              width: 80,
              Header: TableUtil.OperationHeader,
              Cell: (row) => (
                <TableUtil.OperationCell>
                  <TableUtil.OperationDetail
                    href={`#/system/setting/distribute_templete/order_batch?${qs.stringify(
                      { id: row.original.id },
                    )}`}
                  />
                  {deletePermission && (
                    <TableUtil.OperationDelete
                      title='警告'
                      onClick={handleDel.bind(this, row.original.id)}
                    >
                      {i18next.t('确定删除模板吗？')}
                    </TableUtil.OperationDelete>
                  )}
                </TableUtil.OperationCell>
              ),
            },
          ]}
        />
      </BoxTable>
    </div>
  )
})
