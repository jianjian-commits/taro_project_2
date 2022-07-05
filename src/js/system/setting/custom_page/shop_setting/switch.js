import React from 'react'
import PropTypes from 'prop-types'
import { i18next } from 'gm-i18n'
import { Switch } from '@gmfe/react'

const BSwitch = (props) => {
  const { tip } = props
  return (
    <>
      <Switch
        {...props}
        type='primary'
        on={i18next.t('开启')}
        off={i18next.t('关闭')}
      />
      {tip && <div className='gm-text-desc gm-margin-top-5'>{tip}</div>}
    </>
  )
}

BSwitch.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  tip: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
}

export default BSwitch
