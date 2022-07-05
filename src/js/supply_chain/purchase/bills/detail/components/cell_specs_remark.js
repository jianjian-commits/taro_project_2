import React from 'react'
import { observer } from 'mobx-react'
import memoComponentWithDataHoc from './memo_with_data_hoc'
import PropTypes from 'prop-types'
import { KCInput } from '@gmfe/keyboard'
import store from '../store'

const CellRemark = observer((props) => {
  const { index, data } = props
  const { goods_remark } = data

  const handleChange = (event) => {
    store.changeEditTask(true)
    store.changeListItem(index, { goods_remark: event.target.value })
  }

  return (
    <KCInput
      maxLength={50}
      type='text'
      value={goods_remark || ''}
      className='form-control input-sm'
      onChange={handleChange}
    />
  )
})

CellRemark.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(CellRemark)
