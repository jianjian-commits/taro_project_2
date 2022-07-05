import React from 'react'
import { t } from 'gm-i18n'
import { observer, Observer } from 'mobx-react'
import { TableX } from '@gmfe/table-x'
import Big from 'big.js'

import store from './store'
import { isNumber } from 'common/util'
import { renderProductPercentageHeader } from '../util'

@observer
class ReportIngredientsList extends React.Component {
  componentDidMount() {
    store.getIngredientsList(this.props.location.query)
  }

  handleDetail = (id) => {
    window.open(`#/supply_chain/process/receipt/plan_detail?id=${id}`)
  }

  render() {
    const { ingredientsList } = store
    return (
      <>
        <Observer>
          {() => (
            <TableX
              data={ingredientsList.slice()}
              columns={[
                {
                  Header: t('计划编码'),
                  accessor: 'process_order_id',
                  Cell: ({ row: { original } }) => (
                    <a
                      onClick={this.handleDetail.bind(
                        this,
                        original.process_order_id
                      )}
                    >
                      {original.custom_id}
                    </a>
                  ),
                },
                {
                  Header: t('生成成品'),
                  accessor: 'name',
                  Cell: ({ row: { original } }) => (
                    <span>{`${original.name}（${original.sku_id}）`}</span>
                  ),
                },
                {
                  Header: t('销售规格'),
                  accessor: 'sale_unit_name',
                  Cell: ({ row: { original } }) => {
                    const { ratio, sale_unit_name, std_unit_name } = original
                    return (
                      <span>{`${ratio}${std_unit_name}/${sale_unit_name}`}</span>
                    )
                  },
                },
                {
                  Header: t('计划生产数（销售单位）'),
                  accessor: 'plan_amount',
                  Cell: ({ row: { original } }) => {
                    const { sale_unit_name } = original
                    const num = isNumber(original.plan_amount)
                      ? Big(original.plan_amount).toFixed(2) + sale_unit_name
                      : '-'
                    return <span>{num}</span>
                  },
                },
                {
                  Header: t('已完成数（销售单位）'),
                  accessor: 'finish_amount',
                  Cell: ({ row: { original } }) => {
                    const { sale_unit_name } = original
                    const num = isNumber(original.finish_amount)
                      ? Big(original.finish_amount).toFixed(2) + sale_unit_name
                      : '-'
                    return <span>{num}</span>
                  },
                },
                {
                  Header: renderProductPercentageHeader(-1),
                  accessor: 'product_percentage',
                  Cell: ({ row: { original } }) => {
                    const percentage = isNumber(original.product_percentage)
                      ? Big(original.product_percentage).times(100).toFixed(2) +
                        '%'
                      : '-'
                    return <span>{percentage}</span>
                  },
                },
              ]}
            />
          )}
        </Observer>
      </>
    )
  }
}

export default ReportIngredientsList
