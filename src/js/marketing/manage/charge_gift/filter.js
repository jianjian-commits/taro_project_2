import React from 'react'
import { i18next } from 'gm-i18n'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { Box, Form, Select, FormItem, FormButton, Button } from '@gmfe/react'
import store from './store'
import { ALL_STATUS } from './util'

@observer
class ChargeGiftFilter extends React.Component {
  handleFilterSelectChange = (val) => {
    store.changeFilter('status', val)
  }

  handleFilterInputChange = (e) => {
    e.preventDefault()
    store.changeFilter(e.target.name, e.target.value)
  }

  handleSearch = () => {
    store.getChargeGiftList()
  }

  render() {
    const { name, status } = store.filter
    return (
      <Box hasGap>
        <Form inline onSubmit={this.handleSearch}>
          <FormItem label={i18next.t('状态筛选')}>
            <Select
              value={status}
              name='status'
              data={_.map(ALL_STATUS, (status, key) => ({
                text: status,
                value: _.toNumber(key),
              }))}
              onChange={this.handleFilterSelectChange}
            />
          </FormItem>
          <FormItem label={i18next.t('搜索')}>
            <input
              value={name}
              onChange={this.handleFilterInputChange}
              name='name'
              type='text'
              className='form-control'
              placeholder={i18next.t('输入活动名称')}
            />
          </FormItem>
          <FormButton>
            <Button htmlType='submit' type='primary'>
              {i18next.t('搜索')}
            </Button>
          </FormButton>
        </Form>
      </Box>
    )
  }
}

export default ChargeGiftFilter
