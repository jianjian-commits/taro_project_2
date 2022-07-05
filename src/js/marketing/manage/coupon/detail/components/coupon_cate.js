import React from 'react'
import { observer } from 'mobx-react'
import { MoreSelect } from '@gmfe/react'
import _ from 'lodash'

import store from '../store'

const CouponCate = observer((props) => {
  const { disabled } = props
  const {
    basicInfo: { category_id_1_list },
    categoryOneList,
  } = store

  const cateSelected = _.map(category_id_1_list, (item) => {
    return _.find(categoryOneList, (v) => item === v.value)
  }).filter((v) => v) // categoryOneList可能为空，或者存在找不到的情况，因此需要过滤undefined

  const handleCateSelectChange = (selected) => {
    store.changeDetail(
      'category_id_1_list',
      _.map(selected, (item) => item.value),
    )
  }

  return (
    <MoreSelect
      selected={cateSelected}
      name='category_id_1_list'
      data={categoryOneList.slice()}
      style={{ width: '260px' }}
      disabled={disabled}
      onSelect={handleCateSelectChange}
      multiple
    />
  )
})

export default CouponCate
