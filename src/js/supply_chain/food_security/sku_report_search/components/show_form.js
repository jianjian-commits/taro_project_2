import React from 'react'
import { Flex } from '@gmfe/react'
import PropTypes from 'prop-types'
import '../index.less'

const ShowForm = ({ data, labelWidth, colWidth }) => {
  return (
    <Flex wrap className='b-show-form gm-padding-lr-15'>
      {data.map((item, index) => (
        <Flex
          key={index}
          style={{ width: colWidth }}
          className='b-show-form-item  gm-margin-bottom-20'
        >
          <Flex
            style={{ width: labelWidth }}
            className='b-show-form-item-label'
          >
            {item.label}
          </Flex>
          <Flex>{item.value || '-'}</Flex>
        </Flex>
      ))}
    </Flex>
  )
}

ShowForm.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.node,
    })
  ).isRequired,
  labelWidth: PropTypes.string,
  colWidth: PropTypes.string,
}

ShowForm.defaultProps = {
  data: [],
  labelWidth: '70px',
  colWidth: '100%',
}

export default ShowForm
