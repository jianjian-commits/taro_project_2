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
      title={t('????????????')}
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
        diyGroupSorting={[t('????????????')]}
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
            Header: t('?????????'),
            accessor: 'num',
            diyEnable: false,
            diyGroupName: t('????????????'),
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
            diyGroupName: t('????????????'),
            Header: '??????ID',
            accessor: 'spu_id',
          },
          {
            show: false,
            minWidth: 80,
            diyGroupName: t('????????????'),
            Header: '??????ID',
            accessor: 'id',
          },
          {
            Header: (
              <span>
                {t('????????????')}
                <TableXUtil.SortHeader
                  type={sort_by === 'name' ? sort_direction : null}
                  onChange={(direction) => handleSort('name', direction)}
                />
              </span>
            ),
            minWidth: 160,
            diyEnable: false,
            diyItemText: t('????????????'),
            diyGroupName: t('????????????'),
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
                {t('????????????')}
                <TableXUtil.SortHeader
                  onChange={(direction) => handleSort('category', direction)}
                  type={sort_by === 'category' ? sort_direction : null}
                />
              </span>
            ),
            diyGroupName: t('????????????'),
            diyItemText: t('????????????'),
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
            Header: t('??????'),
            show: false,
            diyEnable: true,
            diyGroupName: t('????????????'),
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
                <span>{t('???????????????????????????')}</span>
                <ToolTip
                  popup={
                    <div className='gm-padding-5'>
                      {t('??????????????????????????? = ????????? - ??????')}
                    </div>
                  }
                />
              </div>
            ),
            accessor: 'quantity',
            diyGroupName: t('????????????'),
            diyEnable: false,
            minWidth: 130,
            Cell: ({ row }) => {
              const { spu_id, quantity, std_unit } = row.original

              return isValid(spu_id) ? quantity + std_unit : '-'
            },
          },
          {
            Header: <RefCostSelect />,
            diyItemText: '????????????',
            accessor: 'ref_price',
            minWidth: 90,
            diyGroupName: t('????????????'),
            show: false,
            // eslint-disable-next-line react/prop-types
            Cell: ({ row }) => {
              // eslint-disable-next-line react/prop-types
              return <RefCostCell index={row.index} />
            },
          },
          {
            Header: t('??????????????????????????????'),
            accessor: 'std_unit_price',
            diyEnable: false,
            diyGroupName: t('????????????'),
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
            Header: t('??????'),
            accessor: 'different_price',
            minWidth: 100,
            diyGroupName: t('????????????'),
            Cell: ({ row }) => {
              const { spu_id, different_price } = row.original

              return isValid(spu_id)
                ? Big(different_price || 0).toFixed(2) + Price.getUnit()
                : '-'
            },
          },
          {
            show: false,
            Header: t('???????????????????????????'),
            diyGroupName: t('????????????'),
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
            Header: t('??????????????????????????????'),
            diyGroupName: t('????????????'),
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
            Header: t('????????????'),
            accessor: 'money',
            diyEnable: false,
            diyGroupName: t('????????????'),
            minWidth: 100,
            Cell: ({ row }) => {
              const { spu_id, money } = row.original

              return isValid(spu_id)
                ? Big(money || 0).toFixed(2) + Price.getUnit()
                : '-'
            },
          },
          {
            Header: t('???????????????????????????'),
            accessor: 'instock_money_no_tax',
            diyGroupName: t('????????????'),
            minWidth: 140,
            Cell: ({ row }) => {
              const { instock_money_no_tax: value } = row.original
              return value ? Big(value).toFixed(2) + Price.getUnit() : '-'
            },
          },
          {
            Header: t('????????????'),
            minWidth: 100,
            diyGroupName: t('????????????'),
            accessor: 'tax_rate',
            Cell: ({ row }) =>
              `${Big(row.original.tax_rate || 0)
                .div(100)
                .toFixed(2)}%`,
          },
          {
            Header: t('????????????'),
            minWidth: 100,
            diyGroupName: t('????????????'),
            accessor: 'tax_money',
            Cell: ({ row }) =>
              `${row.original.tax_money || 0}${Price.getUnit()}`,
          },
          isFIFO && {
            Header: t('????????????'),
            minWidth: 100,
            diyGroupName: t('????????????'),
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
            Header: t('?????????'),
            minWidth: 100,
            diyGroupName: t('????????????'),
            accessor: 'shelf_life',
            show: isFIFO,
            diyEnable: isFIFO,
            Cell: ({ row }) => {
              const { production_time, life_time } = row.original

              return isValid(production_time) && isValid(life_time)
                ? moment(life_time).diff(production_time, 'day') + t('???')
                : '-'
            },
          },
          isFIFO && {
            Header: t('?????????'),
            minWidth: 100,
            diyGroupName: t('????????????'),
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
            Header: t('????????????'),
            minWidth: 100,
            diyGroupName: t('????????????'),
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
            Header: t('?????????'),
            minWidth: 80,
            diyGroupName: t('????????????'),
            accessor: 'operator',
          },
          {
            show: true,
            Header: t('????????????'),
            minWidth: 80,
            diyGroupName: t('????????????'),
            accessor: 'is_arrival',
            // eslint-disable-next-line react/prop-types
            Cell: ({ row }) => {
              // 1 ?????????????????? 0 ?????????
              return (
                // eslint-disable-next-line react/prop-types
                <div>{row.original.is_arrival ? t('?????????') : '-'}</div> // ?????? status ???????????? 1???1 ???????????????????????????????????????
              )
            },
          },
          {
            show: false,
            minWidth: 100,
            diyGroupName: t('????????????'),
            Header: t('????????????'),
            accessor: 'remark',
          },
        ].filter((item) => item)} // diy ??????????????????????????????
      />
    </BoxPanel>
  )
})

export default StockInListDetail
