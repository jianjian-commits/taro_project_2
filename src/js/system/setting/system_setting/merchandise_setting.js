import React, { useEffect, useRef } from 'react'
import { observer } from 'mobx-react'
import {
  Form,
  FormGroup,
  FormItem,
  FormPanel,
  Radio,
  RadioGroup,
  Switch,
  Tip,
  Select,
} from '@gmfe/react'
import { i18next } from 'gm-i18n'
import store from './store'
import globalStore from '../../../stores/global'
import { formula_price_rounding_types, ssuPricePrecision } from './util'

const MerchandiseSetting = observer(() => {
  const {
    show_sku_outer_id,
    show_suggest_price,
    show_tax_rate,
    sync_price_timing,
    formula_price_precision,
    formula_price_rounding_type,
  } = store.merchandiseData
  const hasEditSuggestPrice = globalStore.hasPermission('edit_suggest_price')
  const hasGetTax = globalStore.hasPermission('get_tax')
  const hasEditTaxRate = globalStore.hasPermission('edit_tax')

  const formRef = useRef(null)

  useEffect(() => {
    store.initData('merchandise', {
      show_sku_outer_id: globalStore.otherInfo.showSkuOuterId ? 1 : 0,
      show_suggest_price: globalStore.otherInfo.showSuggestPrice,
      show_tax_rate: globalStore.otherInfo.showTaxRate,
      sync_price_timing: globalStore.otherInfo.syncPriceTiming,
      formula_price_precision: globalStore.otherInfo.formulaPricePrecision,
      formula_price_rounding_type:
        globalStore.otherInfo.formulaPriceRoundingType,
    })
  }, [])

  const handleChangeSwitch = (name) => {
    store.changeDataItem('merchandise', name, !store.merchandiseData[name])
  }

  const handleChangeRadio = (name, value) => {
    store.changeDataItem('merchandise', name, value)
  }

  const handleSave = () => {
    store.postSetting('merchandise').then(() => {
      Tip.success(i18next.t('保存成功'))
      window.location.reload()
    })
  }

  const { isCStation } = globalStore.otherInfo

  return (
    <FormGroup formRefs={[formRef]} onSubmit={handleSave}>
      <FormPanel title={i18next.t('商品设置')}>
        <Form
          onSubmit={handleSave}
          ref={formRef}
          labelWidth='166px'
          hasButtonInGroup
          disabledCol
        >
          <FormItem label={i18next.t('商品ID展现方式')}>
            <RadioGroup
              name='show_sku_outer_id'
              value={show_sku_outer_id}
              inline
              onChange={(value) =>
                handleChangeRadio('show_sku_outer_id', value)
              }
            >
              <Radio value={0}>{i18next.t('系统分配商品ID')}</Radio>
              <Radio value={1}>{i18next.t('自定义编码')}</Radio>
            </RadioGroup>
          </FormItem>
          {hasGetTax && !isCStation && (
            <FormItem label={i18next.t('税额展示')}>
              <Switch
                type='primary'
                checked={!!show_tax_rate}
                on={i18next.t('开启')}
                off={i18next.t('关闭')}
                onChange={() => handleChangeSwitch('show_tax_rate')}
                disabled={!hasEditTaxRate}
              />
              <div className='gm-text-desc gm-margin-top-5'>
                {i18next.t(
                  '开启后：1. 可对商品进行单独的税率设置（需权限）；2. 设置后，将在订单、数据、账务、单据等处展示税率',
                )}
              </div>
            </FormItem>
          )}
          <FormItem label={i18next.t('建议价格区间')}>
            <Switch
              type='primary'
              checked={!!show_suggest_price}
              on={i18next.t('开启')}
              off={i18next.t('关闭')}
              onChange={() => handleChangeSwitch('show_suggest_price')}
              disabled={!hasEditSuggestPrice}
            />
            <div
              className='gm-text-desc gm-margin-top-5'
              style={{ fontSize: '12px' }}
            >
              <p className='gm-margin-bottom-5'>{i18next.t('开启后')}：</p>
              <p className='gm-margin-bottom-5'>
                {i18next.t('1. 在商品详情中设置每种商品的价格建议价格区间')}
              </p>
              <p className='gm-margin-bottom-5'>
                {i18next.t(
                  '2. 设置后，商品价格超出建议价格区间将在商品中做出预警提示',
                )}
              </p>
            </div>
          </FormItem>
          {!isCStation && (
            <FormItem label={i18next.t('同步时价商品')}>
              <Switch
                type='primary'
                checked={!!sync_price_timing}
                on={i18next.t('开启')}
                off={i18next.t('关闭')}
                onChange={() => handleChangeSwitch('sync_price_timing')}
              />
              <div
                className='gm-text-desc gm-margin-top-5'
                style={{ fontSize: '12px' }}
              >
                <p className='gm-margin-bottom-5'>{i18next.t('开启后')}：</p>
                <p className='gm-margin-bottom-5'>
                  {i18next.t(
                    '1. 订单商品同步最新单价时，可同步时价商品的商品库价格',
                  )}
                </p>
                <p className='gm-margin-bottom-5'>
                  {i18next.t(
                    '2. 订单商品价格同步回报价单时，可同步时价商品的订单价格',
                  )}
                </p>
              </div>
            </FormItem>
          )}

          <FormItem label={i18next.t('商品定价公式精确度')}>
            <Select
              onChange={(value) => {
                store.changeDataItem(
                  'merchandise',
                  'formula_price_precision',
                  value,
                )
              }}
              data={ssuPricePrecision}
              value={formula_price_precision}
              style={{ width: '180px' }}
            />
            <div className='gm-text-desc gm-margin-top-5'>
              {i18next.t('可设置商品价格在经过定价公式计算后的精确度')}
            </div>
          </FormItem>
          <FormItem label={i18next.t('商品定价公式取舍方法')}>
            <RadioGroup
              name='formula_price_rounding_type'
              value={formula_price_rounding_type}
              inline
              onChange={(value) =>
                handleChangeRadio('formula_price_rounding_type', value)
              }
            >
              {formula_price_rounding_types.map((item) => {
                return (
                  <Radio key={item.value} value={item.value}>
                    {item.text}
                  </Radio>
                )
              })}
            </RadioGroup>
          </FormItem>
        </Form>
      </FormPanel>
    </FormGroup>
  )
})

export default MerchandiseSetting
