import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Tip,
  Price,
  Button,
  BoxPanel,
  Popover,
  Flex,
  InputNumberV2,
} from '@gmfe/react'
import Big from 'big.js'
import _ from 'lodash'
import { isValid, isNumOrLetter } from '../util'
import { Request } from '@gm-common/request'
import { history } from '../../common/service'
import TableListTips from 'common/components/table_list_tips'
import { EditTable, TableUtil } from '@gmfe/table'
import PropTypes from 'prop-types'

const { OperationHeader, referOfWidth, EditTableOperation } = TableUtil

// Popover组件错误tip
function errorPopover(msg) {
  return (
    <div className='gm-padding-10 gm-bg' style={{ minWidth: '100px' }}>
      <div>{msg || 'error'}</div>
    </div>
  )
}

const Abnormal = ({ name }) => {
  const errorTips = {
    in_stock_amount: i18next.t('入库数（基本单位）必须大于0且小于99999'),
    purchase_amount: i18next.t('入库数（包装单位）必须大于0且小于99999'),
    unit_price: i18next.t('入库单价（基本单位）必须大于0且小于99999'),
    purchase_price: i18next.t('入库单价（包装单位）必须大于0且小于99999'),
    sku_money: i18next.t('入库金额必须大于0且对应货值不能超出1e11'),
    supplier_id: i18next.t('不存在该供应商'),
    purchase_sku_id: i18next.t('不存在该商品信息'),
    remark: i18next.t('备注不能超过15字'),
  }

  return (
    <Popover
      showArrow
      component={<div />}
      type='hover'
      popup={errorPopover(errorTips[name])}
    >
      <span
        style={{
          color: '#fff',
          backgroundColor: '#f00',
        }}
      >
        {i18next.t('异常')}
      </span>
    </Popover>
  )
}

Abnormal.propTypes = {
  name: PropTypes.string,
}

function getValue(val) {
  return isValid(val)
    ? Big(_.toNumber(val)).lte(Big(99999))
      ? Big(_.toNumber(val)).toFixed(2)
      : ''
    : ''
}

class inStockImportDetail extends React.Component {
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
    if (!_.has(this.props.product, 'inStockBatchImportList')) {
      return Tip.warning(i18next.t('请先导入文件'))
    }

