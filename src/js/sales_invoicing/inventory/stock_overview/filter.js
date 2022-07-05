import React, { useState } from 'react'
import { observer } from 'mobx-react'
import { i18next } from 'gm-i18n'
import { Form, FormItem, Input, FormButton, Button, Box } from '@gmfe/react'
import store from './store'
import CategoryFilterHoc from 'common/components/category_filter_hoc/single'
import { urlToParams } from 'common/util'

const Filter = observer(() => {
  const { text } = store.filter

  const [cate1, setCate1] = useState(null)
  const [cate2, setCate2] = useState(null)

  const handleSearch = () => {
    store.apiDoFirstRequest()
  }

  const handleExport = () => {
    const url = urlToParams(store.getFilterData())
    window.open('/stock/list?export=1&' + url)
  }

  const handleChangeFilter = (name, value) => {
    store.changeFilter(name, value)
  }

  const handleChangeCateFilter = (cate) => {
    const { category1, category2 } = cate
    setCate1(category1)
    setCate2(category2)

    // 只需要取id即可
    store.changeFilter('category_id_1', category1 ? category1.id : null)

    // 只需要取id即可
    store.changeFilter('category_id_2', category2 ? category2.id : null)
  }

  const level = { category1: cate1, category2: cate2 }
  return (
    <Box hasGap>
      <Form onSubmit={handleSearch} labelWidth='90px' colWidth='360px' inline>
        <FormItem label={i18next.t('商品筛选')}>
          <CategoryFilterHoc
            disablePinLei
            selected={level}
            onChange={handleChangeCateFilter}
          />
        </FormItem>
        <FormItem label={i18next.t('搜索')}>
          <Input
            value={text}
            onChange={(e) => handleChangeFilter('text', e.target.value)}
            className='form-control'
            placeholder={i18next.t('输入商品名进行搜索')}
          />
        </FormItem>

        <FormButton>
          <Button type='primary' htmlType='submit'>
            {i18next.t('搜索')}
          </Button>
          <div className='gm-gap-10' />
          <Button onClick={handleExport}>{i18next.t('导出')}</Button>
        </FormButton>
      </Form>
    </Box>
  )
})

export default Filter
