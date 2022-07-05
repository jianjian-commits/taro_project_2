import React from 'react'
import { t } from 'gm-i18n'
import { Box, FormItem, FormButton, Form, Select, Button } from '@gmfe/react'
import { observer } from 'mobx-react'

import store from '../store'

@observer
class Filter extends React.Component {
  handleTextChange = e => {
    const { value, name } = e.target
    store.setFilter(name, value)
  }

  handleSearch = () => {
    store.doInfoFirstRequest()
  }

  handleSelectChange = (val, name) => {
    store.setFilter(name, val)
  }

  render() {
    const { telphone, member_status } = store.filter

    return (
      <Box hasGap>
        <Form inline onSubmit={this.handleSearch}>
          <FormItem label={t('会员状态')}>
            <Select
              value={member_status}
              data={[
                { value: 0, text: t('全部') },
                { value: 1, text: t('正常') },
                { value: 2, text: t('过期') }
              ]}
              onChange={value =>
                this.handleSelectChange(value, 'member_status')
              }
            />
          </FormItem>
          <FormItem label={t('搜索')}>
            <input
              type='text'
              value={telphone}
              name='telphone'
              className='form-control'
              placeholder={t('输入注册手机号搜索')}
              onChange={this.handleTextChange}
            />
          </FormItem>
          <FormButton>
            <Button htmlType='submit' type='primary'>
              {t('搜索')}
            </Button>
          </FormButton>
        </Form>
      </Box>
    )
  }
}

export default Filter
