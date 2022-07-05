import { t } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { FullTab } from '@gmfe/frame'
import InStockRecording from './in_stock_recording'
import OutStockRecording from './out_stock_recording'
import RefundStockRecording from './refund_stock_recording'
import ReturnStockRecording from './return_stock_recording'

import './actions'
import './reducer'
import actions from '../../actions'
import GiveUpPickUp from './give_up_pick_up'

class InventoryRecord extends React.Component {
  static propTypes = {
    inventory: PropTypes.object,
  }

  constructor(props) {
    super(props)
    this.handleSelectKey = ::this.handleSelectKey
  }

  componentDidMount() {
    actions.product_inventory_sku_categories()
  }

  handleSelectKey(key) {
    actions.product_inventory_record_tab_key(key)
  }

  render() {
    const { inventoryRecordTabKey } = this.props.inventory

    return (
      <FullTab
        active={inventoryRecordTabKey}
        tabs={[
          t('入库记录'),
          t('出库记录'),
          t('退货出库'),
          t('退货入库'),
          t('放弃取货'),
        ]}
        onChange={this.handleSelectKey}
      >
        <InStockRecording {...this.props} />
        <OutStockRecording {...this.props} />
        <RefundStockRecording {...this.props} />
        <ReturnStockRecording {...this.props} />
        <GiveUpPickUp />
      </FullTab>
    )
  }
}

export default InventoryRecord
