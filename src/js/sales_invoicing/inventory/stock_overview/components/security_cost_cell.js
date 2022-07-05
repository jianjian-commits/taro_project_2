import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import Big from 'big.js'
import _ from 'lodash'
import { t } from 'gm-i18n'
import classNames from 'classnames'
import { Flex } from '@gmfe/react'
import { TableUtil } from '@gmfe/table'
import EditCellConfirm from './edit_cell_confirm'
import store from '../store'
const { EditButton } = TableUtil

const isNotSet = (data) => data === null || data === undefined || data === ''
const SecurityCostCell = (props) => {
  const {
    changeType,
    original,
    original: {
      threshold,
      remain, // 成品库存
      std_unit_name,
      upper_threshold,
      ingredient_remain, // 原料库存
    },
    fetchList,
  } = props

  const [upWarning, setUpWaring] = useState(false) // 上限预警
  const [lowWarning, setLowWarning] = useState(false) // 下限预警

  // 上限的最小值
  const min = !_.isNil(threshold) ? threshold : null
  // 下限的最大值
  const max = !_.isNil(upper_threshold) ? upper_threshold : null
  // 库存
  const inventory = changeType === 'product' ? remain : ingredient_remain

  useEffect(() => {
    if (!isNotSet(threshold)) {
      setLowWarning(Big(threshold).minus(inventory).toFixed(2) > 0)
    }
    if (!isNotSet(upper_threshold)) {
      setUpWaring(Big(inventory).minus(upper_threshold).toFixed(2) > 0)
    }
  }, [upWarning, lowWarning])

  const handlePageChange = () => {
    if (changeType === 'product') {
      fetchList()
    } else {
      store.apiDoFirstRequest()
    }
  }

  return (
    <Flex column>
      <span
        className={classNames('gm-margin-bottom-5')}
        style={
          upWarning
            ? {
                color: '#fff',
                backgroundColor: 'red',
                padding: '2px',
                marginBottom: 0,
              }
            : {}
        }
      >
        {t('上限：')}
        {isNotSet(upper_threshold)
          ? t('未设置')
          : parseFloat(Big(upper_threshold).toFixed(2)) + std_unit_name}
        {
          <EditButton
            popupRender={(close) => (
              <EditCellConfirm
                value={original}
                onOk={handlePageChange}
                onCancel={close}
                changeType={changeType}
                type='upStock'
                min={min}
              />
            )}
          />
        }
      </span>
      <span
        style={
          lowWarning
            ? {
                color: '#fff',
                backgroundColor: 'red',
                padding: '2px',
                marginBottom: 0,
              }
            : {}
        }
      >
        {t('下限：')}

        {isNotSet(threshold)
          ? t('未设置')
          : parseFloat(Big(threshold).toFixed(2)) + std_unit_name}
        {
          <EditButton
            popupRender={(close) => (
              <EditCellConfirm
                value={original}
                onOk={handlePageChange}
                onCancel={close}
                type='downStock'
                changeType={changeType}
                max={max}
              />
            )}
          />
        }
      </span>
    </Flex>
  )
}

SecurityCostCell.propTypes = {
  original: PropTypes.object,
  changeType: PropTypes.oneOfType(['raw', 'product']), // raw 修改原料，product 修改成品
  fetchList: PropTypes.func,
}

export default observer(SecurityCostCell)
