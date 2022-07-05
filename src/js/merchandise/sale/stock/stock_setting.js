import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import {
  Flex,
  Sheet,
  SheetColumn,
  SheetAction,
  Pagination,
  PaginationText,
  Switch,
  InputNumber,
  Tip,
  Popover,
  Button,
} from '@gmfe/react'
import {
  FilterSearchSelect,
  QuickFilter,
  QuickPanel,
} from '@gmfe/react-deprecated'
import _ from 'lodash'
import store from './store'
import { getStockType } from '../util'
import {
  isNumberCombination,
  urlToParams,
  TransformCategoty1Group,
} from '../../../common/util'

@observer
class StockSetting extends React.Component {
  constructor() {
    super()

    this.state = {
      categoryOne: { value: '0', name: i18next.t('全部一级分类') },
      categoryTwo: { value: '0', name: i18next.t('全部二级分类') },
      item: { value: '0', name: i18next.t('全部品类') },
      text: '',
      pagination: { offset: 0, limit: 10 },
      editIndex: '',
      isInheritList: {},
      stockTypeList: {},
      remainStocks: {},
    }

    this.handleSearch = ::this.handleSearch
    this.handleExport = ::this.handleExport
    this.handleSelectcategory1 = ::this.handleSelectcategory1
    this.handleSelectcategory2 = ::this.handleSelectcategory2
    this.handleSelectPinlei = ::this.handleSelectPinlei
    this.handlePageChange = ::this.handlePageChange
    this.handleChangeText = ::this.handleChangeText
  }

  async componentDidMount() {
    const { query } = this.props.location
    const req = {
      salemenu_id: query.id,
      offset: 0,
      limit: 10,
    }
    await store.getCategory1()
    await store.getCategory2()
    await store.getPinlei()
    await store.getStocks(req)
  }

  handleSelectcategory1(data) {
    if (data) {
      this.setState({
        categoryOne: data,
        categoryTwo: { value: '0', name: i18next.t('全部二级分类') },
        item: { value: '0', name: i18next.t('全部品类') },
      })
    }
  }

  handleSelectcategory2(data) {
    if (data) {
      this.setState({
        categoryTwo: data,
        item: { value: '0', name: i18next.t('全部品类') },
      })
    }
  }

  handleSelectPinlei(data) {
    if (data) {
      this.setState({ item: data })
    }
  }

  handleFilterData(type, list, query) {
    const state = this.state
    if (query === state[type].name) {
      return list
    }

    // 判断list是否是group
    if (_.has(_.head(list), 'label')) {
      list = _.flattenDeep(_.map(list, (v) => v.children || v))
    }

    const result = []
    _.each(list, (eList) => {
      if (eList.name.indexOf(query) > -1) {
        result.push({ ...eList })
      }
    })

    return result
  }

  handleSearch(e) {
    e.preventDefault()
    const { query } = this.props.location
    const req = Object.assign(
      {},
      { salemenu_id: query.id },
      { offset: 0, limit: 10 },
      this.checkFilter(),
    )
    store.getStocks(req).then(() => {
      this.setState({ pagination: { offset: 0, limit: 10 } })
    })
  }

  handleExport(e) {
    e.preventDefault()
    const { query } = this.props.location
    const req = Object.assign({}, { salemenu_id: query.id }, this.checkFilter())
    window.open(`/product/stocks/list?export=1&${urlToParams(req)}`)
  }

  handlePageChange(page) {
    const { query } = this.props.location
    const req = Object.assign(
      {},
      { salemenu_id: query.id },
      page,
      this.checkFilter(),
    )
    store.getStocks(req).then(() => {
      this.setState({ pagination: page })
    })
  }

  checkFilter() {
    const { categoryOne, categoryTwo, item, text } = this.state
    const filter = {}
    if (categoryOne.value !== '0') {
      filter.category1_id = categoryOne.value
    }
    if (categoryTwo.value !== '0') {
      filter.category2_id = categoryTwo.value
    }
    if (item.value !== '0') {
      filter.pinlei_id = item.value
    }
    if (text !== '') {
      filter.text = text
    }

    return filter
  }

  handleViewDetail(data) {
    const { std_unit_name_forsale, sale_ratio, name, id, sale_unit_name } = data
    window.open(
      `#/merchandise/manage/sale/stock_detail?sku_id=${id}&name=${name}&ratio=${
        sale_ratio + std_unit_name_forsale + '/' + sale_unit_name
      }`,
    )
  }

