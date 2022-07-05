/**
 * 配合grid.less
 */
import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const GridContainer = styled.div`
  display: grid;
  background-color: ${(props) => (props.bg ? '#f6f7fb' : 'none')};
  grid-template-columns: ${(props) => `repeat(${props.column}, 1fr)`};
  grid-template-rows: auto;
  grid-gap: 15px;
  padding: 15px;
`

const Grid = ({ children, column, className, style, bg = true }) => {
  return (
    <GridContainer className={className} bg={bg} column={column} style={style}>
      {children}
    </GridContainer>
  )
}

Grid.propTypes = {
  column: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
  bg: PropTypes.bool,
}
export default Grid
