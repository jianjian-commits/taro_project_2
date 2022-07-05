import React, { useEffect, useRef } from 'react'
import { observer } from 'mobx-react'
import {
  Form,
  FormGroup,
  FormItem,
  FormPanel,
  Select,
  Radio,
  RadioGroup,
  Tip,
} from '@gmfe/react'
import { i18next, t } from 'gm-i18n'
import globalStore from '../../../stores/global'
import store from './store'

const defaultSetting = [
  { text: t('不启用'), value: 0 },
  { text: t('供应商最近询价'), value: 1 },
  { text: t('供应商最近入库价'), value: 3 },
  { text: t('最近询价'), value: 5 },
  { text: t('最近入库价'), value: 6 },
  { text: t('供应商周期报价'), value: 9 },
]

const PurchasingSetting = observer(() => {
  const hasPurchaseSettings = true

  // 判断有没有权限
  const hasEditSettlewayPermission = globalStore.hasPermission(
    'edit_in_stock_ref_price',
  )

  const formRef = useRef(null)

  useEffect(() => {
    store.initData('procurement', {
      purchase_sheet_ref_price:
        globalStore.otherInfo.purchaseSheetRefPrice || 0,
      recommended_purchase_setting:
        globalStore.procurement.recommended_purchase_setting || 1,
      ban_generate_multiple_times:
        globalStore.procurement.ban_generate_multiple_times,
    })
  }, [
    globalStore.procurement.recommended_purchase_setting,
    globalStore.otherInfo.purchaseSheetRefPrice,
    globalStore.procurement.ban_generate_multiple_times,
  ])

  const handleChangeSelect = (name, value) => {
    store.changeDataItem('procurement', name, value)
  }

  const handleSave = () => {
    store.postSetting('procurement').then(() => {
      Tip.success(t('保存成功'))
      window.location.reload()
    })
  }
  return (
    <>
      {hasPurchaseSettings && (
        <FormGroup formRefs={[formRef]} onSubmit={handleSave}>
          <FormPanel title={i18next.t('采购设置')}>
            <Form
              onSubmit={handleSave}
              ref={formRef}
              labelWidth='200px'
              colWidth='600px'
              hasButtonInGroup
            >
              <FormItem label='采购单价默认值设置' colWidth='400px'>
                <Select
                  data={defaultSetting}
                  disabled={!hasEditSettlewayPermission}
                  value={store.purchassData.purchase_sheet_ref_price}
                  onChange={(value) => {
                    handleChangeSelect('purchase_sheet_ref_price', value)
                  }}
                />
              </FormItem>
              <FormItem label='建议采购设置' colWidth='650px'>
                <RadioGroup
                  value={store?.purchassData?.recommended_purchase_setting}
                  onChange={(value) => {
                    handleChangeSelect('recommended_purchase_setting', value)
                  }}
                >
                  <Radio value={1}>计划采购数-库存数量</Radio>
                  <div className='gm-text-desc gm-margin-top-5 gm-margin-bottom-15'>
                    若库存小于0，则建议采购=计划；若建议采购小于0，则建议采购为“库存充足”
                  </div>
                  <Radio value={2}>计划采购数-可用库存数</Radio>
                  <div className='gm-text-desc gm-margin-top-5'>
                    若可用库存小于0，则建议采购=计划；若建议采购小于0，则建议采购为“库存充足”
                  </div>
                </RadioGroup>
              </FormItem>
              <FormItem label='采购任务是否可多次生成采购单' colWidth='650px'>
                <RadioGroup
                  value={store?.purchassData?.ban_generate_multiple_times}
                  inline
                  onChange={(value) => {
                    handleChangeSelect('ban_generate_multiple_times', value)
                  }}
                >
                  <Radio value={0}>可多次生成</Radio>
                  <Radio value={1}>不可多次生成</Radio>
                </RadioGroup>
              </FormItem>
            </Form>
          </FormPanel>
        </FormGroup>
      )}
    </>
  )
})

export default PurchasingSetting
