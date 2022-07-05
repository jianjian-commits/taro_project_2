import React, { useRef, useEffect } from 'react'
import { t } from 'gm-i18n'
import { observer, Observer } from 'mobx-react'
import {
  BoxTable,
  Flex,
  ToolTip,
  Select,
  Button,
  Modal,
  Tip,
} from '@gmfe/react'
import { TableX, TableXUtil } from '@gmfe/table-x'
import { ManagePagination } from '@gmfe/business'
import TableTotalText from 'common/components/table_total_text'
import store from './store'
import { STATUS_ENUM, STATUS_TYPE } from '../enum'
import AddModal from '../components/add_modal'
import globalStore from 'stores/global'
import { convertNumber2Sid } from 'common/filter'

const { OperationHeader, OperationRowEdit, OperationDelete } = TableXUtil

// 上浮定价列表
const List = () => {
  const refPagination = useRef(null)
  const { pagination, fetchList } = store

  useEffect(() => {
    store.setDoFirstRequest(refPagination.current.apiDoFirstRequest)
    refPagination.current.apiDoFirstRequest()
  }, [])

  const handleAdd = () => {
    Modal.render({
      title: t('新建上浮率商户'),
      onHide: Modal.hide,
      style: {
        width: '400px',
      },
      children: (
        <AddModal
          onCancel={() => Modal.hide()}
          type={3}
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
    console.log('pagination', pagination)
    return fetchList(pagination)
  }

  const handleSet = (id) => {
    window.open(
      `#/merchandise/contract_price/comeup_pricing/set_rate?price_rule_id=${id}`,
    )
  }

  const handleRowEdit = (index, isEdit) => {
    store.onRowChange(index, 'isEdit', isEdit)
    if (isEdit) store.onRowChange(index, 'edit_status', undefined)
  }

  const handleSave = (rowData, value) => {
    store.onSave(rowData).then((res) => {
      store.doFirstRequest()
    })
  }

  const columns = [
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
                {t('上浮变化率，按商品和商户预设')}
              </div>
            }
          />
        </Flex>
      ),
      accessor: '_id',
      Cell: (cellProps) =>
        globalStore.hasPermission('get_change_rate') && (
          <a onClick={() => handleSet(cellProps.row.original._id)}>
            {t('点击设置')}
          </a>
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
                  '有效表示下该商户订单时新增上浮变化相关字段，支持修改原价和销售价',
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
                {globalStore.hasPermission('delete_change_rate') && !isEdit && (
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
  ]

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
        id='pagination_list_contactc_price_comeup_pricing'
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
