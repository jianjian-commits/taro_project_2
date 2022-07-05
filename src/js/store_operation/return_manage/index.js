import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import ReturnSearchPanel from './filter'
import {
  Dialog,
  Tip,
  Flex,
  InputNumber,
  Price,
  Popover,
  Select,
  MoreSelect,
  Input,
  Button,
  BoxTable,
  Pagination,
} from '@gmfe/react'

import _ from 'lodash'
import Big from 'big.js'
import moment from 'moment'
import { isNumber } from 'common/util'

import BatchSelect from 'common/components/product_location_dialog'
import actions from '../../actions'
import classNames from 'classnames'
import { SvgXinxi } from 'gm-svg'
import globalStore from 'stores/global'
import {
  TableX,
  TableXUtil,
  diyTableXHOC,
  fixedColumnsTableXHOC,
} from '@gmfe/table-x'

import './style.less'
import TableTotalText from 'common/components/table_total_text'
import SupplierDel from '../../common/components/supplier_del_sign'
import SvgRecall from 'svg/recall.svg'
import styled from 'styled-components'

const ReCallStyled = styled(SvgRecall)`
  font-size: 14px;
`

const {
  OperationHeader,
  TABLE_X,
  OperationRowEdit,
  OperationIconTip,
} = TableXUtil
const FixedColumnsDiyTableX = fixedColumnsTableXHOC(diyTableXHOC(TableX))

