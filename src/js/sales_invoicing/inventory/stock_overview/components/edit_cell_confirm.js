import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import { Button, Flex, InputNumberV2, Select, Tip } from '@gmfe/react'
import _ from 'lodash'
import Big from 'big.js'
import store from '../store'

const TYPE_MAP = {
  upStock: {
    dataKey: 'upper_threshold',
    useKey: 'set_upper_threshold',
    successText: t('修改库存上限成功'),
    placeholderText: t('请输入库存上限'),
    dataMin: 0,
  },
  downStock: {
    dataKey: 'threshold',
    useKey: 'threshold_using',
    successText: t('修改库存下限成功'),
    placeholderText: t('请输入库存下限'),
    dataMin: -999999,
  },
  delayStock: {
    dataKey: 'retention_warning_day',
    useKey: 'set_retention_warning_day',
    successText: t('修改呆滞预警天数成功'),
    placeholderText: t('请输入呆滞预警天数'),
    unit: t('天'),
    dataPrecision: 0,
    dataMin: 1,
  },
}

const EditCellConfirm = ({
  value,
  onCancel,
  onOk,
  type,
  min,
  max,
  changeType,
}) => {
  const { spu_id, std_unit_name, sku_id } = value

  const _configMap = TYPE_MAP[type]
  const data = value[_configMap.dataKey]
  const [isSet, changeIsSet] = useState(_.isNumber(data))
  const [safeInventory, changeInventory] = useState(
    _.isNumber(data) ? data : undefined,
  )

  const handleOk = () => {
    const option = {
      spu_id,
      [_configMap.useKey]: isSet ? 1 : 2,
    }
    if (isSet) {
      option[_configMap.dataKey] = Big(safeInventory || 0).toFixed(
        _.isNil(_configMap.dataPrecision) ? 2 : _configMap.dataPrecision,
      )

      // max/min用来做安全库存上下限的判断
      const upStockError =
        type === 'upStock' && !_.isNil(min) && option[_configMap.dataKey] < min
      const downStockError =
        type === 'downStock' &&
        !_.isNil(max) &&
        option[_configMap.dataKey] > max

      if (upStockError || downStockError) {
        Tip.warning('安全库存下限不能大于上限')
        return
      }
    }
    if (changeType === 'product') option.sku_id = sku_id // 如果是成品安全库存修改。需要增加sku_id

    handleSet(option)
  }

  const handleSet = (option) => {
    const handleOk =
      changeType === 'product' ? store.setProductStock : store.setRowStock
    handleOk(option).then(() => {
      Tip.success(_configMap.successText)
      onOk()
      onCancel()
    })
  }

  return (
    <Flex alignCenter className='gm-margin-lr-20 gm-margin-tb-15'>
      <Select
        style={{ width: '150px' }}
        onChange={changeIsSet}
        data={[
          { value: true, text: t('设置') },
          { value: false, text: t('未设置') },
        ]}
        value={isSet}
        isInPopup
      />
      <span className='gm-gap-10' />
      <InputNumberV2
        onChange={(value) => changeInventory(value)}
        placeholder={_configMap.placeholderText}
        disabled={!isSet}
        className='form-control gm-margin-right-5'
        value={safeInventory}
        precision={
          _.isNil(_configMap.dataPrecision) ? 2 : _configMap.dataPrecision
        }
        max={999999}
        min={_configMap.dataMin}
      />
      <span className='gm-margin-right-10'>
        {_configMap.unit || std_unit_name}
      </span>
      <Button type='link' onClick={onCancel}>
        {t('取消')}
      </Button>
      <div>|</div>
      <Button type='link' onClick={handleOk}>
        {t('确定')}
      </Button>
    </Flex>
  )
}

EditCellConfirm.propTypes = {
  value: PropTypes.object,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
  type: PropTypes.string, // upStore: 库存上限，downStore:库存下限
  min: PropTypes.number,
  max: PropTypes.number,
  changeType: PropTypes.oneOfType(['raw', 'product']), // raw 修改原料，product 修改成品
}

export default EditCellConfirm
