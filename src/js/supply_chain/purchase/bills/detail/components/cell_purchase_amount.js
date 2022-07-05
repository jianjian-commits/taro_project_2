/*
 * @Autor: xujiahao
 * @Date: 2021-05-14 10:18:40
 * @LastEditors: xujiahao
 * @LastEditTime: 2021-11-11 11:16:19
 * @FilePath: /gm_static_stationv2/src/js/supply_chain/purchase/bills/detail/components/cell_purchase_amount.js
 */
import React from 'react'
import { observer } from 'mobx-react'
import memoComponentWithDataHoc from './memo_with_data_hoc'
import PropTypes from 'prop-types'
import { KCInputNumberV2 } from '@gmfe/keyboard'
import { Flex } from '@gmfe/react'
import store from '../store'

const CellAmount = observer((props) => {
  const { index, data } = props
  const { purchase_amount, std_unit_name } = data

  const handleChange = (value) => {
    store.changeEditTask(true)
    store.changeListItemPurchaseAmount(index, value)
  }

  return (
    <Flex alignCenter>
      <KCInputNumberV2
        autocomplete='off'
        id={index}
        value={purchase_amount}
        onChange={handleChange}
        min={0}
        max={999999999}
        style={{ width: '85px' }}
        className='input-sm'
      />
      <span style={{ wordBreak: 'normal' }}>{std_unit_name || '-'}</span>
    </Flex>
  )
})

CellAmount.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(CellAmount)
