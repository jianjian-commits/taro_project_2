import React from 'react'
import PropTypes from 'prop-types'
import { getLocale } from '@gmfe/locales'
import classNames from 'classnames'

export default function ProductSearch(props) {
  const { expand, template, toggleExpand, children } = props

  return (
    <div className='gm-quick gm-quick-filter gm-padding-lr-20'>
      {expand ? template : children}
      <div className='gm-flex gm-flex-justify-center gm-padding-10'>
        <a
          href='javascript:'
          className='gm-quick-filter-toggle'
          onClick={() => toggleExpand(!expand)}
        >
          {expand ? getLocale('收拢详细信息') : getLocale('展开详细信息')}
          &nbsp;
          <i
            className={classNames('xfont', {
              'xfont-down': !expand,
              'xfont-up': expand,
            })}
          />
        </a>
      </div>
    </div>
  )
}

ProductSearch.propTypes = {
  expand: PropTypes.bool,
  template: PropTypes.element,
  toggleExpand: PropTypes.func,
}

ProductSearch.defaultProps = {
  expand: false,
}