class Return extends React.Component {
  columns = [
    {
      Header: i18next.t('下单日期'),
      accessor: 'date_time',
      diyEnable: false,
      diyGroupName: i18next.t('基础字段'),
      minWidth: 140,
      fixed: 'left',
      Cell: ({
        row: {
          original: { date_time },
        },
      }) => <span>{moment(date_time).format('YYYY-MM-DD HH:mm')}</span>,
    },
    {
      Header: i18next.t('待处理商品'),
      accessor: 'sku_id',
      diyEnable: false,
      diyGroupName: i18next.t('基础字段'),
      minWidth: 240,
      fixed: 'left',
      Cell: ({ row: { original } }) => {
        const { sku_id, sku_name, spu_status } = original
        return (
          <Flex>
            <Popover showArrow type='hover' popup={this.renderPopup(original)}>
              <span>
                {sku_name}({sku_id})
              </span>
            </Popover>
            {!spu_status && (
              <Popover
                showArrow
                type='hover'
                popup={
                  <div
                    className='gm-border gm-padding-5 gm-bg gm-text-12'
                    style={{ width: '100px' }}
                  >
                    {i18next.t('该商品已被删除')}
                  </div>
                }
              >
                <span style={{ lineHeight: '36px' }}>
                  <SvgXinxi style={{ color: 'red', marginLeft: '5px' }} />
                </span>
              </Popover>
            )}
          </Flex>
        )
      },
    },
    {
      Header: i18next.t('应退数/应退金额'),
      diyEnable: false,
      accessor: 'request_amount',
      minWidth: 140,
      diyGroupName: i18next.t('基础字段'),
      Cell: ({
        row: {
          original: {
            request_amount,
            clean_food,
            sale_unit_name,
            std_unit_name,
            request_refund_money,
          },
        },
      }) =>
        `${request_amount}${clean_food ? sale_unit_name : std_unit_name}/${Big(
          request_refund_money,
        ).toFixed(2)}${Price.getUnit()}`, // 应退数已换算成销售单位，后台返回基本单位
    },
    {
      Header: i18next.t('处理方式'),
      diyEnable: false,
      accessor: 'solution_id',
      minWidth: 120,
      diyGroupName: i18next.t('基础字段'),
      Cell: ({ row: { original } }) => {
        const { solution_id, editState, new_solution_id } = original
        const name = solution_id
          ? solution_id === 160
            ? i18next.t('二次入库')
            : i18next.t('放弃取货')
          : '-'
        const {
          buy_sell_return_manage: {
            search_option: { refund_solution },
          },
        } = this.props
        const selectList = _.map(refund_solution, (value, key) => ({
          value: key,
          text: value,
        }))
        return editState ? (
          <Select
            style={{ minWidth: '120px' }}
            onChange={(event) =>
              this.handleChangeValue(event, original, 'new_solution_id')
            }
            data={selectList}
            value={new_solution_id || 160}
          />
        ) : (
          name
        )
      },
    },
    {
      Header: i18next.t('实退数'),
      diyEnable: false,
      accessor: 'real_amount',
      diyGroupName: i18next.t('基础字段'),
      minWidth: 120,
      Cell: ({ row: { original } }) => {
        const {
          real_amount,
          solution_id,
          clean_food,
          sale_unit_name,
          std_unit_name,
          editState,
          sale_ratio,
          new_real_amount,
          std_ratio,
        } = original
        // 净菜逻辑，用户输入销售单位，直接传销售单位，展示数据后台传基本单位，所以需要换算
        const showValue = clean_food
          ? Big(real_amount || 0)
              .div(sale_ratio)
              .div(std_ratio) // 兼容供港
              .toFixed(2) + sale_unit_name
          : real_amount + std_unit_name
        const value = solution_id === 160 ? showValue : '-'

        const { isWarning, canEdit } = this.state
        const warning = isWarning && !isNumber(real_amount)
        return editState ? (
          <div
            className={classNames({
              'has-error': warning,
            })}
          >
            <InputNumber
              value={new_real_amount}
              onChange={(event) =>
                this.handleChangeValue(event, original, 'new_real_amount')
              }
              placeholder={i18next.t('实退数')}
              min={0}
              precision={2}
              className='form-control'
              disabled={!canEdit}
            />
          </div>
        ) : (
          value
        )
      },
    },
    {
      Header: i18next.t('实退金额'),
      diyEnable: false,
      accessor: 'real_refund_money',
      minWidth: 120,
      diyGroupName: i18next.t('基础字段'),
      Cell: (cellProps) => {
        const {
          // 这一期先默认 '-'
          new_real_amount,
          editState,
          real_refund_money,
          request_refund_money,
          request_amount,
        } = cellProps.row.original
        const unitPrice = Big(request_refund_money).div(request_amount)
        return editState
          ? // ? '-'
            `${unitPrice
              .times(new_real_amount || 0)
              .toFixed(2)}${Price.getUnit()}`
          : `${Big(real_refund_money || 0).toFixed(2)}${Price.getUnit()}`
      },
    },
    {
      Header: i18next.t('实退金额（不含税）'),
      accessor: 'refund_in_money_no_tax',
      minWidth: 160,
      diyGroupName: i18next.t('基础字段'),
      Cell: (cellProps) => {
        const {
          editState,
          refund_in_money_no_tax,
          tax_rate,
          new_real_amount,
          request_refund_money,
          request_amount,
        } = cellProps.row.original
        const unitPrice = Big(request_refund_money).div(request_amount)
        const new_refund_money = unitPrice.times(new_real_amount || 0)
        const money = new_refund_money
          .div(Big(tax_rate).div(10000).plus(1))
          .toFixed(2)
        return editState
          ? `${money}${Price.getUnit()}`
          : `${Big(refund_in_money_no_tax || 0).toFixed(2)}${Price.getUnit()}`
      },
    },
    {
      Header: i18next.t('销项税率'),
      accessor: 'tax_rate',
      minWidth: 120,
      diyGroupName: i18next.t('基础字段'),
      Cell: (cellProps) => {
        const { tax_rate } = cellProps.row.original
        if (_.isNil(tax_rate)) {
          return '-'
        }
        return `${Big(tax_rate).div(100).toFixed(2)}%`
      },
    },
    {
      Header: i18next.t('销项税额'),
      accessor: 'tax_money',
      minWidth: 120,
      diyGroupName: i18next.t('基础字段'),
      Cell: (cellProps) => {
        const {
          editState,
          tax_rate,
          tax_money,
          new_real_amount,
          request_refund_money,
          request_amount,
        } = cellProps.row.original
        const unitPrice = Big(request_refund_money).div(request_amount)
        const new_refund_money = unitPrice.times(new_real_amount || 0)
        const money = Big(new_refund_money)
          .times(Big(tax_rate).div(10000))
          .div(Big(tax_rate).div(10000).plus(1))
          .toFixed(2)

        return editState
          ? `${money}${Price.getUnit()}`
          : `${Big(tax_money || 0).toFixed(2)}${Price.getUnit()}`
      },
    },
    {
      Header: i18next.t('入库数'),
      diyEnable: false,
      accessor: 'store_amount',
      minWidth: 120,
      diyGroupName: i18next.t('基础字段'),
      Cell: ({ row: { original } }) => {
        const {
          store_amount,
          solution_id,
          clean_food,
          sale_unit_name,
          std_unit_name,
          editState,
          new_store_amount,
          sale_ratio,
          std_ratio,
        } = original
        // 净菜逻辑，用户输入销售单位，直接传销售单位，展示数据后台传基本单位，所以需要换算
        const showValue = clean_food
          ? Big(store_amount || 0)
              .div(sale_ratio)
              .div(std_ratio) // 兼容供港
              .toFixed(2) + sale_unit_name
          : store_amount + std_unit_name
        const value = solution_id === 160 ? showValue : '-'

        const { isWarning, canEdit } = this.state
        const warning = isWarning && !isNumber(store_amount)
        return editState ? (
          <div
            className={classNames({
              'has-error': warning,
            })}
          >
            <InputNumber
              value={new_store_amount}
              onChange={(event) =>
                this.handleChangeValue(event, original, 'new_store_amount')
              }
              placeholder={i18next.t('入库数')}
              min={0}
              precision={2}
              className='form-control'
              disabled={!canEdit}
            />
          </div>
        ) : (
          value
        )
      },
    },
    {
      Header: `${i18next.t('入库单价')}${
        globalStore.otherInfo.cleanFood ? i18next.t('(基本单位)') : ''
      }`,
      accessor: 'in_stock_price',
      minWidth: 120,
      diyEnable: false,
      diyGroupName: i18next.t('基础字段'),
      Cell: ({ row: { original } }) => {
        const {
          in_stock_price,
          solution_id,
          std_unit_name,
          editState,
          new_in_stock_price,
        } = original
        const value =
          solution_id === 160
            ? `${Big(in_stock_price).toFixed(2)}${Price.getUnit()}/${
                std_unit_name // 统一不管是否净菜都显示基本单位
              }`
            : '-'
        const { isWarning, canEdit } = this.state
        const warning = isWarning && !isNumber(in_stock_price)
        return editState ? (
          <div className={classNames({ 'has-error': warning })}>
            <InputNumber
              value={new_in_stock_price}
              disabled={!canEdit}
              onChange={(event) =>
                this.handleChangeValue(event, original, 'new_in_stock_price')
              }
              placeholder={new_in_stock_price || i18next.t('入库单价')}
              min={0}
              precision={2}
              className='form-control'
            />
          </div>
        ) : (
          value
        )
      },
    },
    {
      Header: i18next.t('供应商信息'),
      accessor: 'supplier_id',
      diyEnable: false,
      width: 300,
      diyGroupName: i18next.t('基础字段'),
      Cell: ({ row: { original } }) => {
        const {
          supplier_id,
          solution_id,
          supplier_name,
          clean_food,
          editState,
          new_supplier_id,
          new_supplier_name,
          supplier_status,
        } = original
        const { supplyGroup, isWarning, canEdit } = this.state
        const value = solution_id === 160 ? supplier_name : '-'
        const selectSupplier = new_supplier_id
          ? { value: new_supplier_id, text: new_supplier_name }
          : null
        const warning = isWarning && !supplier_id
        return (
          <Flex>
            {supplier_status === 0 && <SupplierDel />}
            {!clean_food && editState ? (
              <div className={classNames({ 'has-error': warning })}>
                <MoreSelect
                  selected={selectSupplier}
                  data={supplyGroup}
                  onSelect={(event) =>
                    this.handleChangeValue(event, original, 'new_supplier_id')
                  }
                  placeholder={i18next.t('请选择供应商')}
                  disabled={!canEdit}
                />
              </div>
            ) : (
              value
            )}
          </Flex>
        )
      },
    },
    {
      Header: OperationHeader,
      width: TABLE_X.WIDTH_OPERATION,
      id: 'operation',
      diyGroupName: i18next.t('基础字段'),
      fixed: 'right',
      diyItemText: i18next.t('操作'),
      Cell: ({ row: { original } }) => {
        const { state, editState, solution_id, refund_id } = original
        return (
          <Flex justifyCenter>
            {state === 4 ? null : (
              <OperationRowEdit
                isEditing={editState}
                onClick={() => this.handleEdit(original)}
                onSave={() => this.handleSave(original)}
                onCancel={this.handleCancel}
              />
            )}
            {solution_id ? (
              <OperationIconTip tip={i18next.t('回撤')}>
                <span
                  className='gm-cursor'
                  onClick={this.handleRecall.bind(this, refund_id)}
                >
                  <ReCallStyled />
                </span>
              </OperationIconTip>
            ) : null}
          </Flex>
        )
      },
    },
  ]

