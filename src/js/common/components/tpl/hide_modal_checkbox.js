import React from 'react'
import { Checkbox } from '@gmfe/react'
import PropTypes from 'prop-types'
import { i18next } from 'gm-i18n'

const HideModalCheckbox = ({ checked, onChange }) => {
  return (
    <Checkbox
      checked={checked}
      onChange={(e) =>
        onChange('hidePrinterOptionsModal', e.currentTarget.checked)
      }
    >
      {i18next.t('不再弹出单据模板选择窗口')}
    </Checkbox>
  )
}

HideModalCheckbox.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
}

export default HideModalCheckbox
