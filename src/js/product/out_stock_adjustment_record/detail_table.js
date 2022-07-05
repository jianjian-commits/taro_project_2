import { i18next } from 'gm-i18n'
import React from 'react'
import { Price } from '@gmfe/react'
import store from './store'
import { Table } from '@gmfe/table'
import { observer } from 'mobx-react'
import _ from 'lodash'
import Big from 'big.js'
import globalStore from '../../stores/global'

@observer
class DetailTable extends React.Component {
  render() {
    const { detail } = store
    const stockMethod = globalStore.user.stock_method // 进销存计算方式： 1 加权平均    2 先进先出
    const columns = [
      {
        Header: i18next.t('销售规格ID'),
        accessor: 'sku_id',
      },
      {
        Header: i18next.t('商品名称'),
        accessor: 'name',
      },
      {
        Header: i18next.t('规格'),
        id: 'ratio',
        Cell: ({ original }) => {
          const { ratio, std_unit, sale_unit } = original
          return (
            <div>{`${ratio || '-'}${std_unit || '-'}/${sale_unit || '-'}`}</div>
          )
        },
      },
      {
        Header: i18next.t('商品分类'),
        accessor: 'category_2_name',
      },
      {
        Header: i18next.t('出库数（销售单位）'),
        id: 'sale_quantity',
        Cell: ({ original }) => {
          const { sale_quantity, sale_unit } = original
          return <div>{`${sale_quantity || '-'}${sale_unit || '-'}`}</div>
        },
      },
      {
        Header: i18next.t('出库批次号'),
        accessor: 'batch_number',
      },
      {
        Header: i18next.t('关联出库单号'),
        accessor: 'order_id',
      },
      {
        Header: i18next.t('出库数（基本单位）'),
        id: 'unit_quantity',
        Cell: ({ original }) => {
          const { unit_quantity, std_unit } = original
          return <div>{`${unit_quantity || '-'}${std_unit || '-'}`}</div>
        },
      },
      {
        Header: i18next.t('调整前单价'),
        id: 'old_price',
        Cell: ({ original }) => {
          const { old_price, std_unit } = original
          return (
            <div>{`${old_price || '-'}${Price.getUnit()}/${
              std_unit || '-'
            }`}</div>
          )
        },
      },
      {
        Header: i18next.t('调整后单价'),
        id: 'new_price',
        Cell: ({ original }) => {
          const { new_price, std_unit } = original
          return (
            <div>{`${new_price || '-'}${Price.getUnit()}/${
              std_unit || '-'
            }`}</div>
          )
        },
      },
      {
        Header: i18next.t('调整差异'),
        id: 'difference_price',
        Cell: ({ original }) => {
          const { new_price, old_price, std_unit } = original
          return (
            <div>{`${parseFloat(
              Big(new_price || 0)
                .minus(old_price || 0)
                .toFixed(2)
            )}${Price.getUnit()}/${std_unit || '-'}`}</div>
          )
        },
      },
      {
        Header: i18next.t('操作人'),
        accessor: 'operator',
      },
    ]

    const newColumns = _.filter(columns, (column) => {
      if (+stockMethod === 1) {
        return column.accessor !== 'batch_number'
      }
      return true
    })

    return <Table data={detail.details} columns={newColumns} />
  }
}

export default DetailTable
