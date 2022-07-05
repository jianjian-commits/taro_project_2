import { i18next } from 'gm-i18n'
import React from 'react'
import { FullTab } from '@gmfe/frame'
import PropTypes from 'prop-types'
import MaterialInStock from './material'
import ProductInStock from './clean_food_stock_in/product_stock_list'
import StockInList from './store/clean_food_store'
import globalStore from '../../../stores/global'
import store from './store'
import { observer } from 'mobx-react'

@observer
class StockIn extends React.Component {
  componentDidMount() {
    StockInList.getSkucategories()
    store.changeTab(+this.props.location.query.tabIndex || 0)
  }

  handleChangeTab = (tab) => {
    store.changeTab(tab)
  }

  render() {
    if (globalStore.otherInfo.cleanFood) {
      return (
        <FullTab
          active={store.activeTab}
          tabs={[i18next.t('原料入库'), i18next.t('成品入库')]}
          onChange={this.handleChangeTab}
        >
          <MaterialInStock {...this.props} />
          <ProductInStock {...this.props} />
        </FullTab>
      )
    } else {
      return <MaterialInStock {...this.props} />
    }
  }
}

StockIn.propTypes = {
  tabIndex: PropTypes.number,
}

export default StockIn
