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

const LifeTimeCell = observer((props) => {
  const { index, data } = props
  const { stockInShareList } = store
  const { production_time, life_time, id } = data

  const handleChangeLifeTime = (value) => {
    const changeData = {}
    changeData.life_time = value ? moment(value).format('YYYY-MM-DD') : value

    // 如果有生产日期以及到期日，自动算出保质期
    if (production_time && value) {
      changeData.shelfLife = moment(value).diff(production_time, 'day')
    } else if (!value) {
      changeData.shelfLife = null
    }

    store.changeStockInReceiptListItem(index, changeData)
  }

  return isInShare(stockInShareList, id) ? (
    life_time
  ) : (
    <KCDatePicker
      placeholder={t('请选择到期日')}
      min={production_time ? moment(production_time) : null}
      date={life_time ? moment(life_time) : null}
      onChange={handleChangeLifeTime}
      style={{ width: TABLE_X.WIDTH_DATE }}
    />
  )
})

LifeTimeCell.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(LifeTimeCell)
