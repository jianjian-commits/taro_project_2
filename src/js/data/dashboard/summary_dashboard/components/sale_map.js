import React from 'react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Panel from 'common/components/dashboard/panel'

const SaleMap = ({ className }) => {
  return (
    <Panel title={t('运营地图')} className={classNames('gm-bg', className)}>
      <div />
    </Panel>
  )
}

SaleMap.propTypes = {
  xxxx: PropTypes.bool,
  className: PropTypes.string,
}
export default SaleMap
