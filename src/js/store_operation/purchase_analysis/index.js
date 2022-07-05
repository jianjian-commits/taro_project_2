import React from 'react'
import { FullTab } from '@gmfe/frame'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import moment from 'moment'
import _ from 'lodash'
import globalStore from '../../stores/global'

import SupplyProductionAnalysis from './supply_production_analysis'
import PurchaserAssessment from './purchaser_assessment'
import SupplierEvaluation from './supplier_evaluation'
import QuotationLog from '../purchase_task/quotation_log/index'

@observer
class PurchaseAnalysis extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      active: Number(this.props.location.query.tab) || 0,
      begin_time:
        this.props.location.query.begin_time || moment().startOf('day'),
      end_time: this.props.location.query.end_time || moment().startOf('day'),
    }
  }

  handleChangeTab = (value) => {
    const { begin_time, end_time, tab } = this.props.location.query

    this.setState({
      active: value,
      begin_time: value === +tab ? begin_time : moment().startOf('day'),
      end_time: value === +tab ? end_time : moment().startOf('day'),
    })
  }

  render() {
    const { begin_time, end_time } = this.state
    const get_supply_and_analysis = globalStore.hasPermission(
      'get_supply_and_analysis'
    )
    const get_purchaser_assess = globalStore.hasPermission(
      'get_purchaser_assess'
    )
    const get_supplier_assess = globalStore.hasPermission('get_supplier_assess')
    const get_quote_price_record = globalStore.hasPermission(
      'get_quote_price_record'
    )

    const supplyAnalysis = get_supply_and_analysis
      ? i18next.t('供采分析')
      : null
    const purchaserAssess = get_purchaser_assess
      ? i18next.t('采购员评估')
      : null
    const supplierAssess = get_supplier_assess ? i18next.t('供应商评估') : null
    const quotePrice = get_quote_price_record ? i18next.t('询价记录') : null
    const tabs = _.filter(
      [supplyAnalysis, purchaserAssess, supplierAssess, quotePrice],
      (val) => !!val
    )

    return (
      <FullTab
        active={this.state.active}
        onChange={(tab) => this.handleChangeTab(tab)}
        tabs={tabs}
        className='b-order'
      >
        {/* 供采分析 */}
        {get_supply_and_analysis && (
          <SupplyProductionAnalysis
            begin_time={begin_time}
            end_time={end_time}
          />
        )}

        {/* 采购员评估 */}
        {get_purchaser_assess && (
          <PurchaserAssessment begin_time={begin_time} end_time={end_time} />
        )}

        {/* 供应商评估 */}
        {get_supplier_assess && (
          <SupplierEvaluation begin_time={begin_time} end_time={end_time} />
        )}

        {/* 询价记录 */}
        {}
        {get_quote_price_record && <QuotationLog />}
      </FullTab>
    )
  }
}

export default PurchaseAnalysis
