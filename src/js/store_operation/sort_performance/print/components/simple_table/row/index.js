/*
 * @Description: 表身每一行
 */
import React from 'react'
import PropTypes from 'prop-types'

function Row(props) {
  const { columns, rowObject } = props

  return (
    <tr>
      {columns.map(({ dataIndex }) => (
        <td key={rowObject[dataIndex] || Math.random()}>
          {rowObject[dataIndex]}
        </td>
      ))}
    </tr>
  )
}

Row.propTypes = {
  columns: PropTypes.array.isRequired,
  rowObject: PropTypes.object.isRequired,
}

export default Row
