/*
 * @Description: 备注长度popover提示
 */
import React from 'react'
import { Popover } from '@gmfe/react'
import PropTypes from 'prop-types'
function ViewPopoverRemark({ value }) {
  if (!value?.length) return '-'

  return (
    <Popover
      showArrow
      center
      type='hover'
      popup={
        <div
          className='gm-bg gm-padding-10'
          style={{ width: '200px', wordBreak: 'break-all' }}
        >
          {value}
        </div>
      }
    >
      <span className='b-ellipsis-order-remark'>{value}</span>
    </Popover>
  )
}

ViewPopoverRemark.propTypes = {
  value: PropTypes.string,
}
export default ViewPopoverRemark
