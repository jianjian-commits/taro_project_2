import React, { useState } from 'react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import { FormItem, Select, Form, FormButton, Button } from '@gmfe/react'

const EditDispatchMethod = ({ onCancel, onSave }) => {
  const [type, setType] = useState(1)

  const handleChangeType = (type) => {
    setType(type)
  }

  const handleSave = () => {
    onSave({ type })
  }

  return (
    <Form
      className='gm-padding-lr-5 gm-padding-tb-10'
      labelWidth='80px'
      colWidth='460px'
      onSubmit={handleSave}
    >
      <FormItem label={t('投框方式')}>
        <Select
          onChange={handleChangeType}
          name='dispatch_method'
          data={[
            { value: 1, text: t('按订单投框') },
            { value: 2, text: t('按司机投框') },
          ]}
          value={+type}
        />
      </FormItem>
      <div className='gm-text-red gm-text-12 gm-margin-left-20 gm-margin-bottom-20'>
        <p className='gm-margin-bottom-5'>{t('提示：')}</p>
        <p className='gm-margin-bottom-5'>
          {t('1. 将选中的商品批量修改投框方式')}
        </p>
        <p className='gm-margin-bottom-5'>
          {t('2. 修改投框方式后将会影响分拣任务')}
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

export default EditDispatchMethod
EditDispatchMethod.propTypes = {
  onCancel: PropTypes.func,
  onSave: PropTypes.func,
}
