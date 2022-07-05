import React, { useEffect, useRef } from 'react'
import { observer } from 'mobx-react'
import { Form, FormGroup, FormItem, FormPanel, Select, Tip } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import _ from 'lodash'

import store from './store'
import globalStore from '../../../stores/global'
import ProcessPlanAlgorithmForm from '../../../common/components/process_plan_algorithm_form'
import { DEFAULT_PLAN_PRODUCE_SETTING } from './util'
import { ORDER_PUBLISH_SETTING } from 'common/enum'

const ProcessSetting = observer(() => {
  const {
    order_request_release_amount_type,
    process_order_suggest_plan_amount_config,
  } = store.processData

  const isCleanFood = globalStore.isCleanFood()

  const formRef = useRef(null)

  useEffect(() => {
    const {
      is_active,
      query_order_type,
      query_order_days,
      adjust_ratio,
      stock_up_type,
      stock_up_days,
      is_deduct_stock,
    } = globalStore.processInfo.processPlanAlgorithmInfo
    store.initData('process', {
      order_request_release_amount_type:
        globalStore.processInfo.order_request_release_amount_type || 1, // 默认为1
      process_order_suggest_plan_amount_config: {
        is_active: is_active || 0,
        query_order_type: query_order_type || 1, // 日均下单数设置
        query_order_days: query_order_days || null, // 手动填写的最近下单数，query_order_type === 1时使用
        adjust_ratio: adjust_ratio || null, // 调整比例
        stock_up_type: stock_up_type || 1, // 备货天数类型，1为按手动填写，2为按保质期
        stock_up_days: stock_up_days || null, // 手动填写的备货天数，stock_up_type === 1 时使用
        is_deduct_stock: is_deduct_stock || 0,
      },
    })
  }, [
    globalStore.processInfo.processPlanAlgorithmInfo,
    globalStore.processInfo.order_request_release_amount_type,
  ])

  const handleChangeProcessPlanAlgorithm = (name, value) => {
    store.changeProcessPlanAlgorithm(name, value)
  }

  const handleChangeProcess = (name, value) => {
    store.changeDataItem('process', name, value)
  }

  const verifyData = () => {
    let submit = true
    const {
      is_active,
      query_order_type,
      query_order_days,
      adjust_ratio,
      stock_up_type,
      stock_up_days,
    } = process_order_suggest_plan_amount_config

    // 日均下单数手动填写天数时，需要校验是否填写天数
    const verifyQueryOrder = query_order_type === 1 && _.isNil(query_order_days)
    // 预计备货天数手动填写天数时，需要校验是否填写天数
    const verifyStockUp = stock_up_type === 1 && _.isNil(stock_up_days)
    const verifyRatio = _.isNil(adjust_ratio)

    // 开启算法时需要校验
    if (is_active === 1) {
      if (verifyQueryOrder || verifyStockUp || verifyRatio) {
        Tip.warning(i18next.t('请填写完整信息'))
        submit = false
      }
    }

    return submit
  }

  const handleSave = () => {
    if (verifyData()) {
      store.postSetting('process').then(() => {
        Tip.success(i18next.t('保存成功'))
        window.location.reload()
      })
    }
  }

  const processPlanAlgorithmData = _.omit(
    {
      ...process_order_suggest_plan_amount_config,
    },
    'is_active',
  )

  const isActiveType = process_order_suggest_plan_amount_config.is_active

  return (
    <FormGroup formRefs={[formRef]} onSubmit={handleSave}>
      <FormPanel title={i18next.t('加工设置')}>
        <Form
          onSubmit={handleSave}
          ref={formRef}
          labelWidth='166px'
          hasButtonInGroup
          disabledCol
        >
          <FormItem label={i18next.t('任务发布时计划生产数默认设置')}>
            <Select
              onChange={(value) =>
                handleChangeProcess('order_request_release_amount_type', value)
              }
              data={ORDER_PUBLISH_SETTING}
              value={order_request_release_amount_type}
              style={{ width: '300px' }}
            />
          </FormItem>
          {/* 净菜才有智能推荐 */}
          {isCleanFood && (
            <FormItem label={i18next.t('预生产建议计划生产数默认设置')}>
              <Select
                onChange={(value) =>
                  handleChangeProcessPlanAlgorithm('is_active', value)
                }
                data={DEFAULT_PLAN_PRODUCE_SETTING}
                value={isActiveType}
                style={{ width: '300px' }}
              />
              <div className='gm-text-desc gm-margin-top-5'>
                {i18next.t(
                  '设置公式后，在新建预生产计划添加商品时，建议计划生产数和计划生产数将根据公式默认展示',
                )}
              </div>
            </FormItem>
          )}
          {isCleanFood && isActiveType === 1 && (
            <FormItem label={i18next.t('1.算法说明')}>
              <div className='gm-text-bold gm-text-14 gm-padding-top-5'>
                {i18next.t(
                  '建议计划生产数 = 日均下单数 x 调整比例 x 预计备货天数',
                )}
              </div>
            </FormItem>
          )}
          {isCleanFood && isActiveType === 1 && (
            <FormItem label={i18next.t('公式说明')}>
              <div className='gm-padding-top-5'>
                {i18next.t(
                  '基于填写的近xx日均下单数乘以调整比例，再乘以预计备货天数计算得出在当前备货天数下的建议计划生产数；',
                )}
              </div>
            </FormItem>
          )}
          {isCleanFood && isActiveType === 1 && (
            <FormItem label={i18next.t('示例')}>
              <div className='gm-padding-top-5'>
                {i18next.t(
                  '如选择近3天的A商品的日均下单数为100斤，调整比例为80%，预计备5天的货，则计算出来的建议计划生产数为100*80%*5=400斤。',
                )}
              </div>
            </FormItem>
          )}
          {isCleanFood && isActiveType === 1 && (
            <FormItem label={i18next.t('2.算法设置')}>
              <span> </span>
            </FormItem>
          )}
        </Form>
        {isCleanFood &&
          process_order_suggest_plan_amount_config.is_active === 1 && (
            <ProcessPlanAlgorithmForm
              data={processPlanAlgorithmData}
              onChange={handleChangeProcessPlanAlgorithm}
            />
          )}
      </FormPanel>
    </FormGroup>
  )
})

export default ProcessSetting
