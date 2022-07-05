import React from 'react'
import { t } from 'gm-i18n'

const Container = ({ children }) => (
  <div style={{ overflowY: 'scroll', maxHeight: '100%' }}>
    <div className='gm-back-bg gm-padding-tb-10 gm-padding-lr-20 gm-text-14'>
      <div>
        <strong
          className='gm-padding-left-5'
          style={{ borderLeft: '3px solid rgb(54, 173, 58)' }}
        >
          {t('智能识别')}
        </strong>
      </div>
    </div>
    {children}
  </div>
)

export default Container
