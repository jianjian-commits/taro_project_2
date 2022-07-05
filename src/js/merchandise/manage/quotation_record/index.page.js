import { t } from 'gm-i18n'
import React from 'react'
import { FullTab } from '@gmfe/frame'
import { observer } from 'mobx-react'

import MerchandiseView from './view_merchandise'
import QuotationView from './view_quotation'

const QuotationRecord = observer(() => (
  <FullTab tabs={[t('按商品查看'), t('按报价单查看')]}>
    <MerchandiseView />
    <QuotationView />
  </FullTab>
))

export default QuotationRecord
