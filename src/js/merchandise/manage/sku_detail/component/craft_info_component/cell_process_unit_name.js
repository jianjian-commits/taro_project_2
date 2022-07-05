import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { Select } from '@gmfe/react'

import globalStore from 'stores/global'
import memoComponentWithDataHoc from './memo_hoc'
import skuStore from '../../sku_store'
import { adapterSelectComData } from 'common/util'

const CellProcessUnitName = observer((props) => {
  const { processUnit } = globalStore
  const { std_unit_name, process_unit_name } = props.data

  const [list, setList] = useState([])

  useEffect(() => {
    setList(
      [{ text: std_unit_name, value: std_unit_name, process_ratio: 1 }].concat(
        adapterSelectComData(
          processUnit[std_unit_name],
          'process_unit_name',
          'process_unit_name'
        )
      )
    )
  }, [processUnit, std_unit_name])

  const handleChangeSelect = (selected) => {
    skuStore.changeIngredients(props.index, { process_unit_name: selected })
  }

  // 默认为基本单位
  if (!process_unit_name) {
    skuStore.changeIngredients(props.index, {
      process_unit_name: std_unit_name,
    })
  }

  return (
    <Select
      data={list.slice()}
      onChange={handleChangeSelect}
      value={process_unit_name}
    />
  )
})

export default memoComponentWithDataHoc(CellProcessUnitName)
