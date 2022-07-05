import { Price, ToolTip, Flex } from '@gmfe/react'
import React from 'react'
import { i18next } from 'gm-i18n'
import { getCategoryHeader } from '../common/util'
import { toJS } from 'mobx'
import { TableXUtil } from '@gmfe/table-x'
import Big from 'big.js'
import SupplierDel from 'common/components/supplier_del_sign'

const { SortHeader } = TableXUtil

const getColumns = (store) => {
  const {
    isSpuView,
    filter: { sort, sort_field },
  } = store
  const minWidth = 100
  // 按照商品查看
  if (isSpuView) {
    return [
      {
        minWidth,
        diyEnable: false,
        Header: i18next.t('供应商编号'),
        accessor: 'supplier_num',
        diyGroupName: i18next.t('基础字段'),
      },
      {
        minWidth,
        diyEnable: false,
        Header: (
          <div>
            {i18next.t('供应商名称')}
            {/* <SortHeader
              onClick={store.handleSortFn('supplier')}
              type={sort_field === 'supplier' ? sort_direction : null}
            /> */}
          </div>
        ),
        accessor: 'supplier_name',
        diyItemText: i18next.t('供应商名称'),
        diyGroupName: i18next.t('基础字段'),
        Cell: (cellProps) => {
          const { supplier_name, supplier_status } = cellProps.row.original

          return (
            <Flex>
              {supplier_status === 0 && <SupplierDel />}
              {supplier_name}
            </Flex>
          )
        },
      },
      {
        minWidth,
        Header: i18next.t('商品ID'),
        diyEnable: false,
        accessor: 'spu_id',
        diyGroupName: i18next.t('基础字段'),
      },
      {
        minWidth,
        Header: i18next.t('商品名'),
        diyEnable: false,
        accessor: 'spu_name',
        diyGroupName: i18next.t('基础字段'),
      },
      {
        minWidth,
        Header: i18next.t('商品分类'),
        accessor: 'category2_name',
        diyGroupName: i18next.t('基础字段'),
      },
      {
        minWidth,
        Header: i18next.t('入库数'),
        diyEnable: false,
        id: 'amount',
        diyGroupName: i18next.t('基础字段'),
        Cell: ({ row: { original } }) =>
          `${original.amount}${original.std_unit_name}`,
      },
      {
        minWidth,
        diyEnable: false,
        Header: (
          <Flex alignCenter>
            {i18next.t('入库均价')}
            <ToolTip
              center
              popup={
                <div className='gm-padding-5' style={{ width: '170px' }}>
                  {i18next.t(
                    '入库均价=入库金额/入库数，表明供应商对该商品的供货均价。',
                  )}
                </div>
              }
            />
          </Flex>
        ),
        id: 'avg_price',
        diyItemText: i18next.t('入库均价'),
        diyGroupName: i18next.t('基础字段'),
        Cell: ({ row: { original } }) =>
          `${original.avg_price}${Price.getUnit()}/${original.std_unit_name}`,
      },
      {
        minWidth,
        Header: i18next.t('入库金额'),
        diyEnable: false,
        id: 'money',
        diyGroupName: i18next.t('基础字段'),
        Cell: ({ row: { original } }) => `${original.money}${Price.getUnit()}`,
      },
      {
        minWidth,
        Header: i18next.t('入库金额（不含税）'),
        id: 'money_without_tax',
        diyGroupName: i18next.t('基础字段'),
        Cell: (cellProps) =>
          `${Big(cellProps.row.original.money_without_tax || 0).toFixed(
            2,
          )}${Price.getUnit()}`,
      },
      {
        minWidth,
        Header: i18next.t('进项税率'),
        id: 'tax_rate',
        diyGroupName: i18next.t('基础字段'),
        Cell: (cellProps) =>
          `${Big(cellProps.row.original.tax_rate || 0)
            .div(100)
            .toFixed(2)}%`,
      },
      {
        minWidth,
        Header: i18next.t('进项税额'),
        id: 'tax_money',
        diyGroupName: i18next.t('基础字段'),
        Cell: (cellProps) =>
          `${Big(cellProps.row.original.tax_money || 0).toFixed(
            2,
          )}${Price.getUnit()}`,
      },
    ]
  }

  // 按分类查看 表头分类是动态的 提供金额排序
  const categoryHeader = getCategoryHeader(toJS(store.list))
  return [
    {
      minWidth: 100,
      Header: i18next.t('供应商编号'),
      accessor: 'supplier_num',
      diyGroupName: i18next.t('基础字段'),
    },
    {
      minWidth: 100,
      Header: (
        // <SortHeader
        //   onClick={store.handleSortFn('supplier')}
        //   type={sort_field === 'supplier' ? sort_direction : null}
        // >
        // </SortHeader>
        <span>{i18next.t('供应商名称')}</span>
      ),
      accessor: 'supplier_name',
      diyItemText: i18next.t('供应商名称'),
      diyGroupName: i18next.t('基础字段'),
      Cell: (cellProps) => {
        const { supplier_name, supplier_status } = cellProps.row.original

        return (
          <Flex>
            {supplier_status === 0 && <SupplierDel />}
            {supplier_name}
          </Flex>
        )
      },
    },
    ...categoryHeader,
    {
      minWidth: 100,
      Header: (
        <SortHeader
          onClick={store.handleSortFn('value')}
          type={sort_field === 'value' ? sort : null}
        >
          {i18next.t('小计')}
        </SortHeader>
      ),
      id: 'total_money',
      Cell: ({ row: { original } }) =>
        `${original?.total_money}${Price.getUnit()}`,
      diyGroupName: i18next.t('基础字段'),
    },
  ]
}
export default getColumns
