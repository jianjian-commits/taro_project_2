import React from 'react'
import { t } from 'gm-i18n'
import Panel from 'common/components/report/panel'
import { Flex } from '@gmfe/react'
import { NOTIFY_TYPE } from 'common/enum'
import moment from 'moment'
import store from '../../full_screen_store'
import { observer } from 'mobx-react'
import NoData from './no_data'
import { when, observable } from 'mobx'

@observer
class Notify extends React.Component {
  @observable
  box = React.createRef()

  timeId = null

  animation = () => {
    const box = this.box.current
    const boxHeight = this.box.current.offsetHeight
    box.style.cssText = `
          transition: transform 10s linear;
          transform: translateY(-${boxHeight - 270}px);
        `
    setTimeout(() => {
      box.style.cssText = `
          transition: transform 0.5s;
          transform: translateY(0);
        `
      this.timeId = setTimeout(this.animation, 3000)
    }, 15000)
  }

  componentDidMount() {
    when(() => this.box.current, this.animation, {
      delay: 3000,
    })
  }

  componentWillUnmount() {
    clearTimeout(this.timeId)
  }

  render() {
    return (
      <Panel
        title={t('消息通知')}
        style={{ background: 'transparent', height: 350, overflow: 'hidden' }}
      >
        <div style={{ height: 290, overflow: 'hidden' }}>
          {store.notifyData.length ? (
            <div ref={this.box}>
              {store.notifyData.map((v, i) => (
                <Flex
                  key={i}
                  className='gm-padding-bottom-5 gm-text-14'
                  style={{
                    color: 'rgba(196,253,255, 0.7)',
                    borderBottom: '1px solid rgba(123, 188, 255, 0.8)',
                    marginTop: i === 0 ? 13 : 20,
                  }}
                >
                  <div style={{ whiteSpace: 'nowrap' }}>
                    【{NOTIFY_TYPE[v.type]}】
                  </div>
                  <div style={{ flex: 1, width: 0 }}>
                    <span className='gm-ellipsis'>{v.content}</span>
                  </div>
                  <div>{moment(v.date_time).format('YYYY-MM-DD')}</div>
                </Flex>
              ))}
            </div>
          ) : (
            <NoData />
          )}
        </div>
      </Panel>
    )
  }
}

export default Notify
