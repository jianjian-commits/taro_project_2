/*
 * @Description: 基于原生封装的表格
 */

import React from 'react'
import PropTypes from 'prop-types'

import Thead from './thead'
import Tbody from './tbody'

function SimpleTable(props) {
  const { rowKey, columns, dataSource, bordered = true } = props

  return (
    <table border={bordered ? '1' : undefined} className='b-simple-table'>
      <Thead columns={columns} />
      <Tbody rowKey={rowKey} columns={columns} dataSource={dataSource} />
    </table>
  )
}

SimpleTable.propTypes = {
  rowKey: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequied,
  dataSource: PropTypes.array,
  bordered: PropTypes.bool,
}
SimpleTable.defaultProps = {
  dataSource: [],
}
export default SimpleTable
