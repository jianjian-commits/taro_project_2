import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { BoxPanel } from '@gmfe/react'
import { t } from 'gm-i18n'
import { store } from './store'
import { TableX } from '@gmfe/table-x'
import { isNumber } from 'common/util'
import { remarkType } from 'common/filter'
import _ from 'lodash'
import Big from 'big.js'
import {
  renderProductPercentageHeader,
  renderMaterielPercentageHeader,
} from '../../util'

@observer
class FinishList extends Component {
  columns = [
    {
      Header: t('生产成品'),
      accessor: 'sku_name',
    },
    {
      Header: t('计划生产数'),
      accessor: 'plan_amount',
      Cell: ({ row }) => {
        const { sale_unit_name } = row.original
        const num = isNumber(row.original.plan_amount)
          ? Big(row.original.plan_amount).toFixed(2) + sale_unit_name
          : '-'
        return <span>{num}</span>
      },
    },
    {
      Header: t('成品产出数量'),
      accessor: 'output_amount',
      Cell: ({ row }) => {
        const { sale_unit_name } = row.original
        const num = isNumber(row.original.output_amount)
          ? Big(row.original.output_amount).toFixed(2) + sale_unit_name
          : '-'
        return <span>{num}</span>
      },
    },
    {
      Header: renderProductPercentageHeader(),
      width: 92,
      id: '成品出成率',
      Cell: ({ row }) => {
        const { output_amount, std_unit_name, sale_ratio } = row.original
        const { finish_products } = store.details
        const real_amount_list = _.map(finish_products, (i) => {
          return i.ingredient_recv_amount - i.ingredient_return_amount
        })
        const total_real_amount = _.reduce(
          real_amount_list,
          (sum, num) => sum + num,
          0
        )
        const percentage =
          isNumber(total_real_amount) &&
          isNumber(output_amount) &&
          _.toNumber(total_real_amount) !== 0
            ? Big(output_amount)
                .times(sale_ratio)
                .div(total_real_amount)
                .times(100)
                .toFixed(2) + '%'
            : '-'
        const show = _.every(finish_products.slice(), {
          ingredient_std_unit_name: std_unit_name,
        })
        return <span>{show ? percentage : '-'}</span>
      },
    },
    {
      Header: t('物料名'),
      accessor: 'ingredient_name',
    },
    {
      Header: t('商品类型'),
      accessor: 'remark_type',
      Cell: ({ row: { original } }) => (
        <span>{remarkType(original.remark_type)}</span>
      ),
    },
    {
      Header: t('所需数量（基本单位）'),
      id: '所需数量(基本单位)',
      Cell: ({ row }) => {
        const {
          proportion,
          ingredient_std_unit_name,
          plan_amount,
        } = row.original
        const num =
          isNumber(proportion) && isNumber(plan_amount)
            ? Big(proportion).times(plan_amount).toFixed(2) +
              ingredient_std_unit_name
            : '-'
        return <span>{num}</span>
      },
    },
    {
      Header: t('所需数量（包装单位）'),
      id: '所需数量(包装单位)',
      Cell: ({ row }) => {
        const {
          sale_proportion,
          plan_amount,
          ingredient_sale_unit_name,
        } = row.original
        const num =
          isNumber(sale_proportion) && isNumber(plan_amount)
            ? Big(sale_proportion).times(plan_amount).toFixed(2) +
              ingredient_sale_unit_name
            : '-'
        return <span>{num}</span>
      },
    },
    {
      Header: t('领料数量'),
      accessor: 'ingredient_recv_amount',
      Cell: ({ row }) => {
        const { ingredient_std_unit_name } = row.original
        const num = isNumber(row.original.ingredient_recv_amount)
          ? Big(row.original.ingredient_recv_amount).toFixed(2) +
            ingredient_std_unit_name
          : '-'
        return <span>{num}</span>
      },
    },
    {
      Header: t('退料数量'),
      accessor: 'ingredient_return_amount',
      Cell: ({ row }) => {
        const { ingredient_std_unit_name } = row.original
        const num = isNumber(row.original.ingredient_return_amount)
          ? Big(row.original.ingredient_return_amount).toFixed(2) +
            ingredient_std_unit_name
          : '-'
        return <span>{num}</span>
      },
    },
    {
      Header: t('实际用料'),
      id: '实际用料',
      Cell: ({ row }) => {
        const {
          ingredient_recv_amount,
          ingredient_return_amount,
          ingredient_std_unit_name,
        } = row.original
        const num =
          isNumber(ingredient_recv_amount) && isNumber(ingredient_return_amount)
            ? Big(ingredient_recv_amount)
                .minus(ingredient_return_amount)
                .toFixed(2) + ingredient_std_unit_name
            : '-'
        return <span>{num}</span>
      },
    },
    {
      Header: t('物料产出数量'),
      accessor: 'ingredient_output_amount',
      Cell: ({ row }) => {
        const { ingredient_std_unit_name } = row.original
        const num = isNumber(row.original.ingredient_output_amount)
          ? Big(row.original.ingredient_output_amount).toFixed(2) +
            ingredient_std_unit_name
          : '-'
        return <span>{num}</span>
      },
    },
    {
      Header: renderMaterielPercentageHeader(-1),
      width: 92,
      id: '物料出成率',
      Cell: ({ row }) => {
        const {
          ingredient_recv_amount,
          ingredient_return_amount,
          ingredient_output_amount,
        } = row.original
        const num = ingredient_recv_amount - ingredient_return_amount
        const percentage =
          isNumber(num) &&
          isNumber(ingredient_output_amount) &&
          _.toNumber(num) !== 0
            ? Big(ingredient_output_amount).div(num).times(100).toFixed(2) + '%'
            : '-'
        return <span>{percentage}</span>
      },
    },
  ]

  render() {
    const { details } = store
    const { finish_products } = details
    return (
      <BoxPanel title={t('成品明细')} collapse>
        <TableX data={finish_products.slice()} columns={this.columns} />
      </BoxPanel>
    )
  }
}

export default FinishList
