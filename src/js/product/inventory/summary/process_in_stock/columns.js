import { Price, ToolTip, Flex } from '@gmfe/react'
import React from 'react'
import { i18next } from 'gm-i18n'
import { getCategoryHeader } from '../common/util'
import { toJS } from 'mobx'
import { TableXUtil } from '@gmfe/table-x'
import SupplierDel from 'common/components/supplier_del_sign'

const { SortHeader } = TableXUtil

const getColumns = (store) => {
  const {
    isSpuView,
    filter: { sort_direction, sort_field },
  } = store
  const minWidth = 100
  // 按照商品查看
  if (isSpuView) {
    return [
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
        <SortHeader
          onClick={store.handleSortFn('supplier')}
          type={sort_field === 'supplier' ? sort_direction : null}
        >
          {i18next.t('供应商名称')}
        </SortHeader>
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
          type={sort_field === 'value' ? sort_direction : null}
        >
          {i18next.t('小计')}
        </SortHeader>
      ),
      id: 'total_money',
      Cell: ({ row: { original } }) =>
        `${original.total_money}${Price.getUnit()}`,
      diyGroupName: i18next.t('基础字段'),
    },
  ]
}
export default getColumns
