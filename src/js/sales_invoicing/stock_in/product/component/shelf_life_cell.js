/*
 * @Autor: xujiahao
 * @Date: 2021-05-14 10:18:40
 * @LastEditors: xujiahao
 * @LastEditTime: 2021-11-11 14:18:00
 * @FilePath: /gm_static_stationv2/src/js/sales_invoicing/stock_in/product/component/shelf_life_cell.js
 */
import React from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { Flex } from '@gmfe/react'
import store from '../store/receipt_store'
import { KCInputNumberV2 } from '@gmfe/keyboard'
import memoComponentWithDataHoc from './memo_component_with_data_hoc'
import PropTypes from 'prop-types'
import moment from 'moment'
import { TableXUtil } from '@gmfe/table-x'
import { isInShare } from '../../util'

const { TABLE_X } = TableXUtil

const ShelfLifeCell = observer((props) => {
  const { index, data } = props
  const { stockInShareList } = store
  const { shelfLife, production_time, id } = data

  const handleChangeShelfLife = (value) => {
    const changeData = {}

    changeData.shelfLife = value
    // 如果有生产日期以及保质期，自动算出到期日
    if (production_time) {
      changeData.life_time =
        value !== null
          ? moment(production_time).add(value, 'day').format('YYYY-MM-DD')
          : null
    }

    store.changeStockInReceiptListItem(index, changeData)
  }

  return isInShare(stockInShareList, id) ? (
    shelfLife
  ) : (
    <Flex alignCenter>
      <KCInputNumberV2
        autocomplete='off'
        value={shelfLife}
        onChange={handleChangeShelfLife}
        min={0}
        max={9999}
        precision={0}
        className='form-control input-sm'
        style={{ width: TABLE_X.WIDTH_NUMBER }}
      />
      <span className='gm-padding-5'>{t('天')}</span>
    </Flex>
  )
})

ShelfLifeCell.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(ShelfLifeCell)
