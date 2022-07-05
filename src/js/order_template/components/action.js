import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'

const Action = observer(({ original: { is_new }, onAdd, onDelete }) => {
  return (
    <>
      <a onClick={onAdd} className='gm-cursor'>
        <i className='xfont xfont-plus' />
      </a>
      <a onClick={onDelete} className='gm-cursor gm-margin-left-5'>
        <i className='xfont xfont-delete' />
      </a>
    </>
  )
})

Action.propTypes = {
  original: PropTypes.object,
  onAdd: PropTypes.func,
  onDelete: PropTypes.func,
}

export default Action
