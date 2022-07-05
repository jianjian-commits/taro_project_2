import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import store from '../store'
import { t } from 'gm-i18n'
import { Flex, Select, PopupContentConfirm } from '@gmfe/react'
import { TableXUtil } from '@gmfe/table-x'

const { EditButton } = TableXUtil

const StatusCell = observer(({ index }) => {
  const { receiveMaterialList } = store
  const { status, recver, batch_list, id } = receiveMaterialList[index]

  const [edit, changeEdit] = useState(false)
  const [temporaryStatus, changeStatus] = useState(1)

  useEffect(() => {
    changeStatus(1)
  }, [edit])

  const handleChangeStatus = (value) => {
    changeStatus(value)
  }

  const handleOk = async (close) => {
    await store.updateReturn({ id, status: temporaryStatus })
    store.setReceiveMaterialListItem(index, {
      status: temporaryStatus,
      recv_time: new Date(),
    })
    close()
    changeEdit(false)
  }

  if (status === 2) {
    return <span>{t('已领取')}</span>
  }

  return (
    <Flex row alignCenter>
      <div>{t('未领取')}</div>
      {recver && batch_list.length > 0 && (
        <EditButton
          right
          popupRender={(close) => (
            <PopupContentConfirm
              onCancel={close}
              type='save'
              onSave={() => handleOk(close)}
              title={t('设置领取状态')}
            >
              <Select
                isInPopup
                onChange={handleChangeStatus}
                style={{ minWidth: '160px' }}
                data={[
                  { value: 2, text: t('已领取') },
                  { value: 1, text: t('未领取') },
                ]}
                value={temporaryStatus}
              />
            </PopupContentConfirm>
          )}
        />
      )}
    </Flex>
  )
})

StatusCell.propTypes = {
  index: PropTypes.number,
}

export default StatusCell
