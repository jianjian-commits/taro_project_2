import React from 'react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import memoComponentHoc from './memo_component'

const TableNoCell = observer((props) => {
  const { index } = props
  return <>{_.isNaN(parseFloat(index)) ? null : index + 1}</>
})

export default memoComponentHoc(TableNoCell)
