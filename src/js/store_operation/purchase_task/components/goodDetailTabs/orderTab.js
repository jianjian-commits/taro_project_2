import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import {
  Sheet,
  SheetColumn,
  SheetSelect,
  Flex,
  Popover,
  Tip,
  Button,
} from '@gmfe/react'
import styles from '../../style.module.less'
import { orderState, getEnumValue } from '../../../../common/filter'
import Big from 'big.js'
import actions from '../../../../actions'
import _ from 'lodash'
import SupplierSelect from '../editable_supplier_select'
import PurchaserSelect from '../purchaser_select'
import globalStore from '../../../../stores/global'
import { PURCHASE_ORIGIN_STATUS } from '../../../../common/enum'
import SupplierDel from 'common/components/supplier_del_sign'
class OrderTab extends React.Component {
  handleTaskOrderSelect(task, checked, i) {
    actions.purchase_task_order_select(task, checked, i)
  }

  handleTaskOrderSelectAll(task, checked) {
    actions.purchase_task_order_select(task, checked)
  }

  getSelectedTaskOrderList() {
    const { taskListItem } = this.props.purchaseTask
    const tasks = []

    _.each(taskListItem, (task, index) => {
      _.each(task.tasks, (t) => {
        if (task._gm_select || t._gm_select) {
          tasks.push({
            id: t.id, //  商品采购订单的id
            purchaser_name: t.purchaser_name,
            plan_purchase_amount: t.plan_purchase_amount,
            taskStock: task.stock, // 商品总的库存
            index: index, // 商品列表项的唯一性
          })
        }
      })
    })

    return tasks
  }

  handleReleaseTaskOrder(params) {
    const singleOrder = params && params.singleOrder
    const { handleReleaseTask } = this.props
    // 当前弹出页面的单个发布、批量发布
    const orderListChoosed = singleOrder
      ? [singleOrder]
      : this.getSelectedTaskOrderList()
    handleReleaseTask({ ...params, orderListChoosed }).then((data) => {
      if (data) {
        // 如果返回为true 则刷新页面
        actions.refreshTaskList(orderListChoosed)
      }
    })
  }

  async handleDel(id, orders) {
    const { handleListSearchPage, handleChangeModalHide } = this.props
    await actions.purchase_item_del(id)
    Tip.success(i18next.t('条目删除成功'))
    if (orders.length === 1) {
      handleChangeModalHide()
    }
    // 刷新列表
    handleListSearchPage()
    actions.refreshTaskList([{ id }])
  }

