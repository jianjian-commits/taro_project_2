import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import store from '../store/list.store'
import { Box, Button, Form, FormButton, FormItem, Input } from '@gmfe/react'

const Filter = () => {
  const {
    filter: { q },
  } = store

  useEffect(() => {
    handleSearch()
  }, [])

  const handleChange = (event) => {
    const { mergeFilter } = store
    mergeFilter(event.target.value, 'q')
  }

  const handleSearch = () => {
    const { paginationRef } = store
    paginationRef.current.apiDoFirstRequest()
  }

  return (
    <Box hasGap>
      <Form inline onSubmit={handleSearch}>
        <FormItem label={t('搜索')}>
          <Input
            className='form-control'
            placeholder={t('搜索分割方案名称')}
            value={q}
            onChange={handleChange}
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
