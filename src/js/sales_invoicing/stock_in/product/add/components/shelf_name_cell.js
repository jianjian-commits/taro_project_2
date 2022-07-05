import React from 'react'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import { KCLevelSelect } from '@gmfe/keyboard'
import store from '../store'
import { Flex } from '@gmfe/react'
import PropTypes from 'prop-types'
import { TableXUtil } from '@gmfe/table-x'
import memoComponentWithDataHoc from './memo_component_with_data_hoc'

const { TABLE_X } = TableXUtil

const ShelfNameCell = observer((props) => {
  const { index, data } = props
  const { shelfList, status } = store
  const { shelf_name, shelfSelected = [] } = data

  const handleSelect = (selected) => store.setShelfSelected(index, selected)

  return status === 'detail' ? (
    shelf_name
  ) : (
    <Flex row alignCenter>
      <KCLevelSelect
        onSelect={handleSelect}
        selected={shelfSelected.slice()}
        data={toJS(shelfList)}
        right
        style={{ width: TABLE_X.WIDTH_SELECT }}
      />
    </Flex>
  )
})

ShelfNameCell.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(ShelfNameCell)
