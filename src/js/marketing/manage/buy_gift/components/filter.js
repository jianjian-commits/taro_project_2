import React from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import {
  BoxForm,
  FormButton,
  Button,
  FormBlock,
  Select,
  FormItem,
} from '@gmfe/react'

import { mainStore as store } from '../store'
import { GIFT_STATUS, PRESENT_TYPE } from '../utils'

const Filter = () => {
  const handleSubmit = () => {
    store.doBuyGiftFirstRequest()
  }

  const handleSelected = (name, value) => {
    store.changeFilter(name, value)
  }

  const handleFilterInputChange = (name, e) => {
    const { value } = e.target
    store.changeFilter(name, value)
  }

  const { status, present_type, search_text } = store.filter

  return (
    <BoxForm onSubmit={handleSubmit}>
      <FormBlock col={3}>
        <FormItem label={t('赠送条件')}>
          <Select
            data={PRESENT_TYPE}
            value={present_type}
            onChange={handleSelected.bind(this, 'present_type')}
          />
        </FormItem>
        <FormItem label={t('状态')}>
          <Select
            data={GIFT_STATUS}
            value={status}
            onChange={handleSelected.bind(this, 'status')}
          />
        </FormItem>
        <FormItem label={t('搜索')}>
          <input
            value={search_text}
            onChange={handleFilterInputChange.bind(this, 'search_text')}
            name='search_text'
            type='text'
            className='form-control'
            placeholder={t('输入商品名称')}
          />
        </FormItem>
      </FormBlock>
      <FormButton>
        <Button htmlType='submit' type='primary'>
          {t('搜索')}
        </Button>
      </FormButton>
    </BoxForm>
  )
}

export default observer(Filter)
