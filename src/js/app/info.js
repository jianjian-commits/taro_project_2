/**
 * @description 顶部导航按钮
 */

import React, { useState, useEffect } from 'react'
import { i18next } from 'gm-i18n'
import { Storage, Flex } from '@gmfe/react'
import { openNewTab } from '../common/util'
import { ComInfo } from './component'
import TemplateChange from './template_change'
import Search from './search'
import Init from './init'
import globalStore from 'stores/global'
import { gioTrackEvent } from '../common/service'

const key = 'FEATURES_UPDATE_KEY'
const fetchRepo = async () => {
  const res = await window.fetch(
    '//js.guanmai.cn/build/document/yuque_data/rh9gi9/repo.json' +
      `?v=${+new Date()}`,
  )

  if (res.ok) {
    const json = await res.json()
    return json
  }
  return Promise.reject(new Error('static resource error.'))
}

const getTime = (t) => +new Date(t)

const Info = () => {
  const [hasFeatures, setState] = useState(false)
  const [time, setTime] = useState('')

  useEffect(() => {
    fetchRepo().then((json) => {
      setTime(json.updated_at)
      const oldTime = Storage.get(key)
      if (!oldTime || getTime(json.updated_at) > getTime(oldTime)) {
        setState(true)
      }
    })
  }, [])

  const handleClick = () => {
    // gio打点
    gioTrackEvent('new_func_intro', 1, {})

    Storage.set(key, time)
    openNewTab('https://station.guanmai.cn/gm_help/update')
    setState(false)
  }

  return (
    <Flex alignCenter>
      {globalStore.isNormalStation() && (
        <>
          <Search />
          <div />
          {globalStore.isShieldGuanMai() ? null : <Init />}
        </>
      )}

      {/* <TemplateChange /> */}
      {hasFeatures && !globalStore.isShieldGuanMai() && (
        <div
          onClick={handleClick}
          className='gm-inline-block text-center b-feature-btn gm-margin-left-15'
        >
          {i18next.t('新功能上线，点击查看')}
        </div>
      )}
      <Flex alignCenter className='gm-margin-left-15'>
        <ComInfo />
      </Flex>
    </Flex>
  )
}

export default Info
