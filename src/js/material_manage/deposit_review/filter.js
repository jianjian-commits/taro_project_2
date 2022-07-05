import React from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import {
  BoxForm,
  FormBlock,
  FormItem,
  FormButton,
  Button,
  Select,
  DateRangePicker,
} from '@gmfe/react'
import store from './store'
import { STATUS_DATA, RETURN_STATUS_DATA } from './enum'

const Filter = () => {
  const {
    start_date,
    end_date,
    address_id,
    return_status,
    status,
  } = store.filter

  const handleChangeFilter = (name, value) => {
    store.changeFilterData(name, value)
  }

  const handleFetch = () => {
    store.fetchList()
  }
  return (
    <BoxForm btnPosition='left' labelWidth='100px' onSubmit={handleFetch}>
      <FormBlock col={2}>
        <FormItem label={t('申请时间')}>
          <DateRangePicker
            begin={start_date}
            end={end_date}
            onChange={(begin, end) => {
              handleChangeFilter('start_date', begin)
              handleChangeFilter('end_date', end)
            }}
          />
        </FormItem>
        <FormItem label={t('商户搜索')}>
          <input
            placeholder={t('输入商户名/商户ID')}
            className='form-control'
            value={address_id}
            onChange={(e) => handleChangeFilter('address_id', e.target.value)}
          />
        </FormItem>
      </FormBlock>
      <BoxForm.More>
        <FormBlock col={2}>
          <FormItem label={t('司机取回状态')}>
            <Select
              data={RETURN_STATUS_DATA}
              value={return_status}
              onChange={handleChangeFilter.bind(this, 'return_status')}
            />
          </FormItem>
          <FormItem label={t('审核状态')}>
            <Select
              data={STATUS_DATA}
              value={status}
              onChange={handleChangeFilter.bind(this, 'status')}
            />
          </FormItem>
        </FormBlock>
      </BoxForm.More>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
      </FormButton>
    </BoxForm>
  )
}

export default observer(Filter)
