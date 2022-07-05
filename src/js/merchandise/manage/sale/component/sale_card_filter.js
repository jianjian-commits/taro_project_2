import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import store from '../sale_card_store'
import manageStore from '../../store'
import {
  BoxForm,
  FormItem,
  FormBlock,
  Select,
  Option,
  FormButton,
  Button,
} from '@gmfe/react'
import _ from 'lodash'
import { merchandiseTypes } from '../../../../common/enum'

@observer
class SaleCardsFilter extends React.Component {
  handleSelectChange = (name, value) => {
    store.changeFilter(name, value)
  }

  handleInputChange = (e) => {
    const value = e.target.value.trim()
    store.changeFilter('q', value)
  }

  handleRetFilter = () => {
    store.resetFilter()
  }

  handleSearch = () => {
    store.getSaleCards()
  }

  render() {
    const {
      filter: { time_config, sale_type, status, q },
    } = store
    const { serviceTime } = manageStore
    return (
      <BoxForm
        labelWidth='80px'
        onSubmit={this.handleSearch}
        btnPosition='left'
      >
        <FormBlock col={3}>
          <FormItem label={i18next.t('运营时间')}>
            <Select
              onChange={this.handleSelectChange.bind(this, 'time_config')}
              value={time_config}
            >
              <Option value='-1'>{i18next.t('全部运营时间')}</Option>
              {_.map(serviceTime, (v, i) => (
                <Option key={i} value={v.id}>
                  {v.name}
                </Option>
              ))}
            </Select>
          </FormItem>
          <FormItem label={i18next.t('搜索')}>
            <input
              className='form-control'
              name='q'
              type='text'
              placeholder={i18next.t('输入报价单ID或报价单名称')}
              value={q || ''}
              onChange={this.handleInputChange}
            />
          </FormItem>
        </FormBlock>
        <BoxForm.More>
          <FormBlock col={3}>
            <FormItem label={i18next.t('报价单类型')}>
              <Select
                onChange={this.handleSelectChange.bind(this, 'sale_type')}
                value={sale_type}
              >
                {_.map(merchandiseTypes.saleType, (v, i) => (
                  <Option key={i} value={v.value}>
                    {v.name}
                  </Option>
                ))}
              </Select>
            </FormItem>
            <FormItem label={i18next.t('报价单状态')}>
              <Select
                onChange={this.handleSelectChange.bind(this, 'status')}
                value={status}
              >
                {_.map(merchandiseTypes.saleStatus, (v, i) => (
                  <Option key={i} value={v.value}>
                    {v.name}
                  </Option>
                ))}
              </Select>
            </FormItem>
          </FormBlock>
        </BoxForm.More>
        <FormButton>
          <Button type='primary' htmlType='submit'>
            {i18next.t('搜索')}
          </Button>
          <BoxForm.More>
            <>
              <div className='gm-gap-10' />
              <Button onClick={this.handleRetFilter}>
                {i18next.t('重置')}
              </Button>
            </>
          </BoxForm.More>
        </FormButton>
      </BoxForm>
    )
  }
}

export default SaleCardsFilter
