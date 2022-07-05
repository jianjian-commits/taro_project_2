import React from 'react'
import classNames from 'classnames'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { Flex, FlipNumber } from '@gmfe/react'
import { Link } from 'react-router-dom'
import _ from 'lodash'
import SvgSuccess from 'svg/success.svg'

const Wrapper = styled(Flex)`
  border-radius: 3px;
  font-family: 'Helvetica';
  background-color: #f7f8fa;
  padding: 15px 15px 15px;
  transition: box-shadow 0.3s ease-in-out;
  &:hover {
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.12);
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
      background-color: red;
    }
  }

  .b-bulletin-text {
    font-size: 24px;
  }
`

const Bulletin = ({ flip, className, options }) => {
  let { tName, tAcount, tLink } = options
  tAcount = Number(tAcount)
  return (
    <Wrapper column justifyBetween flex className={classNames(className)}>
      <Flex justifyBetween alignCenter className='gm-margin-bottom-15'>
        <div className='b-bulletin-name gm-text-bold gm-text-12'>{tName}</div>
        <SvgSuccess
          style={{
            fontSize: '28px',
          }}
        />
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
              <span>{tAcount < 0 ? '-' : null}</span>
              <FlipNumber
                to={tAcount < 0 ? -tAcount : tAcount}
                decimal={2}
                delay={500}
              />
            </a>
          ) : (
            <Link
              className='gm-flex gm-text-bold gm-text gm-text-24'
              to={tLink}
            >
              <span>{tAcount < 0 ? '-' : null}</span>
              <FlipNumber
                to={tAcount < 0 ? -tAcount : tAcount}
                decimal={2}
                delay={500}
              />
            </Link>
          )
        ) : (
          <Flex className='gm-text-bold gm-text-24 gm-text'>
            <span>{tAcount < 0 ? '-' : null}</span>
            <FlipNumber
              to={tAcount < 0 ? -tAcount : tAcount}
              decimal={2}
              delay={500}
            />
          </Flex>
        )
      ) : tLink ? (
        <Link className='gm-text-bold gm-text-24 gm-text' to={tLink}>
          {tAcount}
        </Link>
      ) : (
        <div className='gm-text-bold gm-text-24'>{tAcount}</div>
      )}
    </Wrapper>
  )
}
Bulletin.propTypes = {
  options: PropTypes.object, // { tName, yName, tAcount, yAcount, tLink, yLink, bgColor }
  flip: PropTypes.bool,
  className: PropTypes.string,
}

export default Bulletin
