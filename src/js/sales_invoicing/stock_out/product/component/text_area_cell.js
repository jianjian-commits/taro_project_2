import memoComponentHoc from './memo_component'
import { observer } from 'mobx-react'
import React from 'react'

const TextAreaCell = memoComponentHoc(
  observer((props) => {
    const { data, field } = props
    const showText = data[field]

    return <span>{showText || '-'}</span>
  })
)

export default TextAreaCell
