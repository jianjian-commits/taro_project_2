/**
 * @description 新手引导按钮
 */
import React from 'react'
import { Button } from '@gmfe/react'
import { history, gioTrackEvent } from '../common/service'

const Init = () => {
  return (
    <Button
      data-id='init'
      type='primary'
      className='gm-margin-left-15'
      style={{ borderRadius: '14px', height: '24px', lineHeight: '14px' }}
      onClick={() => {
        gioTrackEvent('newbie_guide', 1, {})
        history.push('/guides/init')
      }}
    >
      新手引导
    </Button>
  )
}

export default Init
