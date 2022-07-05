import React, { useEffect } from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { Table, selectTableV2HOC } from '@gmfe/table'
import store from '../store/receipt_store'
import { t } from 'gm-i18n'
import { Popover, Price } from '@gmfe/react'
import moment from 'moment'
import Big from 'big.js'
import HoverTips from './hover_tips'
import OutStockBaseCell from './out_stock_base_cell'

const SelectTable = selectTableV2HOC(Table)

const ShelfCell = observer((props) => {
  const { shelf_name } = store.batchList[props.index]
  const len = shelf_name ? shelf_name.length : 0

  if (Big(len).gt(7)) {
    return (
      <Popover
        showArrow
        component={<div />}
        type='hover'
        popup={<HoverTips text={shelf_name} />}
      >
        <p className='b-stock-in-shelf'>{shelf_name}</p>
      </Popover>
    )
  }
  return shelf_name || '-'
})

const BatchSelectTable = observer((props) => {
  const { batchList, currentBatchSelected, outStockList } = store
  const { index } = props

  useEffect(() => {
    return store.clearBatchList
  }, [])

  const handleSelect = (selected) => {
    store.changeBatchSelected(selected)
  }

  const handleSelectAll = (selectAll) => {
    store.changeBatchSelectAll(selectAll)
  }

  const { std_unit_name, clean_food } = outStockList[index]

  const isCleanFood = !!clean_food

  return (
    <div style={{ minHeight: '76vh' }}>
      <SelectTable
        data={batchList.slice()}
        keyField='batch_number'
        onSelectAll={handleSelectAll}
        selected={currentBatchSelected.slice()}
        onSelect={handleSelect}
        enableEmptyTip={t('当前没有可用的出库批次，请先进行入库操作')}
        columns={[
          {
            Header: t('入库时间'),
            accessor: 'in_stock_time',
            Cell: (cellProps) => {
              return moment(cellProps.original.in_stock_time).format(
                'YYYY-MM-DD',
              )
            },
          },
          {
            Header: t('成品批次'),
            show: isCleanFood,
            accessor: 'batch_number',
          },
          {
            Header: t('生产日期'),
            accessor: 'production_time',
          },
          {
            Header: t('保质期'),
            show: !isCleanFood,
            accessor: 'life_time',
          },
          {
            Header: t('供应商信息'),
            show: !isCleanFood,
            accessor: 'supplier_name',
            Cell: (cellProps) => {
              const { supplier_name, customer_id } = cellProps.original
              if (_.isNil(customer_id)) {
                return '-'
              }
              return `${supplier_name}(${customer_id})`
            },
          },
          {
            Header: t('批次号'),
            show: !isCleanFood,
            accessor: 'batch_number',
          },
          {
            Header: t('批次均价'),
            accessor: 'instock_unit_price',
            Cell: (cellProps) => {
              const { instock_unit_price } = cellProps.original
              return instock_unit_price + Price.getUnit() + '/' + std_unit_name
            },
          },
          {
            Header: t('货位名'),
            accessor: 'shelf_name',
            Cell: (cellProps) => {
              return <ShelfCell index={cellProps.index} />
            },
          },
          {
            Header: isCleanFood ? t('剩余库存(销售单位)') : t('剩余库存'),
            accessor: 'remain',
            Cell: (cellProps) => {
              const { remain, sale_unit_name } = cellProps.original

              return `${Big(remain).toFixed(2)}${
                isCleanFood ? sale_unit_name : std_unit_name
              }` // 净菜显示销售单位
            },
          },
          {
            Header: isCleanFood ? t('选择出库数(销售单位)') : t('选择出库数'),
            accessor: 'out_stock_base',
            Cell: (cellProps) => {
              return (
                <OutStockBaseCell index={cellProps.index} stockIndex={index} />
              )
            },
          },
        ]}
      />
    </div>
  )
})

export default BatchSelectTable
