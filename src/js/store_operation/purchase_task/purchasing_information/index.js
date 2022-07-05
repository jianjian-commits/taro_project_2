import React from 'react'
import { FullTab } from '@gmfe/frame'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import globalStore from '../../../stores/global'
import _ from 'lodash'
import { history } from '../../../common/service'

import PurchaseSourcer from '../purchase_sourcer'
import PurchaseSpecificationList from '../../../finance/supplier/purchase_specification/list'

@observer
class PurchaseAnalysis extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      tab: this.props.location.query.tab || 'get_purchaser',
    }
  }

  render() {
    const arr = _.filter(
      [
        {
          tab: 'get_purchaser',
          show: globalStore.hasPermission('get_purchaser'),
          text: i18next.t('采购员'),
          Com: <PurchaseSourcer {...this.props} />,
        },
        {
          tab: 'get_pur_spec',
          show: globalStore.hasPermission('get_pur_spec'),
          text: i18next.t('采购规格'),
          Com: <PurchaseSpecificationList {...this.props} />,
        },
      ],
      (v) => v.show,
    )

    const tab = this.props.location.query.tab || arr[0].tab

    const tabs = _.map(arr, (v) => v.text)

    const active = _.findIndex(
      _.map(arr, (v) => v.tab),
      (v) => v === tab,
    )

    return (
      <FullTab
        active={active}
        onChange={(active) =>
          history.push(
            '/supply_chain/purchase/information?tab=' + arr[active].tab,
          )
        }
        tabs={tabs}
        className='b-order'
      >
        {_.map(arr, (v) => v.Com)}
      </FullTab>
    )
  }
}

export default PurchaseAnalysis
