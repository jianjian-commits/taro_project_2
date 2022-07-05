import React from 'react'
import { i18next } from 'gm-i18n'
import PropTypes from 'prop-types'

const SheetSelectAllTip = (props) => {
  const { isCurrentPage, handleToggle } = props

  return isCurrentPage ? (
    <div>
      {i18next.t('已选择当前页内容，')}
      <a href='javascript:;' onClick={handleToggle.bind(null, false)}>
        {i18next.t('点此勾选全部页内容')}
      </a>
    </div>
  ) : (
    <div>
      {i18next.t('已选择所有页内容，')}
      <a href='javascript:;' onClick={handleToggle.bind(null, true)}>
        {i18next.t('点此勾选当前页内容')}
      </a>
    </div>
  )
}

SheetSelectAllTip.propTypes = {
  isCurrentPage: PropTypes.bool.isRequired,
  handleToggle: PropTypes.func.isRequired,
}

export default SheetSelectAllTip
