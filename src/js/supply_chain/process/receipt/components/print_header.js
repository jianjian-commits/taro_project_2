import { Col, Row } from '@gmfe/react'
import PropTypes from 'prop-types'
import React from 'react'

const Header = ({ content, col }) => {
  return (
    <Row className='gm-text-14 gm-text-bold'>
      {content.map((item, index) => (
        <Col span={24 / col} className='gm-margin-bottom-5' key={index}>
          <div className='gm-inline-block'>
            {item.label}
            <style jsx>{`
              div {
                width: 90px;
                text-align: right;
              }
            `}</style>
          </div>
          ：{item.text}
        </Col>
      ))}
    </Row>
  )
}

Header.propTypes = {
  content: PropTypes.array,
  col: PropTypes.number.isRequired,
}

export default Header
