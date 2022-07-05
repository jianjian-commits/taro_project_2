import { i18next } from 'gm-i18n'
import React from 'react'
import { connect } from 'react-redux'
import {
  Box,
  Form,
  FormItem,
  FormButton,
  Sheet,
  SheetColumn,
  SheetAction,
  Pagination,
  InputNumber,
  Flex,
  Button,
  RightSideModal,
  Popover,
  Price,
} from '@gmfe/react'
import { QuickPanel } from '@gmfe/react-deprecated'
import CategoryFilter from '../../common/components/category_pinlei_filter'
import TaskList from '../../task/task_list'
import { RefPriceToolTip } from '../../common/components/ref_price_type_hoc'

import store from '../sale/store'

import Big from 'big.js'
import _ from 'lodash'
import { saleReferencePrice } from '../../common/enum'
import { isNumber } from '../../common/util'
import { smartPriceWarningTips, getOverSuggestPrice, ENUMFilter } from '../util'
import { history, withBreadcrumbs } from '../../common/service'
import actions from '../../actions'
import '../actions'
import '../reducer'
import '../list/reducer'
import { Request } from '@gm-common/request'
import classNames from 'classnames'
import globalStore from '../../stores/global'

const defaultPagination = { count: 0, offset: 0, limit: 20 }

