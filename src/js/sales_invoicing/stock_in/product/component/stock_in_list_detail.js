import React, { useCallback, useRef, useState } from 'react'
import { observer } from 'mobx-react'
import { BoxPanel, Popover, Price, ToolTip } from '@gmfe/react'
import globalStore from '../../../../stores/global'
import Big from 'big.js'
import StockInPriceWarning from './stock_in_price_warning'
import moment from 'moment'
import { t } from 'gm-i18n'
import { diyTableXHOC, TableXVirtualized, TableXUtil } from '@gmfe/table-x'
import _ from 'lodash'
import store from '../store/receipt_store'
import BatchPopover from './batch_popover'
import DeletedProduct from './deleted_product'
import PriceTrend from './price_trend'
import HoverTips from './hover_tips'
import { isValid } from '../../util'
import RefCostSelect from './ref_cost_header_select_cell'
import RefCostCell from './ref_cost_cell'
import PropTypes from 'prop-types'
import Summary from './summary'

const DiyTableVirtualized = diyTableXHOC(TableXVirtualized)
const { TABLE_X } = TableXUtil

const ShelfCell = observer((props) => {
  const { shelf_name } = store.stockInReceiptList[props.index]
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

ShelfCell.propTypes = {
  index: PropTypes.number.isRequired,
}

const ProductNameCell = observer((props) => {
  const { index } = props
  const { spu_status } = store.stockInReceiptList[index]

  return (
    <>
      <PriceTrend index={index} type='detail' />

      {spu_status === 0 && <DeletedProduct />}
    </>
  )
})

ProductNameCell.propTypes = {
  index: PropTypes.number.isRequired,
}

const StockInListDetail = observer(() => {
  const {
    stockInReceiptList,
    sortItem: { sort_by, sort_direction },
  } = store

  const { stock_method } = globalStore.user
  const tableRef = useRef()
  const [highlightIndex, setHighlightIndex] = useState()
  const canGetShelf = globalStore.hasPermission('get_shelf')
  const isFIFO = stock_method === 2

  const handleHighlight = useCallback((index) => {
    setHighlightIndex(index)
  }, [])

  const handleSort = (name, direction) => {
    store.sortStockInReceiptList(name, direction)
  }

  return (
    <BoxPanel
      icon='bill'
      title={t('商品明细')}
      summary={
        <Summary handleHighlight={handleHighlight} tableRef={tableRef} />
      }
      collapse
    >
      <DiyTableVirtualized
        refVirtualized={tableRef}
        isTrHighlight={(_, index) => index === highlightIndex}
        virtualizedHeight={
          TABLE_X.HEIGHT_HEAD_TR +
          Math.min(10, stockInReceiptList.length) * TABLE_X.HEIGHT_TR
        }
        virtualizedItemSize={TABLE_X.HEIGHT_TR}
        id='in_stock_table_detail'
        diyGroupSorting={[t('基础字段')]}
        data={stockInReceiptList.slice()}
        getTrProps={(state, rowInfo) => {
          return {
            className:
              _.get(rowInfo, 'original.spu_status') === 0 &&
              'b-sheet-item-disable',
          }
        }}
        columns={[
          {
            Header: t('批次号'),
            accessor: 'num',
            diyEnable: false,
            diyGroupName: t('基础字段'),
            minWidth: 60,
            // eslint-disable-next-line react/prop-types
            Cell: ({ row }) => {
              // eslint-disable-next-line react/prop-types
              return <BatchPopover index={row.index} />
            },
          },
          {
            show: false,
            minWidth: 80,
            diyGroupName: t('基础字段'),
            Header: '商品ID',
            accessor: 'spu_id',
          },
          {
            show: false,
            minWidth: 80,
            diyGroupName: t('基础字段'),
            Header: '规格ID',
            accessor: 'id',
          },
          {
            Header: (
              <span>
                {t('商品名称')}
                <TableXUtil.SortHeader
                  type={sort_by === 'name' ? sort_direction : null}
                  onChange={(direction) => handleSort('name', direction)}
                />
              </span>
            ),
            minWidth: 160,
            diyEnable: false,
            diyItemText: t('商品名称'),
            diyGroupName: t('基础字段'),
            accessor: 'name',
            // eslint-disable-next-line react/prop-types
            Cell: ({ row }) => {
              // eslint-disable-next-line react/prop-types
              return <ProductNameCell index={row.index} />
            },
          },
          {
            Header: (
              <span>
                {t('商品分类')}
                <TableXUtil.SortHeader
                  onChange={(direction) => handleSort('category', direction)}
                  type={sort_by === 'category' ? sort_direction : null}
                />
              </span>
            ),
            diyGroupName: t('基础字段'),
            diyItemText: t('商品分类'),
            minWidth: 120,
            accessor: 'category',
            Cell: (cellProps) => {
              const {
                category_name_1,
                category_name_2,
              } = cellProps.row.original
              return category_name_1 + '/' + category_name_2
            },
          },
          {
            Header: t('皮重'),
            show: false,
            diyEnable: true,
            diyGroupName: t('基础字段'),
            accessor: 'tare_quantity',
            minWidth: 190,
            Cell: ({ row }) => {
              const { std_unit, tare_quantity } = row.original
              return tare_quantity ? tare_quantity + std_unit : '-'
            },
          },
          {
            Header: (
              <div>
                <span>{t('入库数（基本单位）')}</span>
                <ToolTip
                  popup={
                    <div className='gm-padding-5'>
                      {t('入库数（基本单位） = 读磅数 - 皮重')}
                    </div>
                  }
                />
              </div>
            ),
            accessor: 'quantity',
            diyGroupName: t('基础字段'),
            diyEnable: false,
            minWidth: 130,
            Cell: ({ row }) => {
              const { spu_id, quantity, std_unit } = row.original

              return isValid(spu_id) ? quantity + std_unit : '-'
            },
          },
          {
            Header: <RefCostSelect />,
            diyItemText: '参考成本',
            accessor: 'ref_price',
            minWidth: 90,
            diyGroupName: t('基础字段'),
            show: false,
            // eslint-disable-next-line react/prop-types
            Cell: ({ row }) => {
              // eslint-disable-next-line react/prop-types
              return <RefCostCell index={row.index} />
            },
          },
          {
            Header: t('入库单价（基本单位）'),
            accessor: 'std_unit_price',
            diyEnable: false,
            diyGroupName: t('基础字段'),
            minWidth: 140,
            // eslint-disable-next-line react/prop-types
            Cell: ({ row }) => {
              const {
                // eslint-disable-next-line react/prop-types
                unit_price,
                // eslint-disable-next-line react/prop-types
                std_unit,
                // eslint-disable-next-line react/prop-types
                supplier_stock_avg_price,
                // eslint-disable-next-line react/prop-types
              } = row.original

              return (
                <div>
                  {isValid(unit_price)
                    ? unit_price + Price.getUnit() + '/' + std_unit
                    : '-'}
                  {Big(supplier_stock_avg_price || 0).lt(unit_price || 0) && (
                    // eslint-disable-next-line react/prop-types
                    <StockInPriceWarning index={row.index} />
                  )}
                </div>
              )
            },
          },
          {
            Header: t('补差'),
            accessor: 'different_price',
            minWidth: 100,
            diyGroupName: t('基础字段'),
            Cell: ({ row }) => {
              const { spu_id, different_price } = row.original

              return isValid(spu_id)
                ? Big(different_price || 0).toFixed(2) + Price.getUnit()
                : '-'
            },
          },
          {
            show: false,
            Header: t('入库数（包装单位）'),
            diyGroupName: t('基础字段'),
            accessor: 'purchase_unit_quantity',
            minWidth: 130,
            Cell: ({ row }) => {
              const {
                spu_id,
                purchase_unit_quantity,
                purchase_unit,
              } = row.original

              return isValid(spu_id)
                ? `${purchase_unit_quantity}${purchase_unit}`
                : '-'
            },
          },
          {
            show: false,
            minWidth: 150,
            Header: t('入库单价（包装单位）'),
            diyGroupName: t('基础字段'),
            accessor: 'purchase_unit_price',
            Cell: ({ row }) => {
              const {
                spu_id,
                purchase_unit_price,
                purchase_unit,
              } = row.original

              return isValid(spu_id)
                ? `${purchase_unit_price}${Price.getUnit()}/${purchase_unit}`
                : '-'
            },
          },
          {
            Header: t('入库金额'),
            accessor: 'money',
            diyEnable: false,
            diyGroupName: t('基础字段'),
            minWidth: 100,
            Cell: ({ row }) => {
              const { spu_id, money } = row.original

              return isValid(spu_id)
                ? Big(money || 0).toFixed(2) + Price.getUnit()
                : '-'
            },
          },
          {
            Header: t('入库金额（不含税）'),
            accessor: 'instock_money_no_tax',
            diyGroupName: t('基础字段'),
            minWidth: 140,
            Cell: ({ row }) => {
              const { instock_money_no_tax: value } = row.original
              return value ? Big(value).toFixed(2) + Price.getUnit() : '-'
            },
          },
          {
            Header: t('进项税率'),
            minWidth: 100,
            diyGroupName: t('基础字段'),
            accessor: 'tax_rate',
            Cell: ({ row }) =>
              `${Big(row.original.tax_rate || 0)
                .div(100)
                .toFixed(2)}%`,
          },
          {
            Header: t('进项税额'),
            minWidth: 100,
            diyGroupName: t('基础字段'),
            accessor: 'tax_money',
            Cell: ({ row }) =>
              `${row.original.tax_money || 0}${Price.getUnit()}`,
          },
          isFIFO && {
            Header: t('生产日期'),
            minWidth: 100,
            diyGroupName: t('基础字段'),
            accessor: 'production_time',
            show: isFIFO,
            diyEnable: isFIFO,
            Cell: ({ row }) => {
              const { production_time } = row.original

              return isValid(production_time)
                ? moment(production_time).format('YYYY-MM-DD')
                : '-'
            },
          },
          isFIFO && {
            Header: t('保质期'),
            minWidth: 100,
            diyGroupName: t('基础字段'),
            accessor: 'shelf_life',
            show: isFIFO,
            diyEnable: isFIFO,
            Cell: ({ row }) => {
              const { production_time, life_time } = row.original

              return isValid(production_time) && isValid(life_time)
                ? moment(life_time).diff(production_time, 'day') + t('天')
                : '-'
            },
          },
          isFIFO && {
            Header: t('到期日'),
            minWidth: 100,
            diyGroupName: t('基础字段'),
            accessor: 'life_time',
            show: isFIFO,
            diyEnable: isFIFO,
            Cell: ({ row }) => {
              const { life_time } = row.original

              return isValid(life_time)
                ? moment(life_time).format('YYYY-MM-DD')
                : '-'
            },
          },
          canGetShelf && {
            Header: t('存放货位'),
            minWidth: 100,
            diyGroupName: t('基础字段'),
            accessor: 'shelf_name',
            diyEnable: canGetShelf,
            show: canGetShelf,
            // eslint-disable-next-line react/prop-types
            Cell: ({ row }) => {
              // eslint-disable-next-line react/prop-types
              return <ShelfCell index={row.index} />
            },
          },
          {
            Header: t('操作人'),
            minWidth: 80,
            diyGroupName: t('基础字段'),
            accessor: 'operator',
          },
          {
            show: true,
            Header: t('到货状态'),
            minWidth: 80,
            diyGroupName: t('基础字段'),
            accessor: 'is_arrival',
            // eslint-disable-next-line react/prop-types
            Cell: ({ row }) => {
              // 1 已标记到货， 0 未到货
              return (
                // eslint-disable-next-line react/prop-types
                <div>{row.original.is_arrival ? t('已到货') : '-'}</div> // 在此 status 肯定不为 1，1 的时候显示的是标记到货按钮
              )
            },
          },
          {
            show: false,
            minWidth: 100,
            diyGroupName: t('基础字段'),
            Header: t('商品备注'),
            accessor: 'remark',
          },
        ].filter((item) => item)} // diy 是否显示用剔除来处理
      />
    </BoxPanel>
  )
})

export default StockInListDetail
