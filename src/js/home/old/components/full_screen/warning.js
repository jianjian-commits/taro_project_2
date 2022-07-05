import React from 'react'
import { t } from 'gm-i18n'
import Panel from 'common/components/report/panel'
import store from '../../full_screen_store'
import { observer } from 'mobx-react'
import { Flex } from '@gmfe/react'
import { WARNING_TYPE } from 'common/enum'
import NoData from './no_data'
import { when, observable } from 'mobx'

@observer
class Warning extends React.Component {
  @observable
  box = React.createRef()

  timeId = null

  animation = () => {
    const box = this.box.current
    const boxHeight = this.box.current.offsetHeight
    box.style.cssText = `
          transition: transform 12s linear;
          transform: translateY(-${boxHeight - 160}px);
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
        title={t('预警信息')}
        style={{ background: 'transparent', height: 224 }}
      >
        <div style={{ height: 160, overflow: 'hidden' }}>
          {store.warningData.length ? (
            <div style={{ willChange: 'transform' }} ref={this.box}>
              {store.warningData.map((v, i) => (
                <Flex
                  key={i}
                  className='gm-padding-top-15 gm-padding-bottom-5 gm-text-14'
                  style={{
                    borderBottom: '1px solid rgba(123, 188, 255, 0.8)',
                    color: 'rgba(196,253,255, 0.7)',
                  }}
                >
                  <div style={{ whiteSpace: 'nowrap', lineHeight: '20px' }}>
                    【{WARNING_TYPE[v.type]}】
                  </div>
                  <Flex flex style={{ width: 0, lineHeight: '20px' }}>
                    <span className='gm-ellipsis'>{v.content}</span>
                  </Flex>
                </Flex>
              ))}
            </div>
          ) : (
            <NoData height={166} />
          )}
        </div>
      </Panel>
    )
  }
}

export default Warning
