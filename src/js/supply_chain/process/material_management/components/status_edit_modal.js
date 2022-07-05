import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import store from '../store'
import { t } from 'gm-i18n'
import { Flex, Select } from '@gmfe/react'
import { initBatchEditModal } from '../tools'

const StatusEditModal = observer(({ selected }) => {
  useEffect(() => {
    initBatchEditModal('setStatus', 2, selected)
  }, [])

  const { batch_edit_list, status } = store

  return (
    <>
      <Flex alignCenter>
        <div>
          {t('将选中')}
          {batch_edit_list.length}
          {t('个任务领料状态修改为')}:
        </div>
        <Select
          className='gm-margin-left-10'
          onChange={(value) => store.setStatus(value)}
          data={[
            { value: 2, text: t('已领取') },
            { value: 1, text: t('未领取') },
          ]}
          value={status}
        />
      </Flex>
      <div className='gm-margin-top-10' style={{ color: 'red' }}>
        {t('领料状态不可逆，请确认领取后再修改')}
      </div>
    </>
  )
})

StatusEditModal.propTypes = {
  selected: PropTypes.array,
}

export default StatusEditModal
