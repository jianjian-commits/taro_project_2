import { i18next, t } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { SvgSupplier, SvgMinus, SvgSearch } from 'gm-svg'
import {
  Flex,
  BoxTable,
  DropSelect,
  PaginationV2,
  Popover,
  Price,
  ToolTip,
  Button,
} from '@gmfe/react'
import { Table, TableUtil } from '@gmfe/table'
import { is } from '@gm-common/tool'
import { ruleTypeName, getRuleType, legitimate } from './filter'
import { inputFocus } from './util'
import { saleState } from 'common/filter'
import FloatTip from 'common/components/float_tip'
import _ from 'lodash'
import Big from 'big.js'
import actions from '../../../actions'
import './actions'
import './reducer'
import { RefPriceTypeSelect } from 'common/components/ref_price_type_hoc'
import TableTotalText from 'common/components/table_total_text'
import { saleReferencePrice, RULE_TYPE } from 'common/enum'
import RuleObjectTypeSwitchBtn from './components/rule_object_type_switch_btn'
import SelectInputEdit from './components/select_input_edit'
import globalStore from 'stores/global'
import BoxTableS from 'common/components/box_table_s'
import SVGTieredPrice from 'svg/tiered_price.svg'

const arrowUp = () => (
  <i className='glyphicon glyphicon-arrow-up' style={{ color: '#ff5454' }} />
)
const arrowDown = () => (
  <i className='glyphicon glyphicon-arrow-down' style={{ color: '#bdea74' }} />
)

