import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { TYPE_1_LIST, TYPE_2_LIST } from '../util'
import store from '../store'

const Action = observer(
  ({ original: { is_new, system_key }, listLength, onAdd, onDelete }) => {
    const {
      detail: { type },
    } = store
    const isType_1 = !TYPE_1_LIST.includes(system_key) && type === 1
    const isType_2 = !TYPE_2_LIST.includes(system_key) && type === 2
    return (
      <>
        <a onClick={onAdd} className='gm-cursor'>
          <i className='xfont xfont-plus' />
        </a>
        {listLength > 1 && (isType_1 || isType_2) && (
          <a onClick={onDelete} className='gm-cursor gm-margin-left-5'>
            <i className='xfont xfont-delete' />
          </a>
        )}
      </>
    )
  },
)

Action.propTypes = {
  original: PropTypes.object,
  index: PropTypes.number,
  onAdd: PropTypes.func,
  onDelete: PropTypes.func,
}

export default Action
