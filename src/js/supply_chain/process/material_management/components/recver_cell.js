import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import store from '../store'
import { TableXUtil } from '@gmfe/table-x'
import { Flex, Select, Tip, PopupContentConfirm } from '@gmfe/react'
import _ from 'lodash'
import '../style.less'
import WarningPopover from 'common/components/warning_popover'

const { EditButton } = TableXUtil

const RecverCell = observer(({ index }) => {
  const { receiveMaterialList, users } = store
  const { status, recver, id, recver_deleted, recver_id } = receiveMaterialList[
    index
  ]

  const [temporaryRecver, changeRecver] = useState(recver_id)

  const isDeleted = recver_deleted && !_.trim(recver)

  useEffect(() => {
    changeRecver(recver_id)
  }, [recver_id])

  const handleChangeSelect = (value) => {
    changeRecver(value)
  }

  const handleOk = async (close) => {
    if (!temporaryRecver) {
      Tip.warning(t('请选择领料人'))
      return
    }
    await store.updateReturn({ id, recver: temporaryRecver })
    store.setReceiveMaterialListItem(index, {
      recver: users.slice().find((item) => item.value === temporaryRecver)
        ?.text,
    })
    close()
  }

  if (status === 2) {
    return (
      <Flex>
        <span>{recver}</span>
        {!!isDeleted && <WarningPopover text={t('已删除')} />}
      </Flex>
    )
  }

  return (
    <Flex row alignCenter>
      <div>{recver || t('选择领料人')}</div>
      <EditButton
        right
        popupRender={(close) => (
          <PopupContentConfirm
            onCancel={close}
            onSave={() => handleOk(close)}
            type='save'
            title={t('选择领料人')}
          >
            <Select
              isInPopup
              onChange={handleChangeSelect}
              data={users.slice()}
              value={temporaryRecver}
              style={{ minWidth: '160px' }}
            />
          </PopupContentConfirm>
        )}
      />
      {!!isDeleted && <WarningPopover text={t('已删除')} />}
    </Flex>
  )
})

RecverCell.propTypes = {
  index: PropTypes.number,
}

export default RecverCell
