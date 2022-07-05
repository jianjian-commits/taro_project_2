import React, { Component } from 'react'
import store from '../store'
import { observer } from 'mobx-react'
import {
  Box,
  Button,
  Form,
  FormButton,
  FormItem,
  Input,
  Select,
} from '@gmfe/react'
import { t } from 'gm-i18n'

@observer
class Filter extends Component {
  handleChangeFilter = (value, key) => {
    const { mergeFilter } = store
    mergeFilter({ [key]: value })
  }

  handleSearch = () => {
    const { pagination } = store
    pagination.current.apiDoFirstRequest()
  }

  render() {
    const { statusList, filter } = store
    const { status, search_text } = filter
    return (
      <Box hasGap>
        <Form inline onSubmit={this.handleSearch}>
          <FormItem label={t('状态')}>
            <Select
              data={statusList.slice()}
              value={status}
              onChange={(value) => this.handleChangeFilter(value, 'status')}
            />
          </FormItem>
          <FormItem label={t('搜索')}>
            <Input
              className='form-control'
              value={search_text}
              onChange={(e) =>
                this.handleChangeFilter(e.target.value, 'search_text')
              }
              placeholder={t('输入税率规则名称')}
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
}

export default Filter
