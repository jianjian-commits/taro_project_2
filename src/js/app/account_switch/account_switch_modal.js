import React, { useState, useEffect } from 'react'
import {
  Form,
  FormItem,
  FormButton,
  Button,
  Flex,
  Modal,
  Tip,
} from '@gmfe/react'
import { i18next } from 'gm-i18n'
import { Request } from '@gm-common/request'
import PropTypes from 'prop-types'
import _ from 'lodash'

const RelatedForm = (props) => {
  const pwdref = React.createRef()
  const { isEdit, original_username } = props
  const [username, set_user] = useState('')
  const [password, set_password] = useState('')
  const handleSubmit = (e) => {
    e.preventDefault()
  }
  const relate = async () => {
    // 关联账户
    console.log(username, password)
    return await Request('/station/multi/account/bind')
      .data({
        username,
        password,
      })
      .post()
      .then((res) => {
        if (res.code === 0) {
          Tip.success(i18next.t('关联成功'))
          return res.code
        } else {
          Tip.error(i18next.t('关联失败'))
        }
      })
  }
  const login = async () => {
    if (!(username && password)) {
      Tip.info(i18next.t('输入用户名或者密码'))
      return
    }
    return await Request('/station/login')
      .data({
        username,
        password,
      })
      .post()
      .then(() => {
        Modal.hide()
        Tip.success(i18next.t('关联成功'))
        setTimeout(() => {
          window.location.href = window.location.href.replace(
            window.location.hash,
            '',
          )
        }, 500)
      })
  }

  const buttons = [
    {
      text: i18next.t('取消'),
      handleClick: (e) => {
        e.preventDefault()
        Modal.hide()
      },
    },
    {
      text: i18next.t('关联'),
      handleClick: (e) => {
        e.preventDefault()
        relate().then(() => Modal.hide())
      },
      type: 'primary',
    },
    {
      text: i18next.t('关联并切换'),
      handleClick: (e) => {
        e.preventDefault()
        relate().then(() => {
          login()
        })
      },
      type: 'primary',
    },
  ]

  // 如果是修改dialog 去掉关联button,并且修改第三个按钮的文字和逻辑
  if (isEdit) {
    buttons[2].text = i18next.t('保存并切换')
    buttons[2].handleClick = (e) => {
      e.preventDefault()
      relate().then(() => {
        login()
      })
    }
    buttons.splice(1, 1)
  }

  useEffect(() => {
    if (isEdit) {
      set_user(original_username)
      pwdref.current.focus()
    }
  }, [isEdit, pwdref, original_username])

  return (
    <Form disabledCol onSubmit={handleSubmit} labelWidth='74px'>
      <FormItem label={i18next.t('输入用户名')}>
        <input
          value={username}
          onChange={(e) => {
            // e.persist()
            set_user(e.target.value)
          }}
        />
      </FormItem>
      <FormItem label={i18next.t(`输入密码`)}>
        <input
          ref={pwdref}
          type='password'
          value={password}
          onChange={(e) => {
            // e.persist()
            set_password(e.target.value)
          }}
        />
      </FormItem>
      <FormButton>
        <Flex justifyEnd className='gm-padding-right-10'>
          {_.map(buttons, (c, i) => (
            <Button
              onClick={c.handleClick}
              key={i}
              type={c.type}
              className='gm-margin-left-10'
            >
              {c.text}
            </Button>
          ))}
        </Flex>
      </FormButton>
    </Form>
  )
}

RelatedForm.propTypes = {
  isEdit: PropTypes.bool,
  original_username: PropTypes.string,
}

const RelatedAccountModal = (props) => {
  const { popref } = props

  popref.current.apiDoSetActive(false)

  return Modal.render({
    size: 'sm',
    title: i18next.t('关联账号信息'),
    onHide: Modal.hide,
    children: <RelatedForm {...props} />,
  })
}

RelatedAccountModal.propTypes = {
  popref: PropTypes.object,
  isEdit: PropTypes.bool,
  original_username: PropTypes.string,
}

export default RelatedAccountModal
