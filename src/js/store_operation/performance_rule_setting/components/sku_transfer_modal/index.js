import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Flex, Button, RightSideModal } from '@gmfe/react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'

import SkuTransfer from '../../../sort_data/components/sku_transfer'
import store from '../../store'

function SkuTransferModal(props) {
  const { isPiece } = props
  // 绩效方式
  const perf_method = isPiece ? 2 : 1

  const { spu_ids, isGettingSpuIds } = store

  useEffect(() => {
    store.getSpu({ perf_method })
  }, [perf_method])

  function handleSave() {
    return store.setSpu({ perf_method }).then((isSuccess) => {
      if (isSuccess) {
        RightSideModal.hide()
      }
    })
  }
  function onHandleSelect(selectedValues) {
    store.setSpuIds(selectedValues)
  }

  return (
    <div className='gm-padding-20'>
      <Flex justifyEnd>
        <Button type='primary' onClick={handleSave}>
          {t('确定')}
        </Button>
      </Flex>
      <hr />
      <SkuTransfer
        selectedValues={spu_ids.slice()}
        onSelectValues={onHandleSelect}
        otherLoading={isGettingSpuIds}
      />
    </div>
  )
}
SkuTransferModal.propTypes = {
  // 是否是计件
  isPiece: PropTypes.bool,
}
export default observer(SkuTransferModal)