    const { inStockBatchImportList } = this.props.product
    const list = []
    _.forEach(inStockBatchImportList, (v) => {
      let [
        supplier_id,
        purchase_sku_id,
        spec_id,
        sku_name,
        spu_name,
        unit_name,
        in_stock_amount,
        unit_price,
        purchase_std_unit_name,
        purchase_amount,
        purchase_price,
        sku_money,
        remark,
      ] = v
      if (supplier_id && purchase_sku_id && isNumOrLetter(purchase_sku_id)) {
        in_stock_amount = getValue(in_stock_amount?.replace(',', ''))
        unit_price = getValue(unit_price)
        purchase_amount = getValue(purchase_amount)
        purchase_price = getValue(purchase_price)
        sku_money = getValue(sku_money)
        let different_price = 0

        console.log('金额' + sku_money)

        // 简化功能，若单价基本单位和入库数基本单位的值都有效，则忽略包装单位的值
        if (isValid(in_stock_amount) && isValid(unit_price)) {
          purchase_amount = ''
          purchase_price = ''
        }

        if (isValid(sku_money)) {
          if (isValid(in_stock_amount) || isValid(unit_price)) {
            if (isValid(in_stock_amount) && isValid(unit_price)) {
              unit_price = Big(_.toNumber(sku_money))
                .div(_.toNumber(in_stock_amount))
                .toFixed(2)
            } else if (isValid(in_stock_amount)) {
              unit_price = Big(_.toNumber(sku_money))
                .div(_.toNumber(in_stock_amount))
                .toFixed(2)
            } else if (isValid(unit_price)) {
              in_stock_amount = Big(_.toNumber(sku_money))
                .div(_.toNumber(unit_price))
                .toFixed(2)
            }
            different_price = Big(_.toNumber(sku_money))
              .minus(
                Big(_.toNumber(unit_price)).times(_.toNumber(in_stock_amount)),
              )
              .toFixed(2)
            console.log(
              'unit_price' + unit_price + 'in_stock_amount' + in_stock_amount,
            )
          } else if (isValid(purchase_amount) || isValid(purchase_price)) {
            if (isValid(purchase_amount) && isValid(purchase_price)) {
              purchase_price = Big(_.toNumber(sku_money))
                .div(_.toNumber(purchase_amount))
                .toFixed(2)
            } else if (isValid(purchase_amount)) {
              purchase_price = Big(_.toNumber(sku_money))
                .div(_.toNumber(purchase_amount))
                .toFixed(2)
            } else if (isValid(purchase_price)) {
              purchase_amount = Big(_.toNumber(sku_money))
                .div(_.toNumber(purchase_price))
                .toFixed(2)
            }
          }
        } else {
          sku_money =
            isValid(in_stock_amount) && isValid(unit_price)
              ? Big(_.toNumber(in_stock_amount))
                  .times(_.toNumber(unit_price))
                  .toFixed(2)
              : ''
          console.log(!(isValid(in_stock_amount) && isValid(unit_price)))
          if (
            isValid(purchase_price) &&
            isValid(purchase_amount) &&
            !(isValid(in_stock_amount) && isValid(unit_price))
          ) {
            sku_money = Big(_.toNumber(purchase_price))
              .times(_.toNumber(purchase_amount))
              .toFixed(2)
          }
        }

        list.push({
          supplier_id: supplier_id,
          purchase_sku_id: purchase_sku_id,
          spec_id,
          sku_name: sku_name || '-',
          spu_name: spu_name || '-',
          in_stock_amount: in_stock_amount,
          unit_name: unit_name || '-',
          purchase_std_unit_name: purchase_std_unit_name || '-',
          different_price: different_price || '0',
          unit_price: unit_price,
          purchase_amount: purchase_amount,
          purchase_price: purchase_price,
          sku_money: sku_money,
          remark,
          error_fields: [],
        })
      }
    })
    this.setState({ list })
  }

  handleDelErrorField(data, name) {
    return _.filter(data, (v) => v !== name)
  }

  handleChangeValue(index, e) {
    const { list } = this.state

    list[index].supplier_id = e.target.value
    list[index].error_fields = this.handleDelErrorField(
      list[index].error_fields,
      'supplier_id',
    )
    this.setState({ list })
  }

  handleChangeNumValue(type, index, value) {
    const { list } = this.state

    list[index][type] = value
    switch (type) {
      case 'in_stock_amount': {
        list[index].sku_money = isValid(value)
          ? isValid(list[index].unit_price)
            ? Big(value).mul(list[index].unit_price).toFixed(2)
            : 0
          : 0
        list[index].error_fields = this.handleDelErrorField(
          list[index].error_fields,
          'in_stock_amount',
        )
        list[index].different_price = 0
        break
      }
      case 'unit_price': {
        list[index].sku_money = isValid(value)
          ? isValid(list[index].in_stock_amount)
            ? Big(value).mul(list[index].in_stock_amount).toFixed(2)
            : 0
          : 0
        list[index].error_fields = this.handleDelErrorField(
          list[index].error_fields,
          'unit_price',
        )
        list[index].different_price = 0
        break
      }
      case 'purchase_amount': {
        list[index].sku_money = isValid(value)
          ? isValid(list[index].purchase_price)
            ? Big(value).mul(list[index].purchase_price).toFixed(2)
            : 0
          : 0
        list[index].error_fields = this.handleDelErrorField(
          list[index].error_fields,
          'purchase_amount',
        )
        list[index].different_price = 0
        break
      }
      case 'purchase_price': {
        list[index].sku_money = isValid(value)
          ? isValid(list[index].purchase_amount)
            ? Big(value).mul(list[index].purchase_amount).toFixed(2)
            : 0
          : 0
        list[index].error_fields = this.handleDelErrorField(
          list[index].error_fields,
          'purchase_price',
        )
        list[index].different_price = 0
        break
      }
      case 'sku_money': {
        const {
          in_stock_amount,
          unit_price,
          purchase_amount,
          purchase_price,
        } = list[index]

        if (!isValid(purchase_amount) || !isValid(purchase_price)) {
          if (!isValid(value) || !isValid(in_stock_amount)) {
            list[index].unit_price = 0
            break
          }

          const unit_price = Big(value).div(in_stock_amount).toFixed(2)
          list[index].unit_price = unit_price
          list[index].different_price = Big(value)
            .minus(Big(Big(unit_price).times(in_stock_amount)).toFixed(4))
            .toFixed(2)
        } else if (!isValid(in_stock_amount) || !isValid(unit_price)) {
          if (!isValid(value) || !isValid(purchase_amount)) {
            list[index].purchase_price = 0
            break
          }

          const purchase_price = Big(value).div(purchase_amount).toFixed(2)
          list[index].purchase_price = purchase_price
          list[index].different_price = Big(value)
            .minus(Big(Big(purchase_price).times(purchase_amount)).toFixed(4))
            .toFixed(2)
        }
        list[index].error_fields = this.handleDelErrorField(
          list[index].error_fields,
          'sku_money',
        )

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
    // 删除该行去掉后台返回的错误
    _.omit(list[index], ['error_fields'])
    this.setState({ list })
  }

  handleReturnError(json) {
    this.setState({ list: json })
  }

  handleSubmit() {
    const { list } = this.state
    const postData = _.map(list, (v) => {
      return _.omit(v, [
        'unit_name',
        'sku_name',
        'spu_name',
        'error_fields',
        'purchase_std_unit_name',
      ])
    })
    Request('/stock/in_stock_sheet/material/import')
      .data({ in_stock_list: JSON.stringify(postData) })
      .code(1)
      .post()
      .then(
        (json) => {
          if (json.code !== 0) {
            Tip.warning(i18next.t('批量导入失败，请修改错误字段后再导入'))

            // 处理返回的错误数据
            this.handleReturnError(json.data)
          } else {
            Tip.success(i18next.t('批量导入入库单成功'))
            history.push('/sales_invoicing/stock_in/product')
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
            isValid(val.sku_money) === false
          )
        })
  }

  render() {
    const { list } = this.state

    return (
      <div>
        <TableListTips
          tips={[i18next.t('同一个供应商的入库商品将在同一个入库单展现')]}
        />
        <BoxPanel
          icon='bill'
          collapse
          title={i18next.t('待导入入库商品')}
          summary={[{ text: i18next.t('合计'), value: list.length }]}
        >
          <EditTable
            data={list}
            columns={[
              {
                Header: OperationHeader,
                accessor: 'action',
                fixed: 'left',
                width: referOfWidth.operationCell,
                Cell: (cellProps) => {
                  return (
                    <EditTableOperation
                      onDeleteRow={() => this.handleDeleteList(cellProps.index)}
                    />
                  )
                },
              },
              {
                Header: i18next.t('供应商编号'),
                accessor: 'supplier_id',
                minWidth: 120,
                Cell: (cellProps) => {
                  const {
                    index,
                    original: { supplier_id },
                  } = cellProps
                  const isError = _.find(
                    list[index].error_fields,
                    (v) => v === 'supplier_id',
                  )

                  return (
                    <div>
                      <input
                        className='form-control'
                        type='text'
                        name='supplier_id'
                        value={supplier_id}
                        onChange={this.handleChangeValue.bind(this, index)}
                      />
                      {isError && <Abnormal name='supplier_id' />}
                    </div>
                  )
                },
              },
              {
                Header: i18next.t('入库规格ID'),
                minWidth: 80,
                accessor: 'purchase_sku_id',
                Cell: (cellProps) => {
                  const {
                    index,
                    original: { purchase_sku_id },
                  } = cellProps

                  const isError = _.find(
                    list[index].error_fields,
                    (v) => v === 'purchase_sku_id',
                  )

                  return (
                    <div>
                      {purchase_sku_id}
                      {isError && <Abnormal name='purchase_sku_id' />}
                    </div>
                  )
                },
              },
              {
                Header: i18next.t('商品名'),
                minWidth: 80,
                accessor: 'sku_name',
              },
              {
                Header: i18next.t('分类'),
                minWidth: 80,
                accessor: 'spu_name',
              },
              {
                Header: i18next.t('入库数（基本单位）'),
                accessor: 'in_stock_amount',
                minWidth: 120,
                Cell: (cellProps) => {
                  const {
                    index,
                    original: { in_stock_amount },
                  } = cellProps
                  const v = in_stock_amount || ''
                  const {
                    unit_name,
                    purchase_price,
                    unit_price,
                    purchase_amount,
                  } = list[index]

                  const isError = _.find(
                    list[index].error_fields,
                    (v) => v === 'in_stock_amount',
                  )

                  return (
                    <Flex alignCenter>
                      <InputNumberV2
                        name='in_stock_amount'
                        value={v}
                        style={{ width: referOfWidth.numberInputBox }}
                        onChange={this.handleChangeNumValue.bind(
                          this,
                          'in_stock_amount',
                          index,
                        )}
                        max={99999}
                        min={0}
                        precision={2}
                        className='form-control'
                        minus
                        disabled={
                          isValid(purchase_price) &&
                          isValid(purchase_amount) &&
                          !(isValid(unit_price) && isValid(in_stock_amount))
                        }
                      />
                      {unit_name}
                      {isError && <Abnormal name='in_stock_amount' />}
                    </Flex>
                  )
                },
              },
              {
                Header: i18next.t('入库单价（基本单位）'),
                accessor: 'unit_price',
                minWidth: 120,
                Cell: (cellProps) => {
                  const {
                    index,
                    original: { unit_price },
                  } = cellProps
                  const {
                    unit_name,
                    purchase_price,
                    purchase_amount,
                    in_stock_amount,
                  } = list[index]
                  const disabled =
                    isValid(purchase_price) &&
                    isValid(purchase_amount) &&
                    !(isValid(unit_price) && isValid(in_stock_amount))
                  const isError = _.find(
                    list[index].error_fields,
                    (v) => v === 'unit_price',
                  )

                  return (
                    <Flex alignCenter>
                      <InputNumberV2
                        style={{ width: referOfWidth.numberInputBox }}
                        name='unit_price'
                        value={unit_price || ''}
                        onChange={this.handleChangeNumValue.bind(
                          this,
                          'unit_price',
                          index,
                        )}
                        max={99999}
                        min={0}
                        precision={2}
                        className='form-control'
                        minus
                        disabled={disabled}
                      />
                      {Price.getUnit() + '/' + unit_name}
                      {isError && <Abnormal name='unit_price' />}
                    </Flex>
                  )
                },
              },
              {
                Header: i18next.t('补差'),
                accessor: 'different_price',
                minWidth: 60,
                Cell: (cellProps) => {
                  const {
                    original: { different_price },
                  } = cellProps
                  return different_price === undefined
                    ? '-'
                    : Big(different_price || 0).toFixed(2) + Price.getUnit()
                },
              },
              {
                Header: i18next.t('入库数（包装单位）'),
                accessor: 'purchase_amount',
                minWidth: 120,
                Cell: (cellProps) => {
                  const {
                    index,
                    original: {
                      purchase_amount,
                      unit_price,
                      in_stock_amount,
                      purchase_price,
                    },
                  } = cellProps
                  const v = purchase_amount || ''
                  const isError = _.find(
                    list[index].error_fields,
                    (v) => v === 'purchase_amount',
                  )

                  return (
                    <Flex alignCenter>
                      <InputNumberV2
                        name='purchase_amount'
                        style={{ width: referOfWidth.numberInputBox }}
                        value={v}
                        onChange={this.handleChangeNumValue.bind(
                          this,
                          'purchase_amount',
                          index,
                        )}
                        max={99999}
                        min={0}
                        precision={2}
                        className='form-control'
                        minus
                        disabled={
                          (isValid(unit_price) && isValid(in_stock_amount)) ||
                          ((isValid(unit_price) || isValid(in_stock_amount)) &&
                            !(
                              isValid(purchase_price) &&
                              isValid(purchase_amount)
                            ))
                        }
                      />
                      {list[index].purchase_std_unit_name}
                      {isError && <Abnormal name='purchase_amount' />}
                    </Flex>
                  )
                },
              },
              {
                Header: i18next.t('入库单价（包装单位）'),
                accessor: 'purchase_price',
                minWidth: 120,
                Cell: (cellProps) => {
                  const {
                    index,
                    original: {
                      purchase_price,
                      unit_price,
                      in_stock_amount,
                      purchase_amount,
                    },
                  } = cellProps
                  const v = purchase_price || ''
                  const isError = _.find(
                    list[index].error_fields,
                    (v) => v === 'purchase_price',
                  )
                  return (
                    <Flex alignCenter>
                      <InputNumberV2
                        name='purchase_price'
                        value={v}
                        style={{ width: referOfWidth.numberInputBox }}
                        onChange={this.handleChangeNumValue.bind(
                          this,
                          'purchase_price',
                          index,
                        )}
                        max={99999}
                        min={0}
                        precision={2}
                        className='form-control'
                        minus
                        disabled={
                          (isValid(unit_price) && isValid(in_stock_amount)) ||
                          ((isValid(unit_price) || isValid(in_stock_amount)) &&
                            !(
                              isValid(purchase_price) &&
                              isValid(purchase_amount)
                            ))
                        }
                      />
                      {Price.getUnit() +
                        '/' +
                        list[index].purchase_std_unit_name}
                      {isError && <Abnormal name='purchase_price' />}
                    </Flex>
                  )
                },
              },
              {
                Header: i18next.t('入库金额'),
                accessor: 'sku_money',
                minWidth: 120,
                Cell: (cellProps) => {
                  const {
                    index,
                    original: { sku_money },
                  } = cellProps
                  const v = sku_money || ''
                  const isError = _.find(
                    list[index].error_fields,
                    (v) => v === 'sku_money',
                  )
                  return (
                    <Flex alignCenter>
                      <InputNumberV2
                        style={{ width: referOfWidth.numberInputBox }}
                        name='sku_money'
                        value={v}
                        onChange={this.handleChangeNumValue.bind(
                          this,
                          'sku_money',
                          index,
                        )}
                        min={0}
                        precision={2}
                        className='form-control input-sm'
                        minus
                      />
                      {Price.getUnit()}
                      {isError && <Abnormal name='sku_money' />}
                    </Flex>
                  )
                },
              },
              {
                Header: i18next.t('商品备注'),
                minWidth: 80,
                accessor: 'remark',
                Cell: (cellProps) => {
                  const {
                    index,
                    original: { remark },
                  } = cellProps
                  const isError = _.find(
                    list[index].error_fields,
                    (v) => v === 'remark',
                  )

                  return (
                    <>
                      {remark}
                      {isError && <Abnormal name='remark' />}
                    </>
                  )
                },
              },
            ]}
          />
          <Flex
            justifyCenter
            className='gm-padding-left-15 gm-padding-bottom-15'
            style={{ marginTop: '60px', marginBottom: '60px' }}
          >
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
        </BoxPanel>
      </div>
    )
  }
}

inStockImportDetail.propTypes = {
  product: PropTypes.object,
}

export default inStockImportDetail
