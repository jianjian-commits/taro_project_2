import React from 'react'
import { t } from 'gm-i18n'
import {
  FormButton,
  Box,
  Form,
  FormItem,
  DateRangePicker,
  Button
} from '@gmfe/react'
import { observer } from 'mobx-react'

import store from '../store'

@observer
class Filter extends React.Component {
  handleTextChange = e => {
    const { value, name } = e.target
    store.setFilter(name, value)
  }

  handleSearch = () => {
    store.doFirstRequest()
  }

  handleSelectChange = (name, value) => {
    store.changeFilter(name, value)
  }

  render() {
    const { search_text, begin, end } = store.filter

    return (
      <Box hasGap>
        <Form inline onSubmit={this.handleSearch}>
          <FormItem label={t('购买时间')}>
            <DateRangePicker
              begin={begin}
              end={end}
              onChange={(begin, end) => {
                store.changeFilter('begin', begin)
                store.changeFilter('end', end)
              }}
            />
          </FormItem>
          <FormItem label={t('搜索')}>
            <input
              type='text'
              value={search_text}
              name='search_text'
              className='form-control'
              placeholder={t('输入注册手机号搜索')}
              onChange={this.handleTextChange}
            />
          </FormItem>
          <FormButton>
            <Button type='primary' htmlType='submit'>
              {t('搜索')}
            </Button>
            <div className='gm-gap-10' />
            {/* <Button type='default' onClick={this.handleExport}>
              {t('导出')}
            </Button> */}
            <div className='gm-gap-10' />
          </FormButton>
        </Form>
      </Box>
    )
  }
}

export default Filter
