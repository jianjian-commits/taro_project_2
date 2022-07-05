import React from 'react'
import { observer } from 'mobx-react'

const ErrorTips = observer((props) => {
  return (
    <div
      className='gm-padding-10'
      style={{ backgroundColor: '#ffefe5', width: '100%' }}
    >
      {props.tips}
    </div>
  )
})

export default ErrorTips
