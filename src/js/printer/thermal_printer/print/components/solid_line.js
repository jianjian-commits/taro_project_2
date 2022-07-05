import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'

function SolidLine({ className, ...rest }) {
  return (
    <div className={classNames('b-solid-line', className)} {...rest}>
      <style jsx>
        {`
          .b-solid-line {
            border: 1px solid #000;
          }
        `}
      </style>
    </div>
  )
}

SolidLine.propTypes = {
  className: PropTypes.string,
}

export default SolidLine
