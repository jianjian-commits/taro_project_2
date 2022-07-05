import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Flex, Progress, Loading, Price, ToolTip } from '@gmfe/react'
import { QuickTab } from '@gmfe/react-deprecated'
import OrderTab from './goodDetailTabs/orderTab'
import PurchaseTab from './goodDetailTabs/purchaseTab'
import ReferenceTab from './goodDetailTabs/referenceTab'
import styles from '../style.module.less'
import moment from 'moment'
import Big from 'big.js'
import actions from '../../../actions'
import { connect } from 'react-redux'
import _ from 'lodash'
import classNames from 'classnames'
import { pinYinFilter } from '@gm-common/tool'
import { getStatusLable } from '../util'
import SupplierSelect from './editable_supplier_select'
import PurchaserSelect from '../components/purchaser_select'
import globalStore from '../../../stores/global'
import SupplierDel from 'common/components/supplier_del_sign'

function TipBox(props) {
  /* eslint-disable */
  const {
    icon,
    iconColor,
    title,
    tip,
    value,
    unitName,
    className,
    valueProps,
  } = props
  return (
    <Flex
      flex
      column
      alignCenter
      className={classNames(className, 'gm-padding-tb-10')}
      style={{ backgroundColor: '#f5f5f7' }}
    >
      <Flex alignCenter>
        <i
          className={`xfont ${icon} gm-text-14`}
          style={{ color: iconColor, paddingRight: '2px' }}
        />
        {title}
        <ToolTip
          popup={
            <div
              className='gm-border gm-padding-5 gm-bg'
              style={{ width: '150px' }}
            >
              {tip}
            </div>
          }
          className='gm-margin-left-5'
        />
      </Flex>
      <Flex {...valueProps}>
        {_.isNil(value) || value === ''
          ? '-'
          : Big(value).toFixed(2) + unitName}
      </Flex>
    </Flex>
  )
}

