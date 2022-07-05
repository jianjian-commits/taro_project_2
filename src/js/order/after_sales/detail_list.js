import { i18next } from 'gm-i18n'
import React from 'react'
import { Box, Popover, Select, Price, InputNumberV2, Flex } from '@gmfe/react'
import { TableX, expandTableXHOC, editTableXHOC } from '@gmfe/table-x'
import { observer, Observer } from 'mobx-react'
import Big from 'big.js'
import classNames from 'classnames'
import afterSalesStore from './store'
import { isAbnormalFun, isPresent } from '../util'
import { copywriterByTaxRate } from '../../common/service'
import TextTip from '../../common/components/text_tip'
import { afterSalesType } from '../../common/enum'
import { returnTip, returnIcon } from '../../common/components/modify/util'
import SubTable from './components/sub_table'
import Calculator from './components/calculator'

const ExpandTable = expandTableXHOC(editTableXHOC(TableX))

@observer
class AfterSalesDetailList extends React.Component {
  _columns = [
    {
      Header: i18next.t('商品ID'),
      accessor: 'id',
      minWidth: 80,
    },
    {
      Header: i18next.t('商品名'),
      accessor: 'name',
      Cell: (cellProps) => {
        const {
          row: { original },
        } = cellProps
        return (
          <span>
            {original.name}
            {isAbnormalFun(original) ? (
              <Popover
                showArrow
                type='hover'
                left
                bottom
                style={{
                  marginLeft: '-2px',
                  marginTop: '2px',
                  fontSize: '12px',
                }}
                popup={
                  <div className='gm-inline-block gm-bg gm-padding-10'>
                    {i18next.t('当前商品已存在售后异常')}
                  </div>
                }
              >
                <i className='glyphicon glyphicon-warning-sign text-danger gm-padding-left-5' />
              </Popover>
            ) : null}
          </span>
        )
      },
      minWidth: 80,
    },
    {
      Header: i18next.t('下单数'),
      accessor: 'quantity',
      Cell: ({ row: { original } }) =>
        parseFloat(Big(original.quantity || 0).toFixed(2)) +
        original.sale_unit_name,
      minWidth: 80,
    },
    {
      Header: copywriterByTaxRate(
        i18next.t('单价（销售单位）'),
        i18next.t('含税单价（销售单位）'),
      ),
      accessor: 'sale_price',
      Cell: ({ row: { original } }) =>
        `${Big(original.sale_price || 0).toFixed(2)}${
          Price.getUnit(original.fee_type) + '/'
        }${original.sale_unit_name}`,
      minWidth: 100,
    },
    {
      Header: copywriterByTaxRate(
        i18next.t('单价（基本单位）'),
        i18next.t('含税单价（基本单位）'),
      ),
      accessor: 'std_sale_price_forsale',
      Cell: ({ row: { original } }) =>
        `${Big(original.std_sale_price_forsale / 100 || 0).toFixed(2)}${
          Price.getUnit(original.fee_type) + '/'
        }${original.std_unit_name_forsale}`,
      minWidth: 100,
    },
    {
      Header: i18next.t('下单金额'),
      accessor: 'real_item_price',
      Cell: ({ row: { original } }) => {
        const isTiming = original.is_price_timing
        if (original.code) {
          return null
        }
        if (isTiming) {
          return '0.00' + Price.getUnit(original.fee_type)
        } else {
          return original.quantity
            ? Big(original.quantity)
                .times(original.sale_price || 0)
                .toFixed(2) + Price.getUnit(original.fee_type)
            : '0.00' + Price.getUnit(original.fee_type)
        }
      },
      minWidth: 100,
    },
    {
      Header: i18next.t('出库数（基本单位）'),
      accessor: 'std_real_quantity',
      Cell: ({ row: { original: d } }) => {
        const outOfStock = d.out_of_stock
        const isWeigh = d.is_weigh === undefined ? d.is_weight : d.is_weigh
        const weighted = d.weighted
        const isPrint = d.is_print
        const isSellout = !!(outOfStock || d.std_real_quantity === '0')
        const renderTip = () => (
          <TextTip
            content={returnTip(isWeigh, isPrint, weighted, outOfStock)}
            style={{
              marginLeft: '-6px',
              marginTop: '3px',
            }}
          >
            {returnIcon(isWeigh, isPrint, weighted, isSellout)}
          </TextTip>
        )
        if (!outOfStock && d.std_real_quantity) {
          return (
            <div>
              <span
                className={classNames('gm-inline-block', {
                  'b-order-active-color': isWeigh && !!weighted,
                })}
              >
                {d.std_real_quantity + d.std_unit_name_forsale}
              </span>
              {renderTip()}
            </div>
          )
        } else if (outOfStock || d.std_real_quantity === '0') {
          return (
            <div>
              <span className='gm-text-red gm-inline-block'>
                {i18next.t('缺货')}
              </span>
              {renderTip()}
            </div>
          )
        } else {
          return '-'
        }
      },
      minWidth: 120,
    },
    {
      Header: i18next.t('售后类型'),
      accessor: 'after_sales_type',
      Cell: ({ row: { original: d } }) => {
        return (
          <Observer>
            {() => {
              return (
                <Select
                  disabled={d.isTotalDisabled || isPresent(d.sku_type)}
                  data={afterSalesType}
                  value={d.after_sales_type}
                  style={{ minWidth: 80 }}
                  onChange={this.handleChangeAfterSales.bind(
                    this,
                    d.index,
                    'after_sales_type',
                  )}
                />
              )
            }}
          </Observer>
        )
      },
      minWidth: 100,
    },
    {
      Header: i18next.t('记账数'),
      accessor: 'total_billing_number',
      Cell: ({ row: { original: d, index } }) => {
        return (
          <Observer>
            {() => {
              const { _idIndex } = d
              const data = afterSalesStore.abnormalData.get(_idIndex)

              return d.after_sales_type === 1 ? (
                data && data.length === 1 ? (
                  <Flex alignCenter>
                    <InputNumberV2
                      value={d.totalBillingNumber}
                      onChange={this.handleChangeBillingNumber.bind(
                        this,
                        index,
                        _idIndex,
                      )}
                      min={0}
                      max={99999}
                      placeholder={i18next.t('记账数')}
                    />
                    <span className='gm-padding-left-5 gm-padding-right-5'>
                      {d.clean_food
                        ? d.sale_unit_name
                        : d.std_unit_name_forsale}
                    </span>
                    <Calculator
                      sku={d}
                      type={i18next.t('记账')}
                      handleOk={(value) => {
                        d.totalBillingNumber = value
                        this.handleChangeBillingNumber(index, _idIndex, value)
                      }}
                    />
                  </Flex>
                ) : (
                  <div>
                    {d.totalBillingNumber}
                    <div className='gm-gap-5' />
                    {d.clean_food ? d.sale_unit_name : d.std_unit_name_forsale}
                  </div>
                )
              ) : (
                '-'
              )
            }}
          </Observer>
        )
      },
      minWidth: 115,
    },
    {
      Header: i18next.t('总异常数'),
      accessor: 'total_abnormal_count',
      minWidth: 120,
      Cell: ({ row: { original: d } }) => {
        return (
          <Observer>
            {() => {
              return d.after_sales_type === 1 ? (
                <div>
                  {d.totalAbnormalCount}
                  <div className='gm-gap-5' />

                  {d.clean_food
                    ? d.sale_unit_name // 如果是净菜就用销售单位
                    : d.std_unit_name_forsale}
                </div>
              ) : (
                '-'
              )
            }}
          </Observer>
        )
      },
    },
    {
      Header: i18next.t('总退货数'),
      accessor: 'total_refund_count',
      minWidth: 120,
      Cell: ({ row: { original: d } }) => {
        return (
          <Observer>
            {() => {
              return d.after_sales_type === 2 ? (
                <div>
                  {d.totalRefundCount}
                  <div className='gm-gap-5' />
                  {d.clean_food
                    ? d.sale_unit_name // 如果是净菜就用销售单位
                    : d.std_unit_name_forsale}
                </div>
              ) : (
                '-'
              )
            }}
          </Observer>
        )
      },
    },
  ]

