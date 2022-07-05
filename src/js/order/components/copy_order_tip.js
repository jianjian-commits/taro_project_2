/*
 * @Description: 复制订单弹窗内容
 */
import React, { useState } from 'react'
import { Flex, Select, Storage } from '@gmfe/react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'

// 复制订单是否同步商品单价
const key = 'COPY_ORDER_IS_SYNC_GOODS_PRICE'

export const getCopyOrderSyncGoodsPrice = () => {
  return Storage.get(key) || 2
}
export const setCopyOrderSyncGoodsPrice = (newValue) => {
  return Storage.set(key, newValue)
}
export const isCopyOrderSyncGoodsPrice = (value) => {
  return value === 1
}

const CopyOrderTip = observer(({ inList, onChange }) => {
  const [value, setValue] = useState(getCopyOrderSyncGoodsPrice)

  const onSelectChange = (newValue) => {
    setValue(newValue)
    onChange(newValue)
  }
  return (
    <>
      <Flex alignCenter>
        {t('复制订单是否同步商品单价')}：
        <Select
          style={{ width: 80 }}
          value={value}
          data={[
            { text: t('是'), value: 1 },
            { text: t('否'), value: 2 },
          ]}
          onChange={onSelectChange}
        />
      </Flex>
      {inList && (
        <Flex className='gm-margin-top-5'>
          {t('点击确定将复制此订单内的有效商品，但会清空商品列表原有商品！')}
        </Flex>
      )}
    </>
  )
})

CopyOrderTip.propTypes = {
  inList: PropTypes.bool,
  onChange: PropTypes.func,
}

export default CopyOrderTip