class PopupGoodDetail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tabKey: 0,
      curSelectedAmount: 0, // 当前的已选计划采购数量和
    }
    this.handleSelectTab = ::this.handleSelectTab
    this.handleTaskSupplierUpdate = ::this.handleTaskSupplierUpdate
  }

  static getDerivedStateFromProps(props) {
    const { taskListItem } = props.purchase_task
    let curSelectedAmount = 0

    _.each(taskListItem, (task) => {
      _.each(task.tasks, (t) => {
        if (t._gm_select) {
          curSelectedAmount = Big(curSelectedAmount).plus(
            t.plan_purchase_amount,
          )
        }
      })
    })

    return {
      curSelectedAmount: curSelectedAmount.toFixed(2),
    }
  }

  async componentDidMount() {
    const { spec_id, release_id } = this.props.taskIds
    const { q_type, begin_time, end_time } = this.props.getSearchOption()

    await actions.purchase_task_list_search_item_clear()
    // 获取到当前点击的采购条
    globalStore.hasPermission('get_purchase_task_item') &&
      this.handleSetPurchaseListItem()
    // 获取采购记录的历史
    globalStore.hasPermission('get_purchase_history') &&
      actions.purchase_history_get(
        spec_id,
        release_id || 0,
        q_type,
        begin_time,
        end_time,
      )
  }

  handleSelectTab(tabKey) {
    this.setState({ tabKey })
  }

  handleSetPurchaseListItem = () => {
    const { taskList } = this.props
    actions.purchase_set_task_list(taskList)
  }

  /*
        taskIndex 当前的商品的序号
        orderIndex 当前的商品关联订单的序号
        ifOrderUpdate 是否为商品的关联订单每一项的供应商更新 默认为false
        ifAllUpdate 是否商品的总供应商更新
    */
  async handleTaskSupplierUpdate(type, task, selectedSupplier, orderIndex) {
    const { tasks } = task
    const params = { [type]: selectedSupplier.id }
    let ids = []
    if (orderIndex === null) {
      // 更新所有订单(task)供应商
      ids = _.map(tasks, (t) => t.id)
    } else if (_.isArray(orderIndex)) {
      // 批量更新订单供应商
      ids = _.map(orderIndex, (index) => tasks[index].id)
    } else {
      // 更新单个订单供应商
      let order = tasks[orderIndex]
      ids = [order.id]
    }

    await actions.purchase_item_supplier_update(ids, params)

    this.props.onListSearchPage() // 刷新tasklist页面

    // 供应商全部被修改。关闭弹窗
    if (orderIndex === null || ids.length === tasks.length) {
      this.props.onModalHide()
    }
    actions.refreshTaskList(
      _.map(ids, (id) => {
        return { id }
      }),
    )
  }

  handlInputFilter(list, query) {
    return pinYinFilter(list, query, (supplier) => supplier.name)
  }

  handleTaskOrderSupplierChange(task, orderIndex, supplier) {
    actions.purchase_task_order_supplier_change(task, orderIndex, supplier)
  }

  renderSupplierName(task) {
    return (
      <Flex alignCenter>
        {task.supplier_status === 0 && <SupplierDel />}
        <SupplierSelect
          task={task}
          onOk={this.handleTaskSupplierUpdate.bind(
            this,
            'settle_supplier_id',
            task,
          )}
        />
      </Flex>
    )
  }

  renderPurchaserName(task) {
    return (
      <PurchaserSelect
        task={task}
        onOk={this.handleTaskSupplierUpdate.bind(this, 'purchaser_id', task)}
      />
    )
  }

  render() {
    const {
      purchase_task,
      referencePriceFlag,
      onReleaseTask,
      onModalHide,
      onListSearchPage,
      progressUnit,
    } = this.props
    const { purchaseHistory, taskListItem } = purchase_task
    const task = taskListItem && taskListItem[0]
    const can_get_purchase_history = globalStore.hasPermission(
      'get_purchase_history',
    ) // 关联采购采购单据
    const can_get_purchase_task_item = globalStore.hasPermission(
      'get_purchase_task_item',
    ) // 关联订单权限
    const can_get_purchase_market = globalStore.hasPermission(
      'get_purchase_market',
    ) // 关联订单权限
    const isSupplierUser = globalStore.isSettleSupply()
    // 如果task 不存在 返回加载loading
    if (!task) {
      return (
        <Loading
          style={{ marginTop: '50px' }}
          text={i18next.t('长时间未加载数据，请刷新页面')}
        />
      )
    }

    const {
      supply_limit,
      supply_remain,
      supplier_purchased_amount,
      supplier_distribute_amount,
      name,
      already_purchase_amount,
      plan_purchase_amount,
      std_unit_name,
      release_time,
      sale_unit_name,
      sale_ratio,
      status,
      suggest_purchase_num,
      stock,
      settle_supplier_id,
      supplier_status,
    } = task

    const reference_price = task[referencePriceFlag]
    const quickTabs = []
    let suggestPurchaseNum =
      suggest_purchase_num > 0
        ? `${Big(suggest_purchase_num).toFixed(2)}${task.std_unit_name}`
        : i18next.t('库存充足')

    // 已发布的采购任务计划采购数为0时进度为100
    let percentage
    if (plan_purchase_amount === 0 && status !== 1) {
      percentage = 100
    } else {
      percentage = Number(
        Big(already_purchase_amount)
          .div(plan_purchase_amount || 1)
          .times(100),
      )
    }

    const lable = getStatusLable(status)

    // 权限，有供应商，供应商存在（未删除）
    const canShowRefInfo =
      can_get_purchase_market && supplier_status === 1 && settle_supplier_id

    // 根据权限 筛选出tab对应的内容
    if (can_get_purchase_task_item) {
      quickTabs.push(
        <div key={quickTabs.length}>
          <Flex className='gm-padding-tb-10' justifyAround>
            <TipBox
              icon='xfont-success-circle'
              iconColor='#02a6f4'
              className='gm-margin-right-5'
              value={this.state.curSelectedAmount}
              title={i18next.t('当前已选')}
              tip={i18next.t(
                '已选订单的计划采购总数，可调拨当前数量至其他供应商',
              )}
              unitName={std_unit_name}
              valueProps={{
                className: 'gm-text-red',
              }}
            />
            <TipBox
              icon='xfont-up-limit-circle'
              iconColor='#ffd100'
              title={i18next.t('单次可供上限')}
              value={supply_limit}
              tip={i18next.t('供应商对商品的单次可供应上限')}
              unitName={std_unit_name}
            />
            <TipBox
              icon='xfont-time-circle'
              iconColor='#fb3737'
              title={i18next.t('剩余可供')}
              value={supply_remain}
              tip={i18next.t(
                '供应商对商品的剩余可供应上限，当值小于0时，建议调拨数量至其他供应商',
              )}
              unitName={std_unit_name}
            />
            <TipBox
              icon='xfont-exchange-circle'
              iconColor='#5ebc5e'
              title={i18next.t('已分配')}
              value={supplier_distribute_amount}
              tip={i18next.t('各状态下商品已分配给供应商的计划采购总数')}
              unitName={std_unit_name}
            />
            <TipBox
              icon='xfont-order-circle'
              iconColor='#02a6f4'
              title={i18next.t('已采购')}
              value={supplier_purchased_amount}
              tip={i18next.t('分配给供应商的商品的已采购总数')}
              unitName={std_unit_name}
            />
          </Flex>
          <OrderTab
            purchaseTask={purchase_task}
            task={task}
            handleReleaseTask={onReleaseTask}
            handleChangeModalHide={onModalHide}
            handleTaskSupplierUpdate={this.handleTaskSupplierUpdate}
            handlInputFilter={this.handlInputFilter}
            handleTaskOrderSupplierChange={this.handleTaskOrderSupplierChange}
            handleListSearchPage={onListSearchPage}
          />
        </div>,
      )
    }
    if (can_get_purchase_history) {
      quickTabs.push(
        <PurchaseTab
          key={quickTabs.length}
          purchaseHistory={purchaseHistory}
        />,
      )
    }
    if (canShowRefInfo) {
      quickTabs.push(
        <ReferenceTab
          key={quickTabs.length}
          id={task.spec_id}
          supplier_id={task.settle_supplier_id}
          std_unit_name={std_unit_name}
        />,
      )
    }

    // eslint-disable-line
    return (
      <Flex column>
        <Flex column className='gm-padding-tb-10 gm-padding-lr-20 gm-back-bg'>
          <Flex>
            <div
              className={`${styles[lable.statusClass]} ${
                styles.purchaseStatusName
              }`}
            >
              {lable.statusName}
            </div>
            <strong className='gm-margin-lr-10'>
              {name}({sale_ratio}
              {std_unit_name}/{sale_unit_name})
            </strong>
            <div style={{ width: '250px' }} className='gm-position-relative'>
              <Progress
                percentage={percentage <= 100 ? percentage : 100}
                strokeWidth={14}
                textInside
                style={{ paddingRight: '110px' }}
              />
              <div
                className='gm-position-absolute gm-text-12'
                style={{ left: '100px', top: '3px' }}
              >
                {progressUnit === i18next.t('基本单位')
                  ? `${Big(already_purchase_amount).valueOf()}${std_unit_name}
                                    /${Big(
                                      plan_purchase_amount,
                                    ).valueOf()}${std_unit_name}`
                  : `${Big(already_purchase_amount)
                      .div(sale_ratio)
                      .toFixed(2)}${sale_unit_name}/
                                    ${Big(plan_purchase_amount)
                                      .div(sale_ratio)
                                      .toFixed(2)}${sale_unit_name}`}
              </div>
            </div>
          </Flex>
          <Flex className='gm-padding-top-15 gm-text-14'>
            <div>{i18next.t('采购描述：') + (task.description || '-')}</div>
          </Flex>
          <Flex row alignCenter className='gm-padding-top-15 gm-text-12'>
            <Flex alignCenter className='gm-padding-right-15'>
              {i18next.t('供应商')}：{this.renderSupplierName(task)}
            </Flex>

            {!isSupplierUser && (
              <div className='gm-margin-right-15'>
                {i18next.t('参考成本')}：
                {reference_price
                  ? `${Big(reference_price || 0)
                      .div(100)
                      .toFixed(2)}${Price.getUnit() + '/'}${std_unit_name}`
                  : '-'}
              </div>
            )}
            <Flex alignCenter className='gm-padding-right-15'>
              {i18next.t('采购员')}：{this.renderPurchaserName(task)}
            </Flex>
            <div className='gm-margin-right-15'>
              {i18next.t('建议采购')}：
              {stock < 0
                ? (suggestPurchaseNum = `${Big(
                    task.plan_purchase_amount,
                  ).toFixed(2)}${task.std_unit_name}`)
                : suggestPurchaseNum}
            </div>
            <div>
              {release_time
                ? i18next.t('KEY223', {
                    VAR1: moment(release_time).format('YYYY-MM-DD HH:mm:ss'),
                  }) /* src:`发布：${moment(release_time).format('YYYY-MM-DD HH:mm:ss')}` => tpl:发布：${VAR1} */
                : ''}
            </div>
          </Flex>
        </Flex>
        <Flex className='gm-padding-tb-15 gm-padding-lr-20'>
          <QuickTab
            active={this.state.tabKey}
            tabs={_.filter(
              [
                can_get_purchase_task_item
                  ? i18next.t('KEY224', {
                      VAR1: task.tasks.length,
                    }) /* src:`关联订单(${task.tasks.length})` => tpl:关联订单(${VAR1}) */
                  : null,
                can_get_purchase_history
                  ? i18next.t('KEY225', {
                      VAR1: purchaseHistory.length,
                    }) /* src:`关联采购单据(${purchaseHistory.length})` => tpl:关联采购单据(${VAR1}) */
                  : null,
                canShowRefInfo ? i18next.t('参考信息') : null,
              ],
              (item) => item,
            )}
            onChange={this.handleSelectTab}
            style={{ width: '860px' }}
          >
            {quickTabs}
          </QuickTab>
        </Flex>
      </Flex>
    )
  }
}

PopupGoodDetail.propTypes = {
  taskIds: PropTypes.object.isRequired,
  taskIndex: PropTypes.number.isRequired,
  taskList: PropTypes.array.isRequired,
  progressUnit: PropTypes.string,
  getSearchOption: PropTypes.func,
  onListSearchPage: PropTypes.func,
  onModalHide: PropTypes.func,
  onReleaseTask: PropTypes.func,
}

PopupGoodDetail.defaultProps = {
  taskIndex: 0,
  getSearchOption: _.noop(),
}

export default connect((state) => ({
  purchase_task: state.purchase_task,
}))(PopupGoodDetail)
