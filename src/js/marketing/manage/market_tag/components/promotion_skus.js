import { i18next } from 'gm-i18n'
import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import {
  DropSelect,
  Flex,
  Popover,
  InputNumber,
  Select,
  Option,
  Price,
  Button,
} from '@gmfe/react'
import { Table, TableUtil } from '@gmfe/table'

import { tagDetailStore } from '../stores'
import { observer } from 'mobx-react'
import globalStore from 'stores/global'
import Big from 'big.js'
import _ from 'lodash'
import { saleReferencePrice } from 'common/enum'
import FloatTip from 'common/components/float_tip'
import {
  refPriceTypeHOC,
  RefPriceTypeSelect,
} from 'common/components/ref_price_type_hoc'
import classNames from 'classnames'
import { SvgSupplier } from 'gm-svg'

@refPriceTypeHOC(1)
@observer
class PromotionSkus extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activeIndex: null,
      search_input: '',
      dropSelectShow: false,
    }

    this.handleDropSelectHide = ::this.handleDropSelectHide
    this.handleDropSelectEnter = ::this.handleDropSelectEnter
    this.handleSearchInputChange = ::this.handleSearchInputChange
    this.handleSearchInputFocus = ::this.handleSearchInputFocus
    this.handleSearchInputClear = ::this.handleSearchInputClear
  }

  handleDropSelectHide() {
    if (this.state.dropSelectShow) {
      this.setState({
        dropSelectShow: false,
      })
    }
  }

  focusToPriceInput(sku) {
    const inputPrice = ReactDOM.findDOMNode(this[`refPrice${sku.id}`])

    // inputPrice只有在世固定锁价的时候存在
    if (inputPrice) {
      // 键盘弹起之后再scrollIntoView
      setTimeout(() => {
        inputPrice.scrollIntoViewIfNeeded()
      }, 300)
      inputPrice.select()
    } else {
      this[`refTr${sku.id}`].scrollIntoViewIfNeeded()
    }
  }

  handleDropSelectEnter(index) {
    const { searchData, restPurSkus } = tagDetailStore
    const sku = searchData[index]
    const activeIndex = _.findIndex(restPurSkus, (s) => s.id === sku.id)

    Promise.all([
      tagDetailStore.addRestPurSkus(sku),
      this.refInput.blur(),
    ]).then(() => {
      this.setState(
        {
          dropSelectShow: false,
          activeIndex: activeIndex > -1 ? activeIndex : 0,
        },
        () => {
          this.focusToPriceInput(sku, activeIndex)
        },
      )
    })
  }

  handleSearchInputChange(e) {
    const { dropSelectShow } = this.state
    if (!dropSelectShow) this.handleSearchInputFocus()

    this.setState({
      search_input: e.target.value,
    })
    // 记录当前search
    tagDetailStore.setCurrentSearch(e.target.value)
    tagDetailStore.searchRestPurSkus(e.target.value)
  }

  handleSearchInputFocus() {
    console.log('1')
    this.setState({
      dropSelectShow: true,
    })
  }

  handleSearchInputClear() {
    this.setState({
      dropSelectShow: false,
      search_input: '',
    })
  }

  handleDel(val) {
    tagDetailStore.deleteRestPurSkus(val.original.id)
  }

  handleChange(index, name, val) {
    tagDetailStore.changeDetailSkusValue(index, name, val)
  }

  handleRestPurSkusAdd(rowData) {
    tagDetailStore.addRestPurSkus(rowData)

    this.setState(
      {
        dropSelectShow: false,
        activeIndex: 0,
      },
      () => {
        this.focusToPriceInput(rowData)
      },
    )
  }

  handleSecondTagSelect(item, value) {
    const { labelList } = this.props
    const result = _.find(labelList, (item) => item.id === value) || {}
    tagDetailStore.changeRestPurSkusLabel2(item, value, result)
  }

  render() {
    const { dropSelectShow, search_input } = this.state
    const { restPurSkus, searchData } = tagDetailStore
    const {
      isCheckedLabel2,
      labelList,
      postRefPriceType,
      refPriceType,
    } = this.props

    let referencePriceName = ''
    let referencePriceFlag = ''
    _.find(saleReferencePrice, (item) => {
      if (item.type === refPriceType) {
        referencePriceName = item.name
        referencePriceFlag = item.flag

        return true
      }
    })

    const columns = [
      {
        field: 'id',
        name: i18next.t('商品'),
        render: (id, sku) => (
          <div className='b-price-rule-drop-column-name'>
            <div className='gm-ellipsis'>{sku.name}</div>
            <div className='b-second-text-opacity'>
              <FloatTip
                skuId={id}
                tip={sku.outer_id}
                showCustomer={globalStore.otherInfo.showSkuOuterId}
              />
            </div>
          </div>
        ),
      },
      {
        field: 'state',
        name: i18next.t('销售状态'),
        render: (state) => {
          if (state) {
            return (
              <span className='gm-padding-lr-5 label-primary gm-text-white'>
                {i18next.t('上架')}
              </span>
            )
          } else {
            return (
              <span className='gm-padding-lr-5 label-default gm-text-white'>
                {i18next.t('下架')}
              </span>
            )
          }
        },
      },
      {
        field: 'salemenu_name',
        name: i18next.t('报价单'),
      },
      {
        field: 'last_quote_price',
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
                {i18next.t('来源')}：{referencePriceName}
              </div>
            }
          >
            <div>{i18next.t('参考成本')}</div>
          </Popover>
        ),
        render: (last_quote_price, sku) => {
          let isSupplierPrice = false
          if (
            referencePriceFlag === 'latest_quote_price' &&
            sku.latest_quote_from_supplier
          ) {
            isSupplierPrice = true
          } else if (
            referencePriceFlag === 'last_quote_price' &&
            sku.quoted_from_supplier
          ) {
            isSupplierPrice = true
          }
          const val = _.isNil(sku[referencePriceFlag])
            ? '-'
            : sku[referencePriceFlag]
          return (
            <Flex alignCenter>
              <div>
                {val === '-'
                  ? '-'
                  : val +
                    Price.getUnit(sku.fee_type) +
                    '/' +
                    sku.std_unit_name_forsale}
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
        field: 'sale_price',
        name: i18next.t('当前定价'),
        render: (value, rowData) =>
          rowData.is_price_timing ? i18next.t('时价') : value,
      },
      {
        field: 'price',
        name: i18next.t('活动价'),
        render: () => '-',
      },
      {
        field: 'limit_number',
        name: i18next.t('限购数'),
        render: () => '-',
      },
      {
        field: 'actions',
        name: i18next.t('操作'),
        render: (value, rowData) => {
          const sku = _.find(restPurSkus, (s) => {
            return s.id === rowData.id
          })

          if (sku) {
            return i18next.t('已添加')
          }

          return (
            <Button onClick={this.handleRestPurSkusAdd.bind(this, rowData)}>
              <i className='glyphicon glyphicon-ok' />
            </Button>
          )
        },
      },
    ]
    const searchSkuData = {
      loading: false,
      list: searchData.slice(),
      columns: _.filter(columns, (c) => {
        if (!!window.g_clean_food && c.field === 'last_quote_price') {
          return false
        }
        return true
      }),
    }

    return (
      <div className='gm-margin-bottom-20 price-rule'>
        <DropSelect
          show={dropSelectShow}
          data={searchSkuData}
          onHide={this.handleDropSelectHide}
          onEnter={this.handleDropSelectEnter}
        >
          <div className='input-prepend input-group'>
            <span className='input-group-addon'>
              <i className='xfont xfont-search' />
            </span>
            <input
              ref={(ref) => {
                this.refInput = ref
              }}
              value={search_input}
              onChange={this.handleSearchInputChange}
              onFocus={this.handleSearchInputFocus}
              className='form-control'
              placeholder={i18next.t('输入商品ID或商品名，快速添加商品')}
              type='search'
            />
            <span className='input-group-btn'>
              <button onClick={this.handleSearchInputClear} className='btn'>
                <i className='xfont xfont-remove' />
              </button>
            </span>
          </div>
        </DropSelect>
        <Table
          defaultPageSize={9999}
          data={restPurSkus.slice()}
          columns={[
            {
              Header: i18next.t('商品'),
              accessor: 'id',
              Cell: (row) => {
                const {
                  name,
                  sale_price,
                  price,
                  is_price_timing,
                } = row.original
                return (
                  <Flex alignCenter>
                    <span>
                      {name}
                      <br />
                      {row.value}
                    </span>
                    {!is_price_timing && sale_price && price
                      ? Big(sale_price || 0).lte(price) && (
                          <Popover
                            showArrow
                            component={<div />}
                            type='hover'
                            left
                            bottom
                            style={{
                              marginLeft: '-3px',
                              marginTop: '3px',
                              fontSize: '12px',
                            }}
                            popup={
                              <div className='gm-padding-10 gm-bg'>
                                {i18next.t(
                                  '活动价须小于当前定价，否则活动价失效',
                                )}
                              </div>
                            }
                          >
                            <i className='glyphicon glyphicon-warning-sign text-danger gm-padding-left-5' />
                          </Popover>
                        )
                      : null}
                  </Flex>
                )
              },
            },
            {
              Header: i18next.t('销售状态'),
              id: 'state',
              accessor: (d) => {
                if (d.state) {
                  return (
                    <span className='gm-padding-lr-5 label-primary gm-text-white'>
                      {i18next.t('上架')}
                    </span>
                  )
                } else {
                  return (
                    <span className='gm-padding-lr-5 label-default gm-text-white'>
                      {i18next.t('下架')}
                    </span>
                  )
                }
              },
            },
            {
              Header: i18next.t('报价单'),
              accessor: 'salemenu_name',
            },
            {
              Header: (
                <RefPriceTypeSelect
                  postRefPriceType={postRefPriceType}
                  refPriceType={refPriceType}
                />
              ),
              accessor: 'id',
              Cell: (row) => {
                const val = row.original[referencePriceFlag]
                let isSupplierPrice = false
                if (
                  referencePriceFlag === 'latest_quote_price' &&
                  row.original.latest_quote_from_supplier
                ) {
                  isSupplierPrice = true
                } else if (
                  referencePriceFlag === 'last_quote_price' &&
                  row.original.quoted_from_supplier
                ) {
                  isSupplierPrice = true
                }

                return (
                  <Flex alignCenter>
                    <div>
                      {val === '-' || _.isNil(val)
                        ? '-'
                        : val +
                          Price.getUnit(row.original.fee_type) +
                          '/' +
                          row.original.std_unit_name_forsale}
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
              Header: i18next.t('当前定价'),
              id: 'sale_price',
              accessor: (d) =>
                d.is_price_timing
                  ? i18next.t('时价')
                  : Big(d.sale_price || 0).toFixed(2) +
                    Price.getUnit(d.fee_type) +
                    '/' +
                    d.sale_unit_name,
            },
            {
              Header: i18next.t('二级标签'),
              accessor: 'label_2_id',
              show: isCheckedLabel2,
              Cell: (row) => {
                return (
                  <Select
                    size='sm'
                    style={{ minWidth: '80px', width: '100px' }}
                    className='text-left'
                    value={row.value || ''}
                    onChange={this.handleSecondTagSelect.bind(
                      this,
                      row.original,
                    )}
                  >
                    <Option value=''>-</Option>
                    {_.map(labelList, (item, i) => {
                      return (
                        <Option key={i} value={item.id}>
                          {item.name}
                        </Option>
                      )
                    })}
                  </Select>
                )
              },
            },
            {
              Header: i18next.t('活动价'),
              accessor: 'price',
              Cell: (row) => {
                const {
                  is_price_timing,
                  sale_price,
                  sale_unit_name,
                  fee_type,
                } = row.original
                return (
                  <div>
                    <InputNumber
                      style={{ width: '60%' }}
                      value={row.value}
                      min={0}
                      precision={2}
                      ref={(ref) => {
                        this[`refPrice${row.original.id}`] = ref
                      }}
                      className={classNames(
                        'form-control gm-inline-block gm-margin-right-5',
                        {
                          'b-bg-warning': is_price_timing
                            ? false
                            : Big(row.value || 0).gte(sale_price),
                        },
                      )}
                      onChange={this.handleChange.bind(
                        this,
                        row.index,
                        'price',
                      )}
                    />
                    {Price.getUnit(fee_type)}/{sale_unit_name || '-'}
                  </div>
                )
              },
            },
            {
              Header: i18next.t('限购数'),
              accessor: 'limit_number',
              Cell: (row) => {
                return (
                  <div>
                    <InputNumber
                      style={{ width: '120px' }}
                      value={row.value}
                      min={0}
                      precision={2}
                      className='form-control gm-inline-block gm-margin-right-5'
                      onChange={this.handleChange.bind(
                        this,
                        row.index,
                        'limit_number',
                      )}
                    />
                    {row.original.sale_unit_name || '-'}
                  </div>
                )
              },
            },
            {
              width: 80,
              Header: TableUtil.OperationHeader,
              Cell: (row) => (
                <TableUtil.OperationCell>
                  <Button
                    type='danger'
                    onClick={this.handleDel.bind(this, row)}
                  >
                    <i className='glyphicon glyphicon-remove' />
                  </Button>
                </TableUtil.OperationCell>
              ),
            },
          ]}
          noDataText={i18next.t('请添加商品')}
          // style={{height: '600px'}}
          getTrProps={(state, rowInfo) => {
            if (rowInfo) {
              return {
                ref: (ref) => {
                  this[`refTr${rowInfo.original.id}`] = ref
                },
              }
            } else {
              return {
                className: '',
                ref: (ref) => {
                  this[`refTr${rowInfo.original.id}`] = ref
                },
              }
            }
          }}
        />
      </div>
    )
  }
}

PromotionSkus.propTypes = {
  labelList: PropTypes.array,
  isCheckedLabel2: PropTypes.bool,
  postRefPriceType: PropTypes.func,
  refPriceType: PropTypes.number,
}

export default PromotionSkus
