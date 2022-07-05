import React, { Component } from 'react'
import { observer, Observer } from 'mobx-react'
import { t } from 'gm-i18n'
import {
  TableX,
  TableXUtil,
  diyTableXHOC,
  selectTableXHOC,
} from '@gmfe/table-x'
import { BoxTable, Dialog, RightSideModal, Tip } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import moment from 'moment'

import store from '../store'
import globalStore from 'stores/global'
import { filterStatusList } from 'common/enum'
import StatusCell from './status_cell'
import BatchConfirmModal from './batch_confirm_modal'
import TaskList from '../../../../task/task_list'

const DiySelectTableX = diyTableXHOC(selectTableXHOC(TableX))
const {
  OperationCell,
  OperationRowEdit,
  BatchActionBar,
  OperationHeader,
} = TableXUtil
@observer
class List extends Component {
  columns = [
    {
      Header: t('订单号'),
      id: 'order_id',
      diyGroupName: t('基础'),
      Cell: (cellProps) => {
        const { order_id, id } = cellProps.row.original
        return (
          <a
            href={`#/order_manage/order_review/details?id=${id}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            {order_id}
          </a>
        )
      },
    },
    { Header: t('改单日期'), accessor: 'edit_time', diyGroupName: t('基础') },
    {
      Header: t('商户名/ID'),
      id: 'address',
      diyGroupName: t('基础'),
      Cell: (cellProps) => {
        const { address_id, address_name } = cellProps.row.original
        return `${address_name}/${address_id}`
      },
    },
    { Header: t('改动商品数'), accessor: 'skus_num', diyGroupName: t('基础') },
    {
      Header: t('订单状态'),
      id: 'status',
      diyGroupName: t('基础'),
      Cell: (cellProps) => {
        const { status } = cellProps.row.original
        return [...filterStatusList, { id: -1, name: t('已删除') }].find(
          (item) => item.id === status,
        ).name
      },
    },
    {
      Header: t('审核状态'),
      id: 'audit_status',
      diyGroupName: t('基础'),
      Cell: (cellProps) => {
        return <StatusCell index={cellProps.row.index} />
      },
    },
    {
      Header: t('订单备注'),
      accessor: 'order_remark',
      diyGroupName: t('基础'),
    },
    { Header: t('申请人'), accessor: 'applicant', diyGroupName: t('基础') },
    {
      Header: OperationHeader,
      id: 'operation',
      diyEnable: false,
      diyItemText: t('操作'),
      diyGroupName: t('基础'),
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const { row_edit, audit_status } = cellProps.row.original
              const canEditOrderAudit = globalStore.hasPermission(
                'edit_order_audit',
              )

              if (audit_status !== 1 && !row_edit) return null

              return (
                <OperationCell>
                  {canEditOrderAudit && (
                    <OperationRowEdit
                      isEditing={row_edit}
                      onClick={() =>
                        this.handleChange(cellProps.row.index, {
                          row_edit: !row_edit,
                        })
                      }
                      onSave={() => this.handleUpdate(cellProps.row.index)}
                      onCancel={() => {
                        const { pagination } = store
                        pagination.current.apiDoCurrentRequest()
                      }}
                    />
                  )}
                </OperationCell>
              )
            }}
          </Observer>
        )
      },
    },
  ]

  componentDidMount() {
    const { pagination } = store
    pagination.current.apiDoFirstRequest()
  }

  handleUpdate = (index) => {
    const { list, handleUpdate } = store
    const { audit_status, id } = list[index]
    const param = {
      id,
      update_audit_status: audit_status,
    }
    return handleUpdate(param).then(() => {
      Tip.success(t('修改成功'))
      const { pagination } = store
      pagination.current.apiDoCurrentRequest()
    })
  }

  handleChange = (index, value) => {
    const { setListItem } = store
    setListItem(index, value)
  }

  handleRequest = (pagination) => {
    const { handleSearch } = store
    return handleSearch(pagination)
  }

  handleSelect = (selected) => {
    const { setSelected } = store
    setSelected(selected)
  }

  onToggleSelectAll = () => {
    const { setIsSelectAll } = store
    setIsSelectAll()
  }

  handleBatchConfirm = () => {
    Dialog.confirm({
      title: t('批量审核'),
      children: <BatchConfirmModal />,
      size: 'md',
      onOK: this.handleBatchConfirmOK,
    })
  }

  handleBatchConfirmOK = () => {
    const { handleUpdate, updateParams, selected, isSelectAll, filter } = store
    let params = {}
    if (isSelectAll) {
      params.begin_time = moment(filter.begin).format('YYYY-MM-DD HH:mm:ss')
      params.end_time = moment(filter.end).format('YYYY-MM-DD HH:mm:ss')
      params.search_text = filter.text
      params.update_audit_status = updateParams.update_audit_status
      params.audit_status = 1
    } else {
      params = Object.assign({}, updateParams, {
        ids: JSON.stringify(selected),
      })
    }
    return handleUpdate(params).then(() => {
      setTimeout(() => {
        RightSideModal.render({
          children: <TaskList tabKey={1} />,
          style: {
            width: '300px',
          },
          onHide: RightSideModal.hide,
        })
      })
    })
  }

  render() {
    const { loading, list, pagination, selected, isSelectAll } = store
    const canBatchModifyOrderAudit = globalStore.hasPermission(
      'batch_edit_order_audit',
    )
    return (
      <BoxTable>
        <ManagePaginationV2 onRequest={this.handleRequest} ref={pagination}>
          <DiySelectTableX
            selected={selected.slice()}
            onSelect={this.handleSelect}
            id='order_review_table'
            columns={this.columns}
            data={list.slice()}
            keyField='id'
            isSelectorDisable={(item) => item.audit_status !== 1}
            loading={loading}
            diyGroupSorting={[t('基础')]}
            batchActionBar={
              !!selected.length && (
                <BatchActionBar
                  isSelectAll={isSelectAll}
                  count={isSelectAll ? null : selected.length}
                  toggleSelectAll={this.onToggleSelectAll}
                  batchActions={[
                    {
                      type: 'business',
                      name: t('批量审核'),
                      show: canBatchModifyOrderAudit,
                      onClick: this.handleBatchConfirm,
                    },
                  ]}
                  onClose={() => this.handleSelect([])}
                />
              )
            }
          />
        </ManagePaginationV2>
      </BoxTable>
    )
  }
}

export default List
