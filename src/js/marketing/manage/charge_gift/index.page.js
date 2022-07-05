import React from 'react'
import ChargeGiftList from './list'
import ChargeGiftFilter from './filter'

class Coupon extends React.Component {
  render() {
    return (
      <div>
        <ChargeGiftFilter />
        <ChargeGiftList />
      </div>
    )
  }
}

export default Coupon
