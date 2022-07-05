import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import {
  RightSideModal,
  ToolTip,
  Tip,
  Pagination,
  Dialog,
  Flex,
} from '@gmfe/react'

import {
  Table,
  TableUtil,
  selectTableV2HOC,
  diyTableHOC,
  fixedColumnsTableHOC,
} from '@gmfe/table'

import actions from '../../../actions'
import { purchaseTaskStatus } from '../../../common/filter'
import { gioTrackEvent } from '../../../common/service'
import { is } from '@gm-common/tool'
import Big from 'big.js'
import _ from 'lodash'
import moment from 'moment'
import PopupGoodDetail from './popupGoodDetail'
import ReferencePriceDetail from '../../../common/components/reference_price_detail'
import EditableSupplierSelectNew from './editable_supplier_select_new'
import EditablePurchaseSelect from './editable_purchase_select'
import { RefPriceTypeSelect } from '../../../common/components/ref_price_type_hoc'
import BatchActions from './purchase_task_batch_actions'
import HeaderTip from '../../../common/components/header_tip'
import PurchaserProgressHeader from './purchase_progress/header'
import PurchaserProgressContent from './purchase_progress/content'

import globalStore from '../../../stores/global'
import { saleReferencePrice } from '../../../common/enum'
import { observer } from 'mobx-react'
import SupplierDel from 'common/components/supplier_del_sign'
import { Request } from '@gm-common/request'
import Catch from '../../../common/components/catch'

const SelectTable = selectTableV2HOC(diyTableHOC(fixedColumnsTableHOC(Table)))

const PlanPurchaseCellHeader = observer(() => {
  return (
    <HeaderTip
      title={i18next.t('计划采购')}
      tip={
        <div className='gm-padding-5' style={{ width: '170px' }}>
          <span className='gm-text-bold'>{i18next.t('开启加工商品：')}</span>
          {i18next.t(
            '计划采购数=（下单数-成品库存）*配比值，任务完成后此数值将保持不变；若成品库存大于等于下单数，计划采购数=0；若成品库存小于0，则计划采购数=下单数*配比值；',
          )}
          <br />
          <span className='gm-text-bold'>{i18next.t('未开启加工商品：')}</span>
          {i18next.t('未开启加工商品：计划采购数=下单数')}
        </div>
      }
    />
  )
})

class PurchaseTaskTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      progressUnit: i18next.t('基本单位'),
      sort: {
        fileds: '',
        opt: '',
      },
    }
  }

  componentDidMount() {
    const { getSearchOption } = this.props
    actions.purchase_task_list_search(getSearchOption({ offset: 0, limit: 10 }))
  }

  componentWillUnmount() {
    actions.purchase_task_list_select_all(false)
    actions.purchase_task_batch_modify_change({
      selectAllPage: 0,
    })
  }

  handleSelect = (selected) => {
    actions.purchase_task_list_select_single(selected)
    actions.purchase_task_batch_modify_change({
      selectAllPage: 0,
    })
  }

  // 数据修改 刷新页面 依然保持在修改页
  handleListSearchPage = () => {
    const { getSearchOption, purchase_task } = this.props
    const { offset, limit } = purchase_task.taskListPagination
    actions.purchase_task_list_search(
      getSearchOption({ offset: offset, limit: limit }),
    )
    actions.purchase_list_get_all_supplier_purchaser(
      this.props.getSearchOption(null, true),
    )
  }

  handleSelectAll = (isSelected) => {
    actions.purchase_task_list_select_all(isSelected)
    actions.purchase_task_batch_modify_change({
      selectAllPage: 0,
    })
  }

  handleChangeProgressUnit = (type) => {
    this.setState({
      progressUnit: type,
    })
  }

  handlePopupGoodDetail = (data) => {
    const { taskIds, referencePriceFlag, progressUnit, record } = data
    const { getSearchOption } = this.props
    const handleChangeModalHide = function () {
      RightSideModal.hide()
    }

    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: is.phone()
        ? { width: '100vw', overflow: 'auto' }
        : { width: '900px', overflowY: 'scroll' },
      children: (
        <PopupGoodDetail
          taskIds={taskIds}
          taskList={[record]}
          progressUnit={progressUnit}
          getSearchOption={getSearchOption}
          referencePriceFlag={referencePriceFlag}
          canEdit={globalStore.hasPermission('edit_purchase_task_item')}
          onReleaseTask={this.handleReleaseTask}
          onModalHide={handleChangeModalHide}
          onListSearchPage={this.handleListSearchPage}
        />
      ),
    })
  }

  async handleSupplierUpdate(type, item, selected) {
    const ids = _.map(item.tasks, 'id')
    await actions.purchase_item_supplier_update(ids, {
      [type]: selected.id || selected.value,
    })
    this.handleListSearchPage()
  }

  async handleSupplyAmountLimitChange(record, value) {
    if (record.supply_limit === value) {
      return
    }
    if (value === '') {
      // 不传
      value = undefined
    }
    const supplier_id = record.settle_supplier_id
    const spec_id = record.spec_id
    await actions.purchase_task_supply_limit_change({
      supplier_id,
      spec_id,
      limit: value,
    })
    this.handleListSearchPage()
  }

  async handleSuggestPurchaseAmountChange(record, value) {
    if (record.customized_suggest_purchase_amount === value) {
      return
    }
    await Request('/purchase/task/suggest_purchase_amount/edit')
      .data({
        task_ids: JSON.stringify(record.tasks?.map((task) => +task.id) || []),
        set: [undefined, null].includes(value) ? 0 : 1,
        amount: value,
      })
      .post()
    this.handleListSearchPage()
  }

  handleRequest = (page) => {
    const { getSearchOption } = this.props
    const { fileds, opt } = this.state.sort
    const arr = {
      category1_name: 1,
      settle_supplier_name: 2,
      purchaser_name: 3,
      name: 4,
    }
    if (fileds !== '' && opt !== '') {
      page.sort = JSON.stringify({
        opt: opt,
        fileds: arr[fileds],
      })
    }
    actions.setPagination(page)
    return actions.purchase_task_list_search(getSearchOption(page))
  }

  getSelectedTaskOrderList(checkAll = false) {
    const { taskList } = this.props.purchase_task
    const tasks = []

    _.each(taskList, (task, index) => {
      _.each(task.tasks, (t) => {
        if (checkAll || task._gm_select || t._gm_select) {
          tasks.push({
            id: t.id, //  商品采购订单的id
            purchaser_name: t.purchaser_name,
            plan_purchase_amount: t.plan_purchase_amount,
            stock: task.stock, // 商品总的库存
            index: index, // 商品列表项的唯一性
          })
        }
      })
    })

    return tasks
  }

  handleReleaseTask = async (params) => {
    gioTrackEvent('purchase_task_release_task')
    // 发布库存不足任务 标识release_out_of_stock：true
    let release_out_of_stock
    params &&
      params.release_out_of_stock &&
      (release_out_of_stock = params.release_out_of_stock)
    const {
      purchase_task: {
        purchaseBatchModify: { selectAllPage },
      },
      getSearchOption,
    } = this.props
    if (selectAllPage) {
      this.handleReleaseTaskAll(release_out_of_stock)
      return
    }
    // 支持单个发布 添加参数singleOrder
    const orderListChoosed = params && params.orderListChoosed
    const handleChangeModalHide = params && params.handleChangeModalHide // 关闭弹窗的方法
    const ifhandleModeHide = params && params.ifhandleModeHide // 在弹出层发布需要关闭弹窗：如果是最后一个单个发布的，或者是在弹出层批量发布

    const skus = orderListChoosed || this.getSelectedTaskOrderList()
    const task_ids = []
    const taskSuggestList = []
    let isExistNoSupllier = false
    let isNeedPostRequest = true
    const options = getSearchOption({})

    if (!skus.length) {
      Tip.warning(i18next.t('请选择采购任务'))
      return
    }
    _.each(skus, (sku) => {
      task_ids.push(sku.id)
      if (!sku.purchaser_name) {
        isExistNoSupllier = true
      }
    })

    if (isExistNoSupllier) {
      isNeedPostRequest = await Dialog.confirm({
        children: i18next.t(
          '所选采购任务中，未分配供应商和未分配采购员的任务均无法发布，是否继续？',
        ),
      })
        .then(() => {
          return true
        })
        .catch(() => {
          return false
        })
    }

    const releaseOptions = _.pick(
      options,
      'q_type',
      'begin_time',
      'end_time',
      'time_config_id',
      'weight_status',
      'purchaser_id',
      'route_id',
      'route_ids',
      'has_created_sheet',
      'is_new_ui',
      'client',
    )

    // 发布库存不足任务，release_out_of_stock:true
    release_out_of_stock &&
      (releaseOptions.release_out_of_stock = release_out_of_stock)

    // 采购任务 关联的商品列表发布 根据列表序号的index选择
    // 在子列表随机选一个id suggest_purchase_num：由该商品订单项的全部计划采购的和 减去该商品的库存
    _.forEach(_.groupBy(skus, 'index'), (item) => {
      let all_plan_amount = 0
      const { stock } = item[0]
      _.forEach(item, (i) => {
        all_plan_amount = Big(all_plan_amount).plus(i.plan_purchase_amount)
      })

      taskSuggestList.push({
        task_id: item[0].id,
        suggest_purchase_num:
          all_plan_amount > stock
            ? Big(all_plan_amount)
                .minus(stock > 0 ? stock : 0)
                .toFixed(2)
                .valueOf()
            : 0,
      })
    })

    // 采购任务 添加采购字段更新
    _.assign(releaseOptions, {
      task_suggests: JSON.stringify([...taskSuggestList]),
    })

    if (isNeedPostRequest) {
      return actions
        .purchase_task_realease(task_ids, releaseOptions)
        .then(() => {
          this.handleListSearchPage()
          Tip.success(i18next.t('已分配采购员的任务发布成功'))
          if (ifhandleModeHide) {
            handleChangeModalHide()
          }
          return true // 返回成功
        })
    }
  }

  handleReleaseTaskAll = (params) => {
    const releaseOptions = _.pick(
      this.props.getSearchOption({}),
      'q_type',
      'begin_time',
      'end_time',
      'q',
      'time_config_id',
      'category1_ids',
      'category2_ids',
      'pinlei_ids',
      'status',
      'order_status',
      'settle_supplier_ids',
      'task_suggests',
      'weight_status',
      'purchaser_id',
      'route_id',
      'route_ids',
      'has_created_sheet',
      'source_type',
      'address_label_id',
      'address_ids',
      'is_new_ui',
      'client',
      'purchase_change_release',
    )
    // 是否发布库存不足任务
    params && (releaseOptions.release_out_of_stock = params)
    const { taskList } = this.props.purchase_task
    const taskListNotDone = _.filter(taskList, (list) => {
      return list.status !== 3 // 未发布 已完成 都可以重新的发布
    })
    const taskSuggestList = []
    _.forEach(taskListNotDone, (item) => {
      let all_plan_amount = 0
      _.forEach(item.tasks, (i) => {
        all_plan_amount = Big(all_plan_amount).plus(i.plan_purchase_amount)
      })

      taskSuggestList.push({
        task_id: item.tasks[0].id,
        suggest_purchase_num:
          all_plan_amount > item.stock
            ? Big(all_plan_amount)
                .minus(item.stock > 0 ? item.stock : 0)
                .toFixed(2)
                .valueOf()
            : 0,
      })
    })

    _.assign(releaseOptions, {
      task_suggests: JSON.stringify([...taskSuggestList]),
    })

    Dialog.confirm({
      children: i18next.t(
        '采购任务中，未分配供应商和未分配采购员的任务均无法发布，是否继续？',
      ),
    }).then(() => {
      actions.purchase_task_realease([], releaseOptions).then(() => {
        const { getSearchOption } = this.props
        actions.purchase_task_list_search(
          getSearchOption({ offset: 0, limit: 10 }),
        )
        Tip.success(i18next.t('已分配采购员的任务发布成功'))
      })
    })
  }

  handleSortClick(name) {
    const { getSearchOption } = this.props
    const { sort } = this.state
    let newSort = { ...sort }

    if (sort.fileds && sort.opt) {
      const isDesc = sort.opt === 'desc'
      const isCurrentName = sort.fileds === name

      if (isCurrentName) {
        newSort.opt = isDesc ? 'asc' : ''
      } else {
        newSort = {
          fileds: name,
          opt: 'desc',
        }
      }
    } else {
      newSort = {
        fileds: name,
        opt: 'desc',
      }
    }

    this.setState({
      sort: newSort,
    })

    const arr = {
      category1_name: 1,
      settle_supplier_name: 2,
      purchaser_name: 3,
      name: 4,
    }

    const data = getSearchOption({ offset: 0, limit: 10 })
    if (newSort.fileds !== '' && newSort.opt !== '') {
      data.sort = JSON.stringify({
        opt: newSort.opt,
        fileds: arr[newSort.fileds],
      })
    }
    actions.setPagination({ offset: 0, limit: 10 })
    actions.purchase_task_list_search(data)
  }

  render() {
    const {
      purchase_task,
      isSupplierUser,
      refPriceType,
      postRefPriceType,
    } = this.props
    const { sort } = this.state
    const {
      taskList: list,
      taskListSelected: selected,
      taskListLoading: loading,
    } = purchase_task
    // 单次可供上线权限
    const canEditSupplyRemain = isSupplierUser
      ? !isSupplierUser
      : globalStore.hasPermission('edit_supply_limit')
    const can_get_purchase_history = globalStore.hasPermission(
      'get_purchase_history',
    )
    const can_get_purchase_task_item = globalStore.hasPermission(
      'get_purchase_task_item',
    )
    const can_get_purchase_market = globalStore.hasPermission(
      'get_purchase_market',
    )
    const { progressUnit } = this.state
    let referencePriceFlag = ''
    _.find(saleReferencePrice, (item) => {
      if (item.type === refPriceType) {
        referencePriceFlag = item.flag
        return true
      }
    })

    return (
      <div>
        <SelectTable
          data={list}
          loading={loading}
          id='purchase_task_list_v1.0'
          keyField='_index'
          selected={selected}
          isSelectorDisable={(task) => task.status === 3}
          onSelectAll={this.handleSelectAll}
          onSelect={this.handleSelect}
          batchActionBar={
            selected.length ? (
              <BatchActions
                isSupplierUser={isSupplierUser}
                purchase_task={purchase_task}
                getSearchOption={this.props.getSearchOption}
                onReleaseTask={this.handleReleaseTask}
              />
            ) : null
          }
          diyGroupSorting={[i18next.t('基础字段')]}
          columns={[
            {
              Header: i18next.t('采购规格ID'),
              accessor: 'spec_id',
              minWidth: 120,
              diyItemText: i18next.t('采购规格ID'),
              diyGroupName: i18next.t('基础字段'),
            },
            {
              Header: (
                <TableUtil.SortHeader
                  onClick={this.handleSortClick.bind(this, 'name')}
                  type={sort.fileds === 'name' ? sort.opt : null}
                >
                  {i18next.t('商品')}
                </TableUtil.SortHeader>
              ),
              accessor: 'name',
              minWidth: 120,
              diyEnable: false,
              diyItemText: i18next.t('商品'),
              diyGroupName: i18next.t('基础字段'),
              Cell: ({ value: name, original: record }) => {
                const taskIds = {
                  release_id: record.release_id,
                  settle_supplier_id: record.settle_supplier_id,
                  spec_id: record.spec_id,
                  status: record.status,
                }
                if (
                  !(
                    can_get_purchase_history ||
                    can_get_purchase_task_item ||
                    can_get_purchase_market
                  )
                ) {
                  return `${name}(${record.sale_ratio}${record.std_unit_name}/${record.sale_unit_name})`
                }
                return (
                  <div>
                    <a
                      onClick={() =>
                        this.handlePopupGoodDetail({
                          taskIds,
                          referencePriceFlag,
                          progressUnit,
                          record,
                        })
                      }
                    >
                      {name}({record.sale_ratio}
                      {record.std_unit_name}/{record.sale_unit_name})
                    </a>
                    {record.status === 1 && record.supply_remain < 0 && (
                      <ToolTip
                        popup={
                          <div
                            className='=gm-padding-5'
                            style={{ width: '150px' }}
                          >
                            {i18next.t('当前供应商供应能力不足')}
                          </div>
                        }
                        className='gm-text-red gm-margin-left-5'
                      />
                    )}
                  </div>
                )
              },
            },
            {
              Header: (
                <TableUtil.SortHeader
                  onClick={this.handleSortClick.bind(this, 'category1_name')}
                  type={sort.fileds === 'category1_name' ? sort.opt : null}
                >
                  {i18next.t('分类')}
                </TableUtil.SortHeader>
              ),
              accessor: 'category1_name',
              minWidth: 120,
              diyItemText: i18next.t('分类'),
              diyGroupName: i18next.t('基础字段'),
              Cell: ({ original: record, value: category1_name }) =>
                `${category1_name}/${record.category2_name}/${record.pinlei_name}`,
            },

            {
              Header: (
                <TableUtil.SortHeader
                  onClick={this.handleSortClick.bind(
                    this,
                    'settle_supplier_name',
                  )}
                  type={
                    sort.fileds === 'settle_supplier_name' ? sort.opt : null
                  }
                >
                  {i18next.t('供应商')}
                </TableUtil.SortHeader>
              ),
              accessor: 'settle_supplier_name',
              minWidth: 150,
              diyItemText: i18next.t('供应商'),
              diyGroupName: i18next.t('基础字段'),
              Cell: ({ original: record, value: settle_supplier_name }) => {
                const canEdit =
                  record.status !== 3 &&
                  globalStore.hasPermission('edit_purchase_task_supplier') &&
                  record.editable &&
                  !globalStore.isSettleSupply() /* 未发布 且 task.editable 且 不是供应商 */

                return (
                  <Flex alignCenter>
                    {record.supplier_status === 0 && <SupplierDel />}
                    <span>{record.settle_supplier_name}&nbsp;</span>
                    {canEdit && (
                      <EditableSupplierSelectNew
                        purchase_task={this.props.purchase_task}
                        onSave={(selected) =>
                          this.handleSupplierUpdate(
                            'settle_supplier_id',
                            record,
                            selected,
                          )
                        }
                        task={record}
                      />
                    )}
                  </Flex>
                )
              },
            },

            {
              Header: (
                <HeaderTip
                  title={i18next.t('单次可供上限')}
                  tip={i18next.t('供应商对该商品的单次可供应上限')}
                />
              ),
              diyItemText: i18next.t('单次可供上限'),
              accessor: 'supply_limit',
              minWidth: 120,
              diyGroupName: i18next.t('基础字段'),
              Cell: ({ original: record, value: supply_limit }) => {
                const { supplier_status, settle_supplier_id } = record
                // 需要选择供应商并且供应商未被删除才可编辑

                const isSupplierValid =
                  supplier_status !== 0 && settle_supplier_id

                return (
                  <>
                    <span>
                      {supply_limit ? supply_limit + record.std_unit_name : '-'}
                      &nbsp;
                    </span>
                    {canEditSupplyRemain && isSupplierValid && (
                      <TableUtil.EditButton
                        popupRender={(closePopup) => {
                          return (
                            <TableUtil.EditContentInputNumber
                              min={0}
                              max={999999999}
                              initialVal={+supply_limit || null}
                              onSave={(value) =>
                                this.handleSupplyAmountLimitChange(
                                  record,
                                  value,
                                )
                              }
                              closePopup={closePopup}
                              suffixText={record.std_unit_name}
                            />
                          )
                        }}
                      />
                    )}
                  </>
                )
              },
            },
            {
              Header: (
                <HeaderTip
                  title={i18next.t('剩余可供')}
                  tip={i18next.t(
                    '供应商对商品的剩余可供应上限，当值小于0时，建议调拨数量至其他供应商',
                  )}
                />
              ),
              diyItemText: i18next.t('剩余可供'),
              accessor: 'supply_remain',
              minWidth: 90,
              diyGroupName: i18next.t('基础字段'),
              Cell: ({ original: record, value: supply_remain }) => {
                return (
                  <span>
                    {_.isNil(supply_remain) || supply_remain === ''
                      ? '-'
                      : Big(supply_remain || 0).toFixed(2) +
                        record.std_unit_name}
                  </span>
                )
              },
            },
            {
              Header: (
                <TableUtil.SortHeader
                  onClick={this.handleSortClick.bind(this, 'purchaser_name')}
                  type={sort.fileds === 'purchaser_name' ? sort.opt : null}
                >
                  {i18next.t('采购员')}
                </TableUtil.SortHeader>
              ),
              diyItemText: i18next.t('采购员'),
              accessor: 'purchaser_name',
              minWidth: 100,
              diyGroupName: i18next.t('基础字段'),
              Cell: ({ original: task }) => {
                const { supplier_status, settle_supplier_id } = task

                // 需要选择供应商并且供应商未被删除才可编辑

                const isSupplierValid =
                  supplier_status !== 0 && settle_supplier_id

                const canEdit =
                  task.status <= 2 &&
                  globalStore.hasPermission('edit_released_purchase_task') &&
                  task.editable &&
                  !globalStore.isSettleSupply() &&
                  isSupplierValid /* 未发布 且 task.editable 且 不是供应商 或已发布有权限 需要选择供应商并且供应商未被删除 */
                return (
                  <>
                    <span>
                      {task.purchaser_name || '-'}
                      &nbsp;
                    </span>
                    {canEdit && (
                      <EditablePurchaseSelect
                        purchase_task={this.props.purchase_task}
                        onSave={(selected) =>
                          this.handleSupplierUpdate(
                            'purchaser_id',
                            task,
                            selected,
                          )
                        }
                        task={task}
                      />
                    )}
                  </>
                )
              },
            },
            !isSupplierUser && {
              Header: (
                <RefPriceTypeSelect
                  postRefPriceType={postRefPriceType}
                  refPriceType={refPriceType}
                />
              ),
              id: 'referencePriceFlag',
              diyItemText: i18next.t('参考成本'),
              accessor: (d) => d[referencePriceFlag],
              minWidth: 100,
              diyGroupName: i18next.t('基础字段'),
              Cell: ({ original: task, value: reference_price, index }) => {
                return (
                  <ReferencePriceDetail
                    sequshList={list}
                    reference_price={reference_price}
                    currentIndex={index}
                    referencePriceFlag={referencePriceFlag}
                    unit_name={list[index].std_unit_name}
                  />
                )
              },
            },
            !isSupplierUser && {
              Header: (
                <HeaderTip
                  title={i18next.t('库存')}
                  tip={i18next.t('库存数读取实时库存')}
                />
              ),
              diyItemText: i18next.t('库存'),
              accessor: 'stock',
              minWidth: 100,
              diyGroupName: i18next.t('基础字段'),
              Cell: ({ original: record, value: stock }) =>
                `${Big(stock).toFixed(2)}${record.std_unit_name}`,
            },
            {
              Header: (
                <HeaderTip
                  title={i18next.t('建议采购')}
                  tip={i18next.t(
                    '来源：根据采购设置中的配置进行计算，修改此数据后后续流程将以修改后的数据为准，以蓝色显示.发布前可修改，发布后不允许再次修改',
                  )} // 净菜某些文案中库存字段改为原料库存
                />
              ),
              diyItemText: i18next.t('建议采购'),
              accessor: 'suggest_purchase_num',
              minWidth: 100,
              diyGroupName: i18next.t('基础字段'),
              Cell: Catch(
                ({ original: record, value: suggest_purchase_num }, err) => {
                  if (err) {
                    return err.message
                  }
                  /** @type {{
                   * status:Boolean,
                   * stock:number,
                   * plan_purchase_amount:number,
                   * std_unit_name:string,
                   * customized_suggest_purchase_amount?:number
                   * }} */
                  const {
                    status,
                    stock,
                    plan_purchase_amount,
                    std_unit_name,
                    customized_suggest_purchase_amount,
                  } = record
                  // 有权限才显示编辑按钮
                  // 发布前可修改，发布后的不可点击，为修改过的显示默认值
                  /** 是否已发布 */
                  const unpublished = status === 1
                  /** 修改后的值 */
                  const changedVal = customized_suggest_purchase_amount
                  const hasPermission = globalStore.user.permission.includes(
                    'edit_sug_purc_amount',
                  )

                  let val = <>{`${plan_purchase_amount}${std_unit_name}`}</>
                  if (changedVal) {
                    val = (
                      <span className='gm-text-primary'>
                        {`${changedVal}${std_unit_name}`}
                      </span>
                    )
                  } else if (Number(stock) < 0) {
                    val = suggest_purchase_num
                      ? `${parseFloat(
                          Big(suggest_purchase_num).toFixed(2),
                        )}${std_unit_name}`
                      : '-'
                  } else if (Number(suggest_purchase_num) <= 0) {
                    return globalStore.otherInfo.cleanFood
                      ? i18next.t('原料库存充足')
                      : i18next.t('库存充足')
                  } else {
                    val = `${parseFloat(
                      Big(suggest_purchase_num).toFixed(2),
                    )}${std_unit_name}`
                  }
                  return (
                    <>
                      <span>{val}</span>
                      {unpublished && hasPermission && (
                        <TableUtil.EditButton
                          popupRender={(closePopup) => {
                            return (
                              <TableUtil.EditContentInputNumber
                                min={0}
                                max={999999999}
                                initialVal={+changedVal || null}
                                onSave={(value) =>
                                  this.handleSuggestPurchaseAmountChange(
                                    record,
                                    value,
                                  )
                                }
                                closePopup={closePopup}
                                suffixText={record.std_unit_name}
                              />
                            )
                          }}
                        />
                      )}
                    </>
                  )
                },
                (err) => err.message,
              ),
            },
            {
              Header: (
                <HeaderTip
                  title={i18next.t('在途库存')}
                  tip={i18next.t('在途库存：当前时间下该商品未入库的已采购数')}
                />
              ),
              diyItemText: i18next.t('在途库存'),
              accessor: 'in_transit_stock',
              minWidth: 90,
              diyGroupName: i18next.t('基础字段'),
              Cell: ({ original: record }) =>
                `${parseFloat(Big(record.in_transit_stock || 0).toFixed(2))}${
                  record.std_unit_name
                }`,
            },
            {
              Header: globalStore.otherInfo.cleanFood ? (
                <PlanPurchaseCellHeader />
              ) : (
                i18next.t('计划采购')
              ),
              accessor: 'plan_purchase',
              minWidth: 140,
              diyGroupName: i18next.t('基础字段'),
              Cell: ({ original: record }) => {
                // const { purchase_task } = this.props
                // const purchase_change_release =
                //   purchase_task.headerFilter?.changeOption || '0'
                const originAmount =
                  record?.tasks && record?.tasks?.length > 0
                    ? record.tasks.reduce(
                        (acr, cur) =>
                          Big(cur?.plan_amount_release || 0).plus(acr),
                        Big(0),
                      )
                    : Big(record.plan_purchase_amount)
                const originAmountFixed2 = originAmount.toFixed(2)
                const planPurchaseAmount = Big(record.plan_purchase_amount)
                const planPurchaseAmountFixed2 = Big(
                  record.plan_purchase_amount,
                ).toFixed(2)

                const hasDifference = !Big(originAmountFixed2).eq(
                  Big(planPurchaseAmountFixed2),
                )

                if (
                  hasDifference &&
                  !isSupplierUser &&
                  purchaseTaskStatus(record.status) === '已发布'
                ) {
                  return (
                    <div>
                      <div
                        style={{ backgroundColor: '#F5222D', color: 'white' }}
                      >
                        {`${planPurchaseAmount
                          .div(record.sale_ratio)
                          .toFixed(2)}${
                          record.sale_unit_name
                        }(${planPurchaseAmountFixed2}${record.std_unit_name})`}
                      </div>
                      <div>
                        原数量：
                        {`${originAmount.div(record.sale_ratio).toFixed(2)}
                        ${record.sale_unit_name}(${originAmountFixed2}
                        ${record.std_unit_name})`}
                      </div>
                    </div>
                  )
                }
                return `${planPurchaseAmount
                  .div(record.sale_ratio)
                  .toFixed(2)}${
                  record.sale_unit_name
                }(${planPurchaseAmountFixed2}${record.std_unit_name})`
              },
            },
            {
              Header: i18next.t('已采购'),
              accessor: 'already_purchase_amount',
              minWidth: 120,
              diyGroupName: i18next.t('基础字段'),
              Cell: ({ original: record, value: already_purchase_amount }) => {
                return `${Big(already_purchase_amount)
                  .div(record.sale_ratio)
                  .toFixed(2)}${record.sale_unit_name}(${Big(
                  already_purchase_amount,
                ).toFixed(2)}${record.std_unit_name})`
              },
            },
            {
              Header: i18next.t('发布时间'),
              accessor: 'release_time',
              minWidth: 150,
              diyGroupName: i18next.t('基础字段'),
              Cell: ({ value: release_time }) => {
                return release_time
                  ? moment(release_time).format('YYYY-MM-DD HH:mm:ss')
                  : '-'
              },
            },
            {
              Header: i18next.t('采购描述'),
              accessor: 'description',
              minWidth: 100,
              diyGroupName: i18next.t('基础字段'),
              Cell: ({ value: description }) => {
                return description || '-'
              },
            },
            {
              Header: (
                <PurchaserProgressHeader
                  unit={progressUnit}
                  onChange={this.handleChangeProgressUnit}
                />
              ),
              accessor: 'plan_purchase_amount',
              minWidth: 200,
              diyItemText: i18next.t('采购进度'),
              diyGroupName: i18next.t('基础字段'),
              Cell: ({ original: record, value: plan_purchase_amount }) => {
                const {
                  already_purchase_amount,
                  std_unit_name,
                  sale_ratio,
                  sale_unit_name,
                  status,
                } = record
                const alreadyPurchase =
                  progressUnit === i18next.t('基本单位')
                    ? `${Big(
                        already_purchase_amount,
                      ).valueOf()}${std_unit_name}`
                    : `${Big(already_purchase_amount)
                        .div(sale_ratio)
                        .toFixed(2)}${sale_unit_name}`
                const planPurchase =
                  progressUnit === i18next.t('基本单位')
                    ? `${Big(plan_purchase_amount).valueOf()}${std_unit_name}`
                    : `${Big(plan_purchase_amount)
                        .div(sale_ratio)
                        .toFixed(2)}${sale_unit_name}`

                let percentage
                // plan_purchase_amount 有可能为0, 所以做下兼容.总量为0就当做100%,其中已发布的采购任务计划数为0的进度为100
                if (plan_purchase_amount === 0 && status !== 1) {
                  percentage = 100
                } else {
                  percentage = Number(
                    Big(already_purchase_amount)
                      .div(plan_purchase_amount || 1)
                      .times(100)
                      .toFixed(2),
                  )
                }

                // 实际采购可能超出计划采购 百分比如果超出了100 则显示100
                percentage = percentage <= 100 ? percentage : 100
                return (
                  <PurchaserProgressContent
                    percentage={percentage}
                    already={alreadyPurchase}
                    plan={planPurchase}
                    showText
                  />
                )
              },
            },
            {
              Header: i18next.t('状态'),
              accessor: 'status',
              minWidth: 80,
              diyGroupName: i18next.t('基础字段'),
              Cell: ({ value: status }) => purchaseTaskStatus(status),
            },
          ].filter((_) => _)}
        />
        <div className='b-purchase-box' />
        <Pagination
          className='gm-padding-20 b-purchase-pagination'
          style={{ justifyContent: 'flex-end' }}
          data={purchase_task.taskListPagination}
          toPage={this.handleRequest}
          nextDisabled={list.length < 10}
        />
      </div>
    )
  }
}

PurchaseTaskTable.propTypes = {
  purchase_task: PropTypes.object.isRequired,
  status: PropTypes.string.isRequired,
  isSupplierUser: PropTypes.bool,
  selectAllType: PropTypes.number,
  refPriceType: PropTypes.number,
  postRefPriceType: PropTypes.func,
  getSearchOption: PropTypes.func,
}

export default PurchaseTaskTable
