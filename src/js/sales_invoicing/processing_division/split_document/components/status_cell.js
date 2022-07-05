import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { Select } from '@gmfe/react'
import store from '../stores/store'
import { SPLIT_SHEET_STATUS } from 'common/enum'

const StatusCell = ({ index }) => {
  const { list } = store
  const { isEditing, status, temporaryStatus } = list[index]

  const handleChange = (temporaryStatus) => {
    const { setListItemData } = store
    setListItemData(index, { temporaryStatus })
  }

  const data = Object.entries(SPLIT_SHEET_STATUS)
    .filter(([key]) => Number(key) > 0)
    .map(([key, value]) => ({
      value: Number(key),
      text: value,
    }))

  if (isEditing) {
    return (
      <Select onChange={handleChange} data={data} value={temporaryStatus} />
    )
  }
  return SPLIT_SHEET_STATUS[status]
}

StatusCell.propTypes = {
  index: PropTypes.number.isRequired,
}

export default observer(StatusCell)
