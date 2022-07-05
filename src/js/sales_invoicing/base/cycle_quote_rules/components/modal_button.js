import React from 'react'
import PropTypes from 'prop-types'
import { Button, Flex, FormButton, Modal } from '@gmfe/react'
import { t } from 'gm-i18n'

function ModalButton(props) {
  const { loading } = props

  function onHandleCancel(event) {
    event.preventDefault()
    Modal.hide()
  }

  return (
    <FormButton>
      <Flex row justifyEnd>
        <Button onClick={onHandleCancel} disabled={loading}>
          {t('取消')}
        </Button>
        <div className='gm-gap-10' />
        <Button type='primary' htmlType='submit' loading={loading}>
          {t('确定')}
        </Button>
      </Flex>
    </FormButton>
  )
}

ModalButton.propTypes = {
  loading: PropTypes.bool,
}
export default ModalButton
