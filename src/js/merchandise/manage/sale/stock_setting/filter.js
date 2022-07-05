import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import store from './store'
import { urlToParams } from 'common/util'
import { Box, Form, FormItem, FormButton, Button } from '@gmfe/react'
import CategoryFilter from 'common/components/category_filter_hoc/single'

@observer
class StockSetting extends React.Component {
  handleSearch = () => {
    store.getStockSettingList(store.searchData, this.props.query.id)
  }

  handleExport = (e) => {
    e.preventDefault()
    const req = Object.assign({}, store.searchData, {
      salemenu_id: this.props.query.id,
    })
    window.open(`/product/stocks/list?export=1&${urlToParams(req)}`)
  }

  handleCategoryFilterChange = (selected) => {
    store.changeFilter('categoryFilters', selected)
  }

  handleChangeText = (e) => {
    store.changeFilter('text', e.target.value)
  }

  render() {
    const { categoryFilters, text } = store.filter
    return (
      <Box hasGap>
        <Form onSubmit={this.handleSearch} inline>
          <FormItem label={i18next.t('商品筛选')} col={2}>
            <CategoryFilter
              selected={categoryFilters}
              onChange={this.handleCategoryFilterChange}
            />
          </FormItem>
          <FormItem label={i18next.t('搜索')}>
            <input
              value={text}
              onChange={this.handleChangeText}
              name='text'
              type='text'
              className='form-control'
              placeholder={i18next.t('输入商品信息搜索')}
            />
          </FormItem>
          <FormButton>
            <Button type='primary' htmlType='submit'>
              {i18next.t('搜索')}
            </Button>
            <div className='gm-gap-10' />
            <Button onClick={this.handleExport}>{i18next.t('导出')}</Button>
          </FormButton>
        </Form>
      </Box>
    )
  }
}

StockSetting.propTypes = {
  query: PropTypes.object,
}

export default StockSetting
