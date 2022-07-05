import { t } from 'gm-i18n'
import React from 'react'
import { ToolTip } from '@gmfe/react'

const renderPercentageHeader = (right) => {
  return (
    <span>
      {t('出成率')}
      <ToolTip
        right={Boolean(right)}
        popup={
          <div style={{ width: '320px' }} className='gm-padding-5'>
            {t('出成率=产出数量（基本单位）/领料数量（基本单位）')}
          </div>
        }
      />
    </span>
  )
}

const renderProductPercentageHeader = (right) => {
  return (
    <span>
      {t('成品出成率')}
      <ToolTip
        right={Boolean(right)}
        popup={
          <div style={{ width: '620px' }} className='gm-padding-5'>
            <p className='gm-margin-0'>
              {t(
                '成品出成率=成品产出数量（基本单位）/物料实际用料数量（基本单位）'
              )}
            </p>
            <p className='gm-margin-0'>
              {t(
                '多物料且物料基本单位相同时，成品出成率=成品产出数量（基本单位）之和/物料实际用料数量（基本单位）之和'
              )}
            </p>
            <p className='gm-margin-0'>
              {t('多物料且物料基本单位不同时，成品出成率不做计算')}
            </p>
          </div>
        }
      />
    </span>
  )
}

const renderMaterielPercentageHeader = (right) => {
  return (
    <span>
      {t('物料出成率')}
      <ToolTip
        right={Boolean(right)}
        popup={
          <div style={{ width: '380px' }} className='gm-padding-5'>
            {t('物料出成率=物料产出数量（基本单位）/实际用料数量（基本单位）')}
          </div>
        }
      />
    </span>
  )
}

export {
  renderPercentageHeader,
  renderProductPercentageHeader,
  renderMaterielPercentageHeader,
}
