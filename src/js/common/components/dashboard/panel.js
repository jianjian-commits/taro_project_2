import React, { useState, useEffect } from 'react'
import { t } from 'gm-i18n'
import { Flex } from '@gmfe/react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import classnames from 'classnames'
import { adapter } from 'common/util'

const Panel = ({
  children,
  title,
  right,
  className,
  height,
  addon,
  theme,
  ...rest
}) => {
  const { theme: color, type } = adapter(theme)
  const [active, setActive] = useState(false)

  useEffect(() => {
    setActive(true)
  }, [])

  return (
    <Wrapper
      column
      height={height}
      className={classnames(className, {
        ocean: color === 'ocean',
        column: type === 'column',
        rows: type === 'row',
        active,
      })}
      {...rest}
    >
      <Flex
        column={type === 'column'}
        justifyBetween
        alignCenter
        height={type === 'column' ? 'auto' : '40px'}
        className='gm-margin-bottom-10'
      >
        <div
          className={classnames('title', {
            column: type === 'column',
            rows: type === 'row',
          })}
        >
          {title}
        </div>
        <span className='gm-text-12 gm-text-desc'>{addon}</span>
        {right && (
          <Flex height='35px' alignCenter className='right'>
            {right}
          </Flex>
        )}
      </Flex>
      {children || (
        <Flex flex justifyCenter alignCenter column className='gm-text-desc'>
          {t('没有更多数据了')}
        </Flex>
      )}

      {/* 投屏模式下的样式 */}
      {color && type !== 'column' && type !== 'row' && (
        <>
          <div className='meteor meteor1' />
          <div className='meteor meteor2' />
          <div className='meteor meteor3' />
          <div className='meteor meteor4' />
        </>
      )}
    </Wrapper>
  )
}

export default Panel
Panel.propTypes = {
  title: PropTypes.any,
  addon: PropTypes.any,
  right: PropTypes.any,
  children: PropTypes.any,
  height: PropTypes.string,
  className: PropTypes.string,
  theme: PropTypes.any,
}

const Wrapper = styled.div.attrs((props) => {
  /**
   *  四个角的序号
   *  4 ---- 1
   *  |      |
   *  |      |
   *  3 ---- 2
   */

  const meteors = [1, 2, 3, 4]
    .map((index) => {
      const left = index / 3 >= 1
      const top = index % 3 === 1
      const odd = index % 2 !== 0
      return `
        .meteor {
          opacity: 0;
          transition: opacity 1.5s ease 0.5s;
        }
        .meteor${index} {
          position: absolute;
          width: 100px;
          height: 2px;

          ${left ? 'left' : 'right'}: 0;
          ${top ? 'top' : 'bottom'}: 0;

          background-repeat: no-repeat;
          background-image: linear-gradient(
            50deg,
            ${
              left
                ? `rgba(68, 201,246,1),rgba(0, 0, 0, 0)`
                : `rgba(0, 0, 0, 0),rgba(68, 201,246,1)`
            }
          );

          &::after {
            content: '';
            position: absolute;
            width: 100px;
            height: 2px;

            right: ${left ? '-1px' : '1px'};
            top: 0px;

            background-position: ${left ? '-100px' : '100px'};
            transform: rotateZ(${odd ? '-90deg' : '90deg'});
            transform-origin: ${left ? 'left' : 'right'};

            background-image: linear-gradient(
              50deg,
              ${
                left
                  ? `rgba(68, 201,246,1),rgba(0, 0, 0, 0)`
                  : `rgba(0, 0, 0, 0),rgba(68, 201,246,1)`
              }
            );
          }
        }
      `
    })
    .join('')

  return {
    meteor: meteors,
  }
})`
  padding: 10px 20px 20px;
  position: relative;
  min-width: 200px;
  min-height: 200px;
  background-color: #ffff;
  .title {
    font-size: 14px;
    font-weight: bold;
  }

  &.ocean {
    background-color: transparent;
    box-shadow: inset 0px 0px 0px #3147c9;
    transition: box-shadow 1.5s ease;
    .title {
      width: 100%;
      font-size: 16px;
      color: #fff;
      z-index: 2;
      &.column {
        box-shadow: none;
        text-align: center;
        position: relative;
        &::after {
          content: '';
          z-index: -1;
          position: absolute;
          bottom: -2px;
          top: -3px;
          left: 0;
          right: 0;
          background: linear-gradient(
            to right,
            rgba(0, 0, 0, 0),
            rgba(42, 111, 206, 1) 50%,
            rgba(0, 0, 0, 0)
          );
        }
        & ~ .right {
          margin: 10px 0 0;
        }
      }
      &.rows {
        background: linear-gradient(90deg, #2862b7 0%, transparent 40%);
        padding: 5px 20px;
      }
    }

    &.column {
      box-shadow: none !important;
    }
    &.rows {
      box-shadow: none !important;
    }
  }

  // 四个角的样式
  ${(props) => props.meteor}

  &.active {
    &.ocean {
      box-shadow: inset 0px 0px 35px #3147c9;
      &.column {
        box-shadow: none;
      }
      .meteor {
        opacity: 1;
      }
    }
  }
`
