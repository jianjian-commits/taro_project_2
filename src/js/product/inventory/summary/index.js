import { i18next } from 'gm-i18n'
import React from 'react'
import { FullTab } from '@gmfe/frame'
import InStock from './in_stock'
import global from 'stores/global'
import OutRecord from './out_stock'
import ProcessInStock from './process_in_stock'
import Permission from '../../../common/components/permission'

class Index extends React.Component {
  render() {
    return (
      <FullTab
        tabs={[
          i18next.t('采购入库汇总'),
          global.otherInfo.cleanFood && i18next.t('加工入库汇总'),
          i18next.t('销售出库汇总'),
        ].filter((f) => f)}
      >
        <Permission field='get_in_stock_summary'>
          <InStock />
        </Permission>
        {global.otherInfo.cleanFood && (
          <Permission field='get_in_stock_summary'>
            <ProcessInStock />
          </Permission>
        )}

        <Permission field='get_out_stock_summary'>
          <OutRecord />
        </Permission>
      </FullTab>
    )
  }
}

export default Index
