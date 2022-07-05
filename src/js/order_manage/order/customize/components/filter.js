import React from 'react'
import { t } from 'gm-i18n'
import { Box, Form, FormItem, FormButton, Button, Select } from '@gmfe/react'
import { Observer } from 'mobx-react'
import store from '../store'
import { belongType, fieldType } from '../enum'

const Filter = () => {
  function handleSearch() {
    store.fetchList()
  }

  function handleChange(key, value) {
    store.updateFilter(key, value)
  }

  return (
    <Box hasGap>
      <Form inline className='form-inline' onSubmit={handleSearch}>
        <FormItem label={t('所属对象')}>
          <Observer>
            {() => (
              <Select
                value={store.filter.object_type}
                data={[{ value: 0, text: t('全部') }, ...belongType]}
                onChange={handleChange.bind(undefined, 'object_type')}
              />
            )}
          </Observer>
        </FormItem>
        <FormItem label={t('字段格式')}>
          <Observer>
            {() => (
              <Select
                value={store.filter.field_type}
                data={[{ value: 0, text: t('全部') }, ...fieldType]}
                onChange={handleChange.bind(undefined, 'field_type')}
              />
            )}
          </Observer>
        </FormItem>
        <FormItem label={t('搜索')}>
          <Observer>
            {() => (
              <input
                type='text'
                value={store.filter.search_text}
                className='form-control'
                placeholder={t('搜索字段名称')}
                onChange={(e) => handleChange('search_text', e.target.value)}
              />
            )}
          </Observer>
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

export default Filter
