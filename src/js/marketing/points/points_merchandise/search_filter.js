import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Form,
  FormItem,
  FormButton,
  Select,
  Option,
  Box,
  Button,
} from '@gmfe/react'
import store from './store'
import { observer } from 'mobx-react'

@observer
class SearchFilter extends React.Component {
  handleSearch = () => {
    store.pagination && store.pagination.doFirstRequest()
  }

  render() {
    const { status, search_text } = store.filter
    return (
      <Box hasGap>
        <Form inline onSubmit={this.handleSearch}>
          <FormItem label={i18next.t('兑换状态')}>
            <Select
              value={status}
              onChange={(value) => store.setFilter('status', value)}
            >
              <Option value={0}>全部状态</Option>
              <Option value={1}>上架</Option>
              <Option value={2}>下架</Option>
            </Select>
          </FormItem>
          <FormItem label={i18next.t('搜索')}>
            <input
              type='text'
              className='form-control'
              placeholder={i18next.t('输入商品名称')}
              value={search_text}
              onChange={(e) => store.setFilter('search_text', e.target.value)}
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
  }
}

export default SearchFilter
