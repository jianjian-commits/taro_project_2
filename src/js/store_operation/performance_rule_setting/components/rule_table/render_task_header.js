/**
 * @description: 渲染【最 小 | 大 任务数】表头
 */

import React from 'react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import { ToolTip } from '@gmfe/react'

function RenderTaskHeader(props) {
  const { isMin, isPiece } = props

  const tip = t(
    isMin
      ? '单个自然日内完成分拣任务数的区间最小值，按操作时间统计'
      : '单个自然日内完成分拣任务数的区间最大值，按操作时间统计',
  )
  return (
    <div>
      <span className='gm-margin-right-5'>
        {t('KEY_224', {
          VAR1: isMin ? '小' : '大',
          VAR2: isPiece ? '件' : '重',
          VAR3: isMin ? '' : '不',
        })}
        {/* 最${VAR1}计${VAR2}数（${VAR3}包含） */}
      </span>
      <ToolTip popup={<div>{tip}</div>} />
    </div>
  )
}
RenderTaskHeader.propTypes = {
  isMin: PropTypes.bool.isRequired,
  isPiece: PropTypes.bool.isRequired,
}

export default RenderTaskHeader
