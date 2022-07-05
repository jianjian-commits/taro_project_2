import React from 'react'
import { Modal, Storage } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import User from '../user'
import Language from './language'
import _ from 'lodash'
import { isPathMatch, setTitle } from '@gm-common/tool'
import { gioClearUser } from '../common/service'
import { isDev } from '../common/util'

function modifyPassword() {
  Modal.render({
    title: i18next.t('修改密码'),
    size: 'sm',
    children: <User />,
    onHide: Modal.hide,
  })
}

function changeLanguage() {
  Modal.render({
    title: i18next.t('语言'),
    size: 'sm',
    children: <Language />,
    onHide: Modal.hide,
  })
}

function getAppTitle(pathname, navConfig) {
  // 三级确定匹配一个模块
  const result = []
  _.forEach(navConfig, (value) => {
    if (_.startsWith(pathname, value.link)) {
      _.forEach(value.sub, (val) => {
        _.forEach(val.sub, (v) => {
          if (isPathMatch(pathname, v.link)) {
            result.push(value)
            result.push(val)
            result.push(v)
          }
        })
      })
    }
  })

  return result.length ? result[result.length - 1].name : ''
}

let preTitle = ''

function setAppTitle(pathname, breadcrumbs, navConfig) {
  let title = ''
  if (pathname === '/home') {
    title = i18next.t('首页')
  } else if (pathname === '/guides/init') {
    title = i18next.t('新手引导')
  } else if (pathname === '/carousel_full_screen') {
    title = i18next.t('投屏模式')
  } else if (breadcrumbs.length) {
    title = breadcrumbs[breadcrumbs.length - 1]
  } else {
    title = getAppTitle(pathname, navConfig)
  }

  if (title !== preTitle) {
    preTitle = title
    setTitle(title)
  }
}

function logout() {
  // 登出前，清除gio用户ID
  gioClearUser()
  Storage.remove('Category1_groupData')
  Storage.remove('Category2_groupData')
  Storage.remove('Category1_index')
  Storage.remove('Category2_index')
  let href = '/logout'
  if (isDev) {
    href = '/#/login'
  }
  window.location.href = href
}
export { modifyPassword, changeLanguage, setAppTitle, logout }
