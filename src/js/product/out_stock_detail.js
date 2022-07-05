import { i18next } from 'gm-i18n'
import React from 'react'
import { connect } from 'react-redux'
import {
  Flex,
  Tip,
  DropDown,
  DropDownItems,
  DropDownItem,
  Dialog,
  Modal,
  Price,
  Popover,
  RightSideModal,
  Button,
} from '@gmfe/react'
import { QuickDesc, QuickPanel } from '@gmfe/react-deprecated'
import OutStockBatchSelect from './components/out_stock_batch_select'
import moment from 'moment'
import _ from 'lodash'
import Big from 'big.js'
import { isValid, getOutStockConfirmData, closeWindowDialog } from './util'
import OutStockConfim from './components/out_stock_confim'
import globalStore from '../stores/global'
import './actions'
import './reducer'
import actions from '../actions'
import styles from './product.module.less'
import PropTypes from 'prop-types'

import { EditTable, fixedColumnsTableHOC, TableUtil } from '@gmfe/table'

import { KCMoreSelect, KCInputNumberV2, keyboardTableHoc } from '@gmfe/keyboard'
import KeyBoardTips from '../common/components/key_board_tips'
import { isNumber } from '../common/util'

const { OperationHeader, EditTableOperation, referOfWidth } = TableUtil

const KeyboardDiyEditTable = fixedColumnsTableHOC(keyboardTableHoc(EditTable))

const isNullAndUndefined = (data) => {
  return data === null || data === undefined
}

