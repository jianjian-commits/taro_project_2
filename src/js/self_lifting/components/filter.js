import React from 'react'
import { i18next } from 'gm-i18n'
import {
  Box,
  Form,
  FormItem,
  FormButton,
  Select,
  Option,
  Button,
} from '@gmfe/react'
import { observer } from 'mobx-react'
import _ from 'lodash'

import { BUSINESS_STATUS, SELF_LIFTING_TYPE_STATUS } from '../../common/enum'
import AreaSelect from '../../common/components/area_select'

import { getAreaDict } from '../util'
import store from '../store'

@observer
class Component extends React.Component {
  handleChangeSearchText = (e) => {
    store.setFilter({
      search_text: e.target.value,
    })
  }

  handleSearch = () => {
    store.doFirstRequest()
  }

  handleAreaSelect = (citySelected) => {
    store.setFilter(getAreaDict(citySelected))
  }

  render() {
    const businessStatus = [
      { id: '', value: i18next.t('全部') },
      ...BUSINESS_STATUS,
    ]
    const typeStatus = [
      { value: '', text: i18next.t('全部') },
      ...SELF_LIFTING_TYPE_STATUS,
    ]
    const {
      filter: { search_text, business_status, type },
    } = store
    return (
      <Box hasGap>
        <Form inline onSubmit={this.handleSearch}>
          <FormItem label={i18next.t('地理标签')}>
            <AreaSelect onSelect={this.handleAreaSelect} />
          </FormItem>
          <FormItem label={i18next.t('营业状态')}>
            <Select
              value={business_status || ''}
              onChange={(value) =>
                store.setFilter({ business_status: value || null })
              }
            >
              {_.map(businessStatus, (item) => (
                <Option value={item.id} key={item.id}>
                  {item.value}
                </Option>
              ))}
            </Select>
          </FormItem>
          <FormItem label={i18next.t('类型')}>
            <Select
              data={typeStatus}
              value={type || ''}
              onChange={(value) => store.setFilter({ type: value || null })}
            />
          </FormItem>
          <FormItem label={i18next.t('搜索')}>
            <input
              type='text'
              value={search_text || ''}
              className='form-control'
              placeholder={i18next.t('输入自提点名称搜索')}
              onChange={this.handleChangeSearchText}
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

export default Component
