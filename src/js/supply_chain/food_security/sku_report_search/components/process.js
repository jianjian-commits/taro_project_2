import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Flex } from '@gmfe/react'

class Process extends Component {
  static propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        date: PropTypes.string,
        time: PropTypes.string,
        icon: PropTypes.node,
        title: PropTypes.arrayOf(
          PropTypes.shape({
            label: PropTypes.string,
            value: PropTypes.string,
          })
        ),
        show: PropTypes.bool,
      })
    ),
  }

  static defaultProps = {
    data: [],
  }

  render() {
    const { data } = this.props
    return (
      <Flex alignStart justifyAround className='gm-text-16'>
        {data.map((item, index) => (
          <Flex key={index} flex={1} alignCenter>
            <div style={{ width: '100%' }}>
              <div>{item.date}</div>
              <div>{item.time}</div>
              <Flex alignCenter>
                <span style={{ fontSize: '48px', color: '#7584f3' }}>
                  {item.icon}
                </span>
                {index < data.length - 1 && <Line />}
              </Flex>
              <Title title={item.title} />
            </div>
          </Flex>
        ))}
      </Flex>
    )
  }
}

export default Process

const Title = ({ title = [] }) => {
  return (
    <div>
      {title.map((item, index) => (
        <Flex key={index}>
          {item.label && <div>{item.label}:</div>}
          <div>{item.value}</div>
        </Flex>
      ))}
    </div>
  )
}

Title.propTypes = {
  title: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
    })
  ).isRequired,
}

const Line = () => {
  return (
    <Flex alignCenter flex={1} className='gm-margin-lr-10'>
      <div className='b-process-line-dot' />
      <div className='b-process-line' />
      <div className='b-process-line-dot' />
    </Flex>
  )
}
