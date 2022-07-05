import { i18next } from 'gm-i18n'
import { Flex } from '@gmfe/react'
import styled from 'styled-components'
import React from 'react'
import PropTypes from 'prop-types'

const Pre = styled.div`
  margin: 0 8px 10px 8px;
  width: 4px;
  height: 19px;
  background-color: #6cca28;
`
const Title = styled.div`
  color: #333;
  margin-bottom: 10px;
  font-size: 18px;
  font-weight: bold;
`

class ModuleTitle extends React.Component {
  render() {
    const { text, ...rest } = this.props
    return (
      <div className='b-product-title-wrap' {...rest}>
        <div className='b-product-title'>
          <Flex alignCenter>
            <Pre>&nbsp;</Pre>
            <Title>{text || i18next.t('商品组')}</Title>
          </Flex>
        </div>
      </div>
    )
  }
}

ModuleTitle.propTypes = {
  text: PropTypes.string.isRequired,
}

export default ModuleTitle
