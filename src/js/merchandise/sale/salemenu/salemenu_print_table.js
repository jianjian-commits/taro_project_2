import React from 'react'
import { i18next } from 'gm-i18n'
import _ from 'lodash'
import { Price } from '@gmfe/react'
import styles from './print.module.less'
import Big from 'big.js'

class SalemenuPrintTable extends React.Component {
  render() {
    const { data, type } = this.props
    const columns = [
      {
        name: '序号',
        filed: 'index',
        accessor: (item, index) => {
          return index * 2 + type
        },
      },
      {
        name: '商品名称',
        filed: 'sku_name',
      },
      {
        name: '规格',
        filed: 'sale_ratio',
        accessor: (item, index) => {
          return `${item.sale_ratio} ${item.std_unit_name_forsale}/${item.sale_unit_name}`
        },
      },
      {
        name: '销售价',
        filed: 'sale_price',
        accessor: (item, index) => {
          return item.is_price_timing
            ? i18next.t('时价')
            : `${Big(item.sale_price).div(100).toFixed(2)} ${Price.getUnit(
                item.fee_type
              )}/${item.sale_unit_name}`
        },
      },
    ]
    return (
      <table className={styles.gridtable} style={{ width: '50%' }}>
        <thead>
          <tr>
            {_.map(columns, (column) => (
              <th key={column.filed}>{column.name}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {_.map(data, (item, index) => (
            <tr key={item.sku_id}>
              {_.map(columns, (column) => (
                <td key={`${item.sku_id}-${column.filed}`}>
                  {column.accessor
                    ? column.accessor(item, index)
                    : item[column.filed]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )
  }
}

export default SalemenuPrintTable
