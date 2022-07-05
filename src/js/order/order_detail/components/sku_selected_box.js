import { t } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

// 开启 多sku下单，无需标记已选择商品
const SelectedBox = ({
  children,
  selected,
  className = '',
  style = null,
  ...rest
}) => {
  return (
    <div
      className={classNames(className, {
        'b-color-active': selected,
      })}
      data-label={t('组合商品')}
      style={style}
      {...rest}
    >
      {children}
    </div>
  )
}

SelectedBox.propTypes = {
  selected: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
}

export default SelectedBox
