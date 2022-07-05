import React from 'react'
import View from './category_2_components/view' // 查看转态UI
import Edit from './category_2_components/edit' // 编辑状态UI

const Category2List = (props) => {
  return props.ruleDetail.viewType === 'view' ? (
    <View {...props.ruleDetail} />
  ) : (
    <Edit {...props.ruleDetail} />
  )
}

export default Category2List
