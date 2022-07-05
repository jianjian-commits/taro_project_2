import React, { useRef } from 'react'
import { i18next } from 'gm-i18n'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { Modal, Tip, RightSideModal, Button } from '@gmfe/react'
import SettingForm from './setting'
import AuthForm from './auth'

import store from '../store'
import AuthPospal from './auth_pospal'
import ImportInfo from './pospal_info/import'
import TaskList from '../../../../task/task_list'

const Component = observer(({ app, index }) => {
  const refExcel = useRef(null)

  const handlePush = (index, push) => {
    Modal.render({
      title: i18next.t('设置'),
      children: <SettingForm settings={push} index={index} />,
      onHide: Modal.hide,
    })
  }

  const handleSync = (index) => {
    const platform = store.getPlatform(index)
    if (platform.appid === store.pospalId) {
      refExcel && refExcel.current.click()
      return
    }

    store
      .sync(index)
      .then(() =>
        Tip.info(
          i18next.t('系统正在为你初始化商品，如有异常，请到失败列表查看原因'),
        ),
      )
  }

  const getAuthority = (index) => {
    const platform = store.getPlatform(index)
    const settings = platform.settings.slice()
    const authAction = _.find(settings, (item) => item.trigger === 'after_auth')
    const descMessage = _.find(settings, (item) => item.type === 'desc')

    if (authAction && authAction.type === 'redirect') {
      window.open('/youzan/auth') // 后端没有考虑标准化先写死
      return
    }

    if (authAction) {
      store.getAuthority(index).then(() => {
        if (platform.appid === store.pospalId) {
          return Modal.render({
            title: authAction.title,
            style: { width: 1000 },
            children: <AuthPospal action={authAction} index={index} />,
            onHide: Modal.hide,
          })
        } else {
          Modal.render({
            title: authAction.title,
            children: (
              <AuthForm action={authAction} info={descMessage} index={index} />
            ),
            onHide: Modal.hide,
          })
        }
      })
    }
  }

  const cancelAuthority = (index) => {
    store.cancelAuthority(index).then(() => {
      Tip.info(i18next.t('成功取消授权'))
      store.getPlatforms()
    })
  }

  const handleUpload = () => {
    const file = refExcel.current.files[0]
    store.syncPospal(file).then(() => {
      RightSideModal.render({
        children: <TaskList />,
        onHide: RightSideModal.hide,
        style: {
          width: '300px',
        },
      })
    })
    refExcel.current.value = ''
  }

  const getPushSettings = (app) => {
    const arr = []
    _.forEach(app.settings.slice(), (item) => {
      if (item.trigger === 'nomal') {
        arr.push(item)
      }
    })
    return arr
  }

  const pushSettings = getPushSettings(app)
  const {
    youzanInfo: { auth_status },
    youzanId,
  } = store

  return app.status !== 1 ? (
    <div>
      <input
        accept='.xlsx'
        type='file'
        ref={refExcel}
        onChange={handleUpload}
        style={{ display: 'none' }}
      />
      {pushSettings.length ? (
        <Button
          type='primary'
          className='gm-margin-right-10'
          onClick={handlePush.bind(null, index, pushSettings)}
        >
          {i18next.t('推送设置')}
        </Button>
      ) : null}
      <Button
        type='primary'
        className='gm-margin-right-10'
        onClick={getAuthority.bind(null, index)}
      >
        {i18next.t('重新授权')}
      </Button>
      <ImportInfo index={index} className='gm-margin-right-10' />
      <Button
        type='primary'
        className='gm-margin-right-10'
        onClick={handleSync.bind(null, index)}
      >
        {i18next.t('同步商品')}
      </Button>
      <Button onClick={cancelAuthority.bind(null, index)}>
        {i18next.t('解除授权')}
      </Button>
    </div>
  ) : (
    <div>
      <Button
        type='primary'
        className='gm-margin-right-10'
        onClick={getAuthority.bind(null, index)}
      >
        {app.appid === youzanId && auth_status === i18next.t('已授权')
          ? i18next.t('重新授权')
          : i18next.t('授权')}
      </Button>
      <ImportInfo index={index} />
    </div>
  )
})

Component.propTypes = {
  app: PropTypes.object,
  index: PropTypes.number,
}

export default Component
