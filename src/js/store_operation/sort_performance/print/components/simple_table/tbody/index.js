/*
 * @Description: 表身
 */
import React from 'react'
import PropTypes from 'prop-types'

import Row from '../row'

function Tbody(props) {
  const { rowKey, columns, dataSource } = props
  return (
    <tbody>
      {dataSource.map((rowObject) => {
        const key = rowObject[rowKey]
        return <Row rowObject={rowObject} columns={columns} key={key} />
      })}
    </tbody>
  )
}

Tbody.propTypes = {
  rowKey: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequied,
  dataSource: PropTypes.array.isRequired,
}

export default Tbody
