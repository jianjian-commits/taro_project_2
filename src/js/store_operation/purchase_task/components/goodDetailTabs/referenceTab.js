import React from 'react'
import PropTypes from 'prop-types'
import PurchaseQuotations from '../../../../common/components/purchase_quotations'

class ReferenceTab extends React.Component {
  render() {
    return (
      <div>
        <PurchaseQuotations {...this.props} purchase_type={2} is_tab />
      </div>
    )
  }
}

ReferenceTab.propTypes = {
  id: PropTypes.string.isRequired,
  supplier_id: PropTypes.string.isRequired,
  std_unit_name: PropTypes.string.isRequired,
}

export default ReferenceTab
