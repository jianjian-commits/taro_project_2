import React from 'react'
import { ToolTip } from '@gmfe/react'
import { i18next, t } from 'gm-i18n'
import PropTypes from 'prop-types'

const stockInDefaultPriceName = {
  0: t('不启用'),
  1: t('供应商最近询价'),
  3: t('供应商最近入库价'),
  5: t('最近询价'),
  6: t('最近入库价'),
  9: t('供应商周期报价'),
}

const TableHeaderSettingHover = (props) => {
  const { settingTypeObject, title, currentSettingType, onSettingClick } = props
  return (
    <div>
      <span>{title}</span>
      <ToolTip
        popup={
          <div className='gm-padding-5'>
            {currentSettingType !== 0
              ? i18next.t('默认展示') +
                settingTypeObject[currentSettingType] +
                ','
              : i18next.t('未设置默认展示价，')}
            <a onClick={onSettingClick}>{i18next.t('点此设置')}</a>
          </div>
        }
      />
    </div>
  )
}

TableHeaderSettingHover.propTypes = {
  settingTypeObject: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  currentSettingType: PropTypes.number,
  onSettingClick: PropTypes.func.isRequired,
}

TableHeaderSettingHover.defaultProps = {
  settingTypeObject: stockInDefaultPriceName,
}

export default TableHeaderSettingHover
