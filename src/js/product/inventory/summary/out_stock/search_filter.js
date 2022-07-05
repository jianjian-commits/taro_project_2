import { i18next } from 'gm-i18n'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  BoxForm,
  FormBlock,
  FormItem,
  FormButton,
  DateRangePicker,
  Button,
} from '@gmfe/react'
import { observer } from 'mobx-react'
import moment from 'moment'
import CategorySearchFilter from '../../../../common/components/category_filter_hoc'
import CustomerSelect from '../common/customer_select'

@observer
class SearchFilter extends Component {
  handleSearch = () => {
    this.props.store.handleSearch()
  }

  handleExport = () => {
    this.props.store.handleExport()
  }

  disabledDate = (d) => {
    if (+moment(d) < +moment()) {
      return false
    }
    return true
  }

  handleReset = () => {
    this.props.store.initFilter()
  }

  render() {
    const {
      isSpuView,
      filter: { start_time, end_time, q, selectedCategory, selectedCustomer },
      handleFilterChange,
    } = this.props.store
    return (
      <BoxForm labelWidth='80px' btnPosition='left'>
        <FormBlock col={3}>
          <FormItem label={i18next.t('出库时间')}>
            <DateRangePicker
              begin={start_time}
              end={end_time}
              disabledDate={this.disabledDate}
              onChange={(begin, end) => {
                handleFilterChange('start_time', begin)
                handleFilterChange('end_time', end)
              }}
            />
          </FormItem>
          <FormItem label={i18next.t('搜索')}>
            {isSpuView ? (
              <input
                value={q}
                onChange={(e) => {
                  handleFilterChange('q', e.target.value)
                }}
                className='form-control'
                placeholder={
                  isSpuView
                    ? i18next.t('输入商品名称、商品ID搜索')
                    : i18next.t('输入商户ID、商户名称搜索')
                }
              />
            ) : (
              <CustomerSelect
                selected={selectedCustomer}
                onSelect={handleFilterChange.bind(null, 'selectedCustomer')}
              />
            )}
          </FormItem>
          {isSpuView && (
            <BoxForm.More>
              <FormBlock col={3}>
                <FormItem label={i18next.t('商品筛选')} col={2}>
                  <CategorySearchFilter
                    disablePinLei
                    selected={selectedCategory}
                    onChange={handleFilterChange.bind(null, 'selectedCategory')}
                  />
                </FormItem>
                <FormItem label={i18next.t('商户筛选')}>
                  <CustomerSelect
                    selected={selectedCustomer}
                    onSelect={handleFilterChange.bind(null, 'selectedCustomer')}
                  />
                </FormItem>
              </FormBlock>
            </BoxForm.More>
          )}
          <FormButton>
            <Button
              type='primary'
              htmlType='submit'
              onClick={this.handleSearch}
            >
              {i18next.t('搜索')}
            </Button>
            {isSpuView && (
              <BoxForm.More>
                <div className='gm-gap-10' />
                <Button onClick={this.handleReset}>{i18next.t('重置')}</Button>
              </BoxForm.More>
            )}
            <div className='gm-gap-10' />
            <Button onClick={this.handleExport}>{i18next.t('导出')}</Button>
          </FormButton>
        </FormBlock>
      </BoxForm>
    )
  }
}

SearchFilter.propTypes = {
  store: PropTypes.object,
}

export default SearchFilter
