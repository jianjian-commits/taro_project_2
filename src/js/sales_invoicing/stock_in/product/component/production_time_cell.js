import React from 'react'
import { observer } from 'mobx-react'
import { KCDatePicker } from '@gmfe/keyboard'
import store from '../store/receipt_store'
import { t } from 'gm-i18n'
import moment from 'moment'
import { isInShare } from '../../util'
import memoComponentWithDataHoc from './memo_component_with_data_hoc'
import PropTypes from 'prop-types'
import { TableXUtil } from '@gmfe/table-x'

const { TABLE_X } = TableXUtil

const ProductionTimeCell = observer((props) => {
  const { index, data } = props
  const { stockInShareList } = store
  const { production_time, life_time, shelfLife, id } = data

  const handleChangeProductionTime = (value) => {
    const changeData = {}

    changeData.production_time = value
      ? moment(value).format('YYYY-MM-DD')
      : value

    // 如果有保质期以及生产日期，自动算出到期日
    if (shelfLife && value) {
      changeData.life_time = moment(value)
        .add(shelfLife, 'day')
        .format('YYYY-MM-DD')
    } else if (!value) {
      changeData.life_time = null
    }

    store.changeStockInReceiptListItem(index, changeData)
  }

  return isInShare(stockInShareList, id) ? (
    production_time
  ) : (
    <KCDatePicker
      style={{ width: TABLE_X.WIDTH_DATE }}
      max={life_time ? moment(life_time) : null}
      placeholder={t('请选择生产日期')}
      date={production_time ? moment(production_time) : null}
      onChange={handleChangeProductionTime}
    />
  )
})

ProductionTimeCell.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(ProductionTimeCell)
