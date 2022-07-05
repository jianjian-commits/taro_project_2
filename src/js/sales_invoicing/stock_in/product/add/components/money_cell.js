import React from 'react'
import { observer } from 'mobx-react'
import { isValid } from '../../../util'
import store from '../store'
import { Flex, Price } from '@gmfe/react'
import { KCInputNumberV2 } from '@gmfe/keyboard'
import Big from 'big.js'
import memoComponentWithDataHoc from './memo_component_with_data_hoc'
import PropTypes from 'prop-types'
import { TableXUtil } from '@gmfe/table-x'

const { TABLE_X } = TableXUtil

const MoneyCell = observer((props) => {
  const { status } = store
  const { index, data } = props
  const { money, sale_quantity, ratio } = data

  const handleMoneyChange = (value) => {
    const rowData = {
      money: value,
      unit_price:
        sale_quantity === 0
          ? 0
          : isValid(value) && sale_quantity
          ? +Big(value || 0)
              .div(sale_quantity)
              .div(ratio || 1)
              .toFixed(2)
          : null,
    }

    store.onRowDataChange(index, rowData)
  }

  return status === 'detail' ? (
    money + Price.getUnit()
  ) : (
    <Flex alignCenter>
      <KCInputNumberV2
        value={money}
        id={index}
        onChange={handleMoneyChange}
        min={0}
        className='form-control input-sm'
        style={{ width: TABLE_X.WIDTH_NUMBER }}
      />
      <span className='gm-padding-5'>{Price.getUnit()}</span>
    </Flex>
  )
})

MoneyCell.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(MoneyCell)
