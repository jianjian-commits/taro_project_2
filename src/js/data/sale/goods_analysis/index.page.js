import React, { useState } from 'react'
import { FullTab } from '@gmfe/frame'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'

import Goods from './goods'
import Category from './category'

const MerchantAnalysis = () => {
  const [tabKey, setTabKey] = useState(0)

  return (
    <FullTab
      active={tabKey}
      tabs={[t('商品销售分析'), t('分类销售分析')]}
      onChange={(key) => setTabKey(key)}
    >
      <Goods />
      <Category />
    </FullTab>
  )
}

MerchantAnalysis.propTypes = {
  xxxx: PropTypes.bool,
}
export default MerchantAnalysis
