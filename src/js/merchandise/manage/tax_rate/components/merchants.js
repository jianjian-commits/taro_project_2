import React, { useCallback, useMemo, useRef, useState } from 'react'
import { observer } from 'mobx-react'
import store from '../store'
import TableTotalText from 'common/components/table_total_text'
import { t } from 'gm-i18n'
import { Button, Flex, Modal } from '@gmfe/react'
import { TableXVirtualized, TableXUtil } from '@gmfe/table-x'
import Position from 'common/components/position'
import { SvgMinus } from 'gm-svg'
import MerchantsModal from './merchants_modal'

const { TABLE_X, OperationHeader, OperationCell } = TableXUtil

const Merchants = () => {
  const tableRef = useRef()
  const [index, setIndex] = useState()
  const { data } = store
  const { addresses, viewType } = data.ruleDetail
  const edit = viewType === 'edit'

  const columns = useMemo(
    () => [
      { Header: t('商户ID'), accessor: 'address_id' },
      { Header: t('商户名'), accessor: 'address_name' },
      {
        Header: OperationHeader,
        id: 'operation',
        width: TABLE_X.WIDTH_OPERATION,
        // eslint-disable-next-line react/prop-types
        Cell: ({ row: { index } }) => (
          <OperationCell>
            {edit ? (
              <Button
                type='danger'
                onClick={() => handleDelete(index)}
                style={{
                  width: '22px',
                  height: '22px',
                  padding: 0,
                  borderRadius: '4px',
                }}
              >
                <SvgMinus />
              </Button>
            ) : (
              '-'
            )}
          </OperationCell>
        ),
      },
    ],
    [edit]
  )

  const handleDelete = useCallback((index) => {
    store.deleteAddress(index)
  }, [])

  const handleHighlight = useCallback((index) => {
    setIndex(index)
  }, [])

  const handleOk = useCallback((list) => {
    const { addAddress } = store
    addAddress(list)
  }, [])

  const handleCreate = useCallback(() => {
    Modal.render({
      title: t('新建商户'),
      size: 'lg',
      onHide: Modal.hide,
      children: <MerchantsModal onOk={handleOk} />,
    })
  }, [])

  return (
    <div style={{ flex: 1 }} className='gm-margin-lr-10 gm-border'>
      <div className='gm-margin-10 gm-text-14'>
        <TableTotalText
          data={[{ label: t('商户数'), content: addresses.length }]}
        />
        <Flex className='gm-margin-top-10' justifyBetween>
          <Flex>
            {edit && (
              <Button
                type='primary'
                className='gm-margin-right-10'
                onClick={handleCreate}
              >
                {t('添加商户')}
              </Button>
            )}
            <Position
              tableRef={tableRef}
              onHighlight={handleHighlight}
              list={addresses.slice()}
              filterText={['address_name', 'address_id']}
              placeholder={t('请输入商户名')}
            />
          </Flex>
        </Flex>
      </div>
      <TableXVirtualized
        virtualizedHeight={
          TABLE_X.HEIGHT_HEAD_TR +
          Math.min(10, addresses.length) * TABLE_X.HEIGHT_TR
        }
        isTrHighlight={(_, i) => i === index}
        refVirtualized={tableRef}
        data={addresses.slice()}
        columns={columns}
        virtualizedItemSize={TABLE_X.HEIGHT_TR}
      />
    </div>
  )
}

export default observer(Merchants)
