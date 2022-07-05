import React, { useState } from 'react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import {
  FormItem,
  RadioGroup,
  Radio,
  InputNumberV2,
  Form,
  FormButton,
  Button,
} from '@gmfe/react'

const EditStock = ({ onCancel, onSave }) => {
  const [type, setType] = useState(1)
  const [stock, setStock] = useState(0)

  const handleChangeValue = (number) => {
    setStock(number)
  }

  const handleChangeType = (type) => {
    setType(type)
  }

  const handleSave = () => {
    onSave({ type, stock })
  }

  return (
    <Form
      className='gm-padding-lr-5 gm-padding-tb-10'
      labelWidth='80px'
      colWidth='460px'
      onSubmit={handleSave}
    >
      <FormItem label={t('库存设置')}>
        <RadioGroup
          name='storeSetting'
          style={{ marginTop: '-3px' }}
          value={type}
          inline
          onChange={handleChangeType}
        >
          <Radio value={1}>{t('不设置库存')}</Radio>
          <Radio value={3}>{t('限制库存')}</Radio>
          <Radio value={2}>
            <div className='sku-detail-radio gm-inline-block'>
              {t('设置库存')}&nbsp;
              <InputNumberV2
                className='sku-detail-radio-input'
                style={{ width: '80px' }}
                disabled={type !== 2}
                min={0}
                precision={0}
                value={stock}
                onChange={handleChangeValue}
              />
            </div>
          </Radio>
        </RadioGroup>
      </FormItem>
      <div className='gm-text-red gm-text-12 gm-margin-left-20 gm-margin-bottom-20'>
        <p className='gm-margin-bottom-5'>{t('提示：')}</p>
        <p className='gm-margin-bottom-5'>
          {t('1. 限制库存将使用商品当前可用库存')}
        </p>
        <p className='gm-margin-bottom-5'>
          {t('2. 保存后所选商品的库存设置将统一修改为此设置')}
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

export default EditStock
EditStock.propTypes = {
  onCancel: PropTypes.func,
  onSave: PropTypes.func,
}
