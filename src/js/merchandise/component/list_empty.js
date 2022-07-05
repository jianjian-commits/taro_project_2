import { i18next } from 'gm-i18n'
import React from 'react'

class Empty extends React.Component {
  render() {
    return (
      <div className='loading-bro'>
        <div className='content'>{i18next.t('加载中...')}</div>
        <svg className='load' x='0px' y='0px' viewBox='0 0 150 150'>
          <circle className='loading-inner' cx='75' cy='75' r='60' />
        </svg>
      </div>
    )
  }
}

export default Empty
