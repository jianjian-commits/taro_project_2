import React from 'react'
import { observer } from 'mobx-react'
import store from '../store'

const Category = observer((props) => {
  const { category1NameMap, category2NameMap } = store
  const {
    original: { category_id_1, category_id_2 },
  } = props.row
  if (!category1NameMap || !category2NameMap) return ''
  const category1Name = category1NameMap[category_id_1]
  const category2Name = category2NameMap[category_id_2]
  if (category2Name) {
    return <span>{`${category1Name}/${category2Name}`}</span>
  }
  return <span>{category1Name || ''}</span>
})

export default Category
