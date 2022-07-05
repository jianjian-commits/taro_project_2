import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import store from '../store/receipt_store'
import BatchSelectTable from './batch_select_table'
import BatchHeader from './batch_header'
import { Flex, Modal, Tip, Button } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import _ from 'lodash'

const BatchSelect = observer((props) => {
  const { index } = props

  const { id: sku_id, clean_food } = store.outStockList[index]

  useEffect(() => {
    store.initBatchFilterData({
      sku_id,
      clean_food: clean_food ? 1 : 0,
      detail_id: `${sku_id}_${index}`,
    })
    store.fetchBatchList().then(() => {
      store.setSelectedData(index)
    })
  }, [])

  const handleSelectBatchCancel = () => {
    Modal.hide()
  }

  const handleSelectBatchOk = () => {
    const { currentBatchSelected, totalSelectedNum, unAssignedNum } = store
    if (!currentBatchSelected.length) {
      Tip.warning(i18next.t('请选择出库批次'))
      return false
    } else if (_.toNumber(totalSelectedNum) === 0) {
      Tip.warning(i18next.t('请填写出库数'))
      return false
    } else if (_.toNumber(unAssignedNum) !== 0) {
      Tip.warning(i18next.t('所选批次输入的库存总数小于出库数'))
      return false
    }

    store.saveOperatedBatchData(index).then(() => {
      store.changeOutStockListDetail(index, 'isNeedReselectBatch', false)

      Modal.hide()
    })
  }

  return (
    <div className='b-stock-out-batch-list'>
      <BatchHeader index={index} />
      <BatchSelectTable index={index} />
      <Flex justifyCenter className='gm-padding-15 b-position-bottom'>
        <Button className='gm-margin-right-5' onClick={handleSelectBatchCancel}>
          {i18next.t('取消')}
        </Button>
        <Button type='primary' onClick={handleSelectBatchOk}>
          {i18next.t('确定')}
        </Button>
      </Flex>
    </div>
  )
})

export default BatchSelect
