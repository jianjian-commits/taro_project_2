import React from 'react'
import PropTypes from 'prop-types'
import { EditTable } from '@gmfe/table'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import _ from 'lodash'

import store from '../../store'

const initAmountField = (index, min, max, len) => {
  if (index === len - 1) return `≥${min}`
  if (index === 0) return `<${max}`
  return `${min}~${max}`
}

const TieredPriceTable = observer((props) => {
  const { priceUnit, sale_unit_name } = props

  return (
    <EditTable
      className='gm-border'
      style={{ width: '100%' }}
      id='tiered_price_table'
      data={store.step_price_table.slice()}
      columns={_.without(
        [
          {
            id: 'amount',
            // accessor: 'amount',
            width: 120,
            Header: t(`数量（${sale_unit_name}）`),
            Cell: (cellProps) => {
              const max = cellProps.original.max
              const min = cellProps.original.min
              return initAmountField(
                cellProps.index,
                min,
                max,
                store.step_price_table.length,
              )
            },
          },
          sale_unit_name && {
            Header: t(`含税单价（${priceUnit}/${sale_unit_name}）`),
            id: 'step_sale_price',
            accessor: 'step_sale_price',
            // width: 120,
            Cell: (cellProps) => {
              return <div>{cellProps.original.step_sale_price}</div>
            },
          },
        ],
        undefined,
      )}
    />
  )
})

TieredPriceTable.propTypes = {
  priceUnit: PropTypes.string.isRequired,
  sale_unit_name: PropTypes.string,
}

export default TieredPriceTable
