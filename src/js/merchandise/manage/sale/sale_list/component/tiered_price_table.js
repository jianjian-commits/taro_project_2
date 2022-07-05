import React from 'react'
import PropTypes from 'prop-types'
import { EditTable } from '@gmfe/table'
import { Input } from '@gmfe/react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import _ from 'lodash'

import store from '../store.js'

const initAmountField = (index, min, max, len) => {
  if (index === len - 1) return `≥${min}`
  if (index === 0) return `<${max}`
  return `${min}~${max}`
}

const TieredPriceTable = observer((props) => {
  const {
    priceUnit,
    std_unit_name_forsale,
    sale_unit_name,
    isEdit,
    listIndex,
  } = props

  // useEffect(() => {
  //   // store.initStepPriceTable(store.list[listIndex].step_price_table)
  //   store.initStepPriceTable([
  //     { max: 12, min: 1, step_sale_price: '3200', step_std_price: '1280' },
  //   ])

  //   return () => {
  //     store.initStepPriceTable([])
  //   }
  // }, [])

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
            Header: t(`数量（${sale_unit_name || std_unit_name_forsale}）`),
            Cell: (cellProps) => {
              const max = cellProps.original.max
              const min = cellProps.original.min
              return isEdit ? (
                <div>
                  <Input
                    style={{ width: '40px' }}
                    value={min}
                    disabled
                    // onChange={(e) => {
                    //   store.changeTieredPrice(
                    //     listIndex,
                    //     cellProps.index,
                    //     'min',
                    //     e.target.value,
                    //   )
                    // }}
                  />
                  ~
                  <Input
                    style={{ width: '40px' }}
                    value={max}
                    disabled={
                      cellProps.index === store.step_price_table?.length - 1
                    }
                    onChange={(e) => {
                      store.changeTieredPrice(
                        listIndex,
                        cellProps.index,
                        'max',
                        e.target.value,
                      )
                    }}
                  />
                </div>
              ) : (
                initAmountField(
                  cellProps.index,
                  min,
                  max,
                  store.step_price_table.length,
                )
              )
            },
          },
          std_unit_name_forsale && {
            Header: t(`单价（${priceUnit}/${std_unit_name_forsale}）`),
            id: 'step_std_price',
            accessor: 'step_std_price',
            // width: 120,
            Cell: (cellProps) => {
              return isEdit ? (
                <Input
                  style={{ width: '80px' }}
                  autoComplete='off'
                  // precision={2}
                  value={cellProps.original.step_std_price}
                  onChange={(e) => {
                    store.changeTieredPrice(
                      listIndex,
                      cellProps.index,
                      'step_std_price',
                      e.target.value,
                    )
                  }}
                />
              ) : (
                <div>{cellProps.original.step_std_price}</div>
              )
            },
          },
          sale_unit_name && {
            Header: t(`销售价（${priceUnit}/${sale_unit_name}）`),
            id: 'step_sale_price',
            accessor: 'step_sale_price',
            // width: 120,
            Cell: (cellProps) => {
              return isEdit ? (
                <Input
                  precision={2}
                  autoComplete='off'
                  value={cellProps.original.step_sale_price}
                  style={{ width: '80px' }}
                  onChange={(e) => {
                    store.changeTieredPrice(
                      listIndex,
                      cellProps.index,
                      'step_sale_price',
                      e.target.value,
                    )
                  }}
                />
              ) : (
                <div>{cellProps.original.step_sale_price}</div>
              )
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
  std_unit_name_forsale: PropTypes.string,
  sale_unit_name: PropTypes.string,
  isEdit: PropTypes.bool,
  listIndex: PropTypes.number.isRequired,
  // data: PropTypes.array.isRequired,
}

export default TieredPriceTable
