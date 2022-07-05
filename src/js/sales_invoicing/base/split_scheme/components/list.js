import React, { Component } from 'react'
import styled from 'styled-components'
import store from '../store/list.store'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { BoxTable, Button, Flex, Tip, ToolTip } from '@gmfe/react'
import { TableX, TableXUtil } from '@gmfe/table-x'
import { ManagePaginationV2 } from '@gmfe/business'
import global from 'stores/global'

const {
  OperationHeader,
  OperationDetail,
  OperationDelete,
  OperationCell,
} = TableXUtil

@observer
class List extends Component {
  handlePageChange = (pagination) => {
    const { fetchList, filter } = store
    return fetchList(Object.assign({}, filter, pagination))
  }

  handleDelete = async ({ id, version }) => {
    const { handleDelete, paginationRef } = store
    await handleDelete({ id, version })
    Tip.success(t('删除成功'))
    paginationRef.current.apiDoCurrentRequest()
  }

  handleCreate = () => {
    window.open('/#/sales_invoicing/base/split_scheme/create')
  }

  render() {
    const { loading, list, paginationRef } = store
    return (
      <BoxTable
        action={
          global.hasPermission('add_split_plan') && (
            <Button type='primary' onClick={this.handleCreate}>
              {t('新增分割方案')}
            </Button>
          )
        }
      >
        <ManagePaginationV2
          onRequest={this.handlePageChange}
          ref={paginationRef}
        >
          <TableX
            data={list.slice()}
            loading={loading}
            columns={[
              {
                Header: t('分割方案名称'),
                accessor: 'name',
                Cell: (cellProps) => {
                  // has_delete_spu 当前方案是否包含已删除的 SPU 0没有 1有
                  const { name, has_deleted_spu } = cellProps.row.original
                  const Text = styled.span`
                    color: ${!has_deleted_spu ? 'unset' : 'red'};
                  `
                  return (
                    <Flex>
                      <Text>{name}</Text>
                      {!!has_deleted_spu && (
                        <ToolTip
                          className='gm-margin-left-5'
                          showArrow
                          popup={
                            <div className='gm-padding-5'>
                              {t('当前方案存在商品不可用，请进入详情调整方案')}
                            </div>
                          }
                        />
                      )}
                    </Flex>
                  )
                },
              },
              { Header: t('备注'), accessor: 'remark' },
              { Header: t('待分割品'), accessor: 'source_spu_name' },
              {
                Header: OperationHeader,
                accessor: 'action',
                Cell: (cellProps) => {
                  const { original } = cellProps.row
                  return (
                    <OperationCell>
                      {global.hasPermission('edit_split_plan') && (
                        <OperationDetail
                          open
                          href={`#/sales_invoicing/base/split_scheme/edit?id=${original.id}`}
                        />
                      )}
                      {global.hasPermission('delete_split_plan') && (
                        <OperationDelete
                          title={t('delete_split_pan', { name: original.name })}
                          onClick={() => this.handleDelete(original)}
                        />
                      )}
                    </OperationCell>
                  )
                },
              },
            ]}
          />
        </ManagePaginationV2>
      </BoxTable>
    )
  }
}

export default List
