/*
 * @Description: 分拣员
 */
import React, { useEffect, useRef } from 'react'
import {
  Box,
  Form,
  FormItem,
  BoxTable,
  Select,
  FormButton,
  Button,
} from '@gmfe/react'
import { TableUtil, Table } from '@gmfe/table'
import { ManagePaginationV2 } from '@gmfe/business'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'

import TableTotalText from 'common/components/table_total_text'
import { TASK_SCOPE_OPTIONS } from 'common/enum'

import store from './store'

const columns = [
  {
    Header: t('编号'),
    accessor: 'id',
    Cell: ({ index }) => index + 1,
  },
  {
    Header: t('用户名'),
    accessor: 'username',
  },
  {
    Header: t('姓名'),
    accessor: 'name',
  },
  {
    Header: t('手机'),
    accessor: 'phone',
  },
  {
    Header: t('用户状态'),
    id: 'is_active',
    accessor: ({ is_active }) => t(is_active ? '有效' : '无效'),
  },
  {
    Header: t('可见任务范围'),
    id: 'task_scope',
    accessor: ({ task_scope }) => t(task_scope === 1 ? '全部范围' : '固定分配'),
  },
  {
    Header: t('分配方式'),
    id: 'alloc_type',
    accessor: ({ alloc_type }) =>
      alloc_type === undefined
        ? '-'
        : t(alloc_type === 1 ? '按商品分配' : '按商户分配'),
  },
]

function Sorter() {
  const { data, filterRules } = store

  const { task_scope = '', q } = filterRules

  const paginationRef = useRef()
  useEffect(() => {
    getList()
  }, [task_scope])
  useEffect(() => {
    return () => {
      store.clearStore()
    }
  }, [])
  function getList() {
    paginationRef.current.apiDoFirstRequest()
  }
  return (
    <>
      <Box hasGap>
        <Form inline onSubmit={getList}>
          <FormItem label={t('可见任务范围')}>
            <Select
              value={task_scope}
              data={[
                {
                  text: t('全部'),
                  value: '',
                },
                ...TASK_SCOPE_OPTIONS,
              ]}
              onChange={(task_scope) =>
                store.filterChange({
                  task_scope: task_scope === '' ? undefined : task_scope,
                })
              }
            />
          </FormItem>
          <FormItem label={t('搜索')}>
            <input
              className='form-control'
              value={q}
              placeholder={t('分拣员姓名或用户名')}
              onChange={(e) => store.filterChange({ q: e.target.value })}
            />
          </FormItem>
          <FormButton>
            <Button type='primary' onClick={getList}>
              {t('搜索')}
            </Button>
          </FormButton>
        </Form>
      </Box>
      <BoxTable
        info={
          <BoxTable.Info>
            <TableTotalText
              data={[
                {
                  label: t('分拣员数'),
                  content: data.pagination.count,
                },
              ]}
            />
          </BoxTable.Info>
        }
      >
        <ManagePaginationV2
          onRequest={(pagination) => store.getSorterList(pagination)}
          ref={paginationRef}
          id='pagination_in_store_operation_sort_data_sorter_list'
        >
          <Table
            data={data.sorters.slice()}
            columns={[
              ...columns,
              {
                Header: TableUtil.OperationHeader,
                Cell: (row) => (
                  <TableUtil.OperationCell>
                    <TableUtil.OperationDetail
                      href={`#/supply_chain/sorting/method/sorter/detail/${row.original.user_id}`}
                      open
                    />
                  </TableUtil.OperationCell>
                ),
              },
            ]}
          />
        </ManagePaginationV2>
      </BoxTable>
    </>
  )
}

export default observer(Sorter)
