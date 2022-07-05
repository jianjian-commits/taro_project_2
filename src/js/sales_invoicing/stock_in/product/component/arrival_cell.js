import React from 'react'
import { observer } from 'mobx-react'
import { Flex } from '@gmfe/react'
import ArrivalSubmitSvg from 'svg/arrival_submit.svg'
import store from '../store/receipt_store'
import { isInShare } from '../../util'
import memoComponentWithDataHoc from './memo_component_with_data_hoc'
import ArrivalCancelSvg from 'svg/arrival_cancel.svg'
import PropTypes from 'prop-types'

const ArrivalCell = observer((props) => {
  const { index, data } = props
  const { stockInShareList } = store
  const { is_arrival, id } = data

  const handleIsArrivalChange = (e) => {
    e.preventDefault()
    const changeData = {}

    changeData.is_arrival = +!is_arrival

    store.changeStockInReceiptListItem(index, changeData)
  }

  return (
    <Flex alignCenter justifyCenter className='b-stock-in-arrival-mark'>
      {/* 1 已标记到货， 0 未到货 */}
      <span>
        {is_arrival ? (
          <ArrivalSubmitSvg
            style={{ fontSize: '16px' }}
            className='gm-text-hover-primary gm-cursor'
          />
        ) : (
          <ArrivalCancelSvg
            style={{ fontSize: '16px' }}
            className='gm-text-hover-primary gm-cursor'
          />
        )}
      </span>
      {!isInShare(stockInShareList, id) && (
        <a
          onClick={handleIsArrivalChange}
          className='b-stock-in-arrival-mark-Text'
        >
          {is_arrival ? '取消到货' : '标记到货'}
        </a>
      )}
    </Flex>
  )
})

ArrivalCell.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(ArrivalCell)
