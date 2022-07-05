import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'

function DashedLine({ className, ...rest }) {
  return (
    <div className={classNames('b-dotted-line', className)} {...rest}>
      <style jsx>
        {`
          .b-dotted-line {
            border: 1px dashed #000;
          }
        `}
      </style>
    </div>
  )
}

DashedLine.propTypes = {
  className: PropTypes.string,
}

export default DashedLine
