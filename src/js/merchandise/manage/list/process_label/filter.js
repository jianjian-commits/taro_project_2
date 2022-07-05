import React from 'react'
import { observer } from 'mobx-react'
import { Form, FormItem, Input, FormButton, Button, Box } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import store from './store'

const Filter = observer(() => {
  const { q } = store.filter
  const handleSubmit = () => {
    store.fetchList()
  }

  const handleInputChange = (e) => {
    store.changeFilter('q', e.target.value)
  }
  return (
    <Box hasGap>
      <Form onSubmit={handleSubmit} disabledCol inline>
        <FormItem label=''>
          <Input
            className='form-control'
            type='text'
            value={q}
            style={{ width: '250px' }}
            placeholder={i18next.t('搜索商品加工标签名称')}
            onChange={handleInputChange}
          />
        </FormItem>
        <FormButton>
          <Button type='primary' htmlType='submit'>
            {i18next.t('搜索')}
          </Button>
        </FormButton>
      </Form>
    </Box>
  )
})

export default Filter
