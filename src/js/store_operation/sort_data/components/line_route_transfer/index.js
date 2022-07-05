/*
 * @Description: 线路穿梭框
 */
import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { LoadingChunk, TransferV2 } from '@gmfe/react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'

import store from './store'

function LineRouteTransfer(props) {
  const {
    selectedValues = [],
    onSelectValues,
    address_kind = 1,
    ...restProps
  } = props

  const { cacheList, loading } = store

  const listTree = cacheList[address_kind === 1 ? 'route' : 'merchant'].slice()

  useEffect(() => {
    store.getInitList()
  }, [])

  return (
    <LoadingChunk text={t('拼命加载中...')} loading={loading}>
      <TransferV2
        list={listTree}
        selectedValues={selectedValues}
        onSelectValues={onSelectValues}
        rightTree
        {...restProps}
      />
    </LoadingChunk>
  )
}
LineRouteTransfer.propTypes = {
  selectedValues: PropTypes.array.isRequired,
  address_kind: PropTypes.number,
  onSelectValues: PropTypes.func.isRequired,
}
export default observer(LineRouteTransfer)
