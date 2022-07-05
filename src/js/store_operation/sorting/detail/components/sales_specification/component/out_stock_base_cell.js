import { observer } from 'mobx-react'
import store from '../store/receipt_store'
import Big from 'big.js'
import _ from 'lodash'
import { Flex, InputNumberV2 } from '@gmfe/react'
import React from 'react'

const OutStockBaseCell = observer((props) => {
  const { index, stockIndex } = props
  const {
    batchList,
    outStockList,
    currentBatchSelected,
    currentBatchSelectedOutStockNumMap,
    unAssignedNum,
  } = store
  const { remain, batch_number, sale_unit_name } = batchList[index]
  const { std_unit_name, clean_food } = outStockList[stockIndex]

  const outStockNum = currentBatchSelectedOutStockNumMap.has(batch_number)
    ? currentBatchSelectedOutStockNumMap.get(batch_number)
    : null

  // 由于待分配已减当前值，所以max需要加回来
  const residue = Big(unAssignedNum)
    .plus(outStockNum || 0)
    .toFixed(2)

  const max = Big(residue).gt(remain) ? _.toNumber(remain) : _.toNumber(residue)

  const isDisable = !_.includes(currentBatchSelected, batch_number)

  const handleChange = (value) => {
    store.changeBatchOutStockNum(batch_number, value)
  }

  return (
    <Flex alignCenter>
      <InputNumberV2
        value={outStockNum}
        onChange={handleChange}
        min={0}
        max={max}
        className='form-control input-sm'
        style={{ width: '60px' }}
        disabled={isDisable}
      />
      <span className='gm-padding-5'>
        {clean_food ? sale_unit_name : std_unit_name}
      </span>
    </Flex>
  )
})

export default OutStockBaseCell
