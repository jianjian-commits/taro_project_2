import React, { useRef, useEffect } from 'react'
import { i18next } from 'gm-i18n'
import {
  FormPanel,
  FormGroup,
  Form,
  FormItem,
  Uploader,
  Checkbox,
  Tip,
} from '@gmfe/react'
import { history } from 'common/service'
import store from './store'
import globalStore from 'stores/global'
import { observer } from 'mobx-react'

const PayInfo = observer(() => {
  const refForm = useRef(null)
  const { payInfo } = store

  useEffect(() => {
    if (!payInfo.appid) {
      handleCancel()
    }
  }, [])

  console.log(payInfo)

  const handleFileUpload = (file, key) => {
    // 与后台约定文件类型字段值, 上传调用接口时用到：1-证书  2-证书密钥
    const type = key === 'api_cert_name' ? 1 : 2
    const certificate_file = file[0]
    store.uploadCertificateFile(type, certificate_file).then((json) => {
      handleChange(key, json.data.file_name)
    })
  }

  const handleCancel = () => {
    history.goBack()
  }

  const handleSubmit = () => {
    if (!globalStore.hasPermission('edit_toc_mp')) {
      Tip.info('没有开启小程序toc权限')
      return
    }
    store.updatePayInfo().then(() => {
      history.goBack()
    })
  }

  const handleChange = (key, value) => {
    store.setPayInfo(key, value)
  }

  return (
    <>
      <div
        style={{
          marginTop: 10,
          paddingLeft: 20,
          height: 36,
          lineHeight: '36px',
          background: '#e8f0ff',
        }}
      >
        {i18next.t(
          '请不要轻易修改小程序对应微信支付的商户号和支付密钥，配置不正确将导致小程序微信支付异常',
        )}
      </div>
      <FormGroup
        formRefs={[refForm]}
        onCancel={handleCancel}
        disabled={!payInfo.checked}
        onSubmitValidated={handleSubmit}
      >
        <FormPanel title={i18next.t('微信小程序')}>
          <Form ref={refForm} labelWidth='160px' colWidth='550px'>
            <FormItem label={i18next.t('小程序AppId')}>
              <div className='gm-margin-top-5'>{payInfo.appid}</div>
            </FormItem>
            <FormItem
              label={i18next.t('APPSecret(小程序密钥)')}
              validate={(v) => v(payInfo.appsecret || '')}
              required
            >
              <input
                type='text'
                name='appsecret'
                value={payInfo.appsecret || ''}
                onChange={(e) => handleChange('appsecret', e.target.value)}
                autoComplete='off'
              />
            </FormItem>
            <FormItem
              label={i18next.t('商户号')}
              validate={(v) => v(payInfo.merchant_id || '')}
              required
            >
              <input
                type='text'
                name='merchant_id'
                value={payInfo.merchant_id || ''}
                onChange={(e) => handleChange('merchant_id', e.target.value)}
                autoComplete='off'
              />
            </FormItem>
            <FormItem
              label={i18next.t('支付密钥')}
              validate={(v) => v(payInfo.pay_key || '')}
              required
            >
              <input
                type='text'
                name='pay_key'
                value={payInfo.pay_key || ''}
                onChange={(e) => handleChange('pay_key', e.target.value)}
                autoComplete='off'
              />
            </FormItem>
            <FormItem
              label={i18next.t('API证书')}
              validate={(v) => v(payInfo.api_cert_name || '')}
              required
            >
              <Uploader
                style={{ marginTop: '6px' }}
                onUpload={(file) => handleFileUpload(file, 'api_cert_name')}
                accept='.pem'
              >
                <a>
                  {payInfo.api_cert_name
                    ? i18next.t('点击重新上传')
                    : i18next.t('点击上传')}
                </a>
              </Uploader>
            </FormItem>

            <FormItem
              label={i18next.t('API证书密钥')}
              validate={(v) => v(payInfo.api_key_name || '')}
              required
            >
              <Uploader
                style={{ marginTop: '6px' }}
                onUpload={(file) => handleFileUpload(file, 'api_key_name')}
                accept='.pem'
              >
                <a>
                  {payInfo.api_key_name
                    ? i18next.t('点击重新上传')
                    : i18next.t('点击上传')}
                </a>
              </Uploader>
            </FormItem>
            <FormItem label=''>
              <Checkbox
                inline
                checked={!!payInfo.checked}
                className='gm-padding-top-5'
                onChange={() => handleChange('checked', !payInfo.checked)}
              >
                {i18next.t(
                  '已确认商户号和支付密钥配置正确（否则将导致微信支付异常）',
                )}
              </Checkbox>
            </FormItem>
          </Form>
        </FormPanel>
      </FormGroup>
    </>
  )
})

export default PayInfo
