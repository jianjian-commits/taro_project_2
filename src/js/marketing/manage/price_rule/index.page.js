import React from 'react'
import PropTypes from 'prop-types'
import { FullTab } from '@gmfe/frame'
import { observer } from 'mobx-react'
import Creater from './creater'
import actions from '../../../actions'
import globalStore from 'stores/global'
import './actions'
import './reducer'
import ruleStore from './view_rule/rule_store'
import skuStore from './view_sku/sku_store'

import ViewRule from './view_rule'
import ViewSku from './view_sku'

@observer
class PriceRule extends React.Component {
  componentWillMount() {
    // 从其他页面进入，清理数据
    if (this.props.location.action === 'REPLACE') {
      skuStore.init()
      ruleStore.init()
      actions.price_rule_clear()
    }
  }

  // componentWillMount中清理数据过后需要setTimeout才能拿到新的props
  componentDidMount() {
    setTimeout(() => {
      const len = ruleStore.list.length
      const filter = ruleStore.filter

      // 返回的时候不搜索数据
      if (
        this.props.location.action !== 'POP' ||
        (this.props.location.action === 'POP' && !len)
      ) {
        if (!len) {
          const { q } = this.props.location.query
          if (q) {
            ruleStore.handleFilterChange('searchText', q)
          }
          ruleStore.fetchData(
            0,
            filter.status,
            q || filter.searchText,
            filter.stationId,
          )
          actions.price_rule_get_salemenus() // 拉取报价单数据
          globalStore.isCenterSaller() && actions.price_rule_get_stations()
        }
      }
    }, 0)
  }

  render() {
    const { activeTab, tabs } = this.props.price_rule

    return (
      <div className='price-rule'>
        <FullTab
          tabs={tabs}
          active={activeTab}
          onChange={(tab) => actions.price_rule_tab_change(tab)}
        >
          <ViewRule {...this.props} />
          <ViewSku {...this.props} />
        </FullTab>
        <Creater {...this.props} />
      </div>
    )
  }
}

PriceRule.propTypes = {
  price_rule: PropTypes.object,
}

export default PriceRule
