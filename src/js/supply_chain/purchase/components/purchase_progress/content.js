import React from 'react'
import { Flex, ProgressCircle } from '@gmfe/react'
import Big from 'big.js'
import PropTypes from 'prop-types'

const Content = ({ percentage, already, plan, showText }) => {
  return (
    <Flex className='gm-position-relative'>
      <div style={{ width: '120px' }}>
        <ProgressCircle
          percentage={Big(percentage).toFixed(0)}
          textPosition='right'
          size={20}
        />
      </div>
      <Flex
        className='gm-position-absolute'
        style={{
          fontWeight: showText ? 'bold' : 'initial',
          marginLeft: '62px',
          width: '120px',
          lineHeight: '21px',
          flexWrap: 'wrap',
        }}
      >
        {showText ? (
          <>
            (<span className='text-primary'>{already}</span>
            <span>/</span>
            <span>{plan}</span>)
          </>
        ) : (
          '-'
        )}
      </Flex>
    </Flex>
  )
}

Content.propTypes = {
  percentage: PropTypes.number,
  already: PropTypes.number,
  plan: PropTypes.number,
  showText: PropTypes.bool,
}

export default Content
