import { i18next } from 'gm-i18n'
import React from 'react'
import { FullTab } from '@gmfe/frame'
import TaxRateListView from './view_tax_rate'
import SpuListView from './view_spu'
import { observer } from 'mobx-react'

@observer
class TaxRate extends React.Component {
  render() {
    return (
      <FullTab
        tabs={[i18next.t('按税率规则查看'), i18next.t('按商户商品查看')]}
      >
        <TaxRateListView />
        <SpuListView />
      </FullTab>
    )
  }
}

export default TaxRate
