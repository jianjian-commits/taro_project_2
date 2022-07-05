import React from 'react'
import List from './list'
import Filter from './filter'
import { t } from 'gm-i18n'

// 说明文案
const ExplainCopy = () => (
  <div
    style={{ fontSize: '14px', padding: '12px', backgroundColor: '#f7f8fa' }}
  >
    <div>
      {t('1.整单折扣定价和上浮定价、锁价均互斥，即至多只能选择一种定价模式。')}
    </div>
    <div>
      {t(
        '2.变化率展现形式可在系统设置/订单中设置，默认选择变化率，表示基于原价的浮动比例，报价单价格自动同步到原价。',
      )}
    </div>
  </div>
)

// 整单折扣定价
const ComeUpPricing = () => {
  return (
    <>
      <ExplainCopy />
      <Filter />
      <List />
    </>
  )
}

export default ComeUpPricing
