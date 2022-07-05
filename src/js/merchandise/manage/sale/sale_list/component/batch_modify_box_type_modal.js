import React, { useState } from 'react'
import { i18next } from 'gm-i18n'
import { Form, FormItem, FormButton, Select, Button } from '@gmfe/react'
import PropTypes from 'prop-types'

const BatchBoxTypeModal = ({ onSubmit, onCancel }) => {
  const [type, setType] = useState(0)

  const handleSelect = (selected) => {
    setType(selected)
  }

  const handleSubmit = () => {
    onSubmit(type)
  }

  return (
    <Form
      horizontal
      className='gm-padding-lr-5 gm-padding-tb-10'
      labelWidth='80px'
      colWidth='460px'
      onSubmitValidated={handleSubmit}
    >
      <FormItem label={i18next.t('装箱类型')}>
        <Select
          onChange={handleSelect}
          data={[
            { value: 0, text: i18next.t('散件装箱') },
            { value: 1, text: i18next.t('整件装箱') },
          ]}
          value={type}
        />
      </FormItem>

      <div className='gm-text-red gm-text-12' style={{ marginLeft: '23px' }}>
        <div>
          <p className='gm-margin-bottom-5'>{i18next.t('提示')}</p>
          <p className='gm-margin-bottom-5'>
            {i18next.t('1.将选中的商品规格批量修改装箱类型')}
          </p>
          <p className='gm-margin-bottom-5'>
            {i18next.t('2.修改装箱类型后将影响在分拣软件的装箱操作')}
          </p>
        </div>
      </div>

      <FormButton>
        <Button onClick={onCancel}>{i18next.t('取消')}</Button>
        <span className='gm-gap-5' />
        <Button type='primary' htmlType='submit'>
          {i18next.t('确定')}
        </Button>
      </FormButton>
    </Form>
  )
}

BatchBoxTypeModal.propTypes = {
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
}

export default BatchBoxTypeModal
