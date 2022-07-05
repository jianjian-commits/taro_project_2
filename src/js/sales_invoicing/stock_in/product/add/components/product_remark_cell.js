import React from 'react'
import { observer } from 'mobx-react'
import store from '../store'
import { KCInput } from '@gmfe/keyboard'
import memoComponentWithDataHoc from './memo_component_with_data_hoc'
import PropTypes from 'prop-types'

const ProductRemarkCell = observer((props) => {
  const { index, data } = props
  const { status } = store
  const { remark } = data

  return status === 'detail' ? (
    remark || '-'
  ) : (
    <KCInput
      style={{ width: '100px' }}
      maxLength={15}
      type='text'
      value={remark}
      className='form-control input-sm'
      onChange={(e) => store.onRowChange('remark', e.target.value, index)}
    />
  )
})

ProductRemarkCell.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(ProductRemarkCell)
