import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const Tag = ({ children, color, round, ...rest }) => {
  return (
    <TagStyle color={color} round={round} rest>
      {children}
    </TagStyle>
  )
}

const TagStyle = styled.span`
  color: ${(props) => props.color};
  border: ${(props) => `1px solid ${props.color}`};
  padding: ${(props) => (props.round ? '0px 5px' : '0px')};
  border-radius: ${(props) => (props.round ? '10px' : '0px')};
`

Tag.propTypes = {
  color: PropTypes.string,
  round: PropTypes.bool,
}

Tag.defaultProps = {
  color: '#56A3F2',
}

export default Tag
