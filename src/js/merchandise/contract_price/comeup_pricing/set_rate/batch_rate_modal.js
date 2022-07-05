import React, { useState } from 'react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import { FormItem, Form, FormButton, Button, InputNumberV2 } from '@gmfe/react'

const BatchRateModal = (props) => {
  const { onCancel, onSave, isPercent } = props
  const [rate, setRate] = useState('')

  const onChange = (value) => setRate(value)

  const handleSubmit = () => {
    onSave(rate)
    onCancel()
  }

  return (
    <Form
      className='gm-padding-lr-5 gm-padding-tb-10'
      labelWidth='80px'
      onSubmit={handleSubmit}
    >
      <FormItem label={t('变化率')}>
        <InputNumberV2
          value={rate}
          min={isPercent ? -99.99 : 0}
          max={999999999}
          className='form-control'
          placeholder={t('请输入变化率')}
          style={{ width: '150px', display: 'inline' }}
          onChange={onChange}
        />
        {isPercent && '%'}
      </FormItem>

      <div className='gm-text-red gm-text-12 gm-margin-left-20 gm-margin-bottom-20'>
        <p className='gm-margin-bottom-5'>
          {t('提示：')}
          {isPercent
            ? t('你已设置上浮率表征变化，用百分数表示，可为负值')
            : t('你已设置变化率表征折扣，用小数表示')}
        </p>
      </div>
      <FormButton>
        <Button onClick={onCancel}>{t('取消')}</Button>
        <span className='gm-gap-5' />
        <Button htmlType='submit' type='primary'>
          {t('保存')}
        </Button>
      </FormButton>
    </Form>
  )
}

BatchRateModal.propTypes = {
  onCancel: PropTypes.func,
  onSave: PropTypes.func,
  isPercent: PropTypes.bool,
}

export default BatchRateModal
