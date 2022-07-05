import { i18next } from 'gm-i18n'
import React from 'react'
import { Box, Form, FormItem, FormButton, Button } from '@gmfe/react'
import SkuSheet from './components/spu_sheet'

import { System } from 'common/service'

import { observer } from 'mobx-react'
import store from './store'
import globalStore from '../../../../stores/global'
import { categoryFilterHoc } from '../../../../common/components/category_filter_hoc'
import { getCategory1, getCategory2, getPinlei } from './api'
import InitCloudGoods from '../../../../guides/init/guide/init_cloud_goods'
const CategoryPinleiFilter = categoryFilterHoc({
  getCategory1,
  getCategory2,
  getPinlei,
})

@observer
class List extends React.Component {
  componentDidMount() {
    globalStore.setBreadcrumbs(['云商品导入'])
  }

  componentWillUnmount() {
    store.tempalteListClear()
    globalStore.setBreadcrumbs([])
  }

  handleCategoryFilterChange = (selected) => {
    store.setFilter('categoryFilter', selected)
  }

  handleChange = (e) => {
    store.setFilter('query', e.target.value)
  }

  handleSubmit = (e) => {
    store.doFirstRequest()
    store.removeSelectData()
  }

  render() {
    const { filter } = store
    const { categoryFilter, query } = filter
    return (
      <div>
        <Box hasGap>
          <Form inline onSubmit={this.handleSubmit}>
            <FormItem label={i18next.t('商品筛选')} col={2}>
              <CategoryPinleiFilter
                selected={categoryFilter}
                onChange={this.handleCategoryFilterChange}
              />
            </FormItem>
            <FormItem label={i18next.t('搜索')}>
              <input
                className='form-control'
                type='text'
                value={query}
                name='query'
                placeholder={i18next.t('输入商品名称搜索')}
                onChange={this.handleChange}
              />
            </FormItem>
            <FormButton>
              <Button type='primary' htmlType='submit'>
                {i18next.t('搜索')}
              </Button>
            </FormButton>
          </Form>
        </Box>
        <SkuSheet retail={!System.isB()} />
        <InitCloudGoods ready={!store.loading} />
      </div>
    )
  }
}

export default List
