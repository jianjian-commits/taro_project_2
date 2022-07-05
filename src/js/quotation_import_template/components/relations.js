import React from 'react'
import { Flex } from '@gmfe/react'
import _ from 'lodash'
import classNames from 'classnames'
import PropTypes from 'prop-types'

const Header = (props) => (
  <Flex>
    {_.map(props.columns, (column, i) => (
      <div
        key={i}
        className={classNames('gm-flex-flex', {
          'gm-flex-none': column.width,
        })}
        style={{
          width: `${column.width}px`,
        }}
      >
        {column.header}
      </div>
    ))}
  </Flex>
)

Header.propTypes = {
  columns: PropTypes.array,
}

const Content = ({ item, columns, index }) => (
  <Flex justifyCenter alignCenter className='gm-padding-top-10'>
    {_.map(columns, (column, i) => {
      let content = null
      if (column.Cell) {
        content = column.Cell({
          original: item,
          index,
        })
      }
      return (
        <div
          key={i}
          className={classNames('gm-flex-flex', {
            'gm-flex-none': column.width,
          })}
          style={{
            width: `${column.width}px`,
          }}
        >
          {content}
        </div>
      )
    })}
  </Flex>
)

Content.propTypes = {
  columns: PropTypes.array,
  item: PropTypes.object,
  index: PropTypes.number,
}

const Relations = ({ data, columns }) => {
  return (
    <Flex column style={{ padding: '6px 0' }}>
      <Header columns={columns} />
      {_.map(data, (item, i) => (
        <Content key={i} item={item} columns={columns} index={i} />
      ))}
    </Flex>
  )
}

Relations.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array.isRequired,
}

export default Relations
