import React from 'react'
import { Form, FormButton, Button, Modal } from '@gmfe/react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'

const Second_prompt = (props) => {
  const { test, onSubmit } = props
  const handleClose = () => {
    Modal.hide()
  }
  return (
    <Form btnPosition='right' onSubmit={onSubmit}>
      <p>
        {t(
          `确认后将新增一条状态为「已${test}」的${test}记录，并不可再次修改。确认填写信息无误并${test}}吗`,
        )}
      </p>
      <FormButton>
        <Button onClick={handleClose}>{t('取消')}</Button>
        <Button type='primary' className='gm-margin-left-5' htmlType='submit'>
          {t('确认')}
        </Button>
      </FormButton>
    </Form>
  )
}

Second_prompt.propTypes = {
  test: PropTypes.string,
  onSubmit: PropTypes.func,
}

export default Second_prompt
