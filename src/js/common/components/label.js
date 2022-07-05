import React from 'react'
import { Flex } from '@gmfe/react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const LabelContainer = styled(Flex)`
  position: relative;
  overflow: hidden;
  height: 20px;

  .b-card-label {
    background-color: #56a3f2;
    color: white;
    padding: 0 2px;
    z-index: 1;
  }

  .b-card-label-content {
    width: 100%;
    height: 9px;
    position: absolute;
    top: 8px;

    .b-card-label-right,
    .b-card-label-left {
      width: 40px;
      background-color: #56a3f2;
    }

    .b-card-label-right {
      transform: rotate(10deg);
      margin-right: -5px;
    }

    .b-card-label-left {
      transform: rotate(350deg);
      margin-left: -5px;
    }
  }
`

const Label = ({ text, ...rest }) => {
  return (
    <LabelContainer column {...rest}>
      <Flex className='b-card-label'>{text}</Flex>
      <Flex className='b-card-label-content'>
        <div className='b-card-label-left' />
        <div className='b-card-label-right' />
      </Flex>
    </LabelContainer>
  )
}

Label.propTypes = {
  text: PropTypes.string.isRequired,
}

export default Label
