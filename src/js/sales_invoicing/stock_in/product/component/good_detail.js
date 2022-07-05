import React from 'react'
import { Flex } from '@gmfe/react'
import PurchaseQuotations from '../../../../common/components/purchase_quotations'
import GoodHeader from './good_header'
import PropTypes from 'prop-types'

const GoodDetail = (props) => {
  return (
    <Flex column>
      <Flex column className='gm-padding-tb-10 gm-padding-lr-20 gm-back-bg'>
        <GoodHeader {...props.header} />
      </Flex>
      <PurchaseQuotations {...props.detail} />
    </Flex>
  )
}

GoodDetail.propTypes = {
  header: PropTypes.object.isRequired,
  detail: PropTypes.object.isRequired,
}
export default GoodDetail
