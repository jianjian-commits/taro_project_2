import React from 'react'
import { observer } from 'mobx-react'
import store from '../store/receipt_store'
import { BoxPanel, Popover, Price } from '@gmfe/react'
import { TableX, fixedColumnsTableXHOC, diyTableXHOC } from '@gmfe/table-x'
import KeyBoardTips from 'common/components/key_board_tips'
import { t } from 'gm-i18n'
import TableNoCell from './table_no_cell'
import SaleRatioCell from './sale_ratio_cell'
import { isNumber } from 'common/util'
import globalStore from 'stores/global'
import _ from 'lodash'
import Big from 'big.js'
import SalePriceCell from './sale_price_cell'
import MoneyCell from './money_cell'
import CreatorCell from './creator_cell'
import BatchDetailCell from './batch_detail_cell'

const FixedColumnsDiyTableX = fixedColumnsTableXHOC(diyTableXHOC(TableX))

const DetailTableList = observer((props) => {
  const { type } = props
  const {
    outStockList,
    outStockDetail: { status },
  } = store

  const batchTips = (rowData) => {
    const { batch_details, std_unit_name, sale_unit_name, clean_food } = rowData
    return (
      <div
        className='gm-padding-10 gm-bg'
        style={{ color: '#333', width: '350px' }}
      >
        {_.map(batch_details, (batch, index) => (
          <p key={index}>
            {
              t('KEY192', {
                VAR1: batch.batch_number,
                VAR2: clean_food
                  ? Big(batch.out_stock_base || 0).toFixed(4)
                  : batch.out_stock_base, // out_stock_base为批次填写时的值，填的时候是基本单位就是基本单位，是销售单位就是销售单位，不需要换算。以免多次保存时换算的值不同。
                VAR3: clean_food ? sale_unit_name : std_unit_name,
              }) /* src:batch.batch_number + '：出库' + batch.out_stock_base + std_unit_name => tpl:${VAR1}：出库${VAR2}${VAR3} */
            }
          </p>
        ))}
      </div>
    )
  }
  return (
    <BoxPanel title={t('商品明细')} collapse right={<KeyBoardTips />}>
      <FixedColumnsDiyTableX
        id='product_details'
        diyGroupSorting={[t('基础字段')]}
        data={outStockList.slice()}
        columns={[
          {
            Header: t('序号'),
            accessor: 'num',
            fixed: 'left',
            width: 100,
            diyGroupName: t('基础字段'),
            Cell: (cellProps) => {
              return <TableNoCell index={cellProps.row.index} />
            },
          },
          {
            Header: t('商品名'),
            diyEnable: false,
            accessor: 'name',
            minWidth: 130,
            diyGroupName: t('基础字段'),
          },
          {
            Header: t('规格'),
            accessor: 'sale_ratio',
            diyEnable: false,
            minWidth: 100,
            diyGroupName: t('基础字段'),
            Cell: (cellProps) => {
              return <SaleRatioCell index={cellProps.row.index} />
            },
          },
          {
            Header: t('商品分类'),
            accessor: 'category',
            minWidth: 100,
            diyGroupName: t('基础字段'),
          },
          {
            Header: t('出库数(销售单位)'),
            accessor: 'quantity_sale',
            minWidth: 160,
            diyGroupName: t('基础字段'),

            Cell: (cellProps) => {
              const {
                original: { quantity, sale_unit_name },
              } = cellProps.row
              return isNumber(quantity) && sale_unit_name
                ? quantity + sale_unit_name
                : '-'
            },
          },
          globalStore.user.stock_method === 2 && {
            Header: t('出库批次'),
            accessor: 'batch_details',
            minWidth: 120,
            diyGroupName: t('基础字段'),

            Cell: (cellProps) => {
              const { batch_details } = cellProps.row.original

              return status === 1 ? (
                <BatchDetailCell type={type} index={cellProps.row.index} />
              ) : batch_details.length > 0 ? (
                <div>
                  <Popover
                    showArrow
                    component={<div />}
                    type='hover'
                    popup={batchTips(cellProps.row.original)}
                  >
                    <span style={{ color: '#2182CC' }}>{t('查看批次')}</span>
                  </Popover>
                </div>
              ) : (
                '-'
              )
            },
          },
          {
            Header: t('出库数(基本单位)'),
            accessor: 'real_std_count',
            diyEnable: false,
            minWidth: 120,
            diyGroupName: t('基础字段'),
            Cell: (cellProps) => {
              const {
                original: { std_unit_name, real_std_count },
              } = cellProps.row

              // 由于只在自动生成的出库单和不可编辑的详情页才显示，因此这里直接使用real_std_count就好，不需要计算
              const amount = parseFloat(Big(real_std_count || 0).toFixed(2))

              return isNumber(amount) && std_unit_name
                ? amount + std_unit_name
                : '-'
            },
          },
          {
            Header: t('出库成本价'),
            diyEnable: false,
            accessor: 'sale_price',
            minWidth: 100,
            diyGroupName: t('基础字段'),

            Cell: (cellProps) => {
              return <SalePriceCell index={cellProps.row.index} />
            },
          },
          {
            Header: t('成本金额'),
            diyEnable: false,
            accessor: 'money',
            minWidth: 120,
            diyGroupName: t('基础字段'),

            Cell: (cellProps) => {
              return <MoneyCell index={cellProps.row.index} />
            },
          },
          {
            Header: t('成本金额（不含税）'),
            accessor: 'out_stock_money_no_tax',
            minWidth: 160,
            diyGroupName: t('基础字段'),
            Cell: (cellProps) => {
              const { out_stock_money_no_tax } = cellProps.row.original
              if (_.isNil(out_stock_money_no_tax)) {
                return '-'
              }
              return `${Big(out_stock_money_no_tax)
                .div(100)
                .toFixed(2)}${Price.getUnit()}`
            },
          },
          {
            Header: t('销项税率'),
            accessor: 'tax_rate',
            minWidth: 120,
            diyGroupName: t('基础字段'),
            Cell: (cellProps) => {
              const { tax_rate } = cellProps.row.original
              if (_.isNil(tax_rate)) {
                return '-'
              }
              return `${Big(tax_rate).div(100).toFixed(2)}%`
            },
          },
          {
            Header: t('销项税额'),
            accessor: 'tax_money',
            diyGroupName: t('基础字段'),
            minWidth: 120,
            Cell: (cellProps) => {
              const { tax_money } = cellProps.row.original
              if (_.isNil(tax_money)) {
                return '-'
              }
              return `${Big(tax_money).div(100).toFixed(2)}${Price.getUnit()}`
            },
          },
          {
            Header: t('操作人'),
            accessor: 'creator',
            minWidth: 100,
            diyGroupName: t('基础字段'),

            Cell: (cellProps) => {
              return <CreatorCell index={cellProps.row.index} />
            },
          },
        ].filter((item) => item)}
      />
    </BoxPanel>
  )
})

export default DetailTableList