  handleSelectChange(index, name, value) {
    afterSalesStore.selectChange(index, name, value)
  }

  handleChangeBillingNumber(index, idIndex, value) {
    const { _std_real_quantity } = afterSalesStore.skuList[index]
    afterSalesStore.changeDetailItem(index, 'totalBillingNumber', value)
    const abnormal = +Big(value || 0)
      .minus(_std_real_quantity)
      .toFixed(2)
    afterSalesStore.changeDetailItem(index, 'totalAbnormalCount', abnormal)
    afterSalesStore.changeSubValue(
      'abnormal',
      idIndex,
      0, // 只有一条数据的时候才能填记账数，因此这里默认改第一条的异常数
      'exception_amount',
      abnormal,
    )
  }

  handleChangeAfterSales(index, name, value) {
    afterSalesStore.selectChange(index, name, value)
    if (value === 1 || value === 2) {
      afterSalesStore.setExpanded({
        ...afterSalesStore.expanded,
        [index]: true,
      })
    } else {
      afterSalesStore.setExpanded({
        ...afterSalesStore.expanded,
        [index]: false,
      })
    }
  }

  render() {
    const { skuList, expanded } = afterSalesStore
    return (
      <Box>
        <ExpandTable
          data={skuList.slice()}
          columns={this._columns}
          expanded={expanded}
          onExpand={(expanded) => afterSalesStore.setExpanded(expanded)}
          SubComponent={(row) => {
            return isPresent(row.original.sku_type) ? null : (
              <SubTable parentRow={row.original} />
            )
          }}
        />
      </Box>
    )
  }
}
export default AfterSalesDetailList
