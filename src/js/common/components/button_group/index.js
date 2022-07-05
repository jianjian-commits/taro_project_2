import React, { useState } from 'react'
import { Flex } from '@gmfe/react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import styled from 'styled-components'
import classNames from 'classnames'
import { adapter } from '../../util'

const ButtonGroup = ({ data, onChange, renderBtn, addon, theme }) => {
  const { theme: color } = adapter(theme)
  const [active, setActive] = useState(data[0].value)
  const handleClick = (btn) => {
    setActive(btn.value)
    onChange && onChange(btn)
  }

  return (
    <>
      <Btns>
        {_.map(data, (btn) => (
          <div
            key={btn.value}
            className={classNames('b-button-group-btn', {
              active: btn.value === active,
              ocean: color === 'ocean',
              'gm-padding-0': !!renderBtn,
            })}
            onClick={() => handleClick(btn)}
          >
            {renderBtn ? renderBtn(btn) : btn.text}
          </div>
        ))}
      </Btns>
      <div className={classNames({ 'gm-margin-left-10': addon })}>{addon}</div>
    </>
  )
}

ButtonGroup.propTypes = {
  onChange: PropTypes.func,
  renderBtn: PropTypes.func,
  addon: PropTypes.any,
  theme: PropTypes.object,
  data: PropTypes.shape({
    text: PropTypes.string,
    value: PropTypes.any,
  }),
}
export default ButtonGroup

const Btns = styled(Flex)`
  .b-button-group-btn {
    box-sizing: border-box;
    padding: 6px 10px;
    border: 1px solid;
    border-color: #d4d8d8 transparent #d4d8d8 #d4d8d8;
    /* border-right-width: 0px; */
    cursor: pointer;
    border-radius: 2px 0 0 2px;
    & ~ .b-button-group-btn {
      border-radius: 0;
    }
    &:last-of-type {
      border-radius: 0px 2px 2px 0px;
      border-color: #d4d8d8;
    }
    &.active {
      border-right-width: 1px;
      border-color: #56a3f2;
      color: #56a3f2;
    }

    &.ocean {
      color: #4281b1;
      border: none;
      position: relative;
      &.active {
        color: #48d5f4;
      }
      &.active:after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: -4px;
        height: 4px;
        background: linear-gradient(
          to right,
          rgba(0, 0, 0, 0),
          #5fdeff 50%,
          rgba(0, 0, 0, 0)
        );
      }
    }
  }
`
