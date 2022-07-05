/**
 * @description: 渲染【单位计件单价】单元格
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Flex } from '@gmfe/react'
import { KCInputNumberV2 } from '@gmfe/keyboard'
import { t } from 'gm-i18n'

function RenderPerf(props) {
  const { index, value, disabled, onChange } = props

  return (
    <Flex alignCenter>
      <KCInputNumberV2
        style={{ width: '80px' }}
        min={0.0}
        precision={2}
        onChange={(num) => onChange('perf', num, index)}
        value={value}
        disabled={disabled}
      />
      <span className='gm-padding-5'>{t('元')}</span>
    </Flex>
  )
}
RenderPerf.propTypes = {
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  disabled: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default RenderPerf