  constructor(props) {
    super(props)
    this.state = {
      pagination: {
        count: 0, // 总数
        offset: 0, // 从第几页开始
        limit: 10, // 每页多少个
      },
      isWarning: false,
      show: false,
      editIndex: -1,
      canEdit: true,
      supplyGroup: [],
      formData: {
        date_from: moment().add(-3, 'd').toDate(),
        date_end: new Date(),
        state: 0, // 退货状态
        station_id: '',
        station_store_id: '',
        order_id: '', // 订单号
        sid: '', // 商户id
        resname: '', // 商户名
      },
    }
    this.rebuildTable()
  }

  rebuildTable = () => {
    if (globalStore.hasPermission('get_shelf')) {
      const option = {
        Header: i18next.t('存放货位'),
        accessor: 'shelf_name',
        diyEnable: false,
        diyGroupName: i18next.t('基础字段'),
        minWidth: 180,
        Cell: ({ row: { original, index } }) => {
          const { shelf_name, solution_id, editState } = original
          const { canEdit } = this.state
          const value = solution_id === 160 ? shelf_name : '-'
          const length = value ? value.length : 0
          if (editState) {
            return (
              <Flex alignCenter className='shelfInput'>
                <Input
                  defaultValue={shelf_name}
                  className='form-control input-sm'
                  disabled={!canEdit}
                  onFocus={(event) => this.handleSelectShelf(index, event)}
                />
                {shelf_name && (
                  <Button
                    onClick={(event) => this.handleClearShelf(original, event)}
                  >
                    &times;
                  </Button>
                )}
              </Flex>
            )
          } else {
            if (Big(length).gt(7)) {
              return (
                <Popover showArrow type='hover' popup={this.hoverTips(value)}>
                  <p className='shelf'>{value}</p>
                </Popover>
              )
            }
            return value || '-'
          }
        },
      }
      this.columns.splice(this.columns.length - 2, 0, option)
    }
    if (globalStore.user.stock_method === 2) {
      const option = {
        Header: i18next.t('入库批次号'),
        diyGroupName: i18next.t('基础字段'),
        minWidth: 240,
        accessor: 'batch_number',
        Cell: ({
          row: {
            original: { batch_number, solution_id },
          },
        }) =>
          solution_id === 160 ? (
            <Popover
              popup={this.hoverTips(batch_number)}
              type='hover'
              showArrow
            >
              <span style={{ color: '#56A3F2' }}>{i18next.t('查看批次')}</span>
            </Popover>
          ) : (
            '-'
          ),
      }
      this.columns.splice(this.columns.length - 2, 0, option)
    }
  }

