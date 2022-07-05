import React, { Component } from 'react'
import { i18next } from 'gm-i18n'
import { FullTab } from '@gmfe/frame'

import '../actions'
import '../reducer'
import actions from '../../../actions'
import IncreaseStockRecording from './increase_stock_recording'
import LossStockRecording from './loss_stock_recording'

class IncreaseLossStock extends Component {
  state = {
    key: 0,
  }

  componentDidMount() {
    actions.product_inventory_sku_categories()
  }

  handleChangeTab = (key) => {
    this.setState({ key })
  }

  render() {
    const { key } = this.state
    return (
      <FullTab
        active={key}
        tabs={[i18next.t('报溢记录'), i18next.t('报损记录')]}
        onChange={this.handleChangeTab}
      >
        <IncreaseStockRecording {...this.props} />
        <LossStockRecording {...this.props} />
      </FullTab>
    )
  }
}

export default IncreaseLossStock
