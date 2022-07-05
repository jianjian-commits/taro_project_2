import { i18next } from 'gm-i18n'
import React, { useEffect, useRef } from 'react'
import { observer } from 'mobx-react'
import {
  Form,
  FormItem,
  FormPanel,
  FormGroup,
  Radio,
  RadioGroup,
  Switch,
  Dialog,
  Tip,
  Select,
  Flex,
} from '@gmfe/react'
import store from './store'
import globalStore from '../../../stores/global'
import { lockPrintSort } from './util'

const SortingSetting = observer(() => {
  const {
    generate_sort_num_rule_classification,
    generate_sort_num_rule,
    sorting_product_code_type,
    show_res_custom_code,
    lock_sort_print,
    sorting_edit_lock,
    sale_unit_sort_independence,
    box_number_rule,
  } = store.sortingData

  const hasEditGenerateSortNumRulePermission = globalStore.hasPermission(
    'edit_generate_sort_num_rule',
  )
  const hasEditSettleWayPermission = globalStore.hasPermission(
    'edit_default_settle_way',
  )
  const hasEditSortingProductCode = globalStore.hasPermission(
    'edit_sorting_product_code',
  )
  const hasEditResCustomCode = globalStore.hasPermission('get_res_custom_code')
  const hasEditSortingLock = globalStore.hasPermission('edit_sorting_lock')
  // 箱号生成规则
  const hasEditBoxNumberRule = globalStore.hasPermission('box_num_rule_setting')

  const formRef = useRef(null)

  useEffect(() => {
    store.initData('sorting', {
      generate_sort_num_rule: globalStore.otherInfo.generateSortNumRule,
      generate_sort_num_rule_classification:
        globalStore.otherInfo.generateSortNumRuleClassification,
    })
  }, [])

  useEffect(() => {
    store.initData('sorting', {
      sorting_product_code_type:
        globalStore.groundWeightInfo.sorting_product_code_type !== 1 || false,
      show_res_custom_code: globalStore.otherInfo.showResCustomCode || 0,
      lock_sort_print: !!globalStore.groundWeightInfo.sorting_edit_lock,
      sorting_edit_lock:
        +globalStore.groundWeightInfo.sorting_edit_lock === 2 ? 2 : 1,
      sale_unit_sort_independence:
        globalStore.groundWeightInfo.sale_unit_sort_independence,
      box_number_rule: globalStore.groundWeightInfo.box_number_rule || 0,
    })
  }, [
    globalStore.groundWeightInfo.sorting_product_code_type,
    globalStore.groundWeightInfo.sorting_edit_lock,
    globalStore.groundWeightInfo.sale_unit_sort_independence,
    globalStore.groundWeightInfo.box_number_rule,
  ])

  const handleChangeSwitch = (name) => {
    store.changeDataItem('sorting', name, !store.sortingData[name])
  }

  const handleChangeSortRule = (name, value) => {
    Dialog.confirm({
      title: i18next.t('提示'),
      children: (
        <div>
          <div>
            {i18next.t(
              '修改分拣序号规则后，新进入“分拣中”的订单将按新规则生成序号。是否确认修改？',
            )}
          </div>
          <div className='gm-text-red'>
            {i18next.t(
              '注意：如当前周期内已有订单按老规则生成序号，建议等当前周期作业结束后再更改',
            )}
          </div>
        </div>
      ),
      onOK: () => {
        if (name === 'generate_sort_num_rule_classification') {
          store.changeDataItem('sorting', 'generate_sort_num_rule', value)
        }
        store.changeDataItem('sorting', name, value)
      },
    })
  }

  const handleSave = () => {
    store.postSetting('sorting').then(() => {
      Tip.success(i18next.t('保存成功'))
      window.location.reload()
    })
  }

  const { isCStation } = globalStore.otherInfo

  return (
    <FormGroup formRefs={[formRef]} onSubmit={handleSave}>
      <FormPanel title={i18next.t('分拣设置')}>
        <Form
          onSubmit={handleSave}
          ref={formRef}
          labelWidth='166px'
          hasButtonInGroup
          disabledCol
        >
          {hasEditGenerateSortNumRulePermission && (
            <FormItem
              label={i18next.t('分拣序号生成规则')}
              if={hasEditSettleWayPermission.toString()}
            >
              <RadioGroup
                name='generate_sort_num_rule_classification'
                value={+generate_sort_num_rule_classification}
                inline
                onChange={(value) =>
                  handleChangeSortRule(
                    'generate_sort_num_rule_classification',
                    value,
                  )
                }
              >
                <Radio value={1}>{i18next.t('按订单生成分拣序号')}</Radio>
                {!isCStation && (
                  <Radio value={2}>{i18next.t('按线路生成分拣序号')}</Radio>
                )}
              </RadioGroup>
              <div className='gm-text-desc gm-margin-top-5'>
                <p className='gm-margin-bottom-5'>
                  {i18next.t(
                    '1. 选择按订单生成分拣序号，分拣序号从1开始递增，依次展现为1，2，3……',
                  )}
                </p>
                {!isCStation && (
                  <p>
                    {i18next.t(
                      '2. 选择按路线生成分拣序号，在各条线路内，独立生成分拣序号，各线路不影响如：线路A-1、无线路-1',
                    )}
                  </p>
                )}
              </div>
            </FormItem>
          )}
          {+generate_sort_num_rule_classification === 2 &&
            hasEditGenerateSortNumRulePermission &&
            !isCStation && (
              <FormItem
                label={i18next.t('线路内商户分拣号设置')}
                if={hasEditSettleWayPermission.toString()}
              >
                <RadioGroup
                  name='generate_sort_num_rule'
                  value={+generate_sort_num_rule}
                  inline
                  onChange={(value) =>
                    handleChangeSortRule('generate_sort_num_rule', value)
                  }
                >
                  <Radio value={2}>
                    {i18next.t('线路内按商户分配分拣序号')}
                  </Radio>
                  <Radio value={3}>
                    {i18next.t('线路内同商户不合并分拣序号')}
                  </Radio>
                </RadioGroup>
                <div className='gm-text-desc gm-margin-top-5'>
                  <p className='gm-margin-bottom-5'>
                    {i18next.t(
                      '1. 线路内按商户分配分拣序号，客户所属线路A时，同一个客户所下第一个订单分配序号为 A-1-1，所下的第二个订单分配序号为A-1-2，可根据前面的“A-1”进行投筐区域区分。',
                    )}
                  </p>
                  <p>
                    {i18next.t(
                      '2. 线路内同商户不合并分拣序号，则每个订单都独立分配分拣序号，如同属线路A的订单分拣序号依次为A-1，A-2……',
                    )}
                  </p>
                </div>
              </FormItem>
            )}
          <FormItem label={i18next.t('分拣商品码')}>
            <Switch
              type='primary'
              checked={sorting_product_code_type}
              on={i18next.t('开启')}
              off={i18next.t('关闭')}
              onChange={() => handleChangeSwitch('sorting_product_code_type')}
              disabled={!hasEditSortingProductCode}
            />
            <div className='gm-text-desc gm-margin-top-5'>
              <p className='gm-margin-bottom-5'>
                {i18next.t(
                  '开启后: 分拣软件打印的标签将会显示商品码，商品码作为商品的唯一识别码，可用于验货、分拣、配送等多个场景的扫码识别，对商品的状态进行记录。',
                )}
              </p>
              <p>{i18next.t('关闭后: 分拣软件打印的标签则不显示商品码')}</p>
            </div>
          </FormItem>
          {!isCStation && (
            <FormItem label={i18next.t('分拣任务信息展现')}>
              <RadioGroup
                name='show_res_custom_code'
                value={show_res_custom_code}
                inline
                onChange={(v) =>
                  store.changeDataItem('sorting', 'show_res_custom_code', v)
                }
              >
                <Radio disabled={!hasEditResCustomCode} value={0}>
                  {i18next.t('优先商户名')}
                </Radio>
                <Radio disabled={!hasEditResCustomCode} value={1}>
                  {i18next.t('优先商户自定义编码')}
                </Radio>
              </RadioGroup>
              <div className='gm-text-desc gm-margin-top-5'>
                <p className='gm-margin-bottom-5'>
                  {i18next.t(
                    '优先商户名：站点内所有账号登录分拣软件，相应位置优先展示「商户名」，不展示「商户自定义编码」',
                  )}
                </p>
                <p>
                  {i18next.t(
                    '优先商户自定义编码：站点内所有账号登录分拣软件，相应位置优先展示「商户自定义编码」，如未设置自定义编码，则展示原商户名',
                  )}
                </p>
              </div>
            </FormItem>
          )}
          <FormItem label={i18next.t('锁定分拣')}>
            <Switch
              type='primary'
              checked={lock_sort_print}
              on={i18next.t('开启')}
              off={i18next.t('关闭')}
              onChange={() => handleChangeSwitch('lock_sort_print')}
              disabled={!hasEditSortingLock}
            />
            <div className='gm-text-desc gm-margin-top-5 gm-margin-bottom-5'>
              <p>
                {i18next.t(
                  '开启后，订单状态为“配送中”或“已签收”后，订单中的商品称重信息不会被分拣软件修改',
                )}
              </p>
            </div>
            {lock_sort_print && (
              <Flex row alignCenter>
                <span>{i18next.t('订单进入')}</span>
                <Select
                  onChange={(value) =>
                    store.changeDataItem('sorting', 'sorting_edit_lock', value)
                  }
                  data={lockPrintSort}
                  value={sorting_edit_lock}
                  style={{ width: '80px' }}
                />
                <span>
                  {i18next.t('状态后，订单中的商品称重信息不会被分拣软件修改')}
                </span>
              </Flex>
            )}
          </FormItem>
          <FormItem label={i18next.t('单独记录销售单位的称重数')}>
            <Switch
              checked={sale_unit_sort_independence}
              on={i18next.t('开启')}
              off={i18next.t('关闭')}
              type='primary'
              onChange={() => handleChangeSwitch('sale_unit_sort_independence')}
            />
            <div className='gm-text-desc gm-margin-top-5 gm-margin-bottom-5'>
              <p>
                {i18next.t(
                  '开启后，销售单位的称重数将单独记录，不与基本单位的称重数互相换算',
                )}
              </p>
            </div>
          </FormItem>
          {hasEditBoxNumberRule && (
            <FormItem label={i18next.t('箱号生成规则')}>
              <RadioGroup
                name='box_number_rule'
                value={box_number_rule}
                inline
                onChange={(v) =>
                  store.changeDataItem('sorting', 'box_number_rule', v)
                }
              >
                <Radio value={1}>{i18next.t('按箱号顺序生成')}</Radio>
                <Radio value={0}>{i18next.t('按“总箱数-当前箱号”生成')}</Radio>
              </RadioGroup>
              <div className='gm-text-desc gm-margin-top-5'>
                <p className='gm-margin-bottom-5'>
                  {i18next.t(
                    '1. 选择按箱号顺序生成，箱号从1开始递增，依次展现为1号箱，2号箱，3号箱......',
                  )}
                </p>
                <p>
                  {i18next.t(
                    '2. 选择按总箱数-当前箱号生成，针对散件箱号依然是顺序生成，整件则根据整件商品的总件数生成，假设有3件，则展现为3-1，3-2，3-3',
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

export default SortingSetting