class SkuList extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      activeIndex: null,
      search_input: '',
      dropSelectShow: false,
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // 闪烁完之后清掉class
    if (prevState.activeIndex !== this.state.activeIndex) {
      setTimeout(() => {
        this.setState({ activeIndex: null })
      }, 1000)
    }
  }

  handleSearchInputFocus = () => {
    this.setState({
      dropSelectShow: true,
    })
  }

  handleDropSelectEnter = (index) => {
    const {
      searchSpuData,
      ruleDetail,
      currentPage,
      pagination: { limit },
    } = this.props
    const { skus } = ruleDetail
    const sku = searchSpuData.list[index]
    const selectIndex = _.findIndex(skus, (s) => s.id === sku.id) // 所选择sku的index
    const page = Math.floor(selectIndex / limit) // 该sku在第几页
    let activeIndex = selectIndex // 当前页面该sku所在index

    if (selectIndex < 0 && !!currentPage) {
      actions.price_rule_sheet_page_change({ offset: 0, limit })
    }

    if (page > -1) {
      actions.price_rule_sheet_page_change({ offset: page * limit, limit })
      activeIndex = selectIndex % limit
    }

    Promise.all([actions.price_rule_sku_add(sku), this.refInput.blur()]).then(
      () => {
        this.setState(
          {
            dropSelectShow: false,
            activeIndex: selectIndex > -1 ? activeIndex : 0,
          },
          () => {
            inputFocus(activeIndex)
          },
        )
      },
    )
  }

  handlePriceRuleSkuAdd(rowData) {
    const { limit } = this.props.pagination
    actions.price_rule_sku_add(rowData)
    actions.price_rule_sheet_page_change({ offset: 0, limit })

    this.setState(
      {
        dropSelectShow: false,
        activeIndex: 0,
      },
      () => {
        inputFocus(0)
      },
    )
  }

  handleSearchInputChange = (e) => {
    const { dropSelectShow } = this.state
    if (!dropSelectShow) this.handleSearchInputFocus()
    this.setState({
      search_input: e.target.value,
    })

    actions.debounceSearchSku(this.props.ruleDetail.salemenu_id, e.target.value)
  }

  handleDropSelectHide = () => {
    if (this.state.dropSelectShow) {
      this.setState({
        dropSelectShow: false,
      })
    }
  }

  handleRuleTypeChange(index, yx_price, rule_type) {
    const { limit } = this.props.pagination
    actions.price_rule_sheet_rule_and_price_change(
      this.props.currentPage * limit + index,
      { rule_type },
    )
    // 由于乘的时候是4位小数，固定和加都只是两位小数，所以切换计算规则类型时，yx_price都统一为两位小数
    actions.price_rule_sheet_rule_and_price_change(
      this.props.currentPage * limit + index,
      { yx_price: Big(yx_price || 0).toFixed(2) },
    )
  }

  handleYxPriceChange(index, yx_price) {
    const { limit } = this.props.pagination
    actions.price_rule_sheet_rule_and_price_change(
      this.props.currentPage * limit + index,
      { yx_price },
    )
  }

  handlePage = (data) => {
    actions.price_rule_sheet_page_change(data)
  }

  handleDel(index) {
    const skus = [...this.props.ruleDetail.skus]
    const {
      currentPage,
      pagination: { limit },
    } = this.props
    let page = currentPage

    skus.splice(this.props.currentPage * limit + index, 1)

    // 如果最后一页的删除完了，自动跳到倒数第二页
    if (
      skus.length % limit === 0 &&
      currentPage !== 0 &&
      Big(currentPage).gte(parseInt(skus.length / limit))
    ) {
      page = currentPage - 1
      const data = { offset: page * limit, limit }

      this.handlePage(data)
    }

    actions.price_rule_sku_del(skus, page)
  }

  handleClearRuleDetailSku = () => {
    actions.price_rule_detail_sku_clear()
  }

  render() {
    const { activeIndex } = this.state
    const {
      ruleDetail,
      ruleTypeMap,
      pagination,
      postRefPriceType,
      refPriceType,
    } = this.props
    const { viewType, skus, type } = ruleDetail
    const list = skus.slice(
      pagination.offset,
      pagination.offset + pagination.limit,
    )
    const { flag: refPriceTypeFlag, name } = _.find(
      saleReferencePrice,
      (v) => v.type === refPriceType,
    )
    let actionDom

    let columns = [
      {
        field: 'name',
        name: i18next.t('商品名/商品ID'),
        render: (name, sku) => (
          <div className='b-price-rule-drop-column-name'>
            <Flex justifyCenter>
              <div className='gm-ellipsis'>{name}</div>
              {sku?.is_step_price === 1 && (
                <Popover
                  type='hover'
                  top
                  showArrow
                  popup={
                    <div
                      style={{
                        padding: '5px',
                      }}
                    >
                      {i18next.t('阶梯定价商品')}
                    </div>
                  }
                  style={{ zIndex: 100000 }}
                >
                  <SVGTieredPrice className='gm-cursor' />
                </Popover>
              )}
            </Flex>
            <div className='b-second-text-opacity'>
              <FloatTip
                skuId={sku.id}
                tip={sku.outer_id}
                showCustomer={globalStore.otherInfo.showSkuOuterId}
              />
            </div>
          </div>
        ),
      },
      {
        field: 'spec',
        name: i18next.t('规格'),
      },
      {
        field: 'cost',
        name: (
          <Popover
            type='hover'
            top
            showArrow
            offset={60}
            popup={
              <div
                className='gm-border gm-padding-5 gm-bg gm-text-12'
                style={{ minWidth: '130px' }}
              >
                {i18next.t('来源')}：{name}
              </div>
            }
          >
            <div>{i18next.t('参考成本')}</div>
          </Popover>
        ),
        render: (v, rowData) => {
          const price = _.isNil(rowData[refPriceTypeFlag])
            ? '-'
            : rowData[refPriceTypeFlag]

          let isSupplierPrice = false
          if (
            refPriceTypeFlag === 'latest_quote_price' &&
            rowData.latest_quote_from_supplier
          ) {
            isSupplierPrice = true
          } else if (
            refPriceTypeFlag === 'last_quote_price' &&
            rowData.quoted_from_supplier
          ) {
            isSupplierPrice = true
          }

          return price === '-' ? (
            '-'
          ) : (
            <Flex alignCenter>
              <div>
                {Big(Number(price) || 0)
                  .div(100)
                  .toFixed(2) +
                  Price.getUnit(rowData.fee_type) +
                  '/' +
                  rowData.std_unit_name_forsale}
              </div>
              {isSupplierPrice && (
                <Popover
                  top
                  showArrow
                  type='hover'
                  popup={<div>{i18next.t('供应商报价')}</div>}
                >
                  <SvgSupplier
                    className='gm-text-14'
                    style={{
                      color: 'green',
                      marginLeft: '2px',
                    }}
                  />
                </Popover>
              )}
            </Flex>
          )
        },
      },
      {
        field: 'original_cost',
        name: i18next.t('原价'),
      },
      {
        field: 'rule_type',
        name: i18next.t('计算规则'),
        render: (rule_type, rowData) => {
          const sku = _.find(skus, (s) => s.id === rowData.id)

          if (!sku) {
            return '-'
          }

          let ruleTypeText = ''
          if (sku.rule_type === ruleTypeMap.FIXED_VALUE) {
            ruleTypeText = ruleTypeName(sku.rule_type)
          } else if (sku.rule_type === ruleTypeMap.VARIATION) {
            ruleTypeText =
              (sku.yx_price >= 0 ? `+${sku.yx_price}` : sku.yx_price) +
              Price.getUnit(rowData.fee_type) +
              '/' +
              sku.sale_unit_name
          } else if (sku.rule_type === ruleTypeMap.MULTIPLE) {
            ruleTypeText = `x${sku.yx_price}`
          }

          return ruleTypeText
        },
      },
      {
        field: 'yx_price',
        name: i18next.t('规则价'),
        render: (yx_price, rowData) => {
          const sku = _.find(skus, (s) => s.id === rowData.id && s.yx_price)

          if (!sku) {
            return '-'
          }

          let rule_price = sku.yx_price
          if (sku.rule_type === ruleTypeMap.VARIATION) {
            rule_price = Big(sku.sale_price)
              .plus(legitimate(yx_price))
              .toString()
          } else if (sku.rule_type === ruleTypeMap.MULTIPLE) {
            rule_price = yx_price
              ? Big(sku.sale_price).times(legitimate(yx_price)).toFixed(2)
              : '0.00'
          }

          return (
            rule_price +
            Price.getUnit(rowData.fee_type) +
            '/' +
            sku.sale_unit_name
          )
        },
      },
      {
        field: 'actions',
        name: i18next.t('操作'),
        render: (value, rowData) => {
          const sku = _.find(skus, (s) => {
            return s.id === rowData.id
          })

          if (sku) {
            return i18next.t('已添加')
          }

          // if (rowData?.is_step_price === 1) {
          //   return (
          //     <Popover
          //       showArrow
          //       type='hover'
          //       left
          //       popup={i18next.t('此商品已设置阶梯定价，不可添加')}
          //       style={{ zIndex: 100000 }}
          //     >
          //       {/* <Button />组件加上disabled会使提示失效，所以自己写样式 */}
          //       <button
          //         className='gm-btn gm-btn-default[disabled]'
          //         style={{ cursor: 'not-allowed' }}
          //       >
          //         <i
          //           className='glyphicon glyphicon-ok'
          //           style={{ color: 'rgba(0, 0, 0, 0.5)' }}
          //         />
          //       </button>
          //     </Popover>
          //   )
          // }

          return (
            <Button onClick={this.handlePriceRuleSkuAdd.bind(this, rowData)}>
              <i className='glyphicon glyphicon-ok' />
            </Button>
          )
        },
      },
    ]

    if (is.phone()) {
      columns = _.reject(columns, (col) => {
        return (
          col.field === 'id' ||
          col.field === 'spec' ||
          col.field === 'original_cost'
        )
      })
    }

    if (globalStore.otherInfo.cleanFood) {
      columns = _.filter(columns, (c) => {
        return c.field !== 'cost'
      })
    }

    const searchSpuData = Object.assign({}, this.props.searchSpuData, {
      columns: columns,
    })

    if (viewType === 'view') {
      actionDom = (
        <div>
          <Button onClick={this.props.onDownload}>{i18next.t('导出')}</Button>
        </div>
      )
    } else if (viewType === 'add') {
      actionDom = (
        <div className='clearfix'>
          <Button onClick={this.props.onUpload}>{i18next.t('导入')}</Button>
          {/* 面向商户才有按分类锁价 */}
          {type === 'customer' && (
            <>
              <div className='gm-gap-10' />
              <RuleObjectTypeSwitchBtn
                curType={1}
                onOk={this.handleClearRuleDetailSku}
              />
            </>
          )}
        </div>
      )
    } else {
      actionDom = (
        <div className='clearfix'>
          <Button onClick={this.props.onUpload}>{i18next.t('导入')}</Button>
        </div>
      )
    }

    const titleLeft = (
      <ToolTip
        popup={
          <div className='gm-padding-5'>
            {i18next.t('商品库已删除的商品，在锁价系统中会同步删除')}
          </div>
        }
        className='gm-margin-left-5'
      />
    )

    return (
      <BoxTableS
        info={
          <Flex alignCenter>
            <BoxTable.Info>
              <TableTotalText
                data={[
                  {
                    label: t('商品数'),
                    content: skus.length,
                  },
                ]}
              />
            </BoxTable.Info>
            {titleLeft}
          </Flex>
        }
        action={actionDom}
      >
        {viewType !== 'view' && (
          <DropSelect
            show={this.state.dropSelectShow}
            data={searchSpuData}
            onHide={this.handleDropSelectHide}
            onEnter={this.handleDropSelectEnter}
          >
            <Flex alignCenter>
              <SvgSearch className='gm-text-16 gm-text-desc gm-margin-lr-10' />
              <input
                ref={(ref) => {
                  this.refInput = ref
                }}
                value={this.state.search_input}
                onChange={this.handleSearchInputChange}
                onFocus={this.handleSearchInputFocus}
                className='form-control'
                placeholder={i18next.t('输入商品ID或商品名，快速添加商品')}
                type='search'
              />
            </Flex>
          </DropSelect>
        )}
        <Table
          data={list}
          columns={[
            {
              Header: t('商品名/商品ID'),
              accessor: 'name',
              Cell: ({ original }) => (
                <div>
                  {original.name}
                  <br />
                  <span className='b-second-text-opacity'>
                    <FloatTip
                      skuId={original.id}
                      tip={original.outer_id}
                      showCustomer={globalStore.otherInfo.showSkuOuterId}
                    />
                  </span>
                </div>
              ),
            },
            {
              Header: t('规格'),
              accessor: 'name',
              Cell: ({ original }) =>
                original.sale_ratio +
                (original.std_unit_name_forsale || original.unit_name) +
                '/' +
                original.sale_unit_name,
            },
            {
              Header: (
                <RefPriceTypeSelect
                  postRefPriceType={postRefPriceType}
                  refPriceType={refPriceType}
                />
              ),
              accessor: 'name',
              Cell: ({ original }) => {
                let isSupplierPrice = false
                if (
                  refPriceTypeFlag === 'latest_quote_price' &&
                  original.latest_quote_from_supplier
                ) {
                  isSupplierPrice = true
                } else if (
                  refPriceTypeFlag === 'last_quote_price' &&
                  original.quoted_from_supplier
                ) {
                  isSupplierPrice = true
                }

                const price = _.isNil(original[refPriceTypeFlag])
                  ? '-'
                  : original[refPriceTypeFlag]
                return price === '-' ? (
                  '-'
                ) : (
                  <Flex alignCenter>
                    <div>
                      {Big(price).div(100).toFixed(2) +
                        Price.getUnit(original.fee_type) +
                        '/' +
                        original.std_unit_name_forsale}
                    </div>
                    {isSupplierPrice && (
                      <Popover
                        top
                        showArrow
                        type='hover'
                        popup={<div>{i18next.t('供应商报价')}</div>}
                      >
                        <SvgSupplier
                          className='gm-text-14'
                          style={{
                            color: 'green',
                            marginLeft: '2px',
                          }}
                        />
                      </Popover>
                    )}
                  </Flex>
                )
              },
            },
            {
              Header: t('原价'),
              accessor: 'name',
              Cell: ({ original }) =>
                original.sale_price +
                Price.getUnit(original.fee_type) +
                '/' +
                original.sale_unit_name,
            },
            {
              Header: t('计算规则'),
              accessor: 'rule_type',
              width: 200,
              Cell: ({ original, index }) => {
                const {
                  yx_price,
                  sale_unit_name,
                  sale_price,
                  rule_type,
                  fee_type,
                } = original
                const suffixText =
                  Price.getUnit(fee_type) + '/' + sale_unit_name
                const isEdit = viewType !== 'view'
                const isWarning = Big(sale_price)
                  .plus(legitimate(yx_price))
                  .lt(0)

                return isEdit ? (
                  <SelectInputEdit
                    isWarning={isWarning}
                    id={index}
                    selected={rule_type}
                    inputValue={yx_price}
                    options={RULE_TYPE}
                    onSelect={this.handleRuleTypeChange.bind(
                      this,
                      index,
                      yx_price,
                    )}
                    onInputChange={this.handleYxPriceChange.bind(this, index)}
                    suffixText={suffixText}
                  />
                ) : (
                  <span>
                    {yx_price >= 0 && getRuleType(rule_type).operator}
                    {yx_price}
                    {rule_type === 1 && Price.getUnit(fee_type)}
                  </span>
                )
              },
            },
            {
              Header: t('规则价'),
              accessor: 'yx_price',
              Cell: ({ original }) => {
                const {
                  rule_type,
                  yx_price,
                  sale_price,
                  sale_unit_name,
                  fee_type,
                } = original
                let rule_price = yx_price
                let yxPriceDom = null
                let yxPriceArrowDom = null

                // 计算出规则价
                if (rule_type === ruleTypeMap.VARIATION) {
                  rule_price = Big(sale_price)
                    .plus(legitimate(yx_price))
                    .toString()
                } else if (rule_type === ruleTypeMap.MULTIPLE) {
                  rule_price = Big(sale_price)
                    .times(legitimate(yx_price))
                    .toFixed(2)
                }

                if (
                  rule_price !== '' &&
                  !Big(legitimate(rule_price)).eq(sale_price)
                ) {
                  yxPriceArrowDom = Big(legitimate(rule_price)).gt(sale_price)
                    ? arrowUp()
                    : arrowDown()
                }

                if (rule_type === ruleTypeMap.FIXED_VALUE) {
                  yxPriceDom = (
                    <span>
                      {rule_price}
                      {Price.getUnit(fee_type) + '/'}
                      {sale_unit_name} {yxPriceArrowDom}
                    </span>
                  )
                } else if (rule_type === ruleTypeMap.VARIATION) {
                  yxPriceDom = (
                    <span>
                      {rule_price}
                      {Price.getUnit(fee_type) + '/'}
                      {sale_unit_name} {yxPriceArrowDom}
                    </span>
                  )
                } else if (rule_type === ruleTypeMap.MULTIPLE) {
                  yxPriceDom = (
                    <span>
                      {rule_price}
                      {Price.getUnit(fee_type) + '/'}
                      {sale_unit_name} {yxPriceArrowDom}
                    </span>
                  )
                }

                return yxPriceDom
              },
            },
            {
              Header: t('销售状态'),
              accessor: 'state',
              Cell: ({ original }) => saleState(original.state),
            },
            {
              Header: TableUtil.OperationHeader,
              width: 100,
              Cell: ({ index }) => {
                return (
                  <Flex justifyCenter>
                    {viewType !== 'view' ? (
                      <Button
                        type='danger'
                        onClick={this.handleDel.bind(this, index)}
                        style={{
                          width: '22px',
                          height: '22px',
                          padding: 0,
                          borderRadius: '3px',
                        }}
                      >
                        <SvgMinus />
                      </Button>
                    ) : (
                      '-'
                    )}
                  </Flex>
                )
              },
            },
          ]}
          getTrProps={(state, rowInfo) => {
            if (rowInfo) {
              return {
                className:
                  rowInfo.index === activeIndex ? 'b-table-tr-twinkle' : '',
              }
            } else {
              return {}
            }
          }}
        />
        <Flex justifyEnd alignCenter className='gm-padding-10'>
          <PaginationV2 data={pagination} onChange={this.handlePage} />
        </Flex>
      </BoxTableS>
    )
  }
}

SkuList.propTypes = {
  searchSpuData: PropTypes.object,
  ruleDetail: PropTypes.object,
  currentPage: PropTypes.number,
  pagination: PropTypes.object,
  ruleTypeMap: PropTypes.object,
  postRefPriceType: PropTypes.func,
  refPriceType: PropTypes.number,
  onDownload: PropTypes.func,
  onUpload: PropTypes.func,
}

export default connect((state) => ({
  ruleDetail: state.price_rule.ruleDetail,
  ruleTypeMap: state.price_rule.ruleTypeMap,
  searchSpuData: state.price_rule.searchSpuData,
  searchSkus: state.price_rule.searchSkus,
  pagination: state.price_rule.pagination,
  currentPage: state.price_rule.currentPage,
}))(SkuList)
