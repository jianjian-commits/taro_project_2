import React from 'react'
import {
  BoxForm,
  Button,
  FormBlock,
  FormButton,
  FormItem,
  Select,
} from '@gmfe/react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import store from './store'
import { STATUS_TYPE } from '../enum'

// 整单折扣定价filter
const Filter = () => {
  const {
    onChangeFilter,
    filter: { address_text, status },
  } = store

  const handleSearch = () => {
    return store.doFirstRequest()
  }

  return (
    <BoxForm onSubmit={handleSearch} btnPosition='left'>
      <FormBlock col={3}>
        <FormItem label={t('状态筛选')}>
          <Select
            data={STATUS_TYPE}
            value={status}
            onChange={(value) => onChangeFilter('status', value)}
          />
        </FormItem>
        <FormItem label={t('搜索')}>
          <input
            value={address_text}
            onChange={(e) => onChangeFilter('address_text', e.target.value)}
            placeholder={t('输入搜索商户ID/商户名')}
          />
        </FormItem>
      </FormBlock>

      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
      </FormButton>
    </BoxForm>
  )
}

export default observer(Filter)
