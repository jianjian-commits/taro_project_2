import React from 'react'
import { Flex } from '@gmfe/react'
import PropTypes from 'prop-types'
import PurchaseTrend from './purchase_trend'
import PurchaseScreenBulletin from './purchase_bulletin_screen'

const SaleMapScreen = ({ className, theme }) => {
  return (
    <Flex column justifyBetween className={className}>
      <PurchaseScreenBulletin />
      <PurchaseTrend theme={theme} />
    </Flex>
  )
}

SaleMapScreen.propTypes = {
  theme: PropTypes.any,
  className: PropTypes.string,
}
export default SaleMapScreen
