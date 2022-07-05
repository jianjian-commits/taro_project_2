import React, { Fragment, Component } from 'react'
import { Table } from '@gmfe/table'
import { Pagination, Flex } from '@gmfe/react'

class TableWithPagination extends Component {
  render() {
    const { columns, data, pagination, handlePagination, ...rest } = this.props
    const { limit, offset } = pagination
    const list = data.slice(offset, offset + limit)

    return (
      <Fragment>
        <Table data={list} columns={columns} {...rest} />
        <Flex justifyEnd alignCenter className='gm-padding-20'>
          <Pagination toPage={handlePagination} data={pagination} />
        </Flex>
      </Fragment>
    )
  }
}

export default TableWithPagination
