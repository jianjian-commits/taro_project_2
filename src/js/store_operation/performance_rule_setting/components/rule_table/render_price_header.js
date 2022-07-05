/**
 * @description: 渲染【单位计件单价】表头
 */
import React from 'react'
import PropTypes from 'prop-types'
import { ToolTip } from '@gmfe/react'
import { t } from 'gm-i18n'

function RenderPriceHeader(props) {
  const { isPiece } = props
  return (
    <div>
      <span className='gm-margin-right-5'>
        {t(isPiece ? '单位计件单价' : '单位计重单价')}
      </span>
      <ToolTip
        popup={
          <div>
            {t(
              isPiece
                ? '单日内分拣任务数达到对应任务区间时的分拣件数单位单价'
                : '单日内分拣任务数达到对应任务区间时的分拣重量单位单价',
            )}
          </div>
        }
      />
    </div>
  )
}
RenderPriceHeader.propTypes = {
  isPiece: PropTypes.bool.isRequired,
}

export default RenderPriceHeader
