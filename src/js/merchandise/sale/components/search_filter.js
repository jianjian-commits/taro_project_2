import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import {
  Select,
  Option,
  FormButton,
  FormItem,
  Form,
  FormBlock,
  Button,
} from '@gmfe/react'
import { QuickFilter } from '@gmfe/react-deprecated'
import CategoryFilter from '../../../common/components/category_pinlei_filter_mobx'
import { merchandiseTypes, FORMULA_TYPE } from '../../../common/enum'
import globalStore from '../../../stores/global'
import _ from 'lodash'

import store from '../store'
import merchandiseStore from '../../store'

@observer
class SearchFilter extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedCategory1: [],
      selectedCategory2: [],
      selectedPinlei: [],

      filterCategory1: [],
      filterCategory2: [],
      filterPinlei: [],
      selectedState: '',

      showSelect: false,
    }
  }

  componentWillMount() {
    // 从其他页面进入，清理数据
    if (this.props.location.action === 'REPLACE') {
      store.saleCategoryFilterChange('text', '')
      store.clearMerchandiseSaleList()
    }
  }

  componentDidMount() {
    const { list } = store.saleList
    setTimeout(() => {
      // 返回的时候不搜索数据
      if (
        list &&
        (this.props.location.action !== 'POP' ||
          (this.props.location.action === 'POP' && !list.length))
      ) {
        merchandiseStore.getAllMerchandise()
        store.getMerchandiseSaleList(this.props.location.query.id)
      }
    }, 0)
  }

  handleFilterChange(name, v) {
    if (name === 'text') {
      store.saleCategoryFilterChange(name, v.target.value)
    } else {
      store.saleCategoryFilterChange(name, v)
    }

    this.setState({
      showSelect: false,
    })
  }

  handleBtnSearch = () => {
    store.getMerchandiseSaleList(this.props.location.query.id)
  }

  handleBtnExport = (e) => {
    e.preventDefault()
    store.merchandiseSaleListExport(this.props.location.query.id)
  }

  renderCollapseFilter = () => {
    const {
      saleListFilter: { categoryFilter, state, text, formula },
    } = store
    const { categories } = merchandiseStore
    // 有导出权限
    const canExport = globalStore.hasPermission('export_sale_skus')

    return (
      <Form horizontal onSubmit={this.handleBtnSearch}>
        <FormBlock col={3}>
          <FormItem label={i18next.t('商品筛选')} labelWidth='60px'>
            <CategoryFilter
              selected={categoryFilter}
              categories={categories.slice()}
              onChange={this.handleFilterChange.bind(this, 'categoryFilter')}
            />
          </FormItem>
          <FormItem label={i18next.t('搜索')}>
            <input
              type='text'
              value={text}
              name='text'
              placeholder={i18next.t('输入商品名称、规格名或ID')}
              onChange={this.handleFilterChange.bind(this, 'text')}
            />
          </FormItem>
          <FormButton>
            <Button type='primary' htmlType='submit'>
              {i18next.t('搜索')}
            </Button>
            <div className='gm-gap-10' />
            {canExport && (
              <Button onClick={this.handleBtnExport}>
                {i18next.t('导出')}
              </Button>
            )}
          </FormButton>
        </FormBlock>
        <FormBlock col={3}>
          <FormItem label={i18next.t('状态')} labelWidth='60px'>
            <Select
              name='state'
              value={state}
              onChange={this.handleFilterChange.bind(this, 'state')}
            >
              <Option value=''>{i18next.t('全部状态')}</Option>
              {_.map(merchandiseTypes.saleState, (v, i) => (
                <Option key={i} value={v.value}>
                  {v.name}
                </Option>
              ))}
            </Select>
          </FormItem>
          <FormItem label={i18next.t('定价公式状态')}>
            <Select
              value={~~formula}
              onChange={this.handleFilterChange.bind(this, 'formula')}
            >
              {_.map(FORMULA_TYPE, (v, i) => (
                <Option key={i} value={v.value}>
                  {v.name}
                </Option>
              ))}
            </Select>
          </FormItem>
        </FormBlock>
      </Form>
    )
  }

  render() {
    const {
      saleListFilter: { categoryFilter, text },
    } = store
    const { categories } = merchandiseStore
    // 有导出权限
    const canExport = globalStore.hasPermission('export_sale_skus')
    return (
      <QuickFilter collapseRender={this.renderCollapseFilter}>
        <Form
          inline
          onSubmit={this.handleBtnSearch}
          ref={(ref) => {
            this.form = ref
          }}
        >
          <FormItem label={i18next.t('商品筛选')}>
            <CategoryFilter
              selected={categoryFilter}
              categories={categories.slice()}
              onChange={this.handleFilterChange.bind(this, 'categoryFilter')}
            />
          </FormItem>
          <FormItem label={i18next.t('搜索')}>
            <input
              type='text'
              value={text}
              name='text'
              style={{ width: '200px' }}
              placeholder={i18next.t('输入商品名称、规格名或ID')}
              onChange={this.handleFilterChange.bind(this, 'text')}
            />
          </FormItem>
          <FormButton>
            <Button type='primary' htmlType='submit'>
              {i18next.t('搜索')}
            </Button>
            <div className='gm-gap-10' />
            {canExport && (
              <Button onClick={this.handleBtnExport}>
                {i18next.t('导出')}
              </Button>
            )}
          </FormButton>
        </Form>
      </QuickFilter>
    )
  }
}

export default SearchFilter
