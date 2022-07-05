import React from 'react'
import { t } from 'gm-i18n'
import { EditTable, TableUtil } from '@gmfe/table'
import { keyboardTableHoc, KCInput } from '@gmfe/keyboard'
import { observer } from 'mobx-react'

import CellCustomer from './cell_customer'
import HeaderTip from 'common/components/header_tip'
import store from './store'

const { referOfWidth, EditTableOperation, OperationHeader } = TableUtil

const KeyboardTable = keyboardTableHoc(EditTable)

const PospalInfoTable = observer(() => {
  const handleAddItem = (index) => {
    store.addItem(index)
  }

  const handleDeleteItem = (index) => {
    store.deleteItem(index)
  }

  const handelInfoChange = (index, key, value) => {
    store.updateItem(index, key, value)
  }

  const { list } = store
  return (
    <KeyboardTable
      style={{ maxHeight: 500 }}
      id='pospal_table'
      onAddRow={handleAddItem}
      data={list.slice()}
      columns={[
        {
          Header: t('序号'),
          accessor: 'index',
          width: referOfWidth.noCell,
          Cell: (cellProps) => cellProps.index + 1,
        },
        {
          Header: OperationHeader,
          accessor: 'operation',
          width: referOfWidth.operationCell,
          Cell: (cell) => (
            <EditTableOperation
              onAddRow={handleAddItem.bind(null, cell.index)}
              onDeleteRow={
                list.length === 1
                  ? undefined
                  : handleDeleteItem.bind(null, cell.index)
              }
            />
          ),
        },
        {
          Header: t('门店名'),
          accessor: 'name',
          minWidth: 100,
          isKeyboard: true,
          Cell: (cell) => (
            <KCInput
              style={{ width: '80px' }}
              maxLength={15}
              type='text'
              value={cell.value || ''}
              className='form-control'
              placeholder={t('门店名')}
              onChange={(e) =>
                handelInfoChange(cell.index, 'name', e.target.value)
              }
            />
          ),
        },
        {
          Header: (
            <HeaderTip
              title={t('门店对应商户')}
              tip={t('设置门店与商户对应关系，获取采购单至此商户订单')}
            />
          ),
          accessor: 'customer',
          minWidth: 210,
          isKeyboard: true,
          Cell: (cell) => (
            <CellCustomer
              selected={cell.original.customer}
              onChange={handelInfoChange.bind(null, cell.index, 'customer')}
            />
          ),
        },
        {
          Header: (
            <HeaderTip
              title={t('接口地址前缀')}
              tip={t('此字段为银豹公司提供，请联系银豹业务员进行申请')}
            />
          ),
          accessor: 'url',
          minWidth: 100,
          isKeyboard: true,
          Cell: (cell) => (
            <KCInput
              style={{ width: '80px' }}
              type='text'
              value={cell.value || ''}
              className='form-control'
              placeholder={t('接口')}
              onChange={(e) =>
                handelInfoChange(cell.index, 'url', e.target.value)
              }
            />
          ),
        },
        {
          Header: (
            <HeaderTip
              title='AppID'
              tip={t('此字段为银豹公司提供，请联系银豹业务员进行申请')}
            />
          ),
          accessor: 'app_id',
          minWidth: 100,
          isKeyboard: true,
          Cell: (cell) => (
            <KCInput
              style={{ width: '80px' }}
              type='text'
              value={cell.value || ''}
              className='form-control'
              placeholder='AppID'
              onChange={(e) =>
                handelInfoChange(cell.index, 'app_id', e.target.value)
              }
            />
          ),
        },
        {
          Header: (
            <HeaderTip
              title='AppKey'
              tip={t('此字段为银豹公司提供，请联系银豹业务员进行申请')}
            />
          ),
          accessor: 'app_key',
          minWidth: 100,
          isKeyboard: true,
          Cell: (cell) => (
            <KCInput
              style={{ width: '80px' }}
              type='text'
              value={cell.value || ''}
              className='form-control'
              placeholder='AppKey'
              onChange={(e) =>
                handelInfoChange(cell.index, 'app_key', e.target.value)
              }
            />
          ),
        },
        {
          Header: (
            <HeaderTip
              title={t('门店供应商ID')}
              tip={t(
                '设置门店供应商与站点对应关系，获取此供应商ID的采购单至订单'
              )}
            />
          ),
          accessor: 'supplier_id',
          minWidth: 110,
          isKeyboard: true,
          Cell: (cell) => (
            <KCInput
              style={{ width: '80px' }}
              type='text'
              value={cell.value || ''}
              className='form-control'
              placeholder={t('供应商ID')}
              onChange={(e) =>
                handelInfoChange(cell.index, 'supplier_id', e.target.value)
              }
            />
          ),
        },
      ]}
    />
  )
})

export default PospalInfoTable
