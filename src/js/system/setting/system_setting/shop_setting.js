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
} from '@gmfe/react'
import { i18next, t } from 'gm-i18n'
import globalStore from '../../../stores/global'
import store from './store'

const ShopSetting = observer(() => {
  const { show_order_remark, default_settle_way } = store.shopData
  const { isCStation } = globalStore.otherInfo

  const viewOrderComment = globalStore.hasPermission('edit_order_remark')
  const hasEditSettlewayPermission = globalStore.hasPermission(
    'edit_default_settle_way'
  )

  const formRef = useRef(null)

  useEffect(() => {
    store.initData('shop', {
      show_order_remark: globalStore.otherInfo.showOrderRemark,
      default_settle_way: globalStore.otherInfo.defaultSettleWay,
    })
  }, [])

  const handleChangeSwitch = (name) => {
    console.log(name)
    store.changeDataItem('shop', name, !store.shopData[name])
  }

  const handleChangeRadio = (name, value) => {
    store.changeDataItem('shop', name, value)
  }

  const handleSave = () => {
    store.postSetting('shop').then(() => {
      Tip.success(t('保存成功'))

      window.location.reload()
    })
  }

  return (
    <>
      {(viewOrderComment || hasEditSettlewayPermission) && (
        <FormGroup formRefs={[formRef]} onSubmit={handleSave}>
          <FormPanel title={i18next.t('商城设置')}>
            <Form
              onSubmit={handleSave}
              ref={formRef}
              labelWidth='166px'
              hasButtonInGroup
              disabledCol
            >
              {viewOrderComment && (
                <FormItem label={t('商户订单备注')}>
                  <Switch
                    type='primary'
                    checked={!!show_order_remark}
                    on={t('开启')}
                    off={t('关闭')}
                    onChange={() => handleChangeSwitch('show_order_remark')}
                  />
                  <div className='gm-text-desc gm-margin-top-5'>
                    <div>
                      {t('开启后，商户端下单时可输入订单备注并与后台同步展示')}
                    </div>
                    <div>{t('关闭后，商户端不展示订单备注')}</div>
                  </div>
                </FormItem>
              )}
              {/** 纯C站点都是先款后货，不可修改 */}
              {hasEditSettlewayPermission && !isCStation && (
                <FormItem label={t('默认结算方式')}>
                  <RadioGroup
                    name='default_settle_way'
                    value={default_settle_way}
                    if={hasEditSettlewayPermission}
                    inline
                    onChange={(value) =>
                      handleChangeRadio('default_settle_way', value)
                    }
                  >
                    <Radio value={1}>{t('先货后款')}</Radio>
                    <Radio value={2}>{t('先款后货')}</Radio>
                  </RadioGroup>
                  <div className='gm-text-desc gm-margin-top-5'>
                    {t('新注册的用户将按照此设置作为默认结算方式')}
                  </div>
                </FormItem>
              )}
            </Form>
          </FormPanel>
        </FormGroup>
      )}
    </>
  )
})

export default ShopSetting
