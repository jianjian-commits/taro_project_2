import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { KCInputNumberV2 } from '@gmfe/keyboard'
import { Flex } from '@gmfe/react'
import { t } from 'gm-i18n'
import Big from 'big.js'

import { isAllNumber, isTwoNumberEqual, isNumber } from 'common/util'
import store from '../store/detail'
import WarningTip from './warning_tip'
import PriceUnit from './price_unit'

const COMPARE_VALUE_KEY = [
  'std_unite_protocol_price',
  'pack_unite_protocol_price',
]

const SUPPLY_PRE_PRICE_VALUE_KEY = [
  'std_unite_pre_quote',
  'pack_unite_pre_quote',
]
function CellPrice(props) {
  const {
    index,
    value,
    unit_name = '-',
    valueKey,
    compareValue,
    isOld,
    ratio,
    ratioKey,
    isEdit,
  } = props
  // 是否显示输入框
  const isShowInput = isEdit && store.isEdit
  // 是否显示提示
  let isTip = false
  /**
   *  如果满足则提示：
   *      1.新增
   *      2.valueKey为协议价
   *      3.预报价和协议价均有价格且不同时
   */
  if (
    COMPARE_VALUE_KEY.includes(valueKey) &&
    isAllNumber([compareValue, value]) &&
    !isTwoNumberEqual(compareValue, value)
  ) {
    isTip = true
  }

  function handleChange(value) {
    const newSkuRow = { [valueKey]: value }
    // 联动修改对应比较的价格
    let ratioKeyValue = 0
    if (value !== '' && ratio) {
      ratioKeyValue = Big(value || 0)
        [ratioKey.includes('pack_') ? 'times' : 'div'](ratio)
        .toFixed(2)
    }
    newSkuRow[ratioKey] = ratioKeyValue
    /**
     * 供应商新建周期报价规则时，仅可输入「预报价」的价格，第一次保存时「协议价」自动同步「预报价」，
     * 后续修改「预报价」时不同步「协议价」
     */
    if (SUPPLY_PRE_PRICE_VALUE_KEY.includes(valueKey) && !isOld) {
      newSkuRow[valueKey.replace('pre_quote', 'protocol_price')] = Big(
        value || 0,
      ).toFixed(2)
      newSkuRow[ratioKey.replace('pre_quote', 'protocol_price')] = ratioKeyValue
    }
    store.changeSkuRow(index, newSkuRow)
  }

  return (
    <Flex alignCenter>
      {isShowInput ? (
        <KCInputNumberV2
          id={`${valueKey}${index}`}
          min={0}
          max={999999999}
          style={{ width: '85px' }}
          className='input-sm'
          value={value}
          onChange={handleChange}
        />
      ) : (
        value
      )}
      {/* 有数值的情况下显示单位 */}
      {isNumber(value) && <PriceUnit unit_name={unit_name} />}
      {isTip && (
        <WarningTip
          tip={t('当前商品供应商预报价和协议价不同，请确认最终协议价')}
        />
      )}
    </Flex>
  )
}

CellPrice.propTypes = {
  index: PropTypes.number.isRequired,
  value: PropTypes.number,
  valueKey: PropTypes.string.isRequired,
  unit_name: PropTypes.string,
  compareValue: PropTypes.any,
  isOld: PropTypes.bool,
  ratio: PropTypes.number,
  ratioKey: PropTypes.string.isRequired,
  isEdit: PropTypes.bool.isRequired,
}

export default memo(CellPrice)
