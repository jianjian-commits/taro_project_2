import React, { useState } from 'react'
import { Flex } from '@gmfe/react'
import styled from 'styled-components'
import Box from 'common/components/dashboard/box'
import SliderArrow from './slider_arrow'
import { useSlider } from './hooks'

import PropTypes from 'prop-types'

const SliderWrapper = styled(Flex)`
  flex: 1;
  .b-home-slider {
    float: left;
    overscroll-behavior-x: contain;
  }
  position: relative;
  padding: 10px 0;
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    display: ${(props) => (props.atFirst ? 'none' : 'block')};
    width: 1px;
    height: 100%;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
  }
  &:after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    display: ${(props) => (props.atEnd ? 'none' : 'block')};
    width: 1px;
    height: 100%;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
  }
`

const Slider = ({ children, data, onChange }) => {
  const { container, point, size, toPre, toNext } = useSlider()
  const [active, setActive] = useState(point)

  const atFirst = point === 0
  const atEnd = point >= data.length - size

  const handleClick = (item, index) => {
    onChange(item, index)
    setActive(index)
  }

  return (
    <Flex justifyBetween>
      <SliderArrow disabled={atFirst} left onClick={toPre} />
      <SliderWrapper
        className='gm-overflow-hidden'
        atFirst={atFirst}
        atEnd={atEnd}
      >
        <div className='b-home-slider gm-flex' ref={container}>
          {data.map((item, index) => (
            <Box
              className='gm-margin-right-15'
              data={item}
              active={active === index}
              key={item.field}
              onClick={() => {
                handleClick(item, index)
              }}
            />
          ))}
        </div>
      </SliderWrapper>
      <SliderArrow right disabled={atEnd} onClick={toNext} />
    </Flex>
  )
}

Slider.propTypes = {
  data: PropTypes.array,
  onChange: PropTypes.func,
}
export default Slider
