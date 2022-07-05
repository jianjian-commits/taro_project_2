import { i18next } from 'gm-i18n'
import React from 'react'
import { FullTab } from '@gmfe/frame'
import Overview from './overview'
import Setting from './setting'

class ShortMessage extends React.Component {
  render() {
    return (
      <div>
        <FullTab tabs={[i18next.t('短信概况'), i18next.t('短信设置')]}>
          <Overview />
          <Setting />
        </FullTab>
      </div>
    )
  }
}

export default ShortMessage
