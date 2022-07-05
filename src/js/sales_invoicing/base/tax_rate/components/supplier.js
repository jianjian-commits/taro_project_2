import React, { useCallback, useMemo, useRef, useState } from 'react'
import { observer } from 'mobx-react'
import store from '../store'
import TableTotalText from 'common/components/table_total_text'
import { t } from 'gm-i18n'
import { Button, Flex, Modal } from '@gmfe/react'
import { TableXVirtualized, TableXUtil } from '@gmfe/table-x'
import { SvgMinus } from 'gm-svg'
import Position from 'common/components/position'
import AddSupplierModal from './add_supplier_modal'

const { OperationHeader, OperationCell, TABLE_X } = TableXUtil

const Supplier = () => {
  const [highLightIndex, setHighlightIndex] = useState()
  const { details, edit } = store
  const { supplier } = details
  const tableRef = useRef()

  const handleDelete = useCallback((index) => {
    const { deleteSupplierItem } = store
    deleteSupplierItem(index)
  }, [])

  const columns = useMemo(
    () => [
      { Header: t('供应商编号'), accessor: 'customer_id' },
      { Header: t('供应商名称'), accessor: 'supplier_name' },
      {
        Header: OperationHeader,
        id: 'operation',
        Cell: (cellProps) => {
          const { index } = cellProps.row
          return (
            <OperationCell>
              {edit ? (
                <Button
                  type='danger'
                  style={{ width: '22px', height: '22px' }}
                  className='gm-padding-0'
                  onClick={() => handleDelete(index)}
                >
                  <SvgMinus />
                </Button>
              ) : (
                '-'
              )}
            </OperationCell>
          )
        },
      },
    ],
    [edit, handleDelete]
  )

  const handleHighlight = useCallback((index) => {
    setHighlightIndex(index)
  }, [])

  const handleOpenAddModal = useCallback(() => {
    Modal.render({
      title: t('添加供应商'),
      children: <AddSupplierModal />,
      onHide: Modal.hide,
      size: 'lg',
    })
  }, [])

  return (
    <div
      className='gm-border gm-margin-lr-10 gm-padding-10'
      style={{ flex: 1 }}
    >
      <div className='gm-text-14'>
        <TableTotalText
          data={[{ label: t('供应商数'), content: supplier.length }]}
        />
      </div>
      <Flex className='gm-margin-tb-10'>
        {edit && (
          <Button
            type='primary'
            className='gm-margin-right-10'
            onClick={handleOpenAddModal}
          >
            {t('添加供应商')}
          </Button>
        )}
        <Position
          tableRef={tableRef}
          onHighlight={handleHighlight}
          list={supplier.slice()}
          placeholder={t('请输入供应商名称或供应商编号')}
          style={{ width: '200px' }}
          filterText={['supplier_name', 'customer_id']}
        />
      </Flex>
      <TableXVirtualized
        refVirtualized={tableRef}
        columns={columns}
        isTrHighlight={(_, index) => index === highLightIndex}
        z
        virtualizedHeight={
          TABLE_X.HEIGHT_HEAD_TR +
          Math.min(10, supplier.length) * TABLE_X.HEIGHT_TR
        }
        virtualizedItemSize={TABLE_X.HEIGHT_TR}
        data={supplier.slice()}
      />
    </div>
  )
}

export default observer(Supplier)
