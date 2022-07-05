import { i18next } from 'gm-i18n'
import React, { Component } from 'react'
import { Price, InputNumber, BoxTable, Button } from '@gmfe/react'
import {
  TableUtil,
  EditTable,
  sortableTable,
  diyTableHOC,
  fixedColumnsTableHOC,
} from '@gmfe/table'
import FieldLock from './components/field_lock'
import FieldLockNormal from './components/field_lock_normal'
import SkuSearch from './components/sku_search'
import { Customize } from 'common/components/customize'

import { isRealSku } from './util'
import { inject, observer, Observer } from 'mobx-react'
import { renderSkuSpec } from 'common/filter'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import Big from 'big.js'
import { DatePicker, ToolTip, Flex } from '@gmfe/react'
import moment from 'moment'

import TableTotalText from 'common/components/table_total_text'
import globalStore from 'stores/global'
import { isLK } from '../../../order/util.js'
import { SvgPassword } from 'gm-svg'

@inject('store')
@observer
class FieldInput extends Component {
  state = {
    isFocus: true,
  }

  handleBlur = () => {
    this.setState({ isFocus: false })
  }

  handleFocus = () => {
    this.setState({ isFocus: true })
  }

  handleChange = (e) => {
    const value = e.target.value
    const { index, field } = this.props
    const { setSkuListItem } = this.props.store
    setSkuListItem(index, { [field]: value })
  }

  handleNumChange = (value) => {
    const { index, field } = this.props
    const { setSkuListItem } = this.props.store
    setSkuListItem(index, { [field]: value })
  }

  render() {
    const { isFocus } = this.state
    const { index, field, store, type, ...rest } = this.props
    const { skuList } = store
    const value = skuList[index][field]

    return type === 'number' ? (
      <InputNumber
        value={value}
        max={999999.99}
        onChange={this.handleNumChange}
        className={classNames('gm-padding-tb-5', {
          'gm-bg-invalid': !isFocus && value === '',
        })}
        onBlur={this.handleBlur}
        onFocus={this.handleFocus}
        {...rest}
      />
    ) : (
      <input
        type='text'
        value={value}
        onChange={this.handleChange}
        className={classNames('gm-padding-tb-5', {
          'gm-bg-invalid': !isFocus && value === '',
        })}
        onBlur={this.handleBlur}
        onFocus={this.handleFocus}
        {...rest}
      />
    )
  }
}

FieldInput.propTypes = {
  store: PropTypes.object,
  index: PropTypes.number,
  field: PropTypes.string,
  type: PropTypes.string,
}
const DiySortTable = fixedColumnsTableHOC(diyTableHOC(sortableTable(EditTable)))
@inject('store')
@observer
class SkuEditor extends Component {
  componentDidMount() {
    // 获取自定义字段
    globalStore.fetchCustomizedConfigs()
  }

  constructor() {
    super()
    this.smInputStyle = { width: '40px' }
    this.mdInputStyle = { width: '70px' }
    this.lgInputStyle = { width: '90px' }
    this.state = { isSorting: false }
    this.tableKey = ''
  }

  handlePlus(index) {
    const { addSkuListItem } = this.props.store
    addSkuListItem(index)
  }

  handleDelete(index) {
    const { deleteSkuListItem } = this.props.store
    deleteSkuListItem(index)
  }

  handleItemChange(index, modify) {
    const { setSkuListItem } = this.props.store
    setSkuListItem(index, modify)
  }

  // 变化前价格
  handlePrevSaleChange(index, modify) {
    const { setSkuListItem, skuList } = this.props.store
    const { before_change_price_forsale } = modify
    const { yx_price, rule_type } = skuList[index] || {}

    setSkuListItem(index, modify)
    if (yx_price && rule_type) {
      const sale_price = Number(
        Big(before_change_price_forsale || 0)
          .times(yx_price)
          .div(100)
          .toFixed(2),
      )
      setSkuListItem(index, {
        sale_price,
        sale_price_lock: 1,
      })
    }
  }

