import React from 'react'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import { KCLevelSelect } from '@gmfe/keyboard'
import store from '../store/receipt_store'
import { isInShare } from '../../util'
import memoComponentWithDataHoc from './memo_component_with_data_hoc'
import { Flex, Popover } from '@gmfe/react'
import { SvgWarningCircle } from 'gm-svg'
import PropTypes from 'prop-types'
import { TableXUtil } from '@gmfe/table-x'

const { TABLE_X } = TableXUtil

const ShelfNameCell = observer((props) => {
  const { index, data } = props
  const { stockInShareList, shelfList } = store
  const { shelf_name, shelfSelected, id, error } = data

  const handleSelectStockGoodsShelf = (selected) => {
    store.setShelfSelected(index, selected)
  }

  return isInShare(stockInShareList, id) ? (
    shelf_name
  ) : (
    <Flex row alignCenter>
      <KCLevelSelect
        onSelect={handleSelectStockGoodsShelf}
        selected={shelfSelected.slice()}
        data={toJS(shelfList)}
        right
        style={{ width: TABLE_X.WIDTH_SELECT }}
      />
      {error && (
        <>
          <div className='gm-gap-10' />
          <Popover
            popup={
              <div className='gm-padding-tb-10 gm-padding-lr-15'>{error}</div>
            }
            type='hover'
            top
            right
            showArrow
          >
            <span style={{ color: 'red' }}>
              <SvgWarningCircle />
            </span>
          </Popover>
        </>
      )}
    </Flex>
  )
})

ShelfNameCell.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(ShelfNameCell)
