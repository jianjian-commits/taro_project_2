import { i18next } from 'gm-i18n'
import React from 'react'
import { FullTab } from '@gmfe/frame'
import BatchManagementRecording from './batch_management_recording'
import ShelfManagementRecording from './shelf_management_recording'
import ProductManagementRecording from './product_management_recording'
import PropTypes from 'prop-types'
import _ from 'lodash'
import './actions'
import './reducer'
import actions from '../../actions'
import { history } from '../../common/service'
import globalStore from '../../stores/global'

const inventoryTabMap = {
  product: i18next.t('按商品盘点'),
  shelf: i18next.t('按货位盘点'),
  batch: i18next.t('按批次盘点'),
}

const canGetShelf = globalStore.hasPermission('get_check_shelf_location')
  ? i18next.t('按货位盘点')
  : null
const canGetBatch = globalStore.hasPermission('get_check_batch_number')
  ? i18next.t('按批次盘点')
  : null
const tabs = _.filter(
  [i18next.t('按商品盘点'), canGetShelf, canGetBatch],
  (val) => !!val,
)

class Inventory extends React.Component {
  componentDidMount() {
    const { activeTab } = this.props.location.query
    actions.product_inventory_sku_categories()

    if (activeTab) {
      const index = tabs.findIndex((v) => v === inventoryTabMap[activeTab])
      actions.product_inventory_tab_key(index)
    }
  }

  handleSelectTab = (key) => {
    actions.product_inventory_tab_key(key)
    if (this.props.location.query.activeTab) {
      history.push('/sales_invoicing/inventory/product')
    }
  }

  render() {
    const { inventoryTabKey } = this.props.inventory

    return (
      <FullTab
        active={inventoryTabKey}
        tabs={tabs}
        onChange={this.handleSelectTab}
      >
        <ProductManagementRecording {...this.props} />
        <ShelfManagementRecording {...this.props} />
        <BatchManagementRecording {...this.props} />
      </FullTab>
    )
  }
}

Inventory.propTypes = {
  inventory: PropTypes.object,
}

export default Inventory
