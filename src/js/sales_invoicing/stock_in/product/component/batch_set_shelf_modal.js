import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import { LevelSelect, Flex, Button } from '@gmfe/react'
import store from '../store/receipt_store'
import { toJS } from 'mobx'

const BatchSetShelfModal = (props) => {
  const { shelfList, tableSelected } = store
  const { onCancel } = props

  const count = tableSelected.length // 若选择所有页，则显示全部采购规格数，否则显示已选择的数量
  const [shelfSelected, setShelfSelected] = useState([])

  const handleChangeShelfSelected = (selected) => {
    setShelfSelected(selected)
  }

  const handleEnsure = () => {
    store.batchSetShelf(shelfSelected, tableSelected)
    // 清空表格选择
    store.changeTableSelect([])
    // 关闭modal
    onCancel()
  }

  return (
    <div className='gm-padding-lr-10'>
      <div>{t('batch_shelf_merchandise_count', { count })}</div>
      <LevelSelect
        className='gm-margin-top-10'
        style={{ width: '180px' }}
        data={toJS(shelfList)}
        selected={shelfSelected}
        onSelect={handleChangeShelfSelected}
      />
      <Flex justifyEnd className='gm-margin-top-10'>
        <Button className='gm-margin-right-10' onClick={onCancel}>
          {t('取消')}
        </Button>
        <Button type='primary' onClick={handleEnsure}>
          {t('确定')}
        </Button>
      </Flex>
    </div>
  )
}

BatchSetShelfModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
}

export default BatchSetShelfModal
