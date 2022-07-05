import React, { useState } from 'react'
import store from './store'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import { Modal, Flex, FormItem, Button, Tip } from '@gmfe/react'

const pattern = /^[A-Za-z0-9]{1,50}$/

const BatchPayModal = () => {
  const [value, setValue] = useState('')

  const onChange = (val) => {
    if (pattern.test(val) || val === '') setValue(val)
  }

  const handleConfirm = () => {
    store.handleBatchPay(value).then((res) => {
      Tip.success(i18next.t('批量结款成功'))
      Modal.hide()
      store.fetchList()
    })
  }
  return (
    <>
      <FormItem label={i18next.t('交易流水号')} style={{ lineHeight: '30px' }}>
        <input
          autoFocus
          className='form-control'
          type='text'
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </FormItem>
      <div className='gm-margin-top-15'>
        {i18next.t(
          '提示：批量结款会将所有结款的的实结金额作为已结金额，并标记为已结款，批量结款的结款单共用一个交易流水号',
        )}
      </div>
      <Flex
        className='gm-margin-top-10'
        style={{ flexDirection: 'row-reverse' }}
      >
        <Button type='primary' onClick={handleConfirm} disabled={!value.length}>
          {i18next.t('确认')}
        </Button>
        <Button className='gm-margin-right-5' onClick={() => Modal.hide()}>
          {i18next.t('取消')}
        </Button>
      </Flex>
    </>
  )
}

export default observer(BatchPayModal)