  handleEditStock(index, data) {
    const { stockTypeList, remainStocks } = this.state
    const remainStockList = Object.assign({}, remainStocks)
    const stockList = Object.assign({}, stockTypeList)

    if (_.has(remainStocks, index)) {
      remainStockList[index] = data.remain_stocks
    }

    if (_.has(stockTypeList, index)) {
      stockList[index] = data.stocks_type
    }

    this.setState({
      editIndex: index,
      remainStocks: remainStockList,
      stockTypeList: stockList,
    })
  }

  handleCancelEditStock(index, data) {
    const { isInheritList, stockTypeList, remainStocks } = this.state
    const inheritList = Object.assign({}, isInheritList)
    const stockList = Object.assign({}, stockTypeList)
    const remainStockList = Object.assign({}, remainStocks)
    inheritList[index] = data.stocks_type + '' === '0'
    stockList[index] = data.stocks_type
    remainStockList[index] = data.remain_stocks
    this.setState({
      editIndex: '',
      isInheritList: inheritList,
      stockTypeList: stockList,
      remainStocks: remainStockList,
    })
  }

  handleSaveStock(index, data) {
    const {
      isInheritList,
      stockTypeList,
      remainStocks,
      pagination,
    } = this.state
    const { query } = this.props.location
    const { id, stocks_type } = data
    const req = { sku_id: id }
    let isInherist
    if (+query.salemenuType === 2) {
      isInherist = _.has(isInheritList, index)
        ? isInheritList[index]
        : stocks_type + '' === '0'
    }
    if (isInherist) {
      req.stock_type = 0
    } else {
      let stock_type = 1
      if (_.has(stockTypeList, index)) {
        stock_type = stockTypeList[index]
      } else {
        stock_type = +stocks_type === 0 ? 1 : stocks_type
      }
      if (stock_type + '' === '2') {
        if (!remainStocks[index]) {
          Tip.warning(
            i18next.t('销售库存设置为设置固定库存时销售库存数不能为空'),
          )
          return
        }
        req.amount = remainStocks[index]
      }
      req.stock_type = stock_type
    }

    store.editStock(req).then(() => {
      Tip.success(i18next.t('编辑成功'))
      store.getStocks(
        Object.assign(
          {},
          { salemenu_id: query.id },
          pagination,
          this.checkFilter(),
        ),
      )
      this.setState({ editIndex: '' })
    })
  }

  handleChangeInherit(index) {
    const { stockList } = this.props.merchandiseSale
    const { isInheritList } = this.state
    const list = Object.assign({}, isInheritList)
    if (_.has(isInheritList, index)) {
      list[index] = !list[index]
    } else {
      list[index] = !(stockList[index].stocks_type + '' === '0')
    }

    this.setState({ isInheritList: list })
  }

  handleChangeStockType(index, e) {
    const { stockTypeList } = this.state
    const list = Object.assign({}, stockTypeList)
    list[index] = e.target.value
    this.setState({ stockTypeList: list })
  }

  handleChangeRemainStocks(index, value) {
    if (value !== '' && !isNumberCombination(value)) {
      return false
    }

    const stockList = Object.assign({}, this.state.remainStocks)
    stockList[index] = value
    this.setState({ remainStocks: stockList })
  }

  handleChangeText(e) {
    this.setState({ text: e.target.value })
  }

