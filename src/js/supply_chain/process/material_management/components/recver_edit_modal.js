import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import store from '../store'
import { Select } from '@gmfe/react'
import { initBatchEditModal } from '../tools'

const RecverEditModal = observer(({ selected, isAfterBatchNum }) => {
  const { batch_edit_list, batch_recver, users } = store

  useEffect(() => {
    if (!isAfterBatchNum) {
      initBatchEditModal('setBatchRecver', null, selected)
    }
    const [{ id }] = users
    store.setBatchRecver(id)

    // 设置领取数后会弹出设置领料人，需要保留之前的数据，因此情况清空edit list在这里
    return store.clearBatchEditList
  }, [])

  return (
    <div>
      {t('将选中的')}
      {batch_edit_list.length}
      {t('个任务领料人修改为')}：
      <Select
        style={{ minWidth: '180px' }}
        onChange={(value) => store.setBatchRecver(value)}
        data={users.slice().map((i) => ({ text: i.name, value: i.id }))}
        value={batch_recver}
      />
    </div>
  )
})

RecverEditModal.defaultProps = {
  isAfterBatchNum: false,
}

RecverEditModal.propTypes = {
  selected: PropTypes.array,
}

export default RecverEditModal
