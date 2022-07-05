import React from 'react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import store from '../../store'
import { TableUtil } from '@gmfe/table'
import { t } from 'gm-i18n'

const SortHeader = observer((props) => {
  const { field } = props
  const { sort_name, sort_direction } = store.recommendPlanData

  const handleSort = () => {
    let sortType

    // 切换
    if (!sort_direction) {
      sortType = 'desc'
    } else if (sort_direction === 'desc') {
      sortType = 'asc'
    } else if (sort_direction === 'asc') {
      sortType = 'desc'
    }

    store.sortRecommendData(field, sortType)
  }

  let name
  if (field === 'product') {
    name = t('商品')
  } else if (field === 'category_name') {
    name = t('分类')
  }

  return (
    <TableUtil.SortHeader
      onClick={handleSort}
      type={sort_name === field ? sort_direction : null}
    >
      {name}
    </TableUtil.SortHeader>
  )
})

SortHeader.propTypes = {
  field: PropTypes.string.isRequired,
}

export default SortHeader
