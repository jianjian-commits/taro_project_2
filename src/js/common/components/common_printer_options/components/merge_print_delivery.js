import React from 'react'
import { RadioGroup, Radio, ToolTip } from '@gmfe/react'
import { t } from 'gm-i18n'
import printer_options_store from '../printer_options_store'
import { observer } from 'mobx-react'

const MergePrintDelivery = observer(() => {
  const { mergeDeliveryType, setDeliveryMergeType } = printer_options_store
  const handleSetMergeDeliveryType = (value) => {
    setDeliveryMergeType(value)
  }
  return (
    <>
      <RadioGroup
        name='setDeliveryMergeType'
        value={mergeDeliveryType}
        onChange={handleSetMergeDeliveryType}
        className='gm-padding-right-15 b-distribute-order-popup-temp-radio gm-padding-left-20'
      >
        <Radio value={1} key='mergePrintSID'>
          <span>
            {t('合并打印相同商户订单')}
            <ToolTip
              popup={
                <div className='gm-padding-5'>
                  {t(
                    '开启后，同商户的订单会合并打印（同商品数量、金额会累加）',
                  )}
                </div>
              }
            />
          </span>
        </Radio>
        <Radio value={2} key='mergePrintCommodity'>
          <span>
            {t('合并打印订单内相同商品')}
            <ToolTip
              popup={
                <div className='gm-padding-5'>
                  {t(
                    '开启后该订单的相同商品会合并打印（相同商品的数量、金额会累加）',
                  )}
                </div>
              }
            />
          </span>
        </Radio>
      </RadioGroup>
    </>
  )
})
export default MergePrintDelivery
