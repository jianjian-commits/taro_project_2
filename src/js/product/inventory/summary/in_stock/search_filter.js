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
import SupplierSelect from '../../../../common/components/supplier_selector'

@observer
class SearchFilter extends Component {
  handleSearch = () => {
    this.props.store.handleSearch()
  }

  handleExport = () => {
    this.props.store.handleExport()
  }

  handleReset = () => {
    this.props.store.initFilter()
  }

  disabledDate = (d) => {
    if (+moment(d) < +moment()) {
      return false
    }
    return true
  }

  render() {
    const {
      isSpuView,
      filter: { start_time, end_time, q, selectedCategory, selectedSupplier },
      handleFilterChange,
    } = this.props.store
    return (
      <>
        <BoxForm
          btnPosition='left'
          onSubmit={this.handleSearch}
          labelWidth='90px'
        >
          <FormBlock col={3}>
            <FormItem label={i18next.t('入库时间')}>
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
                  placeholder={
                    isSpuView
                      ? i18next.t('输入商品名称、商品ID搜索')
                      : i18next.t('输入供应商名称、供应商编号搜索')
                  }
                />
              ) : (
                <SupplierSelect
                  id='outStockSupplierSelect'
                  selected={selectedSupplier}
                  onSelect={handleFilterChange.bind(null, 'selectedSupplier')}
                />
              )}
            </FormItem>
          </FormBlock>
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
                <FormItem label={i18next.t('供应商筛选')}>
                  <SupplierSelect
                    id='outStockSupplierSelect'
                    selected={selectedSupplier}
                    onSelect={handleFilterChange.bind(null, 'selectedSupplier')}
                  />
                </FormItem>
              </FormBlock>
            </BoxForm.More>
          )}
          <FormButton>
            <Button type='primary' htmlType='submit'>
              {i18next.t('搜索')}
            </Button>
            {isSpuView && (
              <BoxForm.More>
                <Button
                  onClick={this.handleReset}
                  className='gm-margin-left-10'
                >
                  {i18next.t('重置')}
                </Button>
              </BoxForm.More>
            )}
            <Button className='gm-margin-left-10' onClick={this.handleExport}>
              {i18next.t('导出')}
            </Button>
          </FormButton>
        </BoxForm>
      </>
    )
  }
}

SearchFilter.propTypes = {
  store: PropTypes.object,
}

export default SearchFilter
