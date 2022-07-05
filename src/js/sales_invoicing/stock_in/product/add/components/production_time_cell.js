import React from 'react'
import { observer } from 'mobx-react'
import { KCDatePicker } from '@gmfe/keyboard'
import store from '../store'
import { t } from 'gm-i18n'
import moment from 'moment'
import PropTypes from 'prop-types'
import { TableXUtil } from '@gmfe/table-x'

const { TABLE_X } = TableXUtil

const ProductionTimeCell = observer((props) => {
  const { index, data } = props
  const { status } = store
  const { production_time, life_time } = data

  const handleChangeProductionTime = (value) => {
    const rowData = {
      production_time: value ? moment(value).format('YYYY-MM-DD') : value,
    }

    store.onRowDataChange(index, rowData)
  }

  return status === 'detail' ? (
    production_time ? (
      moment(production_time).format('YYYY-MM-DD')
    ) : (
      '-'
    )
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

export default ProductionTimeCell
