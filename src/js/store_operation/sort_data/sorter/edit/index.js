/*
 * @Description: 编辑分拣员
 */
import React, { useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Flex,
  FormItem,
  FormPanel,
  FormGroup,
  Form,
  RadioGroup,
  Radio,
} from '@gmfe/react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'

import SkuTransfer from '../../components/sku_transfer'
import LinerouteTransfer from '../../components/line_route_transfer'

import { TASK_SCOPE_OPTIONS } from 'common/enum'

import globalStore from 'stores/global'
import store from './store'

// 分配方式下拉选项
const ALLOC_TYPE_OPTIONS = [
  {
    value: 1,
    text: t('按商品'),
  },
  {
    value: 2,
    text: t('按商户'),
  },
]
// 分配方式下拉选项
const CONFIG_CUSTOMER_OPTIONS = [
  {
    value: 1,
    text: t('按线路'),
  },
  {
    value: 2,
    text: t('按商户标签'),
  },
]

function EditSorter() {
  const { sorterDetail } = store

  const {
    username,
    phone,
    name,
    task_scope,
    alloc_type = 1,
    address_kind = 1,
    spu_ids = [],
    route_address_ids = [],
    merchant_address_ids = [],
  } = sorterDetail

  const address_ids =
    address_kind === 1 ? route_address_ids : merchant_address_ids

  // 编辑分拣员权限
  const editSorterInfo = globalStore.hasPermission('edit_sorter_info')

  const { user_id } = useParams()

  const formRef = useRef()

  useEffect(() => {
    store.getSorterDetail(user_id)
  }, [user_id])

  function renderRadio(params) {
    const { value, text } = params
    return (
      <Radio value={value} key={value} disabled={!editSorterInfo}>
        {text}
      </Radio>
    )
  }

  function onCancel() {
    window.closeWindow()
  }

  const formTextArr = [
    {
      label: t('用户名'),
      text: username,
    },
    {
      label: t('姓名'),
      text: name,
    },
    {
      label: t('电话'),
      text: phone,
    },
  ]

  return (
    <FormGroup
      formRefs={[formRef]}
      disabled={!editSorterInfo}
      onCancel={onCancel}
      onSubmitValidated={() => store.onSubmit()}
    >
      <FormPanel title={t('编辑分拣员')}>
        <Form
          hasButtonInGroup
          ref={formRef}
          labelWidth='130px'
          colWidth='600px'
        >
          {formTextArr.map(({ label, text }) => (
            <FormItem label={label} key={label}>
              <Flex className='form-control gm-border-0'>{text}</Flex>
            </FormItem>
          ))}
          <FormItem label={t('可见分配范围')}>
            <RadioGroup
              inline
              name='task_scope'
              value={task_scope}
              onChange={(task_scope) => store.changeDetailData({ task_scope })}
            >
              {TASK_SCOPE_OPTIONS.map(renderRadio)}
            </RadioGroup>
            <div className='gm-text-desc gm-margin-top-5'>
              <div>
                {t('所有任务：此分拣员登录分拣软件可看到系统所有分拣任务')}
              </div>
              <div>
                {t(
                  '固定分配：需设置分配方式及具体任务，此分拣员登录分拣软件只看到分拣的任务',
                )}
              </div>
            </div>
          </FormItem>
          {task_scope === 2 && (
            <FormItem label={t('分配方式')}>
              <RadioGroup
                inline
                name='alloc_type'
                value={alloc_type}
                onChange={(alloc_type) =>
                  store.changeDetailData({ alloc_type })
                }
              >
                {ALLOC_TYPE_OPTIONS.map(renderRadio)}
              </RadioGroup>
              {alloc_type === 1 && (
                <SkuTransfer
                  className='gm-margin-top-10'
                  selectedValues={spu_ids.slice()}
                  onSelectValues={(value) => {
                    store.changeDetailData({ spu_ids: value })
                  }}
                />
              )}
            </FormItem>
          )}
          {[task_scope, alloc_type].every((value) => value === 2) && (
            <FormItem label={t('配置商户')}>
              <RadioGroup
                inline
                name='address_kind'
                value={address_kind}
                onChange={(address_kind) =>
                  store.changeDetailData({ address_kind })
                }
              >
                {CONFIG_CUSTOMER_OPTIONS.map(renderRadio)}
              </RadioGroup>
              <LinerouteTransfer
                className='gm-margin-top-10'
                address_kind={address_kind}
                selectedValues={address_ids.slice()}
                onSelectValues={(value) => {
                  store.changeDetailData({
                    [`${
                      address_kind === 1 ? 'route' : 'merchant'
                    }_address_ids`]: value,
                  })
                }}
              />
            </FormItem>
          )}
        </Form>
      </FormPanel>
    </FormGroup>
  )
}

export default observer(EditSorter)
