import React, { useEffect } from 'react'
import jsBarCode from 'jsbarcode'
import PropTypes from 'prop-types'

const Title = ({ title, id, code }) => {
  useEffect(() => {
    jsBarCode(`#product_code_${id}`, code, { height: 40, fontSize: 14 })
  }, [id])

  return (
    <div
      style={{
        height: '80px',
        fontSize: '32px',
        textAlign: 'center',
        lineHeight: '80px',
        position: 'relative',
      }}
    >
      {title}
      <div style={{ position: 'absolute', right: 0, top: 0 }}>
        <svg id={`product_code_${id}`} />
      </div>
    </div>
  )
}

Title.propTypes = {
  title: PropTypes.string,
  id: PropTypes.number,
  code: PropTypes.string,
}

export default Title
