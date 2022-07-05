import { observer } from 'mobx-react'
import React, { useEffect } from 'react'
import {
  Form,
  FormItem,
  FormButton,
  Input,
  Button,
  Box,
  Select,
} from '@gmfe/react'
import { i18next } from 'gm-i18n'
import store from '../store/list_store'

const HeaderFilter = observer(() => {
  const { q, technic_category_id } = store.filter

  useEffect(() => {
    // 获取工艺类型列表
    store.fetchTechnicCategoryList()
  }, [])
  const handleSubmit = () => {
    store.pagination.current.apiDoFirstRequest()
  }

  const handleInputChange = (e) => {
    store.changeFilter('q', e.target.value)
  }

  return (
    <Box hasGap>
      <Form
        onSubmit={handleSubmit}
        disabledCol
        inline
        colWidth='365px'
        labelWidth='80px'
      >
        <FormItem label={i18next.t('工艺类型')}>
          <Select
            value={technic_category_id}
            onChange={(value) =>
              store.changeFilter('technic_category_id', value)
            }
            data={store.technicCategoryList.slice()}
            style={{ width: '275px' }}
          />
        </FormItem>
        <FormItem label={i18next.t('搜索')}>
          <Input
            className='form-control'
            maxLength={8}
            type='text'
            value={q}
            style={{ width: '275px' }}
            placeholder={i18next.t('输入工艺名或工艺编号')}
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

export default HeaderFilter
