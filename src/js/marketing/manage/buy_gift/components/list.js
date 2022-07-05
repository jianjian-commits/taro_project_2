import React, { useRef, useEffect } from 'react'
import { t } from 'gm-i18n'
import { BoxTable, Button, Tip, ToolTip, Popover, Flex } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { Table, TableUtil } from '@gmfe/table'
import { observer } from 'mobx-react'

import { showStatus, showPresentType } from '../utils'
import { productDefaultImg } from 'common/service'
import { mainStore as store } from '../store'
import TableTotalText from 'common/components/table_total_text'

const {
  OperationHeader,
  OperationCell,
  OperationDetail,
  OperationDelete,
} = TableUtil

const List = observer(() => {
  const refPagination = useRef()

  useEffect(() => {
    store.setBuyGiftDoFirstRequest(refPagination.current.apiDoFirstRequest)
    refPagination.current.apiDoFirstRequest()
    return () => store.initBuyGift()
  }, [])

  const handlePageChange = (page) => {
    return store.getGiftList(page)
  }

  const handleAdd = () => {
    window.open('#/marketing/manage/buy_gift/add')
  }

  const handleDel = (id) => {
    store.deleteBuyGift(id).then(() => {
      Tip.success(t('删除成功'))
      refPagination.current.apiDoFirstRequest()
    })
  }

  const { giftList, count } = store

  return (
    <BoxTable
      info={
        <BoxTable.Info>
          <TableTotalText
            data={[
              {
                label: t('赠品总数'),
                content: count,
              },
            ]}
          />
        </BoxTable.Info>
      }
      action={
        <div>
          <Button type='primary' onClick={handleAdd}>
            {t('新建赠品')}
          </Button>
          <div className='gm-gap-10' />
        </div>
      }
    >
      <ManagePaginationV2
        onRequest={handlePageChange}
        ref={refPagination}
        id='pagination_in_buy_gift_list'
      >
        <Table
          data={giftList.slice()}
          columns={[
            {
              Header: t('赠品图片'),
              id: 'image',
              accessor: (d) => (
                <img
                  style={{ width: '40px', height: '40px' }}
                  className='gm-border'
                  src={d.image || productDefaultImg}
                />
              ),
            },
            {
              Header: t('赠品名称'),
              id: 'sku_name',
              accessor: (d) => (
                <Flex>
                  {d.sku_name}
                  {d.sku_status === 0 ? (
                    <Popover
                      showArrow
                      type='hover'
                      left
                      bottom
                      style={{
                        marginLeft: '-3px',
                        marginTop: '3px',
                        fontSize: '12px',
                      }}
                      popup={
                        <div
                          style={{ minWidth: '130px' }}
                          className='gm-padding-10 gm-bg'
                        >
                          {t('商品已删除，请手动删除')}
                        </div>
                      }
                    >
                      <span style={{ cursor: 'pointer' }}>
                        <i className='glyphicon glyphicon-warning-sign text-danger gm-padding-left-5' />
                      </span>
                    </Popover>
                  ) : null}
                </Flex>
              ),
            },
            {
              Header: t('销售规格'),
              id: 'sale_ratio',
              accessor: (d) => (
                <span>
                  {d.sale_ratio +
                    d.std_unit_name_forsale +
                    '/' +
                    d.sale_unit_name}
                </span>
              ),
            },
            {
              Header: (
                <div>
                  {t('赠品库存')}
                  <ToolTip
                    className='gm-margin-left-5'
                    popup={
                      <div className='gm-padding-5'>
                        {t('0表示不设置活动库存')}
                      </div>
                    }
                  />
                </div>
              ),
              accessor: 'stock_num',
            },
            {
              Header: t('已用库存'),
              accessor: 'has_used_stock',
            },
            {
              Header: t('赠送条件'),
              id: 'present_type',
              accessor: (d) => <span>{showPresentType(d.present_type)}</span>,
            },
            {
              Header: t('状态'),
              id: 'status',
              accessor: (d) => <span>{showStatus(d.status)}</span>,
            },
            {
              Header: OperationHeader,
              Cell: (cellProps) => {
                return (
                  <OperationCell>
                    <OperationDetail
                      href={`#/marketing/manage/buy_gift/detail?id=${cellProps.original.present_id}`}
                      open
                    />
                    <OperationDelete
                      title={t('警告')}
                      onClick={handleDel.bind(
                        this,
                        cellProps.original.present_id,
                      )}
                    >
                      {t('确定删除吗？')}
                    </OperationDelete>
                  </OperationCell>
                )
              },
            },
          ]}
        />
      </ManagePaginationV2>
    </BoxTable>
  )
})

export default List
