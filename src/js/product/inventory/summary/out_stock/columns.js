import { Price, Flex, ToolTip } from '@gmfe/react'
import React from 'react'
import { i18next } from 'gm-i18n'
import { getCategoryHeader } from '../common/util'
import { toJS } from 'mobx'
import { convertNumber2Sid } from 'common/filter'
import { TableXUtil } from '@gmfe/table-x'
import Big from 'big.js'

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
        Header: i18next.t('商户ID'),
        diyEnable: false,
        id: 'restaurant_id',
        diyGroupName: i18next.t('基础字段'),
        Cell: ({ row: { original } }) =>
          convertNumber2Sid(original.restaurant_id),
      },
      {
        minWidth,
        diyEnable: false,
        Header: (
          <div>
            {i18next.t('商户名称')}
            {/* <SortHeader
              onClick={store.handleSortFn('restaurant')}
              type={sort_field === 'restaurant' ? sort_direction : null}
            /> */}
          </div>
        ),
        accessor: 'restaurant_name',
        diyGroupName: i18next.t('基础字段'),
      },
      {
        minWidth,
        diyEnable: false,
        Header: i18next.t('商品ID'),
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
        Header: i18next.t('出库数'),
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
            {i18next.t('出库均价')}
            <ToolTip
              center
              popup={
                <div className='gm-padding-5' style={{ width: '170px' }}>
                  {i18next.t('出库均价=出库金额/出库数')}
                </div>
              }
            />
          </Flex>
        ),
        id: 'avg_price',
        diyItemText: i18next.t('出库均价'),
        diyGroupName: i18next.t('基础字段'),
        Cell: ({ row: { original } }) =>
          `${original.avg_price}${Price.getUnit()}/${original.std_unit_name}`,
      },
      {
        minWidth,
        diyEnable: false,
        Header: i18next.t('成本金额'),
        id: 'money',
        diyGroupName: i18next.t('基础字段'),
        Cell: ({ row: { original } }) => `${original.money}${Price.getUnit()}`,
      },
      {
        minWidth,
        Header: i18next.t('出库金额（不含税）'),
        id: 'money_without_tax',
        diyGroupName: i18next.t('基础字段'),
        Cell: (cellProps) =>
          `${Big(cellProps.row.original.money_without_tax || 0).toFixed(
            2,
          )}${Price.getUnit()}`,
      },
      {
        minWidth,
        Header: i18next.t('销项税率'),
        id: 'tax_rate',
        diyGroupName: i18next.t('基础字段'),
        Cell: (cellProps) =>
          `${Big(cellProps.row.original.tax_rate || 0)
            .div(100)
            .toFixed(2)}%`,
      },
      {
        minWidth,
        Header: i18next.t('销项税额'),
        id: 'tax_money',
        diyGroupName: i18next.t('基础字段'),
        Cell: (cellProps) =>
          `${Big(cellProps.row.original.tax_money || 0).toFixed(2)}`,
      },
    ]
  }

  // 按分类查看 表头分类是动态的 提供金额排序
  const categoryHeader = getCategoryHeader(toJS(store.list))
  return [
    {
      minWidth,
      Header: i18next.t('商户ID'),
      id: 'restaurant_id',
      diyGroupName: i18next.t('基础字段'),
      Cell: ({ row: { original } }) =>
        convertNumber2Sid(original.restaurant_id),
    },
    {
      minWidth,
      Header: (
        //
        <>{i18next.t('商户名称')}</>
        // <SortHeader
        //   onClick={store.handleSortFn('restaurant')}
        //   type={sort_field === 'restaurant' ? sort : null}
        // >
        // </SortHeader>
      ),
      accessor: 'restaurant_name',
      diyGroupName: i18next.t('基础字段'),
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
      diyGroupName: i18next.t('基础字段'),
      Cell: ({ row: { original } }) =>
        `${original.total_money}${Price.getUnit()}`,
    },
  ]
}
export default getColumns
