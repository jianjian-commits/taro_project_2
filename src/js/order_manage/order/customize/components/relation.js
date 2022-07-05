import { t } from 'gm-i18n'
import React from 'react'
import { Flex, Input, Modal } from '@gmfe/react'
import _ from 'lodash'
import store, { initRadioItem } from '../store'
import { observer } from 'mobx-react'
import ConfirmContent from './confirm_content'

const Relation = observer(({ isCreate }) => {
  function handleAdd() {
    const radioList = store.detail.radio_list.slice()
    radioList.splice(radioList.length + 1, 0, { ...initRadioItem })
    store.updateDetail('radio_list', radioList)
  }

  function handelModal(index) {
    if (isCreate) {
      handleDelete(index)
    } else {
      Modal.render({
        style: { width: '400px' },
        title: t('删除报价单'),
        children: (
          <ConfirmContent
            onSuccess={() => {
              handleDelete(index)
              Modal.hide()
            }}
            onCancel={() => {
              Modal.hide()
            }}
            original={store.detail.radio_list[index]}
          />
        ),
        onHide: () => {
          Modal.hide()
        },
      })
    }
  }

  function handleDelete(index) {
    const radioList = store.detail.radio_list.slice()
    if (radioList.length > 1) {
      radioList.splice(index, 1)
    } else {
      radioList.splice(index, 1, { ...initRadioItem })
    }

    store.updateDetail('radio_list', radioList)
  }

  function handelChange(index, value) {
    const radioList = store.detail.radio_list.slice()
    radioList[index].name = value
    store.updateDetail('radio_list', radioList)
  }

  const { radio_list } = store.detail
  return (
    <Flex column>
      {_.map(radio_list, (v, i) => {
        return (
          <Flex key={i} alignCenter className='gm-padding-bottom-15'>
            <Flex className='gm-margin-right-20'>
              <Input
                className='form-control'
                placeholder={t('请输入选项名')}
                value={v.name}
                onChange={(e) => handelChange(i, e.target.value)}
              />
            </Flex>
            <Flex>
              <span onClick={handleAdd} className='gm-cursor gm-text-primary'>
                <i className='xfont xfont-plus' />
              </span>
              <span
                onClick={handelModal.bind(null, i)}
                className='gm-cursor gm-margin-left-5 gm-text-primary'
              >
                <i className='xfont xfont-delete' />
              </span>
            </Flex>
          </Flex>
        )
      })}
    </Flex>
  )
})

export default Relation
