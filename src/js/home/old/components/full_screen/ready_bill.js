import React from 'react'
import { t } from 'gm-i18n'
import Panel from 'common/components/report/panel'
import { Flex, FlipNumber } from '@gmfe/react'
import store from '../../full_screen_store'
import { observer } from 'mobx-react'

@observer
class ReadyBill extends React.Component {
  render() {
    return (
      <Panel title={t('待处理单据')} style={{ background: 'transparent' }}>
        <Flex style={{ flexWrap: 'wrap', paddingTop: 30 }}>
          {store.readyBillData.map((v) => (
            <Flex
              key={v.key}
              alignCenter
              style={{
                height: 100,
                width: '50%',
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  borderRadius: 50,
                  width: 50,
                  height: 50,
                  textAlign: 'center',
                  lineHeight: '50px',
                  marginRight: 14,
                  background: '#0A1D69',
                }}
              >
                {v.svg}
              </div>
              <div>
                <div style={{ fontSize: 30, fontFamily: 'Helvetica' }}>
                  <FlipNumber to={v.value} delay={500} />
                </div>
                <p style={{ fontSize: 14 }}>{v.title}</p>
              </div>
            </Flex>
          ))}
        </Flex>
      </Panel>
    )
  }
}

export default ReadyBill
