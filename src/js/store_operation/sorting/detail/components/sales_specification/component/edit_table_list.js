import React from 'react'
import { BoxPanel } from '@gmfe/react'
import { i18next, t } from 'gm-i18n'
import {
  editTableXHOC,
  fixedColumnsTableXHOC,
  TableX,
  TableXUtil,
} from '@gmfe/table-x'
import { keyboardTableXHOC } from '@gmfe/keyboard'
import store from '../store/receipt_store'
import KeyBoardTips from 'common/components/key_board_tips'

import { observer } from 'mobx-react'
import globalStore from 'stores/global'

import BatchDetailCell from './batch_detail_cell'
import ProductNameCell from './product_name_cell'
import SaleQuantityCell from './sale_quantity_cell'
import TextAreaCell from './text_area_cell'
import OperationHeaderCell from './operation_header_cell'
import SaleRatioCell from './sale_ratio_cell'
import MoneyCell from './money_cell'
import CreatorCell from './creator_cell'
import TableNoCell from './table_no_cell'

import SalePriceCell from './sale_price_cell'
import TaxRateCell from './tax_rate_cell'
import TaxMoneyCell from './tax_money_cell'
import OutStockMoneyNoTaxCell from './out_stock_money_no_tax_cell'

const { OperationHeader, TABLE_X } = TableXUtil

const KeyboardEditFixedColumnsTableX = fixedColumnsTableXHOC(
  keyboardTableXHOC(editTableXHOC(TableX)),
)

// is_bind_order是指是否是自动生成的出库单
const EditTableList = observer((props) => {
  const { type } = props
  const { outStockList } = store

  const handleDetailAdd = () => {
    store.addOutStockListItem()
  }

  const handleDetailDel = (index) => {
    store.deleteOutStockListItem(index)
  }

  return (
    <BoxPanel title={t('商品明细')} collapse right={<KeyBoardTips />}>
      <KeyboardEditFixedColumnsTableX
        id='out_stock_table'
        data={outStockList.slice()}
        onAddRow={handleDetailAdd}
        columns={[
          {
            Header: t('序号'),
            accessor: 'num',
            fixed: 'left',
            width: TABLE_X.WIDTH_NO,
            Cell: (cellProps) => {
              return <TableNoCell index={cellProps.row.index} />
            },
          },
          {
            Header: OperationHeader,
            accessor: 'action',
            diyEnable: false,
            fixed: 'left',
            width: TABLE_X.WIDTH_OPERATION,
            Cell: (cellProps) => {
              const delDisable = outStockList.length === 1
              return (
                <OperationHeaderCell
                  onAddRow={handleDetailAdd}
                  delDisable={delDisable}
                  onDeleteRow={
                    delDisable
                      ? undefined
                      : () => handleDetailDel(cellProps.row.index)
                  }
                />
              )
            },
          },
          {
            Header: t('商品名'),
            accessor: 'name',
            isKeyboard: true,
            minWidth: 200,
            Cell: (cellProps) => {
              return <ProductNameCell index={cellProps.row.index} />
            },
          },
          {
            Header: t('规格'),
            accessor: 'sale_ratio',
            minWidth: 100,
            Cell: (cellProps) => {
              return <SaleRatioCell index={cellProps.row.index} />
            },
          },
          {
            Header: t('商品分类'),
            accessor: 'category',
            minWidth: 100,
            Cell: (cellProps) => (
              <TextAreaCell index={cellProps.row.index} field='category' />
            ),
          },
          {
            Header: t('出库数(销售单位)'),
            accessor: 'quantity',
            isKeyboard: true,
            minWidth: 160,
            Cell: (cellProps) => {
              return <SaleQuantityCell index={cellProps.row.index} />
            },
          },
          {
            Header: t('出库批次'),
            accessor: 'batch_details',
            minWidth: 120,
            show: globalStore.user.stock_method === 2,
            Cell: (cellProps) => {
              return <BatchDetailCell type={type} index={cellProps.row.index} />
            },
          },
          {
            Header: i18next.t('出库成本价'),
            accessor: 'sale_price',
            minWidth: 100,
            Cell: (cellProps) => {
              return <SalePriceCell index={cellProps.row.index} />
            },
          },
          {
            Header: i18next.t('成本金额'),
            accessor: 'money',
            minWidth: 120,
            Cell: (cellProps) => {
              return <MoneyCell index={cellProps.row.index} />
            },
          },
          {
            Header: i18next.t('成本金额（不含税）'),
            id: 'out_stock_money_no_tax',
            minWidth: 150,
            Cell: (cellProps) => (
              <OutStockMoneyNoTaxCell index={cellProps.row.index} />
            ),
          },
          {
            Header: i18next.t('销项税率'),
            id: 'tax_rate',
            minWidth: 120,
            Cell: (cellProps) => <TaxRateCell index={cellProps.row.index} />,
          },
          {
            Header: i18next.t('销项税额'),
            id: 'tax_money',
            minWidth: 120,
            Cell: (cellProps) => <TaxMoneyCell index={cellProps.row.index} />,
          },
          {
            Header: i18next.t('操作人'),
            accessor: 'creator',
            minWidth: 100,
            Cell: (cellProps) => {
              return <CreatorCell index={cellProps.row.index} />
            },
          },
        ]}
      />
    </BoxPanel>
  )
})

export default EditTableList
