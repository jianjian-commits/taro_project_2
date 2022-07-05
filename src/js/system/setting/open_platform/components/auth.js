import React from 'react'
import { i18next } from 'gm-i18n'
import { Form, FormButton, FormItem, Modal, Tip, Button } from '@gmfe/react'
import _ from 'lodash'
import PropTypes from 'prop-types'

import ItemBase from './item_base'
import store from '../store'

const AuthForm = ({ action, info, index }) => {
  const handleSubmit = (index, { template, name, action, sync }) => {
    const params = {}
    let canSubmit = true
    _.forEach(template, (v, key) => {
      const element = document.getElementById(`${key}`)
      const value = element ? element.value : ''
      if (!value) canSubmit = false
      params[`${key}`] = value
    })

    if (canSubmit) {
      store
        .updateApp(index, { [`${name}_${action}`]: params }, sync)
        .then(() => {
          const platform = store.getPlatform(index) || {}
          platform.appid === store.yongyouId &&
            Tip.info(
              i18next.t(
                '授权成功，系统正在为你初始化商品，如有异常，请到失败列表查看原因'
              )
            )
          store.getPlatforms()
          Modal.hide()
        })
    } else {
      Tip.info(i18next.t('填写完整授权信息'))
      Promise.reject(i18next.t('填写完整授权信息'))
    }
  }

  return (
    <Form
      disabledCol
      labelWidth='150px'
      btnPosition='right'
      onSubmit={() => handleSubmit(index, action)}
    >
      <ItemBase action={action} width={300} />
      {info ? (
        <FormItem label={info.title}>
          <div className='gm-text-desc'>
            <p className='gm-margin-top-5'>{info.template}</p>
          </div>
        </FormItem>
      ) : null}
      <FormButton>
        <Button className='gm-margin-right-5' onClick={() => Modal.hide()}>
          {i18next.t('取消')}
        </Button>
        <Button type='primary' htmlType='submit'>
          {i18next.t('授权')}
        </Button>
      </FormButton>
    </Form>
  )
}

AuthForm.propTypes = {
  action: PropTypes.object,
  info: PropTypes.object,
  index: PropTypes.number,
}

export default AuthForm
