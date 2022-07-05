import { i18next } from 'gm-i18n'
import React from 'react'
import { connect } from 'react-redux'
import DiscountPanel from '../../common/components/discount_panel'
import moment from 'moment'
import './actions'
import './reducer'
import actions from '../../actions'
import PropTypes from 'prop-types'

import Header from './components/settle_detail_header'
import TableDetail from './components/settle_detail_table'
import AmountTable from './components/settle_detail_amount_table'

const REASON = {
  1: i18next.t('抹零'),
  2: i18next.t('供应商计算异常'),
  3: i18next.t('供应商折扣'),
  4: i18next.t('供应商罚款'),
  5: i18next.t('其他'),
}
const TYPE = { 1: i18next.t('加钱'), 2: i18next.t('扣钱') }

class SheetDetail extends React.Component {
  componentDidMount() {
    actions.payment_review_settle_sheet_detail(this.props.params.id)
  }

  handleDiscountAdd = (discount) => {
    const { settle_sheet_detail } = this.props.payment_review
    actions.payment_review_discount_add(
      Object.assign(
        discount,
        { create_time: moment(new Date()).format('YYYY-MM-DD') },
        { operator: settle_sheet_detail.creator },
      ),
    )
  }

  handleDiscountDel = (index) => {
    actions.payment_review_discount_del(index)
  }

  render() {
    const { settle_sheet_detail } = this.props.payment_review
    const { discount } = settle_sheet_detail

    const isSubmit =
      settle_sheet_detail.status === 0 || settle_sheet_detail.status === 1

    return (
      <>
        <Header data={settle_sheet_detail} />
        {/* 单据列表 */}
        <TableDetail />
        {/* 金额折让 */}
        <DiscountPanel
          list={discount}
          reasonMap={REASON}
          actionMap={TYPE}
          editable={isSubmit}
          onAdd={this.handleDiscountAdd}
          onDel={this.handleDiscountDel}
        />
        <AmountTable />
      </>
    )
  }
}

SheetDetail.propTypes = {
  payment_review: PropTypes.object,
}

export default connect((state) => ({
  payment_review: state.payment_review,
}))(SheetDetail)
