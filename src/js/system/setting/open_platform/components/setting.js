import React from 'react'
import { i18next } from 'gm-i18n'
import { Form, FormButton, Modal, Tip, Button } from '@gmfe/react'
import _ from 'lodash'
import PropTypes from 'prop-types'

import ItemBase from './item_base'
import store from '../store'

const SettingForm = ({ settings, index }) => {
  const handlePushSubmit = (index, push) => {
    const params = {}
    _.forEach(push, (item) => {
      if (item.type === 'input') {
        _.forEach(item.template, (v, key) => {
          // template 只有一个key
          const element = document.getElementById(`${key}`)
          params[`${item.name}_${item.action}`] = element ? element.value : ''
        })
      } else if (item.type === 'checkbox') {
        const element = document.getElementById(`${item.name}`)
        params[`${item.name}_${item.action}`] = element
          ? element.dataset.values.split(',')
          : ''
      } else {
        const element = document.getElementById(`${item.name}`)
        params[`${item.name}_${item.action}`] = element ? element.value : ''
      }
    })
    store.updateApp(index, params, null).then(() => {
      store.getPlatforms()
      Tip.info(i18next.t('成功更新设置'))
      Modal.hide()
    })
  }
  return (
    <Form
      disabledCol
      labelWidth='150px'
      btnPosition='right'
      className='gm-padding-10'
      onSubmit={() => handlePushSubmit(index, settings)}
    >
      {_.map(settings, (item, i) => (
        <ItemBase key={i} action={item} width={300} />
      ))}
      <FormButton>
        <Button className='gm-margin-right-5' onClick={() => Modal.hide()}>
          {i18next.t('取消')}
        </Button>
        <Button type='primary' htmlType='submit'>
          {i18next.t('保存')}
        </Button>
      </FormButton>
    </Form>
  )
}

SettingForm.propTypes = {
  settings: PropTypes.array,
  index: PropTypes.number,
}

export default SettingForm
