import React, { useRef, useEffect, useMemo, useCallback } from 'react'
import { t } from 'gm-i18n'
import { observer, Observer } from 'mobx-react'
import {
  BoxTable,
  Flex,
  ToolTip,
  Select,
  InputNumberV2,
  Button,
  Modal,
  Tip,
} from '@gmfe/react'
import { TableX, TableXUtil } from '@gmfe/table-x'
import { ManagePagination } from '@gmfe/business'
import TableTotalText from 'common/components/table_total_text'
import store from './store'
import Big from 'big.js'
import { STATUS_ENUM, STATUS_TYPE } from '../enum'
import globalStore from 'stores/global'
import AddModal from '../components/add_modal'
import { convertNumber2Sid } from 'common/filter'
const { OperationHeader, OperationRowEdit, OperationDelete } = TableXUtil

// 整单折扣列表
const List = () => {
  const refPagination = useRef(null)
  const { pagination, fetchList } = store
  const {
    orderInfo: { contract_rate_format },
  } = globalStore
  const isPercent = contract_rate_format === 1

  useEffect(() => {
    store.setDoFirstRequest(refPagination.current.apiDoFirstRequest)
    refPagination.current.apiDoFirstRequest()
  }, [])

  const handleAdd = () => {
    Modal.render({
      title: t('新建整单折扣率商户'),
      onHide: Modal.hide,
      style: {
        width: '400px',
      },
      children: (
        <AddModal
          onCancel={() => Modal.hide()}
          type={4}
          handleRequest={handleRequest}
        />
      ),
    })
  }

  const handleDelete = (rowData) => {
    store.onDelete(rowData).then(() => {
      Tip.success(t('删除成功'))
      store.doFirstRequest()
    })
  }

  const handleRequest = (pagination) => {
    return fetchList(pagination)
  }

  const handleRowEdit = useCallback((index, isEdit) => {
    store.onRowChange(index, 'isEdit', isEdit)
    if (isEdit) {
      store.onRowChange(index, 'edit_status', undefined)
      store.onRowChange(index, 'edit_rate', undefined)
    }
  }, [])

  const handleSave = useCallback((rowData, value) => {
    store.onSave(rowData).then(() => {
      store.doFirstRequest()
    })
  }, [])

  const columns = useMemo(
    () => [
      {
        Header: t('序号'),
        accessor: 'index',
        Cell: (cellProps) => cellProps.row.index + 1,
      },
      {
        Header: t('商户ID'),
        accessor: '_id',
        Cell: (cellProps) =>
          convertNumber2Sid(cellProps.row.original.addresses[0]),
      },
      {
        Header: t('商户名'),
        accessor: 'first_address_name',
      },
      {
        Header: (
          <Flex>
            {t('变化率')}
            <ToolTip
              popup={
                <div className='gm-padding-5' style={{ width: '150px' }}>
                  {t('整单折扣率，按商户预设')}
                </div>
              }
            />
          </Flex>
        ),
        accessor: 'change_rate',
        Cell: (cellProps) => (
          <Observer>
            {() => {
              const {
                index,
                original: {
                  isEdit,
                  change_rate,
                  edit_rate = isPercent
                    ? +Big(change_rate).minus(100)
                    : +Big(change_rate).div(100).toFixed(2),
                },
              } = cellProps.row
              const changeRate = isPercent
                ? +Big(change_rate).minus(100)
                : +Big(change_rate).div(100).toFixed(2)
              return (
                <Flex columns alignCenter>
                  {isEdit ? (
                    <InputNumberV2
                      className='form-control'
                      value={edit_rate}
                      min={-999999999}
                      max={999999999}
                      style={{ width: '120px' }}
                      onChange={(value) =>
                        store.onRowChange(index, 'edit_rate', value)
                      }
                    />
                  ) : (
                    changeRate
                  )}
                  {isPercent && '%'}
                </Flex>
              )
            }}
          </Observer>
        ),
      },
      {
        Header: (
          <Flex>
            {t('状态')}
            <ToolTip
              popup={
                <div className='gm-padding-5' style={{ width: '150px' }}>
                  {t(
                    '有效表示下该商户订单时新增整单折扣相关字段，支持修改原价和销售价',
                  )}
                </div>
              }
            />
          </Flex>
        ),
        accessor: 'status',
        Cell: (cellProps) => (
          <Observer>
            {() => {
              const {
                index,
                original: { status, edit_status = status, isEdit },
              } = cellProps.row

              return isEdit ? (
                <Select
                  style={{ width: '120px' }}
                  data={STATUS_TYPE.filter((f) => f.value)}
                  value={edit_status}
                  onChange={(value) =>
                    store.onRowChange(index, 'edit_status', value)
                  }
                />
              ) : (
                STATUS_ENUM[status]
              )
            }}
          </Observer>
        ),
      },

      {
        Header: OperationHeader,
        accessor: 'operator',
        Cell: (cellProps) => (
          <Observer>
            {() => {
              const {
                original: { isEdit },
                original,
                index,
              } = cellProps.row
              return (
                <Flex columns alignCenter justifyCenter>
                  {globalStore.hasPermission('update_change_rate') && (
                    <OperationRowEdit
                      isEditing={!!isEdit}
                      onClick={() => handleRowEdit(index, true)}
                      onSave={() => handleSave(original)}
                      onCancel={() => handleRowEdit(index, false)}
                    />
                  )}
                  {globalStore.hasPermission('delete_change_rate') &&
                    !isEdit && (
                      <OperationDelete
                        title={t('确认删除')}
                        onClick={() => handleDelete(original)}
                      />
                    )}
                </Flex>
              )
            }}
          </Observer>
        ),
      },
    ],
    [handleRowEdit, handleSave, isPercent],
  )

  return (
    <BoxTable
      info={
        <BoxTable.Info>
          <TableTotalText
            data={[
              {
                label: t('商户数'),
                content: pagination?.count || 0,
              },
            ]}
          />
        </BoxTable.Info>
      }
      action={
        globalStore.hasPermission('add_change_rate') && (
          <Button type='primary' onClick={handleAdd}>
            {t('新增')}
          </Button>
        )
      }
    >
      <ManagePagination
        onRequest={handleRequest}
        ref={refPagination}
        id='pagination_list_whole_order_discount_pricing'
      >
        <TableX
          data={store.dataList.slice()}
          columns={columns}
          keyField='_id'
        />
      </ManagePagination>
    </BoxTable>
  )
}

export default observer(List)
