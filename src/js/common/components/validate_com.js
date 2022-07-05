import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styled from 'styled-components'

const DivStyled = styled.div`
  color: #a94442;
`

const ValidateCom = ({ isInvalid, warningText, children }) => {
  return (
    <div>
      {React.Children.map(children, (child, index) => {
        return React.cloneElement(child, {
          className: classNames(
            {
              'b-border-red': isInvalid,
            },
            child.props.className
          ),
          key: index,
        })
      })}

      {isInvalid && <DivStyled>{warningText}</DivStyled>}
    </div>
  )
}

ValidateCom.propTypes = {
  isInvalid: PropTypes.bool,
  warningText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
}

export default ValidateCom
