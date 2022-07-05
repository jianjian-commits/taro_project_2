import React from 'react'
import classNames from 'classnames'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { Flex, FlipNumber } from '@gmfe/react'
import { Link } from 'react-router-dom'
import _ from 'lodash'
import { t } from 'gm-i18n'

const Wrapper = styled(Flex)`
  border-radius: 8px;
  font-family: 'Helvetica';
  background-color: #f7f8fa;
  padding: 15px 15px 15px;
  transition: box-shadow 0.3s ease-in-out;
  height: ${(props) => props.height || 'auto'};
  &:hover {
    box-shadow: 0px 0px 10px 0px rgba(194, 224, 250);
  }
  .b-bulletin-name {
    position: relative;
    &::before {
      content: '';
      display: block;
      position: absolute;
      left: -15px;
      top: -1px;
      width: 3px;
      height: 100%;
      background-color: ${(props) => props.color || 'white'};
    }
  }

  .b-bulletin-text {
    font-size: 22px;
  }
`

const Bulletin = ({ className, options, height }) => {
  const {
    text,
    value = 0,
    preValue,
    tLink,
    color,
    icon,
    flip = true,
    isPercent,
    decimal,
  } = options
  return (
    <Wrapper
      column
      justifyBetween
      flex
      className={classNames(className)}
      color={color}
      height={height}
    >
      <Flex justifyBetween alignCenter className='gm-margin-bottom-15'>
        <div className='b-bulletin-name gm-text-14'>{text}</div>
        {icon &&
          React.cloneElement(icon, {
            style: { color },
            className: 'gm-text-24',
          })}
      </Flex>
      {/* 1. 传了flip,使用<Flip />
          2. 传了tLink,tLink以http开头，使用<a />标签包裹，否则用<Link />组件
      */}
      {flip ? (
        tLink ? (
          _.startsWith(tLink, 'http') ? (
            <a
              href={tLink}
              target='_blank'
              rel='noopener noreferrer'
              className='gm-flex gm-text-bold gm-text-24 gm-text'
            >
              {/* FlipNumber 不能传负数，所以取相反数，自己处理负号 */}
              <span>{value < 0 ? '-' : null}</span>
              <FlipNumber
                to={value < 0 ? -value : +value}
                decimal={decimal ?? 2}
                delay={500}
              />
              {isPercent && '%'}
            </a>
          ) : (
            <Link
              className='gm-flex gm-text-bold gm-text gm-text-24'
              to={tLink}
            >
              <span>{value < 0 ? '-' : null}</span>
              <FlipNumber
                to={value < 0 ? -value : +value}
                decimal={decimal ?? 2}
                delay={500}
              />
              {isPercent && '%'}
            </Link>
          )
        ) : (
          <Flex className='gm-text-bold gm-text-24 gm-text'>
            <span>{value < 0 ? '-' : null}</span>
            <FlipNumber
              to={value < 0 ? -value : +value}
              decimal={decimal ?? 2}
              delay={500}
            />
            {isPercent && '%'}
          </Flex>
        )
      ) : tLink ? (
        <Link className='gm-text-bold gm-text-24 gm-text' to={tLink}>
          {value}
        </Link>
      ) : (
        <div className='gm-text-bold gm-text-24'>{value}</div>
      )}

      {(preValue || preValue === 0) && (
        <div className='gm-margin-top-15'>
          <span className='gm-margin-right-15'>{t('前一周期')}</span>
          <span className='gm-text-bold'>
            {decimal === 0 ? Number(preValue) : preValue}
          </span>
          {isPercent && '%'}
        </div>
      )}
    </Wrapper>
  )
}
Bulletin.propTypes = {
  options: PropTypes.object, // { name, yName, data, yAcount, tLink, yLink, bgColor }
  className: PropTypes.string,
  height: PropTypes.string,
}

export default Bulletin
