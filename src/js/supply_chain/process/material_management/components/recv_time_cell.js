import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import store from '../store'
import moment from 'moment'

const RectTimeCell = ({ index }) => {
  const { receiveMaterialList } = store
  const { recv_time } = receiveMaterialList[index]

  return <>{recv_time ? moment(recv_time).format('YYYY-MM-DD') : '-'}</>
}

RectTimeCell.propTypes = {
  index: PropTypes.number,
}

export default observer(RectTimeCell)