  componentDidMount() {
    actions.get_search_option() // 获取搜索选项
    actions.get_search_result({
      // 默认获取三天内的数据
      date_from: moment().subtract(3, 'd').format('YYYY-MM-DD'),
      date_end: moment().format('YYYY-MM-DD'),
    })
  }

  renderPopup = (refund) => {
    const {
      order_id,
      station_name,
      resname,
      address_id,
      exception_reason_text,
      driver_name,
      employee_edit_name,
      description,
    } = refund
    return (
      <div
        className='gm-padding-15 gm-bg'
        style={{ width: '200px', color: '#333' }}
      >
        <div>
          {i18next.t('退货订单号')}：{order_id}
        </div>
        <div>
          {i18next.t('商品送货站点')}：{station_name}
        </div>
        <Flex>
          {i18next.t('商户信息')}：{resname + '(' + address_id + ')'}
        </Flex>
        <div>
          {i18next.t('退货原因')}：{exception_reason_text}
        </div>
        <div>
          {i18next.t('取货司机')}：{driver_name}
        </div>
        <div>
          {i18next.t('发起客服')}：{employee_edit_name}
        </div>
        <div>
          {i18next.t('客服备注')}：{description}
        </div>
      </div>
    )
  }

  handleEdit = (value) => {
    value.editState = true
    const { sourceReturnList } = this.props.buy_sell_return_manage

    // 所编辑list的editState设为true
    actions.return_manage_selected(sourceReturnList)
    // 拉取purchase_sku_id对应的供应商列表
    const { purchase_sku_id } = value
    actions.get_supply_list(purchase_sku_id).then(
      (json) => {
        // 获取供应商列表
        const PSMapping = []
        _.forEach(json.data, (PS) => {
          _.forEach(PS.settle_suppliers, (ss) => {
            PSMapping.push({
              value: ss._id,
              text: ss.name,
            })
          })
        })
        this.setState({
          isWarning: false,
          supplyGroup: PSMapping,
          canEdit: true,
        })
      },
      (err) => {
        console.log(err)
      },
    )
  }