@withBreadcrumbs([i18next.t('商品智能定价')])
class SmartPrice extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      filter: {
        category1_ids: [],
        category2_ids: [],
        pinlei_ids: [],
      },
      q: '',
      list: [],
      pagination: defaultPagination,
      changeList: [],
    }

    this.connectData = {
      smartPricePagination: {},
      smartPriceData: {},
      smartPriceFilter: {
        formula_type: 1,
        price_type: 0,
        cal_type: 0,
        cal_num: 0,
      },
    }

    this.handleSearch = ::this.handleSearch
    this.handleSubmit = ::this.handleSubmit
    this.handleInputChange = ::this.handleInputChange
    this.handleChangeCategoryFilter = ::this.handleChangeCategoryFilter
    this.handleSave = ::this.handleSave
    this.handleGenerateTrProps = ::this.handleGenerateTrProps
  }

  getSkuList(data) {
    return _.map(data, (v) => {
      return {
        ...v,
        sale_price:
          v.sale_price === 0
            ? 0
            : v.sale_price
            ? Big(v.sale_price).div(100).toFixed(2)
            : '-',
        new_price:
          v.new_price === 0
            ? 0
            : v.new_price
            ? Big(v.new_price).div(100).toFixed(2)
            : '',
        old_price: v.old_price === 0 ? 0 : Big(v.old_price).div(100).toFixed(2),
      }
    })
  }

  getDataBySale() {
    const { smartPricePagination, smartPriceData } = store

    this.setState({
      list: this.getSkuList(smartPriceData.sku_list),
      pagination: smartPricePagination.count
        ? smartPricePagination
        : defaultPagination,
    })
    this.connectData = store
  }

  getDataByList() {
    const { smartPricePagination, smartPriceData } = this.props.merchandiseList
    this.setState({
      list: this.getSkuList(smartPriceData.sku_list),
      pagination: smartPricePagination.count
        ? smartPricePagination
        : defaultPagination,
    })
    this.connectData = this.props.merchandiseList
  }

  getDataById(type) {
    Request('/product/sku/smart_pricing/result')
      .data({ task_id: type })
      .get()
      .then((json) => {
        if (json.code === 0) {
          let data = Object.assign({}, json.data.smartPriceFilter, {
            sku_list: JSON.stringify(json.data.smartPriceFilter.sku_list),
            re_category1_ids: JSON.stringify(
              json.data.smartPriceFilter.re_category1_ids
            ),
            re_category2_ids: JSON.stringify(
              json.data.smartPriceFilter.re_category2_ids
            ),
            re_pinlei_ids: JSON.stringify(
              json.data.smartPriceFilter.re_pinlei_ids
            ),
            pinlei_ids: JSON.stringify(json.data.smartPriceFilter.pinlei_ids),
            category2_ids: JSON.stringify(
              json.data.smartPriceFilter.category2_ids
            ),
            category1_ids: JSON.stringify(
              json.data.smartPriceFilter.category1_ids
            ),
            salemenu_ids: JSON.stringify(
              json.data.smartPriceFilter.salemenu_ids
            ),
          })
          data = _.omit(data, ['modify_sku_list'])

          Request('/product/sku/smart_pricing/list')
            .data(data)
            .post()
            .then((val) => {
              if (val.code === 0) {
                this.connectData = {
                  smartPricePagination: val.pagination,
                  smartPriceData: val.data,
                  smartPriceFilter: data,
                }

                this.setState({
                  list: this.getSkuList(val.data.sku_list),
                  pagination: val.pagination.count
                    ? val.pagination
                    : defaultPagination,
                })
              }
            })
        }
      })
  }

  componentDidMount() {
    const { type } = this.props.params

    if (type === 'sale') {
      this.getDataBySale()
    } else if (type === 'list') {
      this.getDataByList()
    } else {
      this.getDataById(type)
    }

    actions.merchandise_common_get_all()
    actions.merchandise_common_get_reference_price_type(1)
  }

  handleGenerateTrProps(index) {
    const { list } = this.state

    if (list[index].status) {
      return {
        className: 'b-sheet-item-disable',
      }
    }
    return {}
  }

  handleInputChange(e) {
    const val = e.target.value

    this.setState({
      q: val,
    })
  }

  handleChangeCategoryFilter(selected) {
    this.setState({
      filter: selected,
    })
  }

  handleChangePrice(index, value) {
    const { list, changeList } = this.state
    const cIndex = _.findIndex(
      changeList,
      (v) => v.sku_id === list[index].sku_id
    )

    list[index].new_price = value

    const over_suggest_price = value
      ? getOverSuggestPrice(
          Big(value).times(100).toFixed(2),
          list[index].suggest_price_min,
          list[index].suggest_price_max
        )
      : false
    // 同步其他值
    list[index].sale_price = value
      ? Big(value).times(list[index].ratio).toFixed(2)
      : '-'
    list[index].over_suggest_price = over_suggest_price
    if (cIndex > -1) {
      changeList[cIndex].price = value
      changeList[cIndex].over_suggest_price = over_suggest_price
    } else {
      changeList.push({
        sku_id: list[index].sku_id,
        price: value,
        status: 0,
        over_suggest_price: over_suggest_price,
      })
    }

    this.setState({
      list,
      changeList,
    })
  }

  handleDel(id, index) {
    const { list, changeList } = this.state
    const cIndex = _.findIndex(changeList, (v) => v.sku_id === id)

    list[index].status = 1
    if (cIndex > -1) {
      changeList[cIndex].status = 1
    } else {
      changeList.push({
        sku_id: id,
        price: list[index].new_price,
        status: 1,
        over_suggest_price: list[index].over_suggest_price,
      })
    }

    this.setState({
      list,
      changeList,
    })
  }

  handleSearch(page = {}) {
    const { smartPriceFilter } = this.connectData
    const {
      filter: { category1_ids, category2_ids, pinlei_ids },
      q,
      changeList,
    } = this.state
    let data = Object.assign({}, smartPriceFilter, page)

    data = Object.assign({}, data, {
      re_category1_ids: JSON.stringify(_.map(category1_ids, (v) => v.id)),
      re_category2_ids: JSON.stringify(_.map(category2_ids, (v) => v.id)),
      re_pinlei_ids: JSON.stringify(_.map(pinlei_ids, (v) => v.id)),
      re_q: q,
    })

    Request('/product/sku/smart_pricing/list')
      .data(data)
      .post()
      .then((json) => {
        const sku_list = _.map(json.data.sku_list, (v) => {
          const sku = _.find(changeList, (l) => l.sku_id === v.sku_id)

          let price =
            v.new_price === 0
              ? 0
              : v.sale_price
              ? Big(v.new_price).div(100).toFixed(2)
              : ''
          let sale_price =
            v.sale_price === 0
              ? 0
              : v.sale_price
              ? Big(v.sale_price).div(100).toFixed(2)
              : '-'
          price = sku ? sku.price : price
          sale_price = sku
            ? isNumber(sku.price)
              ? Big(sku.price).times(v.ratio).toFixed(2)
              : '-'
            : sale_price

          return {
            ...v,
            sale_price,
            new_price: price,
            old_price:
              v.old_price === 0
                ? 0
                : v.old_price
                ? Big(v.old_price).div(100).toFixed(2)
                : '',
            status: sku ? sku.status : 0,
            over_suggest_price: sku
              ? sku.over_suggest_price
              : v.over_suggest_price,
          }
        })

        this.setState({
          list: sku_list,
          pagination: json.pagination,
        })
      })
  }

  handleSubmit(e) {
    e.preventDefault()
    this.handleSearch()
  }

  handleSave() {
    const {
      changeList,
      filter: { category1_ids, category2_ids, pinlei_ids },
      q,
    } = this.state
    const { smartPriceFilter } = this.connectData

    const data = Object.assign({}, smartPriceFilter, {
      re_category1_ids: JSON.stringify(_.map(category1_ids, (v) => v.id)),
      re_category2_ids: JSON.stringify(_.map(category2_ids, (v) => v.id)),
      re_pinlei_ids: JSON.stringify(_.map(pinlei_ids, (v) => v.id)),
      re_q: q,
      modify_sku_list: JSON.stringify(
        _.map(changeList, (l) => {
          l = _.omit(l, ['over_suggest_price'])

          return {
            ...l,
            price:
              _.trim(l.price) === '' ? '' : Big(l.price).times(100).toFixed(2),
          }
        })
      ),
    })

    Request('/product/sku/smart_pricing/update')
      .data(data)
      .post()
      .then((json) => {
        if (json.code === 0) {
          const url =
            this.props.params.type === 'sale'
              ? '/merchandise/manage/sale'
              : '/merchandise/manage/list'
          RightSideModal.render({
            children: <TaskList tabKey={1} />,
            onHide: RightSideModal.hide,
            style: {
              width: '300px',
            },
          })

          history.push(url)
        }
      })
  }

  render() {
    const { categories, reference_price_type } = this.props.merchandiseCommon
    const {
      smartPriceFilter: { formula_type, price_type, cal_type, cal_num },
    } = this.connectData
    const { filter, list, pagination, q } = this.state

    let referencePriceName = ''
    let referencePriceFlag = ''
    _.find(saleReferencePrice, (item) => {
      if (item.type === reference_price_type) {
        referencePriceName = item.name
        referencePriceFlag = item.flag

        return true
      }
    })

    return (
      <div>
        <Box hasGap>
          <Form inline className='form-inline' onSubmit={this.handleSubmit}>
            <FormItem label=''>
              <CategoryFilter
                selected={filter}
                categories={categories}
                onChange={this.handleChangeCategoryFilter}
              />
            </FormItem>
            <FormItem label=''>
              <input
                className='form-control'
                type='text'
                value={q}
                placeholder={i18next.t('输入商品名称或ID')}
                onChange={this.handleInputChange}
              />
            </FormItem>
            <FormButton>
              <Button type='primary' htmlType='submit'>
                {i18next.t('搜索')}
              </Button>
            </FormButton>
          </Form>
        </Box>

        <div className='gm-padding-10 b-warning-tips'>
          <i className='ifont xfont-warning-circle' />
          {i18next.t(
            '若参考数据为空或计算后单价为负值，则单价显示为空。空单价将不会更新，请手动填写后保存'
          )}
        </div>

        <QuickPanel
          icon='bill'
          title={
            <span>
              {i18next.t('定价列表')}:{pagination.count}
              {formula_type === 2 && (
                <React.Fragment>
                  <span className='gm-margin-left-15 gm-margin-right-5'>
                    {i18next.t('（定价公式：单价=')}
                  </span>
                  {ENUMFilter.priceType(price_type)}
                  {ENUMFilter.calType(
                    cal_type,
                    Big(cal_num)
                      .div(100)
                      .toFixed(cal_type === 1 ? 3 : 2)
                  ) + '）'}
                </React.Fragment>
              )}
            </span>
          }
          right={
            <Button type='primary' onClick={this.handleSave} disabled={false}>
              {i18next.t('保存')}
            </Button>
          }
        >
          <Sheet
            list={list}
            getTrProps={this.handleGenerateTrProps}
            enableEmptyTip={i18next.t('没有数据')}
          >
            <SheetColumn name={i18next.t('规格名')} field='sku_id'>
              {(sku_id, index) => {
                return (
                  <div>
                    {list[index].name}
                    <br />
                    {sku_id}
                  </div>
                )
              }}
            </SheetColumn>
            <SheetColumn name={i18next.t('所在报价单')} field='salemenu_name' />
            <SheetColumn name={i18next.t('现单价')} field='old_price'>
              {(old_price, index) => {
                return (
                  old_price +
                  Price.getUnit(list[index].fee_type) +
                  '/' +
                  list[index].std_unit_name_forsale
                )
              }}
            </SheetColumn>
            <SheetColumn name={i18next.t('更新后单价')} field='new_price'>
              {(new_price, index) => {
                if (
                  globalStore.otherInfo.showSuggestPrice &&
                  list[index].over_suggest_price
                ) {
                  return (
                    <Flex className='gm-text-red'>
                      <InputNumber
                        style={{ width: '120px' }}
                        value={new_price}
                        className={classNames('form-control', {
                          'b-bg-warning': _.trim(new_price) === '',
                        })}
                        onChange={this.handleChangePrice.bind(this, index)}
                        disabled={list[index].status}
                      />
                      <span style={{ lineHeight: '30px' }}>
                        {Price.getUnit(list[index].fee_type) +
                          '/' +
                          list[index].std_unit_name_forsale}
                        <Popover
                          showArrow
                          top
                          type='hover'
                          popup={
                            <div
                              className='gm-border gm-padding-5 gm-bg gm-text-12'
                              style={{ width: '200px' }}
                            >
                              {smartPriceWarningTips(
                                list[index].suggest_price_min,
                                list[index].suggest_price_max,
                                list[index].std_unit_name_forsale
                              )}
                            </div>
                          }
                        >
                          <i className='xfont xfont-warning-circle gm-margin-lr-5' />
                        </Popover>
                      </span>
                    </Flex>
                  )
                } else {
                  return (
                    <Flex>
                      <InputNumber
                        style={{ width: '120px' }}
                        value={new_price}
                        className={classNames('form-control', {
                          'b-bg-warning': _.trim(new_price) === '',
                        })}
                        onChange={this.handleChangePrice.bind(this, index)}
                        disabled={list[index].status}
                      />
                      <span style={{ lineHeight: '30px' }}>
                        {Price.getUnit(list[index].fee_type) +
                          '/' +
                          list[index].std_unit_name_forsale}
                      </span>
                    </Flex>
                  )
                }
              }}
            </SheetColumn>
            <SheetColumn name={i18next.t('规格')} field='ratio'>
              {(ratio, index) => {
                return (
                  ratio +
                  list[index].std_unit_name_forsale +
                  '/' +
                  list[index].sale_unit_name
                )
              }}
            </SheetColumn>
            <SheetColumn name={i18next.t('更新后销售价')} field='sale_price'>
              {(sale_price, index) => {
                return (
                  sale_price +
                  Price.getUnit(list[index].fee_type) +
                  '/' +
                  list[index].sale_unit_name
                )
              }}
            </SheetColumn>
            <SheetColumn
              name={<RefPriceToolTip name={referencePriceName} />}
              field='sku_id'
            >
              {(value, index) => {
                const val = list[index][referencePriceFlag]
                return val === 0
                  ? 0 +
                      Price.getUnit(list[index].fee_type) +
                      '/' +
                      list[index].std_unit_name_forsale
                  : val
                  ? Big(val).div(100).toFixed(2) +
                    Price.getUnit(list[index].fee_type) +
                    '/' +
                    list[index].std_unit_name_forsale
                  : '-'
              }}
            </SheetColumn>
            <SheetAction>
              {(value, index) => {
                return (
                  <a
                    onClick={this.handleDel.bind(this, value.sku_id, index)}
                    disabled={list[index].status}
                  >
                    <i className='xfont xfont-delete' />
                  </a>
                )
              }}
            </SheetAction>
          </Sheet>
          <div className='text-center'>
            <Pagination
              data={pagination}
              toPage={this.handleSearch}
              nextDisabled={list.length < 10}
            />
          </div>
        </QuickPanel>
      </div>
    )
  }
}

export default connect((state) => ({
  merchandiseCommon: state.merchandiseCommon,
  merchandiseList: state.merchandiseList,
}))(SmartPrice)
