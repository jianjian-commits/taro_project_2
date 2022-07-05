import React, { Component } from 'react'
import { Button, Form, FormButton, FormItem, Input } from '@gmfe/react'
import ProductSearch from './product_search'
import { store } from '../../store'
import { observer } from 'mobx-react'
import ProductList from './product_list'
import { searchByProduct } from '../../utils'
import CargoFilter from '../../../../common/components/category_filter_hoc/single'

@observer
class ProductFilter extends Component {
  state = {
    expand: false,
  }

  constructor(props) {
    super(props)
    this.toggleExpand = ::this.toggleExpand
  }

  async componentDidMount() {
    await this.handleSearch()
    const [first] = store.productMenu.slice() // 获取商品列表第一个，并搜索第一个
    searchByProduct(first)
  }

  componentWillUnmount() {
    store.resetProductMenuSearchOption()
    store.resetProductSearchOption()
  }

  /**
   * 展开搜索信息
   * @param expand
   */
  toggleExpand(expand) {
    this.setState({ expand })
  }

  /**
   * 修改搜索信息数据绑定
   * @param value
   * @param key
   */
  changeSearchOption(value, key) {
    store.setProductMenuSearchOption(value, key)
  }

  handleSearch() {
    store.setProductMenuSearchOption(0, 'offset')
    store.setProductMenu([])
    return store.getProductMenu()
  }

  handleReset(event) {
    event.preventDefault()
    store.resetProductMenuSearchOption()
  }

  handleChangeCategory = (selected) => {
    const { category1, category2 } = selected
    store.setProductMenuSearchOption(category1, 'category1')
    store.setProductMenuSearchOption(category2, 'category2')
  }

  /**
   * 展开信息模板
   * @returns {*}
   */
  expandTemplate() {
    const { productMenuSearchOption } = store
    const { text } = productMenuSearchOption
    return (
      <Form onSubmit={this.handleSearch}>
        <FormItem>
          <Input
            className='form-control width-100-percent'
            placeholder='请输入商品名或ID搜索'
            value={text}
            onChange={(event) =>
              this.changeSearchOption(event.target.value, 'text')
            }
          />
        </FormItem>
        <FormItem>
          <CargoFilter
            disablePinLei
            selected={productMenuSearchOption}
            onChange={this.handleChangeCategory}
          />
        </FormItem>
        <FormButton>
          <Button type='primary' htmlType='submit'>
            搜索
          </Button>
          <Button className='gm-margin-right-10' onClick={this.handleReset}>
            重置
          </Button>
        </FormButton>
      </Form>
    )
  }

  render() {
    const { expand } = this.state
    const {
      productMenuSearchOption: { text },
    } = store
    return (
      <>
        <ProductSearch
          expand={expand}
          template={this.expandTemplate()}
          toggleExpand={this.toggleExpand}
        >
          <Form inline disabledCol onSubmit={this.handleSearch}>
            <FormItem>
              <Input
                className='form-control'
                placeholder='请输入商品名或ID搜索'
                value={text}
                onChange={(event) =>
                  this.changeSearchOption(event.target.value, 'text')
                }
              />
            </FormItem>
            <FormButton>
              <Button type='primary' htmlType='submit'>
                搜索
              </Button>
            </FormButton>
          </Form>
        </ProductSearch>
        <ProductList expand={expand} />
      </>
    )
  }
}

export default ProductFilter
