import React from 'react'
import { Flex, Dialog, Tip } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import { Request } from '@gm-common/request'
import PropTypes from 'prop-types'
import { SvgDelete } from 'gm-svg'

const DeleteIcon = (props) => {
  const { user_id, popref } = props

  const deleteAccount = (e) => {
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    popref.current.apiDoSetActive(false)
    Dialog.confirm({
      children: i18next.t('是否删除相关联的账号?'),
      title: i18next.t('警告'),
    })
      .then(() => {
        Request('/station/multi/account/delete')
          .data({
            user_id,
          })
          .post()
          .then((res) => {
            if (res.code === 0) {
              Tip.sucess('删除成功')
            } else {
              Tip.danger('删除失败')
            }
          })
      })
      .catch(() => {})
  }

  return (
    <Flex
      alignCenter
      justifyCenter
      className='gm-cursor'
      onClick={deleteAccount}
    >
      <SvgDelete />
    </Flex>
  )
}

DeleteIcon.propTypes = {
  user_id: PropTypes.number,
  popref: PropTypes.object,
}

export default DeleteIcon
