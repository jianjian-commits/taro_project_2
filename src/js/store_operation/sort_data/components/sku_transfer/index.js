/*
 * @Description: sku穿梭框
 */
import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { LoadingChunk, TransferV2 } from '@gmfe/react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'

import store from './store'

function SkuTransfer(props) {
  const {
    selectedValues = [],
    onSelectValues,
    otherLoading,
    ...restProps
  } = props

  const { listTree, loading } = store

  useEffect(() => {
    store.getInitList()
  }, [])

  return (
    <LoadingChunk text={t('拼命加载中...')} loading={loading || otherLoading}>
      <TransferV2
        list={listTree.slice()}
        selectedValues={selectedValues}
        onSelectValues={onSelectValues}
        rightTree
        {...restProps}
      />
    </LoadingChunk>
  )
}
SkuTransfer.propTypes = {
  selectedValues: PropTypes.array.isRequired,
  onSelectValues: PropTypes.func.isRequired,
  otherLoading: PropTypes.bool,
}
export default observer(SkuTransfer)
