import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import { withRouter } from '../common/service'
import pageTipStore from '../stores/page_tip'
import Markdown from 'react-markdown'

const PageTip = ({ location: { pathname } }) => {
  useEffect(() => {
    // 不重要，延迟
    setTimeout(() => {
      pageTipStore.fetchData()
    }, 2000)
  }, [])

  if (pageTipStore.unReminder.includes(pathname)) {
    return null
  }

  const md = pageTipStore.config[pathname] || null

  if (!md) {
    return null
  }

  const handleClick = () => {
    pageTipStore.hide(pathname)
  }

  return (
    <div className='gm-margin-10 gm-back-bg gm-padding-10 b-markdown gm-position-relative gm-cursor'>
      <a
        className='b-page-tip-btn gm-position-absolute'
        onClick={handleClick}
        style={{
          right: '10px',
          top: '5px',
        }}
      >
        不再提醒
      </a>
      <Markdown source={md} />
    </div>
  )
}

export default withRouter(observer(PageTip))
