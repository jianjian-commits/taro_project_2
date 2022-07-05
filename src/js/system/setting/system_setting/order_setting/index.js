import React, { useEffect, useRef } from 'react'
import { observer } from 'mobx-react'
import {
  Form,
  FormGroup,
  FormItem,
  FormPanel,
  Radio,
  RadioGroup,
  Tip,
  CheckboxGroup,
  Checkbox,
  Switch,
  ToolTip,
  InputNumberV2,
  Flex,
} from '@gmfe/react'
import { t } from 'gm-i18n'
import _ from 'lodash'

import { isCStationAndC } from 'common/service'
import globalStore from '../../../../stores/global'
import store from './store'

import { orderStreamType } from '../util'
import Printer from './printer'
import SvgDownLoad from 'svg/download.svg'

const OrderSetting = observer(() => {
  const {
    order_create_purchase_task,
    order_process,
    order_can_have_duplicate_sku,
    pf_merge_order,
    default_spu_remark,
    order_supplement_price,
    recalculate_freight,
    contract_rate_format,
    order_auto_sign,
    auto_sign_days,
    order_auto_print,
  } = store.orderData

  const hasEditOrderPurchaseProfitPermission = globalStore.hasPermission(
    'edit_order_purchase_profit',
  )

  const formRef = useRef(null)

  useEffect(() => {
    // 监听orderInfo地址的变化，以免取值undefined
    store.initData()
  }, [globalStore.orderInfo])

  const handleChange = (name, value) => {
    store.changeDataItem(name, value)
  }

  const handleSave = () => {
    // 处理订单流传参字段
    store.postSetting('order').then(() => {
      Tip.success(t('保存成功'))
      window.location.reload()
    })
  }

  const handleOrderStreamChange = (value, index) => {
    store.setOrderProcess(value, index)
  }

  // 是否有设置订单流权限
  const canEditOrderProcessConfig = globalStore.hasPermission(
    'edit_order_process',
  )

  // 是否有展示多sku开关设置权限
  const canViewDuplicateSkuSetting = globalStore.hasPermission(
    'view_edit_duplicate_sku_setting',
  )

  return (
    <>
      <FormGroup formRefs={[formRef]} onSubmit={handleSave}>
        <FormPanel title={t('订单设置')}>
          <Form
            onSubmit={handleSave}
            ref={formRef}
            labelWidth='166px'
            hasButtonInGroup
            disabledCol
          >
            <FormItem label={t('商品采购设置')}>
              <RadioGroup
                name='order_create_purchase_task'
                value={order_create_purchase_task}
                inline
                onChange={(value) =>
                  handleChange('order_create_purchase_task', value)
                }
              >
                <Radio
                  value={0}
                  disabled={!hasEditOrderPurchaseProfitPermission}
                >
                  {t('订单商品自动进入采购任务')}
                </Radio>
                <div className='gm-text-desc gm-margin-top-5 gm-margin-bottom-20'>
                  {t(
                    '订单创建成功则自动生成采购任务，可能存在延时，请耐心等待',
                  )}
                </div>
                <Radio
                  value={1}
                  disabled={!hasEditOrderPurchaseProfitPermission}
                >
                  {t('订单商品手动进入采购任务')}
                </Radio>
                <div className='gm-text-desc gm-margin-top-5'>
                  {t('通过人工判断订单商品进入采购任务，可操作性、灵活性强')}
                </div>
              </RadioGroup>
            </FormItem>
            <FormItem label={t('默认商品备注')}>
              <Switch
                type='primary'
                checked={!!default_spu_remark}
                on={t('开启')}
                off={t('关闭')}
                onChange={(value) => {
                  handleChange('default_spu_remark', value)
                }}
              />
              <div className='gm-text-desc gm-margin-top-5'>
                <p className='gm-margin-bottom-5'>
                  {t(
                    '开启后，后台录单时订单商品备注会自动添加上笔订单中的商品备注',
                  )}
                </p>
                <p>
                  {t(
                    '关闭后，后台录单时不自动添加商品备注，可手动点击商品备注进行添加',
                  )}
                </p>
              </div>
            </FormItem>
            <FormItem label={t('订单流设置')}>
              <div className='gm-text-desc gm-margin-top-5'>
                {t('通过配置类型的订单进入不同业务模块，请谨慎设定！')}
              </div>
            </FormItem>
            {_.map(order_process, (type, index) => (
              <FormItem label={type.text} key={type.value}>
                <CheckboxGroup
                  name='orderProcess'
                  inline
                  value={type.order_process_config.slice()}
                  onChange={(value) => handleOrderStreamChange(value, index)}
                >
                  {_.map(orderStreamType, (stream) => (
                    <Checkbox
                      key={stream.value}
                      value={stream.value}
                      className='gm-margin-right-10'
                      disabled={stream.disabled || !canEditOrderProcessConfig}
                    >
                      {stream.text}
                    </Checkbox>
                  ))}
                </CheckboxGroup>
              </FormItem>
            ))}
            <FormItem label={t('订单自动签收')}>
              <Switch
                type='primary'
                checked={!!order_auto_sign}
                on={t('开启')}
                off={t('关闭')}
                onChange={(value) => handleChange('order_auto_sign', value)}
              />
              {!!order_auto_sign && (
                <>
                  <Flex alignCenter className='gm-margin-top-5'>
                    <InputNumberV2
                      className='form-control'
                      style={{ width: '50px' }}
                      value={auto_sign_days}
                      min={1}
                      max={30}
                      precision={0}
                      onChange={(value) => {
                        handleChange('auto_sign_days', value)
                      }}
                      placeholder={t('请输入整数')}
                    />
                    &nbsp;天后系统自动签收
                  </Flex>
                  <div className='gm-text-desc gm-margin-top-5'>
                    <p className='gm-margin-bottom-5'>
                      {t(
                        '订单改为 「配送中」时开始计算，系统会按设置的时间自动签收（签收时间精确到小时整）',
                      )}
                    </p>
                    <p>
                      {t(
                        '如：订单改为配送中时间为7月1日 12:21，7天后自动签收，如未通过其它方式签收订单，则系统会在7月8日13:00自动签收该笔订单',
                      )}
                    </p>
                  </div>
                </>
              )}
            </FormItem>
            {canViewDuplicateSkuSetting && (
              <FormItem label={t('订单中相同商品拆分下单')}>
                <Switch
                  type='primary'
                  checked={!!order_can_have_duplicate_sku}
                  on={t('开启')}
                  off={t('关闭')}
                  onChange={() =>
                    handleChange(
                      'order_can_have_duplicate_sku',
                      !order_can_have_duplicate_sku,
                    )
                  }
                />
                <div className='gm-text-desc gm-margin-top-5'>
                  <p className='gm-margin-bottom-5'>
                    {t(
                      '开启后，业务平台和商城端，均可根据需要在订单中重复下单同一种商品，分别独立填写下单数，且拆分进入分拣、配送。',
                    )}
                  </p>
                  <p className='gm-margin-bottom-5'>
                    {t(
                      '关闭后，业务平台和商城端，订单中同一商品仅允许添加一次',
                    )}
                  </p>
                </div>
              </FormItem>
            )}
            {isCStationAndC() || (
              <FormItem label={t('补录订单价格')}>
                <RadioGroup
                  name='order_supplement_price'
                  value={order_supplement_price}
                  inline
                  onChange={(value) =>
                    handleChange('order_supplement_price', value)
                  }
                >
                  <Radio value={0}>{t('当前商品价格')}</Radio>
                  <div className='gm-text-desc gm-margin-top-5 gm-margin-bottom-20'>
                    {t('补录订单添加商品时，根据最新商品单价添加销售价')}
                  </div>
                  <Radio value={1}>{t('历史商品价格')}</Radio>
                  <div className='gm-text-desc gm-margin-top-5'>
                    {t(
                      '补录订单添加商品时，根据所选下单日期单商品历史报价添加销售价',
                    )}
                  </div>
                </RadioGroup>
              </FormItem>
            )}
            {isCStationAndC() || (
              <FormItem label={t('是否开启先款后货订单合并')}>
                <Switch
                  type='primary'
                  checked={!!pf_merge_order}
                  on={t('开启')}
                  off={t('关闭')}
                  onChange={(value) => handleChange('pf_merge_order', value)}
                />
                <div className='gm-text-desc gm-margin-top-5'>
                  <p className='gm-margin-bottom-5'>
                    {t('开启后，先款的订单能够在商城合单')}
                  </p>
                </div>
              </FormItem>
            )}
            {isCStationAndC() || (
              <FormItem label={t('商城合单运费计算逻辑')}>
                <RadioGroup
                  name='recalculate_freight'
                  value={recalculate_freight}
                  inline
                  onChange={(value) =>
                    handleChange('recalculate_freight', value)
                  }
                >
                  <Radio value={0}>{t('合单后重新计算运费')}</Radio>
                  <div className='gm-text-desc gm-margin-top-5 gm-margin-bottom-20'>
                    {t('设置后，根据合单后的商品金额，重新计算运费')}
                  </div>
                  <Radio value={1}>{t('按原单计算运费')}</Radio>
                  <div className='gm-text-desc gm-margin-top-5'>
                    {t('合单后取原始订单运费，不重新计算运费')}
                  </div>
                </RadioGroup>
              </FormItem>
            )}
            <FormItem label={t('合同变化率')}>
              <RadioGroup
                name='contract_rate_format'
                value={contract_rate_format}
                onChange={(value) =>
                  handleChange('contract_rate_format', value)
                }
              >
                <Radio value={1}>
                  {t('表征变化')}
                  <ToolTip
                    className='gm-padding-left-5'
                    popup={
                      <div className='gm-padding-5' style={{ width: '150px' }}>
                        {t(
                          '值为分数形式，可为负值，公式：原价X（1+变化率）=销售价。',
                        )}
                      </div>
                    }
                  />
                </Radio>
                <div className='gm-margin-top-5' />
                <Radio value={2}>
                  {t('表征折扣')}
                  <ToolTip
                    className='gm-padding-left-5'
                    popup={
                      <div className='gm-padding-5' style={{ width: '150px' }}>
                        {t('值为大于0的小数，公式：原价X变化率=销售价')}
                      </div>
                    }
                  />
                </Radio>
              </RadioGroup>
            </FormItem>
            <FormItem label={t('下单后自动打印配送单')}>
              <Switch
                type='primary'
                checked={!!order_auto_print}
                on={t('开启')}
                off={t('关闭')}
                onChange={(value) => handleChange('order_auto_print', value)}
              />
              <div className='gm-text-desc gm-margin-top-5'>
                <p className='gm-margin-bottom-5'>
                  {t(
                    '开启后，有新增订单，系统会自动按商户配置的模板进行打印（如没有配置商户模板则按默认模板打印）',
                  )}
                </p>
              </div>
              <Flex alignCenter className='gm-text-14 gm-text-primary'>
                <a
                  target='_blank'
                  rel='noopener noreferrer'
                  className='gm-cursor'
                  style={{
                    verticalAlign: 'top',
                  }}
                  href='//js.guanmai.cn/v2/static/file/electron_station/观麦桌面端 Setup 1.0.0.exe'
                >
                  <SvgDownLoad />
                  <span className='gm-margin-left-5'>
                    {t('点击下载观麦桌面端')}
                  </span>
                </a>
              </Flex>
            </FormItem>
            {!!order_auto_print && <Printer />}
          </Form>
        </FormPanel>
      </FormGroup>
    </>
  )
})

export default OrderSetting
