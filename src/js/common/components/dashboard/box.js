import React from 'react'
import { Flex } from '@gmfe/react'
import styled from 'styled-components'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { adapter } from '../../util'

const Wrapper = styled(Flex)`
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #eee;
  cursor: pointer;
  font-family: 'Helvetica';
  width: 170px;
  &.active {
    border: 1px solid #56a3f2;
    background-color: #f0f5ff;
  }
  &:hover {
    border: 1px solid #56a3f2;
    background-color: #f0f5ff;
  }

  // ---------- 主题色 -------------
  &.ocean {
    color: #fff;
    border: none;
    justify-content: start;
    background-color: transparent;
    transition: background-color 0.3s linear;
    &:hover {
      background-color: rgba(77, 214, 253, 0.16);
    }
  }
`

const Box = ({ onClick, data = {}, style, className, active, theme }) => {
  const { theme: color } = adapter(theme)
  const { text, isNumber, isPercent, value, preValue } = data
  return (
    <Wrapper
      justifyBetween
      column
      className={classNames(className, {
        active,
        ocean: color === 'ocean',
      })}
      onClick={() => {
        onClick && onClick()
      }}
      style={style}
    >
      <div className='gm-text-14'>{text}</div>
      {data && (
        <div className='gm-text-24 gm-text-bold gm-margin-top-10'>
          {isNumber ? Number(value) : value}
          {isPercent && '%'}
        </div>
      )}
      {(preValue || preValue === 0) && (
        <Flex className='gm-margin-top-5'>
          <div className='gm-text-desc gm-text-14 gm-margin-right-5'>
            {t('昨日')}
          </div>
          <div className='gm-text-bold gm-text-14'>
            {isNumber ? Number(preValue) : preValue}
          </div>
        </Flex>
      )}
      {/* {(preValue || preValue === 0) && (
        <Flex className='gm-margin-tb-5'>
          <div className='gm-text-desc gm-margin-right-5'>{t('较昨日')}</div>
          <div> {isNumber ? Number(preValue) : preValue}</div>
        </Flex>
      )} */}
    </Wrapper>
  )
}

Box.propTypes = {
  onClick: PropTypes.func,
  style: PropTypes.object,
  className: PropTypes.string,
  active: PropTypes.bool,
  theme: PropTypes.any,
  data: PropTypes.shape({
    name: PropTypes.string,
    data: PropTypes.number,
    pre: PropTypes.number,
  }),
}
export default Box