  handleCancel = async () => {
    await actions.get_search_result({
      ...this.state.formData,
      date_from: moment(this.state.formData.date_from).format('YYYY-MM-DD'),
      date_end: moment(this.state.formData.date_end).format('YYYY-MM-DD'),
    })
    this.setState({
      isWarning: false,
      canEdit: true,
      supplyGroup: [],
    })
    // const { sourceReturnList } = this.props.buy_sell_return_manage
    // _.forEach(sourceReturnList, (item) => {
    //   item.editState = false
    //   _.forIn(item, (value, key) => {
    //     if (_.includes(key, 'new_')) {
    //       item[key] = undefined
    //     }
    //   })
    // })

    // actions.return_manage_selected(sourceReturnList)
  }

  handleChangeValue = (event, value, key) => {
    switch (key) {
      case 'new_solution_id':
        value.new_solution_id = event
        if (_.toNumber(event) === 160) {
          value.new_real_amount = ''
          this.setState({ canEdit: true })
        } else {
          value.new_real_amount = value.request_amount
          this.handleCalculation(value)
          this.setState({ canEdit: false })
        }
        break
      case 'new_supplier_id':
        value.new_supplier_id = event ? event.value : null
        value.new_supplier_name = event ? event.text : null
        break
      case 'shelf_id':
        value.shelf_id = event ? event.shelf_id : null
        value.shelf_name = event ? event.shelf_name : null
        break
      default:
        value[key] = event
    }
    const { sourceReturnList } = this.props.buy_sell_return_manage
    actions.return_manage_selected(sourceReturnList)
  }

  handleCalculation = (value) => {
    const { tax_rate, new_real_amount } = value
    console.log(tax_rate, new_real_amount)
  }

  handleFilterSupplier = (list, query) => {
    return _.filter(list, (v) => {
      return v.name.indexOf(query) > -1
    })
  }

  handleSelectShelf = (index, e) => {
    e.preventDefault()
    this.setState({
      show: true,
      editIndex: index,
    })
  }

  handleClearShelf = (value, event) => {
    event.preventDefault()
    const { editIndex } = this.state
    const { sourceReturnList } = this.props.buy_sell_return_manage
    this.handleChangeValue(null, sourceReturnList[editIndex], 'shelf_id')
  }

  onShelfSelectCancel = () => {
    this.setState({ show: false })
  }

  onShelfSelectOk = (shelf_id, shelf_name) => {
    const { editIndex } = this.state
    const { sourceReturnList } = this.props.buy_sell_return_manage
    if (shelf_id) {
      this.handleChangeValue(
        { shelf_id, shelf_name },
        sourceReturnList[editIndex],
        'shelf_id',
      )
    }
    this.setState({ show: false })
  }

  handleSave = (value) => {
    const {
      new_solution_id,
      new_in_stock_price,
      new_real_amount,
      new_store_amount,
      request_amount,
      clean_food,
      new_supplier_id,
    } = value
    const relinquishGoods = _.toNumber(new_solution_id) === 157 // 放弃取货

    // 若处理方式为二次入库，则实退数/入库数/入库单价/供应商信息为必填项, 如果是净菜不需要填写供应商
    if (!relinquishGoods) {
      if (
        !(
          isNumber(new_in_stock_price) &&
          isNumber(new_real_amount) &&
          isNumber(new_store_amount) &&
          isNumber(request_amount) &&
          (clean_food || new_supplier_id)
        )
      ) {
        Tip.warning(i18next.t('请填写'))
        this.setState({ isWarning: true })
        return false
      } else if (Big(_.toNumber(new_real_amount)).gt(request_amount)) {
        Tip.warning(i18next.t('实退数不能大于应退数'))
        return false
      } else if (Big(_.toNumber(new_store_amount)).gt(new_real_amount)) {
        Tip.warning(i18next.t('入库数不能大于实退数'))
        return false
      }
    }

    const post_data = []
    post_data.push({
      refund_id: value.refund_id,
      sku_name: value.sku_name,
      sku_id: value.sku_id,
      solution: relinquishGoods ? 157 : 160,
      driver_id: value.driver_id,
      in_stock_price: relinquishGoods ? 0 : value.new_in_stock_price,
      disabled_in_stock_price: !!value.new_in_stock_price,
      real_amount: value.new_real_amount,
      store_amount: relinquishGoods ? 0 : value.new_store_amount,
      request_amount: relinquishGoods ? 0 : value.request_amount,
      description: value.description,
      shelf_name: value.shelf_name,
      shelf_id: value.shelf_id,
      supplier_id: value.new_supplier_id,
      supplier_name: value.new_supplier_name,
      sale_ratio: value.sale_ratio,
      purchase_sku_id: value.purchase_sku_id,
      purchase_sku_version: value.purchase_sku_version,
      remark_type: value.remark_type,
      clean_food: value.clean_food,
      std_ratio: value.std_ratio,
      detail_id: value.detail_id,
    })

    this.setState({
      isWarning: false,
      canEdit: true,
      editIndex: -1,
      supplyGroup: [],
    })

    value.editState = false
    // 所编辑list的editState设为false
    const { sourceReturnList } = this.props.buy_sell_return_manage
    actions.return_manage_selected(sourceReturnList)

    actions.edit_refund(post_data)
  }