  render() {
    const { task, handleChangeModalHide, handleTaskSupplierUpdate } = this.props
    const orders = task.tasks

    const selectedOrdersIndex = _.reduce(
      orders,
      (accm, order, index) => {
        if (order._gm_select) {
          accm.push(index)
        }
        return accm
      },
      [],
    )
    const can_edit_purchase_task_release = globalStore.hasPermission(
      'edit_purchase_task_release',
    ) // 发布权限
    const can_delete_purchase_task_item = globalStore.hasPermission(
      'delete_purchase_task_item',
    ) // 删除权限
    const isSupplierUser = globalStore.isSettleSupply()
    const { isCStation } = globalStore.otherInfo

    return (
      <Sheet list={orders} className={styles.purchaseListSubTable}>
        <SheetColumn field=''>
          {(item, i) => {
            const order = orders[i]
            const { id, order_id } = order
            const singleOrder = {
              // 直接点击发布 任务
              id: order.id,
              purchaser_name: order.purchaser_name,
              plan_purchase_amount: order.plan_purchase_amount,
              stock: task.stock, // 对应商品的库存
            }

            if (task.status !== 1) {
              return false
            }
            if (selectedOrdersIndex.includes(i)) {
              return !isSupplierUser && can_edit_purchase_task_release ? (
                <Popover
                  showArrow
                  left
                  component={<div />}
                  type='hover'
                  popup={
                    <div>
                      <Button
                        type='primary'
                        onClick={() =>
                          this.handleReleaseTaskOrder({
                            handleChangeModalHide,
                            ifhandleModeHide:
                              orders.length === selectedOrdersIndex.length,
                          })
                        }
                      >
                        {i18next.t('批量发布')}
                      </Button>
                    </div>
                  }
                >
                  <i className='xfont xfont-down-box text-primary gm-text-16 gm-cursor' />
                </Popover>
              ) : null
            } else {
              return !isSupplierUser &&
                (can_edit_purchase_task_release ||
                  (can_delete_purchase_task_item && !order_id)) ? (
                <Popover
                  showArrow
                  left
                  component={<div />}
                  type='hover'
                  popup={
                    <Flex column className='gm-text-white gm-cursor'>
                      {can_edit_purchase_task_release ? (
                        <div>
                          <Button
                            type='primary'
                            className='gm-padding-lr-15'
                            onClick={() =>
                              this.handleReleaseTaskOrder({
                                singleOrder,
                                handleChangeModalHide,
                                ifhandleModeHide: orders.length === 1,
                              })
                            }
                          >
                            {i18next.t('发布')}
                          </Button>
                        </div>
                      ) : null}
                      {can_delete_purchase_task_item && !order_id ? (
                        <div
                          className='gm-text-black gm-back-bg gm-padding-lr-15'
                          onClick={this.handleDel.bind(this, id, orders)}
                        >
                          {i18next.t('删除')}
                        </div>
                      ) : null}
                    </Flex>
                  }
                >
                  <i className='xfont xfont-down-box-o gm-text-16 gm-cursor text-primary' />
                </Popover>
              ) : null
            }
          }}
        </SheetColumn>
        <SheetColumn name={i18next.t('单号')} field='order_id' placeholder='-'>
          {(order_id, index) => {
            // 预生产计划显示计划编号
            return orders[index].source_type === 4
              ? orders[index].process_order_custom_id
              : order_id
          }}
        </SheetColumn>
        {!isCStation && (
          <SheetColumn
            name={i18next.t('线路')}
            field='route_name'
            placeholder='-'
          />
        )}
        <SheetColumn
          name={i18next.t('商户名')}
          field='res_name'
          placeholder='-'
        />
        <SheetColumn
          name={i18next.t('订单状态')}
          field='order_status'
          placeholder='-'
        >
          {(order_status) => {
            return order_status ? orderState(order_status) : '-'
          }}
        </SheetColumn>
        <SheetColumn
          name={i18next.t('计划采购')}
          field='plan_purchase_amount'
          placeholder='-'
        >
          {(plan_purchase_amount) => {
            return `${Big(plan_purchase_amount)
              .div(task.sale_ratio)
              .toFixed(2)}${task.sale_unit_name}
                            (${Big(plan_purchase_amount).div(1).valueOf()}${
              task.std_unit_name
            })`
          }}
        </SheetColumn>
        <SheetColumn field='sale_ratio' name={i18next.t('销售规格')}>
          {(sale_ratio, orderIndex) => {
            const order = orders[orderIndex]
            // 净菜且多物料（ingredient_full_name === ''）时展示‘-’
            const cleanFoodText =
              order.ingredient_full_name === ''
                ? '-'
                : order.ingredient_full_name

            const normalText = sale_ratio
              ? Big(sale_ratio).mul(order.std_ratio).toFixed(2) +
                task.std_unit_name +
                '/' +
                order.sale_unit_name
              : '-'

            const text = order.clean_food ? cleanFoodText : normalText

            return <span>{text}</span>
          }}
        </SheetColumn>
        <SheetColumn
          name={i18next.t('商品备注')}
          field='remark'
          render={(remark) => remark || '-'}
        />
        <SheetColumn
          name={<div style={{ minWidth: '160px' }}>{i18next.t('供应商')}</div>}
          field='settle_supplier_name'
          className={styles.taskOrderSupplierTd}
        >
          {(settle_supplier_name, orderIndex) => {
            const order = orders[orderIndex]
            const { editable } = order

            const taskParams = {
              status: task.status,
              editable,
              spec_id: task.spec_id,
              std_unit_name: task.std_unit_name,
              settle_supplier_name,
              orderIndex,
            }
            return (
              <Flex>
                {task.supplier_status === 0 && <SupplierDel />}
                <SupplierSelect
                  task={taskParams}
                  onOk={handleTaskSupplierUpdate.bind(
                    this,
                    'settle_supplier_id',
                    task,
                  )}
                />
              </Flex>
            )
          }}
        </SheetColumn>
        <SheetColumn
          field='purchaser_name'
          name={<div style={{ minWidth: '80px' }}>{i18next.t('采购员')}</div>}
        >
          {(purchaser_name, orderIndex) => {
            return (
              <PurchaserSelect
                task={{ ...task, orderIndex }}
                onOk={handleTaskSupplierUpdate.bind(this, 'purchaser_id', task)}
              />
            )
          }}
        </SheetColumn>
        <SheetColumn
          name={i18next.t('采购来源')}
          field='source_type'
          placeholder='-'
        >
          {(source_type) => {
            return getEnumValue(PURCHASE_ORIGIN_STATUS, source_type)
          }}
        </SheetColumn>
        <SheetSelect
          onSelect={this.handleTaskOrderSelect.bind(this, task)}
          onSelectAll={this.handleTaskOrderSelectAll.bind(this, task)}
          isDisabled={() => !!task.release_id}
        />
      </Sheet>
    )
  }
}

OrderTab.propTypes = {
  list: PropTypes.array.isRequired,
  taskIndex: PropTypes.number.isRequired,
  purchaseTask: PropTypes.object.isRequired,
  handleReleaseTask: PropTypes.func,
  task: PropTypes.object,
  handleTaskSupplierUpdate: PropTypes.func,
  handleChangeModalHide: PropTypes.func,
  handleListSearchPage: PropTypes.func,
}

OrderTab.defaultProps = {
  list: [],
  taskIndex: 0,
}

export default OrderTab
