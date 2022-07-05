/*
 * @Description: 表格头部
 */
import React from 'react'
import PropTypes from 'prop-types'

function Thead(props) {
  const { columns } = props

  return (
    <thead>
      <tr>
        {columns.map((column) => {
          const { title, dataIndex, width, height = 30 } = column

          return (
            <th width={width} height={height} key={dataIndex}>
              {title}
            </th>
          )
        })}
      </tr>
    </thead>
  )
}

Thead.propTypes = {
  columns: PropTypes.array.isRequired,
}

export default Thead