  hoverTips = (batch_number) => {
    return (
      <div
        className='gm-padding-10 gm-bg'
        style={{ minWidth: '160px', color: '#333' }}
      >
        {batch_number}
      </div>
    )
  }

  handleChange = (formData) => {
    this.setState({ formData })
  }

  doRecall = (id) => {
    const formData = Object.assign({}, this.state.formData, {
      date_from: moment(this.state.formData.date_from).format('YYYY-MM-DD'),
      date_end: moment(this.state.formData.date_end).format('YYYY-MM-DD'),
      page: Math.floor(
        this.state.pagination.offset / this.state.pagination.limit,
      ),
      num: this.state.pagination.limit,
    })

    return actions.recall_refund_receipt(id).then(() => {
      actions.get_search_result(formData)
    })
  }

  handleRecall = (id) => {
    Dialog.confirm({
      children: (
        <div>
          <div>{i18next.t('撤回操作后: ')}</div>
          <div>{i18next.t('1、如处理方式为二次入库，则库存将回退')}</div>
          <div>{i18next.t('2、可再次入库或放弃取货，确认撤回吗？')}</div>
        </div>
      ),
      title: i18next.t('提示'),
    }).then(this.doRecall.bind(this, id))
  }

  handlePage = (pagination) => {
    const formData = Object.assign({}, this.state.formData, {
      date_from: moment(this.state.formData.date_from).format('YYYY-MM-DD'),
      date_end: moment(this.state.formData.date_end).format('YYYY-MM-DD'),
      count: this.state.pagination.count,
      ...pagination,
    })
    return actions.get_search_result(formData).then((json) => {
      this.setState({
        pagination: json.pagination,
      })
      return json
    })
  }

  render() {
    const buy_sell_return_manage = this.props.buy_sell_return_manage
    const { search_option, search_result } = buy_sell_return_manage
    const pagination = Object.assign({}, this.state.pagination)
    pagination.count = buy_sell_return_manage.search_result.total_num
    const refundList = search_result.refund_list

    const { show, editIndex, formData } = this.state

    return (
      <div>
        <ReturnSearchPanel
          refundState={search_option.refund_state}
          station={search_option.station}
          storeStation={search_option.store_station}
          formData={formData}
          onChange={this.handleChange}
        />
        <BoxTable
          info={
            <TableTotalText
              data={[
                {
                  label: i18next.t('入库记录总数'),
                  content: pagination.count,
                },
              ]}
            />
          }
        >
          <FixedColumnsDiyTableX
            id='return'
            diyGroupSorting={[i18next.t('基础字段')]}
            data={refundList}
            columns={this.columns}
          />
          <Flex justifyEnd alignCenter className='gm-padding-20'>
            <Pagination data={pagination} toPage={this.onPage} />
          </Flex>
        </BoxTable>
        <BatchSelect
          show={show}
          listIndex={editIndex}
          handleShelfSelectCancel={this.onShelfSelectCancel}
          handleShelfSelectOk={this.onShelfSelectOk}
        />
      </div>
    )
  }

  onPage = (obj) => {
    const pagination = {
      offset: obj.offset,
      limit: obj.limit,
    }
    this.setState({
      pagination: pagination,
    })
    const formData = Object.assign({}, this.state.formData, {
      date_from: moment(this.state.formData.date_from).format('YYYY-MM-DD'),
      date_end: moment(this.state.formData.date_end).format('YYYY-MM-DD'),
      page: Math.floor(pagination.offset / pagination.limit),
      num: pagination.limit,
    })
    actions.get_search_result(formData)
  }
}

Return.propTypes = {
  buy_sell_return_manage: PropTypes.object,
}

export default Return
