import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { isNil } from 'lodash'
import { storeContext } from './details_component'
import { t } from 'gm-i18n'

const HeaderItem = ({ value, renderer, isId }) => {
  const { splitPlan, is_frozen } = useContext(storeContext)
  if (isNil(splitPlan)) {
    return '-'
  }

  if (isNil(value)) {
    return '-'
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div>{renderer(value)}</div>
      <div>{isId && is_frozen ? t('历史单据，不允许修改') : ''}</div>
    </div>
  )
}

HeaderItem.propTypes = {
  isId: PropTypes.bool,
  value: PropTypes.any,
  renderer: PropTypes.func,
}

HeaderItem.defaultProps = {
  isId: false,
  renderer: (value) => value,
}

export default HeaderItem