  render() {
    const { salemenuType } = this.props.location.query
    const {
      categoryOne,
      categoryTwo,
      item,
      pagination,
      editIndex,
      isInheritList,
      stockTypeList,
      remainStocks,
      text,
    } = this.state
    const { category1, category2, pinlei, stockList } = store

    const category1List = _.map(category1, (category) => {
      return {
        name: category.name,
        value: category.id,
        station_id: category.station_id,
      }
    })

    category1List.unshift({ value: '0', name: i18next.t('全部一级分类') })

    const category1Select = _.find(category1List, (category) => {
      return categoryOne.value === category.value
    })

    const category2List = _.map(
      _.filter(category2, (category) => {
        return category1Select.value === category.upstream_id
      }),
      (category) => {
        return { name: category.name, value: category.id }
      },
    )

    category2List.unshift({ value: '0', name: i18next.t('全部二级分类') })

    const category2Select = _.find(category2List, (category) => {
      return categoryTwo.value === category.value
    })

    const pinleiList = _.map(
      _.filter(pinlei, (pl) => {
        return category2Select.value === pl.upstream_id
      }),
      (p) => {
        return { name: p.name, value: p.id }
      },
    )
    pinleiList.unshift({ value: '0', name: i18next.t('全部品类') })
    const pinleiSelect = _.find(pinleiList, (pinlei) => {
      return item.value === pinlei.value
    })

    const tipWarning = (
      <div className='gm-border gm-padding-15 gm-bg' style={{ width: '200px' }}>
        <div className='gm-margin-bottom-5'>
          {i18next.t('不限库存：用户下单不受进销存系统的库存限制；')}
        </div>
        <div className='gm-margin-bottom-5'>
          {i18next.t('限制库存：用户下单的商品数不可超过进销存系统的库存；')}
        </div>
        <div className='gm-margin-bottom-5'>
          {i18next.t(
            '设置固定库存：设置固定的销售库存，用户下单不可超过设置的库存；',
          )}
        </div>
      </div>
    )

    return (
      <div>
        <QuickFilter>
          <form className='form-inline' onSubmit={this.handleSearch}>
            <Flex column>
              <div className='gm-margin-bottom-15'>
                <div className='form-group' style={{ width: '60px' }}>
                  {i18next.t('商品筛选')}:
                </div>
                <div className='form-group'>
                  <FilterSearchSelect
                    key={'_1' + category1Select.value}
                    list={TransformCategoty1Group(category1List)}
                    isGroupList
                    selected={category1Select}
                    onSelect={this.handleSelectcategory1}
                    onFilter={this.handleFilterData.bind(this, 'categoryOne')}
                  />
                </div>
                <div className='gm-gap-10' />
                <div className='form-group'>
                  <FilterSearchSelect
                    key={'_2' + category2Select.value}
                    list={category2List}
                    isGroupList={false}
                    selected={category2Select}
                    onSelect={this.handleSelectcategory2}
                    onFilter={this.handleFilterData.bind(this, 'categoryTwo')}
                  />
                </div>
                <div className='gm-gap-10' />
                <div className='form-group'>
                  <FilterSearchSelect
                    key={'_' + pinleiSelect.value}
                    list={pinleiList}
                    isGroupList={false}
                    selected={pinleiSelect}
                    onSelect={this.handleSelectPinlei}
                    onFilter={this.handleFilterData.bind(this, 'item')}
                  />
                </div>
              </div>
              <div>
                <div className='form-group' style={{ width: '60px' }}>
                  {i18next.t('搜索')}:
                </div>
                <input
                  value={text}
                  onChange={this.handleChangeText}
                  name='text'
                  type='text'
                  className='form-control'
                  placeholder={i18next.t('输入商品信息搜索')}
                  style={{ fontSize: '12px' }}
                />
                <div className='gm-gap-10' />
                <div className='form-group'>
                  <Button htmlType='submit' type='primary'>
                    {i18next.t('搜索')}
                  </Button>
                </div>
                <div className='gm-gap-10' />
                <div className='form-group'>
                  <Button onClick={this.handleExport}>
                    {i18next.t('导出')}
                  </Button>
                </div>
              </div>
            </Flex>
          </form>
        </QuickFilter>
        <QuickPanel icon='bill' title={i18next.t('商品列表')}>
          <Sheet list={stockList} loading={false} enableEmptyTip>
            <SheetColumn field='id' name={i18next.t('商品编码')} />
            <SheetColumn field='name' name={i18next.t('商品名')} />
            <SheetColumn field='category_name_2' name={i18next.t('分类')} />
            <SheetColumn field='sale_ratio' name={i18next.t('销售规格')}>
              {(sale_ratio, index) => {
                return (
                  sale_ratio +
                  stockList[index].std_unit_name_forsale +
                  '/' +
                  stockList[index].sale_unit_name
                )
              }}
            </SheetColumn>
            <SheetColumn field='state' name={i18next.t('商品状态')}>
              {(state) => {
                return +state === 0 ? (
                  <div style={{ color: 'red' }}>{i18next.t('下架')}</div>
                ) : (
                  i18next.t('上架中')
                )
              }}
            </SheetColumn>
            {salemenuType + '' === '2' ? (
              <SheetColumn
                field='stocks_type'
                name={i18next.t('是否读取上游库存')}
              >
                {(stocks_type, index) => {
                  return editIndex === index ? (
                    <Switch
                      on={i18next.t('是')}
                      off={i18next.t('否')}
                      type='primary'
                      checked={
                        _.has(isInheritList, index)
                          ? isInheritList[index]
                          : stocks_type + '' === '0'
                      }
                      onChange={this.handleChangeInherit.bind(this, index)}
                    />
                  ) : (
                    <div>
                      {stocks_type + '' === '0'
                        ? i18next.t('是')
                        : i18next.t('否')}
                    </div>
                  )
                }}
              </SheetColumn>
            ) : null}
            <SheetColumn
              field='stocks_type'
              name={
                <Flex>
                  {i18next.t('销售库存设置')}
                  <Popover
                    showArrow
                    component={<div />}
                    type='hover'
                    popup={tipWarning}
                  >
                    <i className='ifont ifont-warning' />
                  </Popover>
                </Flex>
              }
            >
              {(stocks_type, index) => {
                let isInherit = false
                let panel = null

                if (editIndex === index) {
                  if (_.has(isInheritList, index)) {
                    isInherit = isInheritList[index]
                  } else {
                    isInherit = +stockList[index].stocks_type === 0
                  }
                  panel = isInherit ? (
                    '-'
                  ) : (
                    <select
                      name='stockType'
                      style={{ width: '100px' }}
                      value={
                        _.has(stockTypeList, index)
                          ? stockTypeList[index]
                          : stocks_type
                      }
                      onChange={this.handleChangeStockType.bind(this, index)}
                    >
                      <option value='1'>{i18next.t('不限库存')}</option>
                      <option value='3'>{i18next.t('限制库存')}</option>
                      <option value='2'>{i18next.t('设置固定库存')}</option>
                    </select>
                  )
                } else {
                  panel = getStockType(stocks_type)
                }

                return panel
              }}
            </SheetColumn>
            <SheetColumn
              field='remain_stocks'
              name={i18next.t('销售库存数')}
              style={{ width: '150px' }}
            >
              {(remain_stocks, index) => {
                let isInherit = false
                let panel = null
                if (editIndex === index) {
                  isInherit = _.has(isInheritList, index)
                    ? isInheritList[index]
                    : +stockList[index].stocks_type === 0
                  if (isInherit) {
                    panel = '-'
                  } else {
                    panel =
                      stockTypeList[index] + '' === '2' ||
                      (!_.has(stockTypeList, index) &&
                        stockList[index].stocks_type + '' === '2') ? (
                        <InputNumber
                          value={remainStocks[index]}
                          min={0}
                          precision={0}
                          onChange={this.handleChangeRemainStocks.bind(
                            this,
                            index,
                          )}
                          style={{ width: '120px' }}
                        />
                      ) : (
                        '-'
                      )
                  }
                } else {
                  panel =
                    remain_stocks === '-'
                      ? remain_stocks
                      : remain_stocks + stockList[index].sale_unit_name
                }
                return panel
              }}
            </SheetColumn>
            <SheetAction>
              {(data, index) => {
                return (
                  <div>
                    {editIndex === index ? (
                      <a onClick={this.handleSaveStock.bind(this, index, data)}>
                        {i18next.t('保存')}
                      </a>
                    ) : (
                      <a onClick={this.handleEditStock.bind(this, index, data)}>
                        {i18next.t('编辑')}
                      </a>
                    )}
                    &nbsp;&nbsp;
                    {editIndex === index ? (
                      <a
                        onClick={this.handleCancelEditStock.bind(
                          this,
                          index,
                          data,
                        )}
                      >
                        {i18next.t('取消')}
                      </a>
                    ) : (
                      <a onClick={this.handleViewDetail.bind(this, data)}>
                        {i18next.t('明细')}
                      </a>
                    )}
                  </div>
                )
              }}
            </SheetAction>
            <Pagination
              data={pagination}
              toPage={this.handlePageChange}
              nextDisabled={stockList.length < 10}
            />
            <PaginationText data={pagination} />
          </Sheet>
        </QuickPanel>
      </div>
    )
  }
}

export default StockSetting
