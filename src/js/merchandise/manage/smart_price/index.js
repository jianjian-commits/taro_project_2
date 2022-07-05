import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import listStore from '../list/list_store'
import saleStore from '../sale/sale_list/store'
import manageStore from '../store'
import globalStore from '../../../stores/global'
import { history, System } from '../../../common/service'
import { getList, getParams, getSkuList } from './util'
import {
  getRefParams,
  smartPriceWarningTips,
  getOverSuggestPrice,
} from '../util'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import Big from 'big.js'
import {
  Box,
  Button,
  Flex,
  Form,
  FormButton,
  FormItem,
  InputNumber,
  Popover,
  Price,
  BoxTable,
  RightSideModal,
  Pagination,
} from '@gmfe/react'
import { Table, TableUtil } from '@gmfe/table'
import { RefPriceToolTip } from 'common/components/ref_price_type_hoc'
import CategoryPinleiFilter from 'common/components/category_filter_hoc'
import TableListTips from 'common/components/table_list_tips'
import TableTotalText from 'common/components/table_total_text'
import TaskList from '../../../task/task_list'
import classNames from 'classnames'
import renderFormulaText from 'common/components/calculator/render_formula_text'

const defaultPagination = { count: 0, offset: 0, limit: 20 }

@observer
class SmartPrice extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      categoryFilter: {
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
  }

  componentDidMount() {
    globalStore.setBreadcrumbs([i18next.t('智能定价')])
    const { type } = this.props.location.query

    if (type === 'sale') {
      this.getDataByStore(saleStore)
    } else if (type === 'list') {
      this.getDataByStore(listStore)
    } else {
      this.getDataById(type)
    }
    manageStore.getAllMerchandise()
    manageStore.getRefPriceType(1)
  }

  componentWillUnmount() {
    globalStore.setBreadcrumbs([])
  }

  getDataByStore = (store) => {
    const { smartPricePagination, smartPriceData, smartPriceFilter } = store

    this.setState({
      list: getList(smartPriceData.sku_list),
      pagination: smartPricePagination.count
        ? smartPricePagination
        : defaultPagination,
    })
    this.connectData = {
      smartPriceData,
      smartPriceFilter,
      smartPricePagination,
    }
  }

  getDataById = (type) => {
    Request('/product/sku/smart_pricing/result')
      .data({ task_id: type })
      .get()
      .then((json) => {
        if (json.code === 0) {
          const params = getParams(json.data.smartPriceFilter)

          Request('/product/sku/smart_pricing/list')
            .data(params)
            .post()
            .then((res) => {
              if (res.code === 0) {
                this.connectData = {
                  smartPricePagination: res.pagination,
                  smartPriceData: res.data,
                  smartPriceFilter: params,
                }

                this.setState({
                  list: getList(res.data.sku_list),
                  pagination: res.pagination.count
                    ? res.pagination
                    : defaultPagination,
                })
              }
            })
        }
      })
  }

  handleChangeCategoryFilter = (selected) => {
    this.setState({
      categoryFilter: selected,
    })
  }

  handleInputChange = (e) => {
    this.setState({
      q: e.target.value,
    })
  }

  handleSubmit = () => {
    this.search()
  }

  search = (page = {}) => {
    const { smartPriceFilter } = this.connectData
    const {
      categoryFilter: { category1_ids, category2_ids, pinlei_ids },
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
    if (System.isC()) data.is_retail_interface = 1

    Request('/product/sku/smart_pricing/list')
      .data(data)
      .post()
      .then((json) => {
        this.setState({
          list: getSkuList(json.data.sku_list, changeList),
          pagination: json.pagination,
        })
      })
  }

  deleteSku = (sku_id, index) => {
    const { list, changeList } = this.state
    const cIndex = _.findIndex(changeList, (v) => v.sku_id === sku_id)

    list[index].status = 1
    if (cIndex > -1) {
      changeList[cIndex].status = 1
    } else {
      changeList.push({
        sku_id: sku_id,
        price: list[index].new_price,
        status: 1,
        over_suggest_price: list[index].over_suggest_price,
      })
    }
    return Promise.resolve({ list, changeList })
  }

  handleDelete = (sku_id, index) => {
    const { list, changeList } = this.state
    const cIndex = _.findIndex(changeList, (v) => v.sku_id === sku_id)

    list[index].status = 1
    if (cIndex > -1) {
      changeList[cIndex].status = 1
    } else {
      changeList.push({
        sku_id: sku_id,
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

  handleSave = () => {
    const {
      changeList,
      categoryFilter: { category1_ids, category2_ids, pinlei_ids },
      q,
    } = this.state
    const { smartPriceFilter } = this.connectData
    const { type } = this.props.location.query

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
        }),
      ),
    })
    if (System.isC()) data.is_retail_interface = 1

    Request('/product/sku/smart_pricing/update')
      .data(data)
      .post()
      .then((json) => {
        if (json.code === 0) {
          const url =
            type === 'sale'
              ? '/merchandise/manage/sale'
              : '/merchandise/manage/list'
          RightSideModal.render({
            children: <TaskList tabKey={1} />,
            onHide: RightSideModal.hide,
            style: {
              width: '300px',
            },
          })

          history.push(System.getUrl(url))
        }
      })
  }

  handleChangePrice = (index, value) => {
    const { list, changeList } = this.state
    const cIndex = _.findIndex(
      changeList,
      (v) => v.sku_id === list[index].sku_id,
    )

    list[index].new_price = value

    const over_suggest_price = value
      ? getOverSuggestPrice(
          Big(value).times(100).toFixed(2),
          list[index].suggest_price_min,
          list[index].suggest_price_max,
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

  handleSearch = (page) => {
    this.search(page)
  }

  renderFormulaTextByRegion = () => {
    const filter = this.connectData.smartPriceFilter
    
    if(filter.filter_price_region === 2){
      const multiPriceRegions = JSON.parse(filter.multi_price_regions)
      let strArr = []
      _.forEach(multiPriceRegions, (item) => {
        let min = item.price_region_min ? Big(item.price_region_min).div(100).toFixed(2) : "　"
        let max = item.price_region_max ? Big(item.price_region_max).div(100).toFixed(2) : "　"
        let formulaText = renderFormulaText(item.formula_text)
        strArr.push(`${min}-${max}：${formulaText}`)
      }); 
      return strArr.join("；　")
    }
    return renderFormulaText(filter.formula_text)
  }

  render() {
    const { reference_price_type } = manageStore
    const {
      smartPriceFilter: { formula_type, formula_text },
    } = this.connectData
    const { categoryFilter, list, pagination, q } = this.state
    const { referencePriceFlag, referencePriceName } = getRefParams(
      reference_price_type,
    )
    return (
      <div>
        <Box hasGap>
          <Form inline onSubmit={this.handleSubmit}>
            <FormItem label={i18next.t('商品筛选')} col={2}>
              <CategoryPinleiFilter
                selected={categoryFilter}
                onChange={this.handleChangeCategoryFilter}
              />
            </FormItem>
            <FormItem label={i18next.t('搜索')}>
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
        <TableListTips
          tips={[
            i18next.t(
              '若参考数据为空或计算后单价为负值，则单价显示为空。空单价将不会更新，请手动填写后保存',
            ),
          ]}
        />

        <BoxTable
          info={
            <BoxTable.Info>
              <TableTotalText
                data={[
                  {
                    label: i18next.t('定价列表'),
                    content: pagination.count,
                  },
                  {
                    label: i18next.t('定价公式'),
                    hide: formula_type !== 2,
                    content:
                      formula_type === 2 && this.renderFormulaTextByRegion(),
                  },
                ]}
              />
            </BoxTable.Info>
          }
          action={
            <Button type='primary' onClick={this.handleSave} disabled={false}>
              {i18next.t('保存')}
            </Button>
          }
        >
          <Table
            data={list}
            getTrProps={(state, rowInfo) => {
              return {
                className:
                  rowInfo && rowInfo.original.status && 'b-sheet-item-disable',
              }
            }}
            columns={[
              {
                Header: i18next.t('规格名'),
                accessor: 'sku_id',
                Cell: ({ original }) => (
                  <span>
                    {original.name}
                    <br />
                    {original.sku_id}
                  </span>
                ),
              },
              System.isB() && {
                Header: i18next.t('所在报价单'),
                accessor: 'salemenu_name',
              },
              {
                Header: i18next.t('现单价'),
                accessor: 'old_price',
                Cell: ({ original }) =>
                  original.old_price +
                  Price.getUnit(original.fee_type) +
                  '/' +
                  original.std_unit_name_forsale,
              },
              {
                Header: i18next.t('更新后单价'),
                accessor: 'new_price',
                Cell: ({ original, index }) => {
                  const {
                    over_suggest_price,
                    new_price,
                    status,
                    std_unit_name_forsale,
                    suggest_price_min,
                    suggest_price_max,
                  } = original
                  if (
                    globalStore.otherInfo.showSuggestPrice &&
                    over_suggest_price
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
                          disabled={status}
                        />
                        <span style={{ lineHeight: '30px' }}>
                          {Price.getUnit(original.fee_type) +
                            '/' +
                            std_unit_name_forsale}
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
                                  suggest_price_min,
                                  suggest_price_max,
                                  std_unit_name_forsale,
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
                          disabled={status}
                        />
                        <span style={{ lineHeight: '30px' }}>
                          {Price.getUnit(original.fee_type) +
                            '/' +
                            std_unit_name_forsale}
                        </span>
                      </Flex>
                    )
                  }
                },
              },
              {
                Header: i18next.t('规格'),
                accessor: 'ratio',
                Cell: ({ original }) =>
                  original.ratio +
                  original.std_unit_name_forsale +
                  '/' +
                  original.sale_unit_name,
              },
              {
                Header: i18next.t('更新后销售价'),
                accessor: 'sale_price',
                Cell: ({ original }) =>
                  original.sale_price +
                  Price.getUnit(original.fee_type) +
                  '/' +
                  original.sale_unit_name,
              },
              {
                Header: <RefPriceToolTip name={referencePriceName} />,
                id: 'sku_id',
                Cell: ({ original }) => {
                  const price = original[referencePriceFlag]
                  return _.isNumber(price)
                    ? Big(price).div(100).toFixed(2) +
                        Price.getUnit(original.fee_type) +
                        '/' +
                        original.std_unit_name_forsale
                    : '-'
                },
              },
              {
                width: 50,
                Header: TableUtil.OperationHeader,
                Cell: ({ original, index }) => (
                  <TableUtil.OperationCell>
                    <TableUtil.OperationDelete
                      onClick={this.handleDelete.bind(
                        this,
                        original.sku_id,
                        index,
                      )}
                      title={i18next.t('删除商品规格')}
                    >
                      {i18next.t('是否确定要删除该商品规格？')}
                    </TableUtil.OperationDelete>
                  </TableUtil.OperationCell>
                ),
              },
            ].filter((_) => _)}
          />
        </BoxTable>
        <Flex justifyEnd alignCenter className='gm-padding-20'>
          <Pagination
            data={pagination}
            toPage={this.handleSearch} // eslint-disable-line
            nextDisabled={list.length < 10}
          />
        </Flex>
      </div>
    )
  }
}

export default SmartPrice
