import React from 'react'
import PropTypes from 'prop-types'
import { TableX } from '@gmfe/table-x'
import { t } from 'gm-i18n'

const BatchPopover = ({ batch }) => {
  return (
    <TableX
      style={{ minWidth: '500px', maxHeight: '500px' }}
      data={batch}
      columns={[
        { Header: t('退料批次'), accessor: 'batch_number' },
        { Header: t('退还数量'), accessor: 'amount' },
        { Header: t('批次均价'), accessor: 'avg_price' },
        { Header: t('退还货位'), accessor: 'shelf_name' },
      ]}
    />
  )
}

BatchPopover.propTypes = {
  batch: PropTypes.array,
}

export default BatchPopover
