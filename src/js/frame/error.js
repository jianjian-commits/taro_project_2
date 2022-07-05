import { i18next } from 'gm-i18n'
import React from 'react'
import { reportDingtalk } from '../common/service'
import { Button } from '@gmfe/react'
import { guid } from 'common/util'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      error: null,
    }
  }

  componentDidCatch(error, info) {
    const traceId = guid()
    this.setState({ error: { error, info, traceId } })

    // 错误上报钉钉
    reportDingtalk(
      'exception_station',
      error.toString(),
      [{ title: 'error', text: error.stack }],
      traceId,
    )
  }

  render() {
    const { error } = this.state
    if (error) {
      return (
        <div style={{ height: '100vh', paddingTop: '150px' }}>
          <div
            style={{
              width: 'max-content',
              padding: '30px 20px',
              margin: 'auto',
            }}
            className='gm-border text-center gm-text-14 gm-bg'
          >
            <p>
              {i18next.t('当前操作存在错误，错误代码：')}
              <span style={{ color: '#56a3f2' }}>{error.traceId}</span>
              <br />
              {i18next.t(
                '请尝试更换谷歌浏览器使用，如仍有问题，请截屏错误信息联系售后团队',
              )}
            </p>
            <Button
              type='primary'
              htmlType='submit'
              style={{
                color: 'white',
                width: '250px',
                height: '34px',
              }}
              onClick={() => (window.location = '/')}
            >
              {i18next.t('返回首页')}
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
