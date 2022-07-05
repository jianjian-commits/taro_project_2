import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { TableXUtil } from '@gmfe/table-x'
import {
  Form,
  FormItem,
  MoreSelect,
  PopupContentConfirm,
  Tip,
} from '@gmfe/react'
import { t } from 'gm-i18n'
import { store } from './store'
import { store as basicStore } from '../store'
import { observer } from 'mobx-react'

const { EditButton } = TableXUtil

const Cell = observer(({ index, onOk }) => {
  const { processList } = basicStore
  const { workShopList } = store

  const handleOk = (technics) => {
    return store
      .editWorkShop({
        ...workShopList[index],
        technics: JSON.stringify(technics.map((item) => item.value)),
      })
      .then(() => {
        Tip.success(t('编辑成功'))
        onOk()
      })
  }

  return (
    <div>
      <span className='gm-padding-right-10'>
        {workShopList[index]?.technics?.map((item) => item.name).join('、') ||
          '-'}
      </span>
      <EditButton
        popupRender={(closePopup) => (
          <Popup
            technics={workShopList[index]?.technics.slice()}
            processList={processList.slice()}
            onCancel={closePopup}
            onOk={handleOk}
          />
        )}
      />
    </div>
  )
})

Cell.propTypes = {
  index: PropTypes.number,
  onOk: PropTypes.func,
}

const Popup = ({ technics, processList, onCancel, onOk }) => {
  const [selected, setSelected] = useState(
    technics.map((v) => ({ value: v.technic_id, text: v.name }))
  )

  const handleSelect = (selected) => {
    setSelected(selected)
  }

  const handleSave = () => {
    onOk(selected).then(() => {
      onCancel()
    })
  }

  return (
    <PopupContentConfirm
      onCancel={onCancel}
      type='save'
      title={t('编辑车间工艺')}
      onSave={handleSave}
    >
      <Form>
        <FormItem label={t('车间工艺')}>
          <MoreSelect
            selected={selected}
            data={processList.map((v) => ({ value: v.id, text: v.name }))}
            onSelect={handleSelect}
            isInPopup
            multiple
          />
        </FormItem>
      </Form>
    </PopupContentConfirm>
  )
}

Popup.propTypes = {
  technics: PropTypes.array,
  processList: PropTypes.array,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
}

export default Cell
