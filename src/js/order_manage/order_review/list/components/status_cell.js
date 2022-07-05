import React from 'react'
import PropTypes from 'prop-types'
import { Flex, Select } from '@gmfe/react'
import { observer } from 'mobx-react'

import store from '../store'
import { auditActionStatusEnum, auditStatusEnum } from 'common/enum'
import ToolTip from '@gmfe/react/src/component/tool_tip'

const StatusCell = ({ index }) => {
  const { list } = store
  const { audit_status, row_edit, reason } = list[index]

  const handleChange = (value) => {
    const { setListItem } = store
    setListItem(index, { audit_status: value })
  }

  if (row_edit) {
    const auditList = []
    auditActionStatusEnum.forEach((value, key) => {
      auditList.push({ value: key, text: value })
    })

    return (
      <Select onChange={handleChange} data={auditList} value={audit_status} />
    )
  }

  return (
    <Flex alignCenter>
      {auditStatusEnum.get(audit_status)}
      {(audit_status === 3 || audit_status === 4) && reason && (
        <ToolTip
          popup={
            <div className='gm-padding-lr-10 gm-padding-tb-5'>{reason}</div>
          }
        />
      )}
    </Flex>
  )
}

StatusCell.propTypes = {
  index: PropTypes.number.isRequired,
}

export default observer(StatusCell)
