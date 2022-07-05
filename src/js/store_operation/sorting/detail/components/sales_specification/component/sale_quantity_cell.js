import React from 'react'
import { observer } from 'mobx-react'
import store from '../store/receipt_store'
import { KCInputNumberV2 } from '@gmfe/keyboard'
import { Popover, Flex } from '@gmfe/react'
import memoComponentHoc from './memo_component'
import Big from 'big.js'
import { TableUtil } from '@gmfe/table'

const { referOfWidth } = TableUtil

const QuantitySaleKCInputNumber = observer(({ index, data }) => {
  const {
    quantity,
    sale_unit_name,
    isNeedReselectBatch,
    batchSelected,
    spu_id,
  } = data

  const handleInputChange = (value) => {
    store.changeOutStockListDetail(index, 'quantity', value)

    let real_std_count = null
    // 当已选择商品，则有比例, 否则值为空
    if (spu_id) {
      const { sale_ratio, std_ratio } = data
      real_std_count = Big(value || 0)
        .mul(sale_ratio)
        .mul(std_ratio)
        .toFixed(2) // 联动出库数销售单位
    }

    store.changeOutStockListDetail(index, 'real_std_count', real_std_count)

    if (batchSelected.length > 0) {
      store.changeOutStockListDetail(index, 'isNeedReselectBatch', true)
    }

    // 更改出库数需要清空批次信息
    store.clearTableBatchSelected(index)

    store.autoFetchBatchList(index)
  }

  const renderPopoverPop = (text) => {
    return (
      <div
        className='gm-padding-10 gm-bg'
        style={{ width: '230px', color: '#333' }}
      >
        {text}
      </div>
    )
  }
  return (
    <Popover
      showArrow
      component={<div />}
      type='hover'
      popup={renderPopoverPop('修改出库数的值，请重新选择出库批次')}
      disabled={!isNeedReselectBatch}
    >
      <Flex alignCenter>
        <KCInputNumberV2
          value={quantity}
          onChange={handleInputChange}
          min={0}
          className='form-control input-sm'
          style={{ width: referOfWidth.numberInputBox }}
        />
        <span className='gm-padding-5'>{sale_unit_name || '-'}</span>
      </Flex>
    </Popover>
  )
})

export default memoComponentHoc(QuantitySaleKCInputNumber)
