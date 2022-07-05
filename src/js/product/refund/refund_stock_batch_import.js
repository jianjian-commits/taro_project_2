import { i18next } from 'gm-i18n'
import React from 'react'
import { Popover, InputNumber, Tip, Price, Button, Flex } from '@gmfe/react'
import { QuickPanel } from '@gmfe/react-deprecated'
import { Table, TableUtil } from '@gmfe/table'
import Big from 'big.js'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { isValid, isNumOrLetter } from '../util'

import '../actions'
import '../reducer'
import actions from '../../actions'
import { history } from '../../common/service'
import styles from '../product.module.less'

// Popover组件错误tip
function errorPopover(msg) {
  return (
    <div className='gm-padding-10 gm-bg' style={{ width: '150px' }}>
      <div>{msg || 'error'}</div>
    </div>
  )
}

class refundStockImportDetail extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      list: [],
    }

    this.handleDeleteList = ::this.handleDeleteList
    this.handleSubmit = ::this.handleSubmit
    this.handleCancelSubmit = ::this.handleCancelSubmit
  }

  componentDidMount() {
    const { refundStockBatchImportList } = this.props.product

    const list = []
    _.map(refundStockBatchImportList, (v) => {
      if (!v[0] || !v[1]) {
        return false
      } else {
        if (typeof v[4] === 'string') {
          v[4] = v[4].trim()
        }
        if (typeof v[6] === 'string') {
          v[6] = v[6].trim()
        }
        return isNumOrLetter(v[1])
          ? list.push({
              supplier_id: v[0],
              return_sku_id: v[1],
              sku_name: v[2] ? v[2] : '-',
              spu_name: v[3] ? v[3] : '-',
              return_stock_amount: isValid(v[4])
                ? Big(v[4]).lte(Big(999999))
                  ? Big(v[4]).toFixed(2)
                  : ''
                : '',
              unit_name: v[5] ? v[5] : '-',
              unit_price: isValid(v[6])
                ? Big(v[6]).lte(Big(999999))
                  ? Big(v[6]).toFixed(2)
                  : ''
                : '',
              sku_money:
                isValid(v[4]) && isValid(v[6])
                  ? Big(v[4]).lte(Big(999999)) && Big(v[6]).lte(Big(999999))
                    ? Big(v[4]).mul(Big(v[6])).toFixed(2)
                    : ''
                  : '',
              error_fields: [],
              different_price: 0,
            })
          : false
      }
    })
    this.setState({ list })
  }

  handleChangeValue(index, e) {
    const { list } = this.state

    list[index].supplier_id = e.target.value
    list[index].error_fields = _.filter(
      list[index].error_fields,
      (v) => v !== 'supplier_id',
    )
    this.setState({ list })
  }

  handleChangeNumValue(type, index, value) {
    const { list } = this.state

    list[index][type] = value
    switch (type) {
      case 'return_stock_amount': {
        list[index].sku_money = isValid(value)
          ? isValid(list[index].unit_price)
            ? Big(value).mul(list[index].unit_price).toFixed(2)
            : 0
          : 0
        list[index].different_price = 0
        break
      }
      case 'unit_price': {
        list[index].sku_money = isValid(value)
          ? isValid(list[index].return_stock_amount)
            ? Big(value).mul(list[index].return_stock_amount).toFixed(2)
            : 0
          : 0
        list[index].different_price = 0
        break
      }
      case 'sku_money': {
        const { return_stock_amount } = list[index]
        if (!isValid(value) || !isValid(return_stock_amount)) {
          list[index].unit_price = 0
          break
        }

        const unit_price = Big(value)
          .div(list[index].return_stock_amount)
          .toFixed(2)
        list[index].unit_price = unit_price
        list[index].different_price = Big(value)
          .minus(Big(Big(unit_price).times(return_stock_amount)).toFixed(4))
          .toFixed(2)
        break
      }
      default:
        break
    }
    this.setState({ list })
  }

  handleDeleteList(index) {
    const { list } = this.state
    list.splice(index, 1)
    this.setState({ list })
  }

  handleReturnError(json) {
    this.setState({ list: json })
  }

  handleSubmit() {
    const { list } = this.state
    const postData = _.map(list, (v) => {
      return _.omit(v, ['unit_name', 'sku_name', 'spu_name', 'error_fields'])
    })
    actions.product_refund_stock_batch_import_submit(postData).then(
      (json) => {
        if (json.code !== 0) {
          Tip.warning(json.msg)

          // 处理返回的错误数据
          this.handleReturnError(json.data)
        } else {
          Tip.success(i18next.t('批量导入退货单成功'))
          history.push('/sales_invoicing/stock_out/refund')
        }
      },
      (err) => {
        console.log(err)
      },
    )
  }

  handleCancelSubmit(e) {
    e.preventDefault()
    history.go(-1)
  }

  // list的值有效且正确才可点击保存
  isOrderInvalid() {
    const { list } = this.state
    return list.length === 0
      ? true
      : _.find(list, (val) => {
          return (
            val.error_fields.length !== 0 ||
            !!val.supplier_id === false ||
            isValid(val.return_stock_amount) === false ||
            isValid(val.unit_price) === false ||
            isValid(val.sku_money) === false
          )
        })
  }

  render() {
    const { list } = this.state

    return (
      <div>
        <div
          className={'gm-padding-10 gm-margin-bottom-10 ' + styles.importTips}
        >
          <i className='ifont ifont-warning gm-margin-right-10' />
          {i18next.t('同一个供应商的退货商品将在同一个退货单展现')}
        </div>
        <QuickPanel icon='bill' title={i18next.t('待导入退货商品')}>
          <Table
            data={list}
            columns={[
              {
                Header: i18next.t('供应商编号'),
                accessor: 'supplier_id',
                width: 180,
                Cell: ({ original, index }) => {
                  if (
                    _.find(original.error_fields, (v) => v === 'supplier_id')
                  ) {
                    return (
                      <div>
                        <input
                          className='import-form-input'
                          type='text'
                          name='supplier_id'
                          value={original.supplier_id}
                          onChange={this.handleChangeValue.bind(this, index)}
                        />
                        <Popover
                          showArrow
                          component={<div />}
                          type='hover'
                          popup={errorPopover(i18next.t('该供应商不存在'))}
                        >
                          <span
                            style={{ color: '#fff', backgroundColor: '#f00' }}
                          >
                            {i18next.t('异常')}
                          </span>
                        </Popover>
                      </div>
                    )
                  } else {
                    return (
                      <input
                        className='import-form-input'
                        type='text'
                        name='supplier_id'
                        value={original.supplier_id}
                        onChange={this.handleChangeValue.bind(this, index)}
                      />
                    )
                  }
                },
              },
              {
                Header: i18next.t('退货商品ID'),
                accessor: 'return_sku_id',
                width: 90,
                Cell: ({ original, index }) => {
                  if (
                    _.find(original.error_fields, (v) => v === 'return_sku_id')
                  ) {
                    return (
                      <div>
                        {original.return_sku_id}
                        <Popover
                          showArrow
                          component={<div />}
                          type='hover'
                          popup={errorPopover(
                            i18next.t(
                              '当前采购规格已被删除或id错误，请删除此条信息',
                            ),
                          )}
                        >
                          <span
                            style={{ color: '#fff', backgroundColor: '#f00' }}
                          >
                            {i18next.t('异常')}
                          </span>
                        </Popover>
                      </div>
                    )
                  } else {
                    return original.return_sku_id
                  }
                },
              },
              {
                Header: i18next.t('商品名'),
                id: 'sku_name',
                accessor: (d) => d.sku_name || '-',
              },
              {
                Header: i18next.t('分类'),
                id: 'spu_name',
                accessor: (d) => d.spu_name || '-',
              },
              {
                Header: i18next.t('退货数'),
                accessor: 'return_stock_amount',
                width: 200,
                Cell: ({ original, index }) => {
                  const v = original.return_stock_amount || ''
                  return (
                    <div>
                      <InputNumber
                        name='return_stock_amount'
                        value={v}
                        onChange={this.handleChangeNumValue.bind(
                          this,
                          'return_stock_amount',
                          index,
                        )}
                        max={999999}
                        min={0}
                        precision={2}
                        className='import-form-input'
                        minus
                      />
                      {original.unit_name}
                    </div>
                  )
                },
              },
              {
                Header: i18next.t('退货单价'),
                accessor: 'unit_price',
                width: 210,
                Cell: ({ original, index }) => {
                  const v = original.unit_price || ''
                  return (
                    <div>
                      <InputNumber
                        name='unit_price'
                        value={v}
                        onChange={this.handleChangeNumValue.bind(
                          this,
                          'unit_price',
                          index,
                        )}
                        max={999999}
                        min={0}
                        precision={2}
                        className='import-form-input'
                        minus
                      />
                      {Price.getUnit() + '/' + original.unit_name}
                    </div>
                  )
                },
              },
              {
                Header: i18next.t('补差'),
                id: 'different_price',
                accessor: (d) =>
                  d.different_price === undefined
                    ? '-'
                    : Big(d.different_price || 0).toFixed(2) + Price.getUnit(),
              },
              {
                Header: i18next.t('退货金额'),
                accessor: 'sku_money',
                width: 200,
                Cell: ({ original, index }) => {
                  const v = original.sku_money || ''
                  return (
                    <div>
                      <InputNumber
                        name='sku_money'
                        value={v}
                        onChange={this.handleChangeNumValue.bind(
                          this,
                          'sku_money',
                          index,
                        )}
                        max={999999}
                        min={0}
                        precision={2}
                        className='import-form-input'
                        minus
                      />
                      {Price.getUnit()}
                    </div>
                  )
                },
              },
              {
                Header: TableUtil.OperationHeader,
                dragField: true,
                Cell: ({ value, index }) => (
                  <TableUtil.OperationCell>
                    <a
                      style={{ color: '#666' }}
                      onClick={this.handleDeleteList.bind(this, index)}
                    >
                      <i className='glyphicon glyphicon-trash' />
                    </a>
                  </TableUtil.OperationCell>
                ),
              },
            ]}
          />
          <Flex className='gm-padding-left-15 gm-padding-tb-15'>
            <Button
              className='gm-margin-left-15'
              onClick={this.handleCancelSubmit}
            >
              {i18next.t('取消')}
            </Button>
            <div className='gm-gap-10' />
            <Button
              type='primary'
              onClick={this.handleSubmit}
              disabled={!!this.isOrderInvalid()}
            >
              {i18next.t('保存')}
            </Button>
          </Flex>
        </QuickPanel>
      </div>
    )
  }
}

refundStockImportDetail.propTypes = {
  product: PropTypes.object,
}

export default refundStockImportDetail
