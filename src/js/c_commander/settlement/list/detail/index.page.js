import React from 'react'
import DetailFilter from './detail_filter'
import DetailList from './detail_list'

const Detail = props => {
  return (
    <>
      <DetailFilter {...props} />
      <DetailList {...props} />
    </>
  )
}

export default Detail
