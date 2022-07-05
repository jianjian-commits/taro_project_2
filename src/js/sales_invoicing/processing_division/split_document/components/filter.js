import React, { useEffect } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import {
  Box,
  Button,
  DateRangePicker,
  Form,
  FormButton,
  FormItem,
  Input,
  Select,
} from '@gmfe/react'
import { SPLIT_SHEET_STATUS } from 'common/enum'
import store from '../stores/store'

const Filter = () => {
  useEffect(() => {
    handleSearch()
  }, [])

  const { filter } = store
  const { begin, end, status, q } = filter

  const handleChange = (value, key) => {
    const { mergeFilter } = store
    mergeFilter({ [key]: value })
  }

  const handleSearch = () => {
    const { paginationRef } = store
    paginationRef.current.apiDoFirstRequest()
  }

  return (
    <Box hasGap>
      <Form inline onSubmit={handleSearch}>
        <FormItem label={t('按分割日期')}>
          <DateRangePicker
            begin={begin}
            end={end}
            onChange={(begin, end) => {
              handleChange(begin, 'begin')
              handleChange(end, 'end')
            }}
          />
        </FormItem>
        <FormItem label={t('单据状态')}>
          <Select
            onChange={(value) => handleChange(value, 'status')}
            data={Object.entries(SPLIT_SHEET_STATUS).map(([key, value]) => ({
              text: value,
              value: Number(key),
            }))}
            value={status}
          />
        </FormItem>
        <FormItem label={t('搜索')}>
          <Input
            className='form-control'
            placeholder={t('请输入分割单号/待分割品搜索')}
            value={q}
            onChange={(event) => handleChange(event.target.value, 'q')}
          />
        </FormItem>
        <FormButton>
          <Button type='primary' htmlType='submit'>
            {t('搜索')}
          </Button>
        </FormButton>
      </Form>
    </Box>
  )
}

export default observer(Filter)