  handleAddQuantityListChange(index, addQuantityIndex, type, value) {
    const { setSkuListAddQuantityList } = this.props.store
    setSkuListAddQuantityList(index, addQuantityIndex, type, value)
  }

  handleAddQuantityListToggleChange(index, modify) {
    const { setSkuListItem } = this.props.store
    setSkuListItem(index, modify)
  }

  // 现价变化
  handleSalePriceChange(index, modify) {
    const { setSkuListItem, skuList } = this.props.store
    const { sale_price } = modify
    const { yx_price, rule_type } = skuList[index] || {}
    setSkuListItem(index, modify)
    if (yx_price && rule_type) {
      const before_change_price_forsale = Number(
        Big(sale_price || 0)
          .div(yx_price)
          .times(100)
          .toFixed(2),
      )
      setSkuListItem(index, {
        before_change_price_forsale,
        before_change_price_forsale_lock: 1,
      })
    }
  }

  handleListItemChange(index, skuObj) {
    const { skuListItemChange } = this.props.store
    skuListItemChange(index, {
      ...skuObj,
      std_unit_name: skuObj.std_unit_name_forsale,
    })
  }

  handleProductionDateChange = (index, skuObj, value) => {
    const { setSkuListItem } = this.props.store
    setSkuListItem(index, {
      ...skuObj,
      sku_production_date: value,
    })
  }

  handleToggleSequence() {
    const {
      saveSortingList,
      sortingListsTrim,
      setCategoryType,
    } = this.props.store
    if (this.state.isSorting) {
      // 保存顺序
      this.setState({ isSorting: !this.state.isSorting })
      saveSortingList()
    } else {
      // 修改顺序
      sortingListsTrim()
        ? this.setState({ isSorting: !this.state.isSorting })
        : this.setState({ isSorting: this.state.isSorting })
    }

    // 重置分类规则
    setCategoryType(null)
  }

  handleCategorySort = () => {
    const {
      skuList,
      setSkuList,
      setCategoryType,
      category_sort_type,
      setSortSkuList,
    } = this.props.store

    // 随机 key 保证拖拽后表格再点击分类排序刷新
    this.tableKey = String(Math.random()).slice(2)

    // 分类 type
    const sortedType = !category_sort_type
      ? 'asc'
      : category_sort_type === 'asc'
      ? 'desc'
      : 'asc'

    // 首字母升序排序
    const sortAsc = (array) => {
      return array.sort((a, b) => {
        return a.category_title_1.localeCompare(b.category_title_1, 'ch')
      })
    }

    // 首字母升序降序
    const sortDesc = (array) => {
      return array.sort((a, b) => {
        return b.category_title_1.localeCompare(a.category_title_1, 'ch')
      })
    }

    const sortedList =
      sortedType === 'asc' ? sortAsc(skuList) : sortDesc(skuList)

    setCategoryType(sortedType)
    setSkuList(sortedList)
    setSortSkuList(sortedList)
  }

