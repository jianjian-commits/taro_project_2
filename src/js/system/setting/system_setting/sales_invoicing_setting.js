import React, { useEffect, useRef } from 'react'
import { observer } from 'mobx-react'
import {
  Form,
  FormGroup,
  FormItem,
  FormPanel,
  Radio,
  RadioGroup,
  Select,
  Switch,
  Tip,
  Flex,
  InputNumberV2,
  Validator,
} from '@gmfe/react'
import store from './store'
import { i18next } from 'gm-i18n'
import globalStore from '../../../stores/global'
import { stockInDefaultPrice } from './util'

const SalesInvoicingSetting = observer(() => {
  const {
    batch_in_stock,
    in_stock_price_warning,
    weigh_stock_in,
    weigh_check,
    in_stock_ref_price,
    is_negative_allow,
    auto_select_batch,
    select_batch_method,
    shelf_life_warning,
    before_warn_days,
  } = store.salesInvoicingData
  const hasEditMultiBatch = globalStore.hasPermission('edit_multi_batch')

  const hasEditInStockRefPrice = globalStore.hasPermission(
    'edit_in_stock_ref_price',
  )

  const { stock_method } = globalStore.user

  const formRef = useRef(null)

  useEffect(() => {
    store.initData('sales_invoicing', {
      in_stock_price_warning: globalStore.otherInfo.inStockPriceWarning,
      batch_in_stock: globalStore.otherInfo.batchInStock ? 1 : 0,
      in_stock_ref_price: globalStore.otherInfo.inStockRefPrice || 0,
    })
  }, [])

  useEffect(() => {
    store.initData('sales_invoicing', {
      weigh_stock_in: globalStore.groundWeightInfo.weigh_stock_in || 0,
      weigh_check: globalStore.groundWeightInfo.weigh_check || 0,
      is_negative_allow: globalStore.otherInfo.isNegativeAllow,
      auto_select_batch: globalStore.otherInfo.autoSelectBatch,
      select_batch_method: globalStore.otherInfo.select_batch_method,
      shelf_life_warning: globalStore.otherInfo.shelf_life_warning || 0,
      before_warn_days: globalStore.otherInfo.before_warn_days || null,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    globalStore.groundWeightInfo.weigh_check,
    globalStore.groundWeightInfo.weigh_stock_in,
    globalStore.otherInfo.isNegativeAllow,
    globalStore.otherInfo.autoSelectBatch,
    globalStore.otherInfo.select_batch_method,
    globalStore.otherInfo.shelf_life_warning,
    globalStore.otherInfo.before_warn_days,
  ])

  const handleChangeSwitch = (name) => {
    console.log(name, '11', !store.salesInvoicingData[name])
    store.changeDataItem(
      'sales_invoicing',
      name,
      !store.salesInvoicingData[name],
    )
  }

  const handleChangeRadio = (name, value) => {
    store.changeDataItem('sales_invoicing', name, value)
  }

  const handleChangeSelect = (name, value) => {
    store.changeDataItem('sales_invoicing', name, value)
  }

  const handleChangeInput = (name, value) => {
    store.changeDataItem('sales_invoicing', name, value)
  }

  const handleSave = () => {
    store.postSetting('sales_invoicing').then(() => {
      Tip.success(i18next.t('保存成功'))
      window.location.reload()
    })
  }

  const { isCStation } = globalStore.otherInfo

  return (
    <FormGroup formRefs={[formRef]} onSubmitValidated={handleSave}>
      <FormPanel title={i18next.t('进销存设置')}>
        <Form
          onSubmitValidated={handleSave}
          ref={formRef}
          labelWidth='166px'
          hasButtonInGroup
          disabledCol
        >
          <FormItem label={i18next.t('进销存计算方式')}>
            <div style={{ paddingTop: '8px' }}>
              {globalStore.user.stock_method === 1
                ? i18next.t('加权平均')
                : i18next.t('先进先出')}
            </div>
            <div className='gm-text-desc gm-margin-top-5'>
              {i18next.t(
                '因涉及核心经营数据，如需修改进销存计算方式请联系客服',
              )}
            </div>
          </FormItem>
          <FormItem label={i18next.t('扫码入库规则')}>
            <RadioGroup
              name='batch_in_stock'
              value={batch_in_stock}
              inline
              onChange={(value) => handleChangeRadio('batch_in_stock', value)}
            >
              <Radio disabled={!hasEditMultiBatch} value={1}>
                {i18next.t('同一规格商品多批次入库')}
              </Radio>
              <Radio disabled={!hasEditMultiBatch} value={0}>
                {i18next.t('同一规格商品单批次入库')}
              </Radio>
            </RadioGroup>
            <Flex column className='gm-text-desc gm-margin-top-5'>
              <span className='gm-margin-bottom-5'>
                {i18next.t(
                  '同一规格商品多批次入库：扫码入库时同一规格商品在当前入库单中允许根据不同批次号生成多条数据',
                )}
                ：
              </span>
              <span>
                {i18next.t(
                  '同一规格商品单批次入库：扫码入库时同一规格商品在当前入库单中只允许生成一条数据',
                )}
              </span>
            </Flex>
          </FormItem>
          <FormItem label={i18next.t('入库单价预警维度')}>
            <RadioGroup
              name='in_stock_price_warning'
              value={in_stock_price_warning}
              inline
              onChange={(value) =>
                handleChangeRadio('in_stock_price_warning', value)
              }
            >
              <Radio value={1}>{i18next.t('近七天入库均价')}</Radio>
              <Radio value={2}>{i18next.t('最高入库单价')}</Radio>
            </RadioGroup>
            <div className='gm-text-desc gm-margin-top-5'>
              <p className='gm-margin-bottom-5'>
                {i18next.t(
                  '近七天入库均价：入库时入库单价高于近七天入库均价时会给予提示',
                )}
              </p>
              <p className='gm-margin-bottom-5'>
                {i18next.t(
                  '最高入库单价：入库时入库单价高于所设的预警值会给予提示',
                )}
              </p>
            </div>
          </FormItem>

          <FormItem label={i18next.t('入库单价默认值设置')}>
            <Select
              onChange={(value) =>
                handleChangeSelect('in_stock_ref_price', value)
              }
              disabled={!hasEditInStockRefPrice}
              data={stockInDefaultPrice}
              value={in_stock_ref_price}
              style={{ width: '180px' }}
            />
          </FormItem>
          {!isCStation && (
            <FormItem label={i18next.t('地磅称重入库')}>
              <Switch
                type='primary'
                checked={!!weigh_stock_in}
                on={i18next.t('开启')}
                off={i18next.t('关闭')}
                onChange={() => handleChangeSwitch('weigh_stock_in')}
              />

              <div className='gm-text-desc gm-margin-top-5'>
                {i18next.t('开启后在入库页面可以读取地磅读数快速入库')}
              </div>
            </FormItem>
          )}
          {!isCStation && (
            <FormItem label={i18next.t('地磅称重盘点')}>
              <Switch
                type='primary'
                checked={!!weigh_check}
                on={i18next.t('开启')}
                off={i18next.t('关闭')}
                onChange={() => handleChangeSwitch('weigh_check')}
              />
              <div className='gm-text-desc gm-margin-top-5'>
                {i18next.t('开启后在库存盘点页面可以读取地磅读数快速盘点')}
              </div>
            </FormItem>
          )}
          <FormItem label={i18next.t('负库存允许出库')}>
            <Switch
              type='primary'
              checked={!!is_negative_allow}
              on={i18next.t('开启')}
              off={i18next.t('关闭')}
              onChange={() => handleChangeSwitch('is_negative_allow')}
            />
            {globalStore.user.stock_method === 1 ? (
              <div className='gm-text-desc gm-margin-top-5'>
                <p>{i18next.t('开启后，商品库存小于出库数时，允许出库操作')}</p>
                <p>
                  {i18next.t(
                    '关闭后，出库单中存在库存小于出库数的商品时，不允许出库操作',
                  )}
                </p>
              </div>
            ) : (
              <div className='gm-text-desc gm-margin-top-5'>
                <p>
                  {i18next.t(
                    '开启后，出库单中存在库存小于出库数的商品时，允许批量出库，但逐个出库单操作时仍不允许负库存出库',
                  )}
                </p>
                <p>
                  {i18next.t(
                    '关闭后，出库单中存在库存小于出库数的商品时，不允许出库操作',
                  )}
                </p>
              </div>
            )}
          </FormItem>
          {globalStore.user.stock_method === 2 && (
            <FormItem label={i18next.t('自动选择出库批次')}>
              <Switch
                checked={!!auto_select_batch}
                type='primary'
                on={i18next.t('开启')}
                off={i18next.t('关闭')}
                onChange={() => handleChangeSwitch('auto_select_batch')}
              />
              <div className='gm-text-desc gm-margin-top-5'>
                <p>{i18next.t('开启后为出库单中的商品自动推荐出库批次')}</p>
              </div>
              {!!auto_select_batch && (
                <RadioGroup
                  value={select_batch_method}
                  inline
                  onChange={(value) =>
                    handleChangeRadio('select_batch_method', value)
                  }
                >
                  <Radio value={1}>{i18next.t('按商品SPU库存批次出库')}</Radio>
                  <Radio value={2}>
                    {i18next.t('按关联采购规格库存批次出库')}
                  </Radio>
                </RadioGroup>
              )}
            </FormItem>
          )}
          {stock_method === 2 && (
            <FormItem label={i18next.t('保质期预警')}>
              <Switch
                type='primary'
                checked={!!shelf_life_warning}
                on={i18next.t('开启')}
                off={i18next.t('关闭')}
                onChange={() => handleChangeSwitch('shelf_life_warning')}
              />
              <div className='gm-text-desc gm-margin-top-5'>
                {i18next.t(
                  '开启后，将在首页预警信息处提醒临近过期（可设置临近时长）的商品',
                )}
              </div>
            </FormItem>
          )}
          {stock_method === 2 && !!shelf_life_warning && (
            <FormItem
              label={i18next.t('提前提醒天数')}
              required
              validate={Validator.create([], before_warn_days)}
            >
              <Flex alignCenter>
                <InputNumberV2
                  className='form-control'
                  style={{ width: '100px' }}
                  value={before_warn_days}
                  precision={0}
                  min={1}
                  onChange={(value) =>
                    handleChangeInput('before_warn_days', value)
                  }
                />
                <span className='gm-margin-lr-5'>{i18next.t('日')}</span>
              </Flex>
              <div className='gm-text-desc gm-margin-top-5'>
                <p>{i18next.t('设置临近保质期日前的提醒天数')}</p>
                <p>
                  {i18next.t(
                    '如：商品2020年5月20日过期，提前提醒天数设置2日，则会在2020年5月18日0点提醒',
                  )}
                </p>
              </div>
            </FormItem>
          )}
        </Form>
      </FormPanel>
    </FormGroup>
  )
})

export default SalesInvoicingSetting
