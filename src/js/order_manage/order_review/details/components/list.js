import React, { Component } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { BoxPanel, Price } from '@gmfe/react'
import { TableX, diyTableXHOC, TableXUtil } from '@gmfe/table-x'

import store from '../store'
import defaultImg from 'img/product-default-gm.png'
import ViewPopoverRemark from 'common/components/view_popover_remark'

const { TABLE_X } = TableXUtil
const DiyTableX = diyTableXHOC(TableX)

@observer
class List extends Component {
  columns = [
    {
      Header: t('序号'),
      width: TABLE_X.WIDTH_NO,
      id: 'no',
      Cell: (cellProps) => cellProps.row.index + 1,
      diyGroupName: t('基础字段'),
    },
    {
      Header: t('商品图'),
      id: 'img',
      Cell: (cellProps) => {
        const { img, sku_id } = cellProps.row.original
        return <img src={img || defaultImg} alt={sku_id} width={60} />
      },
      diyGroupName: t('基础字段'),
    },
    { Header: t('商品ID'), accessor: 'sku_id', diyGroupName: t('基础字段') },
    { Header: t('商品名'), accessor: 'name', diyGroupName: t('基础字段') },
    {
      Header: t('规格'),
      id: 'ratio',
      diyGroupName: t('基础字段'),
      Cell: (cellProps) => {
        const {
          sale_ratio,
          std_unit_name_forsale,
          sale_unit_name,
        } = cellProps.row.original
        if (sale_unit_name === std_unit_name_forsale)
          return t('KEY6', { VAR1: sale_unit_name })
        return `${sale_ratio}${std_unit_name_forsale}/${sale_ratio}`
      },
    },
    {
      Header: t('分类'),
      accessor: 'category_name_2',
      diyGroupName: t('基础字段'),
    },
    {
      Header: t('含税单价(销售单位)'),
      accessor: 'std_sale_price_forsale',
      diyGroupName: t('基础字段'),
      Cell: (cellProps) => {
        const {
          std_sale_price_forsale,
          std_unit_name_forsale,
          fee_type,
        } = cellProps.row.original
        return `${std_sale_price_forsale}${Price.getUnit(
          fee_type,
        )}/${std_unit_name_forsale}`
      },
    },
    {
      Header: t('原下单数'),
      accessor: 'purchase_quantity.before',
      diyGroupName: t('基础字段'),
      Cell: (cellProps) => {
        const {
          purchase_quantity,
          std_unit_name_forsale,
        } = cellProps.row.original
        return `${purchase_quantity.before}${std_unit_name_forsale}`
      },
    },
    {
      Header: t('改后下单数'),
      accessor: 'purchase_quantity.after',
      diyGroupName: t('基础字段'),
      Cell: (cellProps) => {
        const {
          purchase_quantity,
          std_unit_name_forsale,
        } = cellProps.row.original
        return `${purchase_quantity.after}${std_unit_name_forsale}`
      },
    },
    {
      Header: t('原下单金额'),
      accessor: 'sale_money.before',
      diyGroupName: t('基础字段'),
      Cell: (cellProps) => {
        const { sale_money, fee_type } = cellProps.row.original
        return `${sale_money.before}${Price.getUnit(fee_type)}`
      },
    },
    {
      Header: t('改后下单金额'),
      accessor: 'sale_money.after',
      diyGroupName: t('基础字段'),
      Cell: (cellProps) => {
        const { sale_money, fee_type } = cellProps.row.original
        return `${sale_money.after}${Price.getUnit(fee_type)}`
      },
    },
    {
      Header: t('原备注'),
      accessor: 'remark.before',
      diyGroupName: t('基础字段'),
      Cell: ({ cell: { value } }) => {
        return <ViewPopoverRemark value={value} />
      },
    },
    {
      Header: t('改后备注'),
      accessor: 'remark.after',
      diyGroupName: t('基础字段'),
      Cell: ({ cell: { value } }) => {
        return <ViewPopoverRemark value={value} />
      },
    },
  ]

  render() {
    const { details } = store
    const { skus } = details

    return (
      <BoxPanel
        collapse
        title={t('订单明细')}
        summary={[{ text: t('商品列表'), value: skus.length }]}
      >
        <DiyTableX
          columns={this.columns}
          rowKey='id'
          data={skus.slice()}
          id='order_review_table'
          diyGroupSorting={[t('基础字段')]}
        />
      </BoxPanel>
    )
  }
}

export default List
