import { t } from 'gm-i18n'
import React, { useEffect, useRef } from 'react'
import {
  FormGroup,
  FormPanel,
  Form,
  Switch,
  DatePicker,
  Flex,
  Tip,
  FormItem,
  MoreSelect,
  Validator
} from '@gmfe/react'
import { observer } from 'mobx-react'
import store from './store'
import globalStore from '../../../stores/global'
import _ from 'lodash'

const Component = observer(() => {
  const refform = useRef(null)

  const onSubmit = () => {
    store.save().then(() => Tip.success(t('提交成功')))
  }

  const handleChangeSwitch = () => {
    const { is_invite } = store.setting
    store.changeSetting('is_invite', is_invite ? 0 : 1)
  }

  const handleDateChange = value => {
    store.changeSetting('invite_limit_time', value)
  }

  const handleSelectChange = selected => {
    store.changeSetting('invite_coupon_id', selected.value)
  }

  useEffect(() => {
    store.getSetting()
    store.getCouponList()
  }, [])

  const {
    setting: { is_invite, invite_limit_time, invite_coupon_id },
    couponList
  } = store
  const selectedCoupon =
    _.find(couponList, v => v.value === invite_coupon_id) || null

  return (
    <FormGroup
      disabled={!globalStore.hasPermission('edit_invitation_gift')}
      formRefs={[refform]}
      onSubmit={onSubmit}
    >
      <FormPanel title={t('邀请有礼设置')}>
        <Form
          ref={refform}
          hasButtonInGroup
          labelWidth='160px'
          disabledCol
          horizontal
        >
          <FormItem label={t('邀请有礼')} required>
            <Switch
              type='primary'
              checked={!!is_invite}
              on={t('开启')}
              off={t('关闭')}
              onChange={handleChangeSwitch}
            />
            <div className='gm-text-desc gm-margin-top-5'>
              {t('设置为"开启"后，商户可以进入邀请有礼邀请好友注册下单')}
            </div>
          </FormItem>
          <FormItem
            label={t('返券规则')}
            required
            validate={Validator.create(
              Validator.TYPE.required,
              invite_limit_time
            )}
          >
            <Flex alignCenter>
              {t('自')}
              <DatePicker
                date={invite_limit_time}
                onChange={handleDateChange}
                placeholder='选择日期'
              />
              {t('起，每邀请一位好友下单可得一张优惠券')}
            </Flex>
          </FormItem>
          <FormItem label={t('返券选择')}>
            <MoreSelect
              style={{ width: '260px' }}
              data={couponList.slice()}
              selected={selectedCoupon}
              renderListFilterType='pinyin'
              onSelect={handleSelectChange}
              placeholder={t('请选择优惠券')}
            />
          </FormItem>
        </Form>
      </FormPanel>
    </FormGroup>
  )
})

export default Component
