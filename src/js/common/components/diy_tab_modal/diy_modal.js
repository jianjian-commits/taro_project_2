import React, { useState } from 'react'
import { Flex } from '@gmfe/react'
import _ from 'lodash'
import PropTypes from 'prop-types'

import Selector from './selector'
import SortList from './modal_list'

const DiyModal = ({ columns, diyGroupSorting, onChange }) => {
  const [diyCols, setDiyCols] = useState(columns)
  const [showCols, setShowCols] = useState(columns.filter((o) => o.show))

  const handleColsSort = (beforeKey, afterKey) => {
    // 移动到前面，移动到后面
    let beforeIndex, afterIndex
    _.forEach(diyCols, (item, index) => {
      if (beforeKey === item.key) {
        beforeIndex = index
      }
      if (afterKey === item.key) {
        afterIndex = index
      }
    })
    diyCols.splice(afterIndex + 1, 0, diyCols[beforeIndex])
    if (afterIndex > beforeIndex) {
      diyCols.splice(beforeIndex, 1)
    }
    if (afterIndex < beforeIndex) {
      diyCols.splice(beforeIndex + 1, 1)
    }
    setDiyCols(diyCols)
    setShowCols(columns.filter((o) => o.show))
  }

  const onColsChange = (key, curShow) => {
    const index = _.findIndex(diyCols, (o) => o.key === key)
    const _diyCols = diyCols.slice()

    const curItem = _diyCols[index]
    curItem.show = !curShow

    setDiyCols(_diyCols)
    onChange(_diyCols)

    // 如果是增加操作
    if (curItem.show) {
      // 把当前项增加到排序列表中
      setShowCols(_diyCols.filter((o) => o.show))
    } else {
      // 把当前项从排序列表去掉
      const _showCols = showCols.slice()
      _.remove(_showCols, (item) => item.key === key)
      setShowCols(_showCols)
    }
  }

  const onSortColsChange = (cols) => {
    setShowCols(cols)
  }

  const onColsRemove = (key) => {
    const _showCols = showCols.slice()
    _.remove(_showCols, (o) => o.key === key)
    setShowCols(_showCols)

    const index = _.findIndex(diyCols, (o) => o.key === key)
    const _diyCols = diyCols.slice()
    _diyCols[index].show = false
    setDiyCols(_diyCols)
    onChange(_diyCols)
  }

  return (
    <div className='gm-react-table-x-diy-modal'>
      <Flex>
        <div className='gm-react-table-x-diy-modal-selector'>
          <div className='gm-border-bottom gm-react-table-x-diy-modal-title'>
            可选字段
          </div>
          <Selector
            diyGroupSorting={diyGroupSorting}
            cols={diyCols}
            onColsChange={onColsChange}
          />
        </div>
        <div className='gm-react-table-x-diy-modal-list'>
          <div className='gm-border-bottom gm-react-table-x-diy-modal-title'>
            当前选定的字段
          </div>
          <SortList
            cols={showCols}
            onColsChange={onSortColsChange}
            onColsRemove={onColsRemove}
            onColsSort={handleColsSort}
          />
        </div>
      </Flex>
    </div>
  )
}

DiyModal.propTypes = {
  columns: PropTypes.array.isRequired,
  diyGroupSorting: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default DiyModal
