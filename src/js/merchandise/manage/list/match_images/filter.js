import React from 'react'
import { Box, Form, FormItem, FormButton, Button, Select } from '@gmfe/react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'

import store from './store'
import { Types } from './util'
import { categoryFilterHoc } from 'common/components/category_filter_hoc'

const CategoryFilter = categoryFilterHoc({
  getCategory1: store.getCategory1,
  getCategory2: store.getCategory2,
  getPinlei: store.getPinlei,
})

const Filter = observer(() => {
  const { categoryFilter, q, selected } = store.filter
  const handleSearch = () => {
    store.search()
  }

  const handleFilterChange = (key, value) => {
    store.setFilter(key, value)
  }

  return (
    <Box hasGap>
      <Form inline colWidth='360px' onSubmit={handleSearch} labelWidth='80px'>
        <FormItem label={t('商品筛选')}>
          <CategoryFilter
            selected={categoryFilter}
            disablePinLei
            onChange={handleFilterChange.bind(null, 'categoryFilter')}
          />
        </FormItem>
        <FormItem label={t('商品图片')}>
          <Select
            value={selected}
            onChange={handleFilterChange.bind(null, 'selected')}
            data={[
              {
                text: t('全部'),
                value: '',
              },
              ...Types,
            ]}
          />
        </FormItem>
        <FormItem label={t('搜索')}>
          <input
            className='form-control'
            type='text'
            value={q}
            placeholder={t('输入商品名称')}
            onChange={(e) => handleFilterChange('q', e.target.value)}
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
})

export default Filter
