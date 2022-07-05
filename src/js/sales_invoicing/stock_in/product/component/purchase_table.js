import React from 'react'
import { observer } from 'mobx-react'
import { Popover, Price } from '@gmfe/react'
import { Table } from '@gmfe/table'
import { SvgPriceRule } from 'gm-svg'
import memoComponentWithDataHoc from './memo_component_with_data_hoc'
import PropTypes from 'prop-types'

const PurchaseTable = observer((props) => {
  const { data } = props
  const { purchase_price, purchase_amount, purchase_unit } = data

  return (
    <Popover
      showArrow
      component={<div />}
      type='hover'
      popup={
        <div className='gm-border gm-padding-5 gm-bg gm-text-12'>
          <Table
            data={[
              {
                purchase_price,
                purchase_amount,
                purchase_unit,
              },
            ]}
            columns={[
              {
                Header: '采购数',
                id: 'purchase_amount',
                accessor: (d) => d.purchase_amount + d.purchase_unit,
                minWidth: 60,
              },
              {
                Header: '采购单价',
                id: 'purchase_price',
                accessor: (d) =>
                  d.purchase_price + Price.getUnit() + '/' + d.purchase_unit,
                minWidth: 60,
              },
            ]}
          />
        </div>
      }
    >
      <span>
        <SvgPriceRule style={{ transform: 'rotate(270deg)' }} />
      </span>
    </Popover>
  )
})

PurchaseTable.propTypes = {
  data: PropTypes.object.isRequired,
}

export default memoComponentWithDataHoc(PurchaseTable)