  getCustomizedFieldsDetail = () => {
    const {
      order_id,
      orderData: { sync_customized_field },
    } = this.props.store
    const detailConfigs =
      !sync_customized_field || isLK(order_id)
        ? []
        : globalStore.customizedDetailConfigs.filter(
            (v) => v.permission.write_station,
          )
    return detailConfigs.map((v) => ({
      Header: v.field_name,
      minWidth: 100,
      diyEnable: true,
      accessor: v.id,
      id: v.id,
      diyGroupName: i18next.t('基础'),
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const sku = cellProps.original
              const hasLock = sku.detail_customized_field_lock?.[v.id]
              const handleChange = (value) => {
                const customizedField = {
                  ...sku.detail_customized_field,
                  [v.id]: value,
                }
                this.handleItemChange(cellProps.index, {
                  ...sku,
                  detail_customized_field: customizedField,
                  detail_customized_field_lock: {
                    ...sku.detail_customized_field_lock,
                    [v.id]: 1,
                  },
                })
              }
              const handleLockToggle = () => {
                this.handleItemChange(cellProps.index, {
                  ...sku,
                  detail_customized_field_lock: {
                    ...sku.detail_customized_field_lock,
                    [v.id]: Number(!hasLock),
                  },
                })
              }
              const radioList = (v.radio_list || []).map((v) => ({
                value: v.id,
                text: v.name,
              }))
              radioList.unshift({
                value: undefined,
                text: i18next.t('无'),
              })
              return (
                <Flex alignCenter>
                  <Customize
                    type={v.field_type}
                    value={(sku.detail_customized_field || {})[v.id]}
                    onChange={handleChange}
                    data={radioList}
                  />
                  <span
                    className='gm-cursor'
                    title={i18next.t('锁定后，此字段不再同步订单数据')}
                  >
                    <SvgPassword
                      onClick={handleLockToggle}
                      fontSize='1.3em'
                      style={{
                        color: hasLock ? '#56A3F2' : '#bfbfbf',
                        verticalAlign: '-0.3em',
                      }}
                    />
                  </span>
                </Flex>
              )
            }}
          </Observer>
        )
      },
    }))
  }

  render() {
    const { skuList, setSortSkuList, category_sort_type } = this.props.store
    const tableInfo = [
      {
        label: i18next.t('商品列表'),
        content: skuList.length,
      },
    ]
    return (
      <BoxTable
        info={
          <BoxTable.Info>
            <TableTotalText data={tableInfo} />
          </BoxTable.Info>
        }
        action={
          <Button
            type='primary'
            plain
            onClick={this.handleToggleSequence.bind(this)}
          >
            {this.state.isSorting
              ? i18next.t('保存顺序')
              : i18next.t('修改顺序')}
          </Button>
        }
      >
        <DiySortTable
          data={skuList.slice()}
          key={this.tableKey}
          id='step_two_sku'
          onSortChange={(data) => {
            setSortSkuList(data)
          }}
          diyGroupSorting={[i18next.t('基础')]}
          keyField='id'
          isSorting={!this.state.isSorting}
          columns={[
            {
              Header: i18next.t('商品ID'),
              accessor: 'id',
              diyEnable: false,
              minWidth: 100,
              diyGroupName: i18next.t('基础'),
            },
            {
              Header: i18next.t('商品名'),
              id: 'name',
              diyEnable: false,
              minWidth: 120,
              diyGroupName: i18next.t('基础'),
              Cell: ({ original, index }) => {
                const sku = skuList[index]
                const selected = sku.id ? { name: sku.name } : null
                const input = selected ? (
                  <FieldInput
                    index={index}
                    field='name'
                    maxLength='30'
                    style={this.lgInputStyle}
                  />
                ) : (
                  <SkuSearch
                    selected={selected}
                    onSelect={this.handleListItemChange.bind(this, index)}
                    id={sku.id}
                  />
                )
                return isRealSku(sku) || this.state.isSorting
                  ? original.name
                  : input
              },
            },
            {
              Header: this.state.isSorting ? (
                <TableUtil.SortHeader
                  onClick={this.handleCategorySort}
                  type={category_sort_type}
                >
                  {i18next.t('商品分类')}
                </TableUtil.SortHeader>
              ) : (
                i18next.t('商品分类')
              ),
              id: 'category_title_1',
              diyEnable: true,
              minWidth: 100,
              diyGroupName: i18next.t('基础'),
              diyItemText: i18next.t('商品分类'),
              Cell: ({ original, index }) => {
                return isRealSku(skuList[index]) || this.state.isSorting ? (
                  original.category_title_1
                ) : (
                  <FieldInput
                    index={index}
                    field='category_title_1'
                    maxLength='20'
                    style={this.mdInputStyle}
                  />
                )
              },
            },
            {
              Header: i18next.t('商品规格'),
              id: 'spec',
              minWidth: 160,
              diyEnable: true,
              diyGroupName: i18next.t('基础'),
              Cell: ({ original, index }) => {
                return isRealSku(skuList[index]) || this.state.isSorting ? (
                  renderSkuSpec(skuList[index])
                ) : (
                  <div>
                    <FieldInput
                      index={index}
                      field='sale_ratio'
                      type='number'
                      style={this.smInputStyle}
                    />
                    <FieldInput
                      index={index}
                      field='std_unit_name'
                      style={this.smInputStyle}
                    />
                    /
                    <FieldInput
                      index={index}
                      field='sale_unit_name'
                      style={this.smInputStyle}
                    />
                  </div>
                )
              },
            },
            {
              Header: (
                <Flex>
                  {i18next.t('变化前原单价（销售单位）')}
                  <ToolTip
                    popup={
                      <div className='gm-padding-5' style={{ width: '150px' }}>
                        {i18next.t('同步报价单价格')}
                      </div>
                    }
                  />
                </Flex>
              ),
              accessor: 'before_change_price_forsale',
              id: 'before_change_price_forsale',
              diyEnable: true,
              diyGroupName: i18next.t('基础'),
              diyItemText: i18next.t('变化前原单价（销售单位'),
              minWidth: 100,
              Cell: ({ original, index }) =>
                this.state.isSorting ? (
                  original.before_change_price_forsale
                ) : (
                  <FieldLock
                    data={skuList[index]}
                    field='before_change_price_forsale'
                    hasLock={isRealSku(skuList[index])}
                    onInputChange={this.handlePrevSaleChange.bind(this, index)}
                    onLockToggle={this.handleItemChange.bind(this, index)}
                  />
                ),
            },
            {
              Header: (
                <Flex>
                  {i18next.t('变化率')}
                  <ToolTip
                    popup={
                      <div className='gm-padding-5' style={{ width: '150px' }}>
                        {i18next.t(
                          globalStore?.orderInfo?.contract_rate_format === 1
                            ? '表征变化，值为分数形式，可为负值'
                            : '表征折扣，值为大于0的小数',
                        )}
                      </div>
                    }
                  />
                </Flex>
              ),
              accessor: 'change_rate',
              diyEnable: true,
              minWidth: 100,
              diyItemText: i18next.t('变化率'),
              id: 'change_rate',
              diyGroupName: i18next.t('基础'),
              Cell: ({ index, original, value }) => (
                <Observer>
                  {() => {
                    const {
                      sale_price,
                      before_change_price_forsale,
                      yx_price,
                    } = original

                    // 未填写现价或原价时 返回占位符 -
                    if (
                      !yx_price &&
                      (!sale_price || !Number(before_change_price_forsale))
                    )
                      return '-'

                    const change_rate = yx_price
                      ? yx_price / 100
                      : Number(sale_price) / Number(before_change_price_forsale)

                    return globalStore?.orderInfo?.contract_rate_format === 1
                      ? `${+Big(change_rate - 1)
                          .times(100)
                          .toFixed(2)}%`
                      : +Big(change_rate).toFixed(2)
                  }}
                </Observer>
              ),
            },
            {
              Header: i18next.t('单价(销售单位)'),
              id: 'sale_price',
              diyEnable: true,
              minWidth: 100,
              diyGroupName: i18next.t('基础'),
              Cell: ({ original, index }) =>
                this.state.isSorting ? (
                  original.sale_price
                ) : (
                  <FieldLock
                    data={skuList[index]}
                    field='sale_price'
                    hasLock={isRealSku(skuList[index])}
                    onInputChange={this.handleSalePriceChange.bind(this, index)}
                    onLockToggle={this.handleItemChange.bind(this, index)}
                  />
                ),
            },
            {
              Header: i18next.t('下单数'),
              id: 'quantity',
              diyEnable: true,
              minWidth: 100,
              diyGroupName: i18next.t('基础'),
              Cell: ({ original, index }) =>
                this.state.isSorting ? (
                  original.quantity
                ) : (
                  <FieldLock
                    data={skuList[index]}
                    field='quantity'
                    hasLock={isRealSku(skuList[index])}
                    onInputChange={this.handleItemChange.bind(this, index)}
                    onLockToggle={this.handleItemChange.bind(this, index)}
                  />
                ),
            },
            {
              Header: i18next.t('真实出库数(销售单位)'),
              id: 'outstock_quantity',
              diyGroupName: i18next.t('基础'),
              diyEnable: false,
              minWidth: 100,
              Cell: ({ original }) => original.outstock_quantity,
              show: globalStore.isHuaKang(),
            },
            {
              Header: i18next.t('出库数(销售单位)'),
              id: 'real_quantity',
              diyGroupName: i18next.t('基础'),
              diyEnable: false,
              minWidth: 100,
              Cell: ({ original, index }) =>
                this.state.isSorting ? (
                  original.real_quantity
                ) : (
                  <FieldLock
                    data={skuList[index]}
                    field='real_quantity'
                    hasLock={isRealSku(skuList[index])}
                    onInputChange={this.handleItemChange.bind(this, index)}
                    onLockToggle={this.handleItemChange.bind(this, index)}
                  />
                ),
              show: globalStore.isHuaKang(),
            },
            {
              Header: i18next.t('出库数(基本单位)'),
              id: 'real_weight',
              diyEnable: true,
              minWidth: 100,
              diyGroupName: i18next.t('基础'),
              Cell: ({ original, index }) =>
                this.state.isSorting ? (
                  original.real_weight
                ) : (
                  <FieldLock
                    data={skuList[index]}
                    field='real_weight'
                    hasLock={isRealSku(skuList[index])}
                    onInputChange={this.handleItemChange.bind(this, index)}
                    onLockToggle={this.handleItemChange.bind(this, index)}
                  />
                ),
              show: !globalStore.isHuaKang(),
            },
            {
              Header: i18next.t('商品生产日期'),
              accessor: 'sku_production_date',
              diyEnable: true,
              minWidth: 130,
              diyGroupName: i18next.t('基础'),
              Cell: (cellProps) =>
                this.state.isSorting ? (
                  cellProps.original?.sku_production_date ?? '-'
                ) : (
                  <Observer>
                    {() => {
                      return (
                        <DatePicker
                          date={cellProps.original?.sku_production_date}
                          onChange={(value) => {
                            const date = value
                              ? moment(value).format('YYYY-MM-DD')
                              : null
                            this.handleProductionDateChange(
                              cellProps.index,
                              cellProps.original,
                              date,
                            )
                          }}
                          placeholder='选择日期'
                        />
                      )
                    }}
                  </Observer>
                ),
            },
            {
              Header: i18next.t('出库金额'),
              id: 'real_item_price',
              diyEnable: true,
              minWidth: 100,
              diyGroupName: i18next.t('基础'),
              Cell: ({ original }) =>
                Big(original.real_item_price || 0).toFixed(2) +
                Price.getUnit(original.fee_type),
            },
            {
              Header: i18next.t('自采数(销售单位)'),
              id: 'self_pick_quantity',
              diyGroupName: i18next.t('基础'),
              diyEnable: false,
              minWidth: 140,
              Cell: ({ original, index }) =>
                this.state.isSorting ? (
                  original.self_pick_quantity
                ) : (
                  <InputNumber
                    className='gm-padding-tb-5'
                    value={original.self_pick_quantity}
                    style={{ width: '70px' }}
                    max={999999.99}
                    onChange={(value) =>
                      this.handleItemChange(index, {
                        self_pick_quantity: value,
                      })
                    }
                  />
                ),
              show: globalStore.isHuaKang(),
            },
            {
              Header: i18next.t('自采金额'),
              id: 'self_item_price',
              diyEnable: false,
              diyGroupName: i18next.t('基础'),
              minWidth: 100,
              Cell: ({ original }) =>
                Big(
                  original.sale_price * (original.self_pick_quantity || 0),
                ).toFixed(2) + Price.getUnit(original.fee_type),
              show: globalStore.isHuaKang(),
            },
            {
              Header: i18next.t('商品备注'),
              id: 'spu_remark',
              diyEnable: true,
              minWidth: 100,
              diyGroupName: i18next.t('基础'),
              Cell: ({ original, index }) =>
                this.state.isSorting ? (
                  original.spu_remark
                ) : (
                  <FieldLockNormal
                    data={skuList[index]}
                    field='spu_remark'
                    hasLock={isRealSku(skuList[index])}
                    onInputChange={this.handleItemChange.bind(this, index)}
                    onLockToggle={this.handleItemChange.bind(this, index)}
                  />
                ),
              show: !globalStore.isHuaKang(),
            },
            {
              Header: i18next.t('实际下单数'),
              diyEnable: true,
              minWidth: 100,
              diyGroupName: i18next.t('基础'),
              show: false,
              id: 'order_quantity',
              Cell: ({ original }) =>
                Big(original?.order_quantity || 0).toFixed(2) || '-',
            },
            {
              Header: i18next.t('加单数1'),
              diyEnable: true,
              minWidth: 100,
              diyGroupName: i18next.t('基础'),
              show: false,
              id: 'add_quantity_list_0',
              Cell: ({ original, index }) =>
                this.state.isSorting ? (
                  skuList?.[index]?.add_quantity_list?.[0].val ?? '-'
                ) : (
                  <InputNumber
                    min={0}
                    precision={2}
                    value={skuList?.[index]?.add_quantity_list?.[0]?.val ?? ''}
                    onChange={this.handleAddQuantityListChange.bind(
                      this,
                      index,
                      0,
                      'val',
                    )}
                    style={{ width: '70px' }}
                    className={classNames('gm-padding-tb-5')}
                  />
                ),
            },
            {
              Header: i18next.t('加单数2'),
              diyEnable: true,
              minWidth: 100,
              diyGroupName: i18next.t('基础'),
              show: false,
              id: 'add_quantity_list_1',
              Cell: ({ original, index }) =>
                this.state.isSorting ? (
                  skuList?.[index]?.add_quantity_list?.[1].val ?? '-'
                ) : (
                  <InputNumber
                    min={0}
                    precision={2}
                    value={skuList?.[index]?.add_quantity_list?.[1]?.val ?? ''}
                    onChange={this.handleAddQuantityListChange.bind(
                      this,
                      index,
                      1,
                      'val',
                    )}
                    style={{ width: '70px' }}
                    className={classNames('gm-padding-tb-5')}
                  />
                ),
            },
            {
              Header: i18next.t('加单数3'),
              diyEnable: true,
              minWidth: 100,
              diyGroupName: i18next.t('基础'),
              show: false,
              id: 'add_quantity_list_2',
              Cell: ({ original, index }) =>
                this.state.isSorting ? (
                  skuList?.[index]?.add_quantity_list?.[2].val ?? '-'
                ) : (
                  <InputNumber
                    min={0}
                    precision={2}
                    value={skuList?.[index]?.add_quantity_list?.[2]?.val ?? ''}
                    onChange={this.handleAddQuantityListChange.bind(
                      this,
                      index,
                      2,
                      'val',
                    )}
                    style={{ width: '70px' }}
                    className={classNames('gm-padding-tb-5')}
                  />
                ),
            },
            {
              Header: i18next.t('加单数4'),
              diyEnable: true,
              minWidth: 100,
              diyGroupName: i18next.t('基础'),
              show: false,
              id: 'add_quantity_list_3',
              Cell: ({ original, index }) =>
                this.state.isSorting ? (
                  skuList?.[index]?.add_quantity_list?.[3].val ?? '-'
                ) : (
                  <InputNumber
                    min={0}
                    precision={2}
                    value={skuList?.[index]?.add_quantity_list?.[3]?.val ?? ''}
                    onChange={this.handleAddQuantityListChange.bind(
                      this,
                      index,
                      3,
                      'val',
                    )}
                    style={{ width: '70px' }}
                    className={classNames('gm-padding-tb-5')}
                  />
                ),
            },
            {
              Header: i18next.t('加单金额1'),
              diyEnable: true,
              minWidth: 100,
              diyGroupName: i18next.t('基础'),
              show: false,
              id: 'add_quantity_list_0_amount',
              Cell: ({ original, index }) =>
                Big(
                  skuList?.[index]?.add_quantity_list?.[0]?.amount || 0,
                ).toFixed(2),
            },
            {
              Header: i18next.t('加单金额2'),
              diyEnable: true,
              minWidth: 100,
              diyGroupName: i18next.t('基础'),
              show: false,
              id: 'add_quantity_list_1_amount',
              Cell: ({ original, index }) =>
                Big(
                  skuList?.[index]?.add_quantity_list?.[1]?.amount || 0,
                ).toFixed(2),
            },
            {
              Header: i18next.t('加单金额3'),
              diyEnable: true,
              minWidth: 100,
              diyGroupName: i18next.t('基础'),
              show: false,
              id: 'add_quantity_list_2_amount',
              Cell: ({ original, index }) =>
                Big(
                  skuList?.[index]?.add_quantity_list?.[2]?.amount || 0,
                ).toFixed(2),
            },
            {
              Header: i18next.t('加单金额4'),
              diyEnable: true,
              minWidth: 100,
              diyGroupName: i18next.t('基础'),
              show: false,
              id: 'add_quantity_list_3_amount',
              Cell: ({ original, index }) =>
                Big(
                  skuList?.[index]?.add_quantity_list?.[3]?.amount || 0,
                ).toFixed(2),
            },
            {
              Header: i18next.t('套账下单总数'),
              diyEnable: true,
              minWidth: 100,
              diyGroupName: i18next.t('基础'),
              show: false,
              id: 'sku_account_quantity',
              Cell: ({ original, index }) =>
                Big(skuList?.[index]?.sku_account_quantity || 0).toFixed(2),
            },
            {
              Header: i18next.t('套账出库总数'),
              diyEnable: true,
              minWidth: 100,
              diyGroupName: i18next.t('基础'),
              show: false,
              id: 'sku_account_outstock_quantity',
              Cell: ({ original, index }) =>
                Big(
                  skuList?.[index]?.sku_account_outstock_quantity || 0,
                ).toFixed(2),
            },
            {
              Header: i18next.t('套账下单金额'),
              diyEnable: true,
              minWidth: 100,
              diyGroupName: i18next.t('基础'),
              show: false,
              id: 'sku_account_amount',
              Cell: ({ original, index }) =>
                Big(skuList?.[index]?.sku_account_amount || 0).toFixed(2),
            },
            {
              Header: i18next.t('套账出库金额'),
              diyEnable: true,
              minWidth: 100,
              diyGroupName: i18next.t('基础'),
              show: false,
              id: 'sku_account_outstock_amount',
              Cell: ({ original, index }) =>
                Big(skuList?.[index]?.sku_account_outstock_amount || 0).toFixed(
                  2,
                ),
            },
            {
              Header: i18next.t('总加单金额'),
              diyEnable: true,
              minWidth: 100,
              diyGroupName: i18next.t('基础'),
              show: false,
              id: 'add_quantity_amount',
              Cell: ({ original, index }) =>
                Big(skuList?.[index]?.add_quantity_amount || 0).toFixed(2),
            },
            {
              Header: TableUtil.OperationHeader,
              fixed: 'right',
              diyEnable: true,
              diyGroupName: i18next.t('基础'),
              width: 100,
              Cell: ({ index }) =>
                this.state.isSorting ? (
                  <TableUtil.OperationCell>
                    <i className='xfont xfont-sort' />
                  </TableUtil.OperationCell>
                ) : (
                  <TableUtil.EditTableOperation
                    onAddRow={this.handlePlus.bind(this, index)}
                    onDeleteRow={this.handleDelete.bind(this, index)}
                  />
                ),
            },
          ].concat(this.getCustomizedFieldsDetail())}
        />
      </BoxTable>
    )
  }
}

SkuEditor.propTypes = {
  store: PropTypes.object,
}

export default SkuEditor
