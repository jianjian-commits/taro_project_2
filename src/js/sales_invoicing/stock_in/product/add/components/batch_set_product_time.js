import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import { Flex, Button, DatePicker } from '@gmfe/react'
import store from '../store'
import _ from 'lodash'
import moment from 'moment'

const BatchSetShelfModal = (props) => {
  const { tableSelected, itemDetailList } = store
  const { onCancel } = props

  const count = tableSelected.length // 若选择所有页，则显示全部采购规格数，否则显示已选择的数量
  const [time, setTime] = useState(null)

  const handleEnsure = () => {
    _.each(itemDetailList, (item, index) => {
      if (_.includes(tableSelected, item.keyField)) {
        store.onRowChange(
          'production_time',
          moment(time).format('YYYY-MM-DD'),
          index,
        )
      }
    })

    // 清空表格选择
    store.changeTableSelect([])
    // 关闭modal
    onCancel()
  }

  return (
    <div className='gm-padding-lr-10'>
      <div className='gm-margin-bottom-10'>
        {t('batch_shelf_production_time', { count })}
      </div>
      <DatePicker
        // style={{ width: TABLE_X.WIDTH_DATE }}
        // max={life_time ? moment(life_time) : null}
        placeholder={t('请选择生产日期')}
        date={time}
        onChange={(val) => setTime(val)}
      />
      <Flex justifyEnd className='gm-margin-top-10'>
        <Button className='gm-margin-right-10' onClick={onCancel}>
          {t('取消')}
        </Button>
        <Button type='primary' onClick={handleEnsure}>
          {t('确定')}
        </Button>
      </Flex>
    </div>
  )
}

BatchSetShelfModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
}

export default BatchSetShelfModal
