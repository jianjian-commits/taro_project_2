import React from 'react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import TableListTips from 'common/components/table_list_tips'
import store from '../store'

const Tips = observer(() => {
  const { list } = store
  const matchLength = _.filter(list, (item) => {
    return item?.image_list?.length
  }).length

  return (
    <TableListTips
      tips={[
        `云图库匹配完成，${matchLength}条成功，${
          list.length - matchLength
        }条没有匹配成功`,
      ]}
    />
  )
})

export default Tips
