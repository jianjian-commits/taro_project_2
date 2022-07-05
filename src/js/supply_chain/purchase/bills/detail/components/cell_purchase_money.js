/*
 * @Autor: xujiahao
 * @Date: 2021-05-14 10:18:40
 * @LastEditors: xujiahao
 * @LastEditTime: 2021-11-11 11:17:24
 * @FilePath: /gm_static_stationv2/src/js/supply_chain/purchase/bills/detail/components/cell_purchase_money.js
 */
import React from 'react'
import { observer } from 'mobx-react'
import memoComponentWithDataHoc from './memo_with_data_hoc'
import PropTypes from 'prop-types'
import { KCInputNumberV2 } from '@gmfe/keyboard'
import { Flex, Price } from '@gmfe/react'
import store from '../store'

const CellMoney = observer((props) => {
  const { index, data } = props
  const { purchase_money } = data

  const handleChange = (value) => {
    store.changeEditTask(true)
    store.changeListItemMoney(index, value)
  }

  return (
    <Flex alignCenter>
      <KCInputNumberV2
        autocomplete='off'
        id={index}
        value={purchase_money}
        onChange={handleChange}
        min={0}
        max={999999999}
        style={{ width: '85px' }}
        className='input-sm'
      />
      <span style={{ whiteSpace: 'nowrap' }}>{Price.getUnit()}</span>
    </Flex>
  )
})

CellMoney.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(CellMoney)