class OutStockDetail extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      editIndex: -1,
      list_details: {},
      selected_batch: [],
    }
    this.handleOutStock = ::this.handleOutStock
    this.handleCancel = ::this.handleCancel
    this.handleSaveDraft = ::this.handleSaveDraft
    this.handleBatchSelected = ::this.handleBatchSelected
    this.handleSelectBatchCancel = ::this.handleSelectBatchCancel
  }

  componentDidMount() {
    actions.product_out_stock_detail(this.props.params.id)
  }

  handleProQuantityChange(index, value) {
    actions.product_out_product_quantity_change(index, value)
  }

  handleDetailAdd() {
    actions.product_out_stock_pro_detail_add()
  }

  handleDetailDel(index) {
    actions.product_out_stock_pro_detail_del(index)
  }

  handleOutStock() {
    this.modifyOutStockInfo(2) // 提交为2
  }

  handleSaveDraft() {
    this.modifyOutStockInfo(1) // 保存为1
  }

  modifyOutStockInfo(submit_type) {
    const { outStockDetail } = this.props.product

    if (
      outStockDetail.details.length === 0 ||
      !_.find(outStockDetail.details, (v) => v.spu_id)
    ) {
      Tip.warning(i18next.t('没有添加出库商品'))
      return
    }

    let listDetails = _.filter(outStockDetail.details, (detail) => {
      return (
        !isNullAndUndefined(detail.spu_id) ||
        !isNullAndUndefined(detail.quantity)
      )
    })

    const invalid = _.find(listDetails, (value) => {
      return !(value.spu_id && isNumber(value.quantity))
    })

    if (!_.isEmpty(invalid)) {
      Tip.warning(i18next.t('填写出库商品信息不完善'))
      return
    }

    // 若计算方式为先进先出，or是净菜站点，批次为必填字段，
    // 但如果该商品被标记缺货了，out_of_stock为true， 则不必判断批次
    if (
      globalStore.otherInfo.cleanFood ||
      globalStore.user.stock_method === 2
    ) {
      if (
        _.find(outStockDetail.details, (d) => {
          return !d.out_of_stock && d.spu_id && _.isEmpty(d.batch_details)
        })
      ) {
        Tip.warning(i18next.t('请选择出库批次'))
        return
      }
    }

    listDetails = _.map(listDetails, (v) => {
      return _.omit(v, ['selected_sum', 'hasEdit', 'change'])
    })

    outStockDetail.out_stock_time =
      outStockDetail.out_stock_time === '-'
        ? moment(new Date()).format('YYYY-MM-DD')
        : moment(outStockDetail.out_stock_time).format('YYYY-MM-DD')

    if (submit_type === 1) {
      this.handleSubmit(outStockDetail, submit_type, listDetails)
    } else {
      actions
        .product_out_stock_confirm({
          id: outStockDetail.id,
          details: JSON.stringify(
            getOutStockConfirmData(listDetails, globalStore.user.stock_method)
          ),
        })
        .then((json) => {
          if (
            json.data &&
            json.data.spu_remain &&
            json.data.spu_remain.length
          ) {
            Modal.render({
              children: (
                <Flex column>
                  <OutStockConfim list={json.data.spu_remain} />
                  <Flex justifyEnd className='gm-margin-top-5'>
                    <Button className='gm-margin-right-5' onClick={Modal.hide}>
                      {i18next.t('取消操作')}
                    </Button>
                    <Button
                      type='primary'
                      onClick={() => {
                        this.handleSubmitAndClose(
                          outStockDetail,
                          submit_type,
                          listDetails
                        )
                      }}
                    >
                      {i18next.t('继续出库')}
                    </Button>
                  </Flex>
                </Flex>
              ),
              title: i18next.t('提醒'),
              style: { width: '500px' },
              onHide: Modal.hide,
            })
          } else {
            this.handleSubmit(outStockDetail, submit_type, listDetails)
          }
        })
    }
  }

  handleSubmitAndClose(outStockDetail, submit_type, listDetails) {
    Modal.hide()
    this.handleSubmit(outStockDetail, submit_type, listDetails)
  }

  handleSubmit(outStockDetail, submit_type, listDetails) {
    // submit_type 1为保存 2为提交
    actions
      .product_out_stock_submit(
        Object.assign(
          {},
          outStockDetail,
          { is_submit: submit_type },
          { details: JSON.stringify(listDetails) }
        )
      )
      .then((json) => {
        actions
          .product_out_stock_detail(this.props.params.id)
          .then(() => {
            if (submit_type === 1) {
              Tip.success(i18next.t('保存成功'))
            }

            if (json.code === -1) {
              Tip.warning(
                i18next.t('所选批次剩余库存不足，请处理标记为异常的出库批次')
              )
              actions.product_out_stock_anomaly(json.data.sku_id)
            }
          })
          .then(() => {
            if (submit_type === 2) {
              // 提交出库单后，点击确定后，自动关闭当前页
              closeWindowDialog('出库单已提交成功')
            }
          })
      })
  }

  handleCancel() {
    const id = this.props.params.id
    Dialog.confirm({
      children: i18next.t('是否删除此单据?'),
      title: i18next.t('确认删除'),
    }).then(
      () => {
        actions.product_out_stock_cancel(id).then(() => {
          actions.product_out_stock_detail(id)
        })
      },
      () => {}
    )
  }

  handleSelect(index, selectedData) {
    actions.product_out_product_name_selected(index, selectedData)

    // 清空批次
    actions.product_out_product_batch_selected(index, [])
    actions.product_out_product_quantity_change(index, '')
  }

  handleFocus(name, index) {
    if (name) {
      actions.product_out_stock_sku_list(name, index)
    } else {
      actions.product_clear_sku_list(index)
    }
  }

  handleSearch(index, value) {
    if (_.trim(value)) {
      return actions.product_out_stock_sku_list(value, index)
    }
  }

  handleBatch(list_details, index) {
    const canSelect =
      _.has(list_details, 'id') && isValid(list_details.quantity)
    const { details } = this.props.product.outStockDetail
    if (!canSelect) {
      Tip.warning(i18next.t('请先填写商品名和出库数'))
      return false
    }

    const selected_batch = []
    _.forEach(details, (de) => {
      if (de.sup_id === list_details.sup_id && de.id !== list_details.id) {
        _.forEach(de.batch_details, (v) => {
          selected_batch.push(v)
        })
      }
    })
    // 现已经增加的列表是否存在重复sup_id，若存在，则把这些list的batch_details传给OutStockBatchSelect组件
    this.setState({
      editIndex: index,
      list_details,
      selected_batch,
    })

    RightSideModal.render({
      children: (
        <OutStockBatchSelect
          details={list_details}
          selected_batch={selected_batch}
          handleBatchSelected={this.handleBatchSelected}
          handleSelectBatchCancel={this.handleSelectBatchCancel}
        />
      ),
      title: i18next.t('选择出库批次'),
      onHide: RightSideModal.hide,
      opacityMask: true,
      style: {
        width: '1000px',
      },
    })
  }

  handleBatchSelected(batch_details) {
    const { editIndex } = this.state
    actions.product_out_product_batch_selected(editIndex, batch_details)
    RightSideModal.hide()
    this.setState({
      editIndex: -1,
      list_details: {},
    })
  }

  handleSelectBatchCancel() {
    RightSideModal.hide()
    this.setState({
      editIndex: -1,
      list_details: {},
    })
  }

  batchTips(batch_details, std_unit_name) {
    return (
      <div
        className='gm-padding-10 gm-bg'
        style={{ color: '#333', width: '350px' }}
      >
        {_.map(batch_details, (batch, index) => (
          <p key={index}>
            {
              i18next.t('KEY192', {
                VAR1: batch.batch_number,
                VAR2: batch.out_stock_base,
                VAR3: std_unit_name,
              }) /* src:batch.batch_number + '：出库' + batch.out_stock_base + std_unit_name => tpl:${VAR1}：出库${VAR2}${VAR3} */
            }
          </p>
        ))}
      </div>
    )
  }

  // cleanBatchTips (list, std_unit_name, sale_unit_name) {
  //   if (!list.length) {
  //     return (
  //       <div className='gm-padding-10 gm-bg' style={{ width: '230px', color: '#333' }}>
  //         {i18next.t('请在分拣软件上扫码关联出库批次')}
  //       </div>
  //     )
  //   } else {
  //     return (
  //       <div className='gm-padding-10 gm-bg' style={{ width: '260px', color: '#333' }}>
  //         {_.map(list, (batch, index) => (
  //           <p key={index}>{i18next.t(
  //             /* src:batch.code + '：出库 1 ' + sale_unit_name + '(' + batch.amount + std_unit_name + ')' => tpl:${VAR1}：出库 1 ${VAR2}(${VAR3}${VAR4}) */'KEY278',
  //             { VAR1: batch.code, VAR2: sale_unit_name, VAR3: batch.amount, VAR4: std_unit_name }
  //           )}</p>
  //         ))}
  //       </div>
  //     )
  //   }
  // }

  popoverPop = (text) => {
    return (
      <div
        className='gm-padding-10 gm-bg'
        style={{ width: '230px', color: '#333' }}
      >
        {text}
      </div>
    )
  }

  render() {
    const { outStockStatusMap, outStockDetail, saleSku } = this.props.product
    const editable = outStockDetail.status === 1 || false
    const is_bind_order = outStockDetail.is_bind_order
    const { details } = outStockDetail
    const detailIds = _.map(details, (de) => de.id)
    const { list_details, selected_batch } = this.state

    let list = []
    _.each(saleSku, (data, index) => {
      list[index] = []

      // 过滤掉已存在sku_id的数据(过滤已选择的sku,避免选择同一个sku)
      const res = {}
      if (data) {
        _.forEach(Object.keys(data), (key) => {
          const ids = details[index]
            ? _.filter(detailIds, details[index].id)
            : detailIds
          const skus = _.filter(
            data[key].skus,
            (sku) => !_.includes(ids, sku.sku_id)
          )

          res[key] = Object.assign({}, data[key], {
            skus: skus,
          })
        })
      }

      _.each(
        _.filter(res, (r) => r.skus.length),
        (d) => {
          list[index].push({
            label: d.category_name,
            children: _.map(d.skus, (sku) => {
              return {
                name: sku.sku_name,
                value: sku.sku_id,
                category: sku.category_id_2_name,
                sale_price: sku.sale_price,
                sale_unit_name: sku.sale_unit_name,
                spu_id: sku.spu_id,
                std_unit_name: sku.std_unit_name,
                sale_ratio: sku.sale_ratio,
                std_ratio: sku.std_ratio,
                text: sku.sku_name,
              }
            }),
          })
        }
      )
    })

    const headerLeft = (
      <Flex alignCenter>
        <div className={styles.title}>{i18next.t('订单号')}:&nbsp;</div>
        <div className={styles.content}>{outStockDetail.id || '-'}</div>
      </Flex>
    )
    const headerRight = (
      <Flex column className='gm-padding-tb-10'>
        <Flex className='gm-padding-tb-5'>
          <Flex flex={1} alignCenter>
            <div className={styles.title}>{i18next.t('商户信息')}:&nbsp;</div>
            <div className={styles.content}>
              {outStockDetail.out_stock_target}
            </div>
          </Flex>
          <Flex flex={1} alignCenter>
            <div className={styles.title}>{i18next.t('出库时间')}:&nbsp;</div>
            <div className={styles.content}>
              {outStockDetail.out_stock_time}
            </div>
          </Flex>
        </Flex>
        <Flex>
          <Flex flex={1} alignCenter>
            <div className={styles.title}>{i18next.t('出库单状态')}:&nbsp;</div>
            <div className={styles.content}>
              {outStockStatusMap[outStockDetail.status]}
            </div>
          </Flex>
          <Flex flex={1} alignCenter>
            <div className={styles.title}>{i18next.t('建单人')}:&nbsp;</div>
            <div className={styles.content}>{outStockDetail.creator}</div>
          </Flex>
        </Flex>
      </Flex>
    )

    return (
      <div>
        <QuickDesc
          left={headerLeft}
          right={headerRight}
          leftFlex={1}
          rightFlex={2}
        >
          <Flex flex={1} justifyBetween className='gm-padding-15'>
            <div className={styles.title}>{i18next.t('成本金额')}</div>
            <div className={styles.money}>
              {outStockDetail.money === '-'
                ? outStockDetail.money
                : Big(outStockDetail.money || 0)
                    .div(100)
                    .toFixed(2) + Price.getUnit()}
            </div>
          </Flex>
          <Flex flex={3} justifyEnd className='gm-margin-15'>
            {editable ? (
              <Button
                type='primary'
                className='gm-margin-right-5 gm-margin-top-5'
                onClick={this.handleOutStock}
              >
                {i18next.t('确认出库')}
              </Button>
            ) : undefined}
            <DropDown
              right
              popup={
                <DropDownItems>
                  {editable ? (
                    <DropDownItem onClick={this.handleSaveDraft}>
                      {i18next.t('保存草稿')}
                    </DropDownItem>
                  ) : undefined}
                  {outStockDetail.status === 3 ? undefined : (
                    <DropDownItem onClick={this.handleCancel}>
                      {i18next.t('冲销')}
                    </DropDownItem>
                  )}
                </DropDownItems>
              }
            >
              <Button type='primary' plain className='gm-margin-top-5'>
                {i18next.t('工具栏')}&nbsp;&nbsp;
                <span className='caret' />
              </Button>
            </DropDown>
          </Flex>
        </QuickDesc>
        <QuickPanel
          icon='bill'
          title={i18next.t('商品明细')}
          collapse
          className={styles.tableBottom}
          right={<KeyBoardTips />}
        >
          <KeyboardDiyEditTable
            data={details}
            onAddRow={this.handleDetailAdd}
            id='out_stock_table'
            columns={[
              {
                Header: i18next.t('序号'),
                accessor: 'num',
                fixed: 'left',
                width: referOfWidth.noCell,
                Cell: ({ index }) => {
                  return _.isNaN(parseFloat(index)) ? null : index + 1
                },
              },
              {
                Header: OperationHeader,
                accessor: 'action',
                diyEnable: false,
                fixed: 'left',
                width: referOfWidth.operationCell,
                show: !(!editable || is_bind_order),
                Cell: ({ index }) => {
                  const disable = !editable || is_bind_order

                  return (
                    <EditTableOperation
                      onAddRow={disable ? undefined : this.handleDetailAdd}
                      onDeleteRow={
                        disable || details.length === 1
                          ? undefined
                          : this.handleDetailDel.bind(this, index)
                      }
                    />
                  )
                },
              },
              {
                Header: i18next.t('商品名'),
                accessor: 'name',
                isKeyboard: true,
                minWidth: 200,
                Cell: ({ index, original: { name, id } }) => {
                  const selected = id ? { value: id, text: name } : null

                  if (!editable || is_bind_order) {
                    return name
                  }

                  return (
                    <KCMoreSelect
                      style={{ width: referOfWidth.searchBox }}
                      data={list[index] || [{ label: '', children: [] }]}
                      isGroupList
                      selected={selected}
                      onSelect={this.handleSelect.bind(this, index)}
                      onSearch={this.handleSearch.bind(this, index)}
                      renderListFilter={(data) => {
                        return data
                      }}
                      onFocus={this.handleFocus.bind(this, name, index)}
                      placeholder={i18next.t('请输入商品名搜索')}
                    />
                  )
                },
              },
              {
                Header: i18next.t('规格'),
                accessor: 'sale_ratio',
                minWidth: 100,
                Cell: ({
                  original: {
                    std_ratio,
                    sale_ratio,
                    std_unit_name,
                    sale_unit_name,
                  },
                }) => {
                  if (!sale_ratio) {
                    return '-'
                  }
                  return (
                    parseFloat(Big(std_ratio).mul(sale_ratio).toFixed(2)) +
                    std_unit_name +
                    '/' +
                    sale_unit_name
                  )
                },
              },
              {
                Header: i18next.t('商品分类'),
                accessor: 'category',
                minWidth: 100,
              },
              {
                Header: i18next.t('出库数(销售单位)'),
                accessor: 'quantity_sale',
                isKeyboard: true,
                minWidth: 160,
                Cell: ({
                  index,
                  original: { quantity, sale_unit_name, change },
                }) => {
                  const element = (
                    <Flex alignCenter>
                      <KCInputNumberV2
                        value={quantity}
                        onChange={this.handleProQuantityChange.bind(
                          this,
                          index
                        )}
                        min={0}
                        className='form-control input-sm'
                        style={{ width: referOfWidth.numberInputBox }}
                      />
                      <span className='gm-padding-5'>
                        {sale_unit_name || '-'}
                      </span>
                    </Flex>
                  )

                  if (!editable || is_bind_order) {
                    return isNumber(quantity) && sale_unit_name
                      ? quantity + sale_unit_name
                      : '-'
                  } else {
                    return (
                      <Popover
                        showArrow
                        component={<div />}
                        type='hover'
                        popup={this.popoverPop(
                          '修改出库数的值，请重新选择出库批次'
                        )}
                        disabled={!change}
                      >
                        {element}
                      </Popover>
                    )
                  }
                },
              },
              {
                Header: i18next.t('出库批次'),
                accessor: 'batch_details',
                minWidth: 120,
                show: globalStore.user.stock_method === 2,
                Cell: ({
                  index,
                  original: {
                    is_anomaly,
                    batch_details,
                    out_of_stock,
                    std_unit_name,
                  },
                  original,
                }) => {
                  let is_has_selected = false

                  if (_.has(original, 'batch_details')) {
                    is_has_selected = !!batch_details.length
                  }

                  // 如果商品标记缺货，则不用选择批次
                  if (out_of_stock) {
                    return (
                      <Flex row>
                        <span
                          className='gm-not-allowed gm-margin-right-5'
                          style={{ color: '#999999' }}
                        >
                          {i18next.t('选择批次')}
                        </span>
                        <Popover
                          showArrow
                          component={<div />}
                          type='hover'
                          popup={this.popoverPop(
                            '该商品出库数为0，无需选择批次'
                          )}
                        >
                          <i className='ifont xfont-warning-circle gm-text-red' />
                        </Popover>
                      </Flex>
                    )
                  }

                  // 如果是净菜商品，则显示该spu绑定的小批次号
                  // if (list && list.clean_food) {
                  //   return (
                  //     <div>
                  //       <Trigger showArrow component={<div/>} type='hover' popup={this.cleanBatchTips(list.clean_food_batch_details, list.std_unit_name, list.sale_unit_name)}>
                  //         <span style={{ color: '#2182CC' }}>{i18next.t('查看批次')}</span>
                  //       </Trigger>
                  //     </div>
                  //   )
                  // }

                  if (!editable) {
                    return original && batch_details && batch_details.length ? (
                      <div>
                        <Popover
                          showArrow
                          component={<div />}
                          type='hover'
                          popup={this.batchTips(batch_details, std_unit_name)}
                        >
                          <span style={{ color: '#2182CC' }}>
                            {i18next.t('查看批次')}
                          </span>
                        </Popover>
                      </div>
                    ) : (
                      '-'
                    )
                  }

                  return (
                    <a
                      href='javascript:;'
                      onClick={this.handleBatch.bind(this, original, index)}
                    >
                      {is_has_selected ? (
                        i18next.t('查看批次')
                      ) : is_anomaly ? (
                        <div className={styles.anomaly}>
                          <span
                            style={{
                              color: '#ff0000',
                              textDecoration: 'underline',
                              marginRight: '5px',
                            }}
                          >
                            {i18next.t('选择批次')}
                          </span>
                          <Popover
                            showArrow
                            component={<div />}
                            type='hover'
                            popup={this.popoverPop(
                              '所选批次库存数小于出库数，请更改批次或修改退货数'
                            )}
                          >
                            <span
                              style={{
                                backgroundColor: '#ff0000',
                                color: '#ffffff',
                                padding: '2px',
                              }}
                            >
                              {i18next.t('异常')}
                            </span>
                          </Popover>
                        </div>
                      ) : (
                        i18next.t('选择批次')
                      )}
                    </a>
                  )
                },
              },
              {
                Header: i18next.t('出库数(基本单位)'),
                accessor: 'real_std_count',
                show: !editable || is_bind_order,
                minWidth: 120,
                Cell: ({
                  original: {
                    real_std_count,
                    clean_food,
                    batch_details,
                    std_unit_name,
                  },
                }) => {
                  let amount = 0

                  if (clean_food) {
                    _.forEach(batch_details, (l) => {
                      amount = Big(amount || 0)
                        .plus(l.out_stock_base)
                        .toFixed(2)
                    })
                  } else {
                    amount = parseFloat(Big(real_std_count || 0).toFixed(2))
                  }

                  return isNumber(amount) && std_unit_name
                    ? amount + std_unit_name
                    : '-'
                },
              },
              {
                Header: i18next.t('出库成本价'),
                accessor: 'sale_price',
                minWidth: 100,
                Cell: ({ original: { sale_price, std_unit_name } }) => {
                  if (!sale_price && +sale_price !== 0) {
                    return '-'
                  }
                  return (
                    Big(sale_price || 0)
                      .div(100)
                      .toFixed(2) +
                    Price.getUnit() +
                    '/' +
                    std_unit_name
                  )
                },
              },
              {
                Header: i18next.t('成本金额'),
                accessor: 'money',
                minWidth: 120,
                Cell: ({ original: { money } }) => {
                  if (!money && +money !== 0) {
                    return '-'
                  }
                  return (
                    Big(money || 0)
                      .div(100)
                      .toFixed(2) + Price.getUnit()
                  )
                },
              },
              {
                Header: i18next.t('操作人'),
                accessor: 'creator',
                minWidth: 100,
                Cell: ({ original: { creator } }) => {
                  return creator || outStockDetail.creator
                },
              },
            ]}
          />
        </QuickPanel>
      </div>
    )
  }
}

OutStockDetail.propTypes = {
  product: PropTypes.object,
}

export default connect((state) => ({
  product: state.product,
}))(OutStockDetail)
