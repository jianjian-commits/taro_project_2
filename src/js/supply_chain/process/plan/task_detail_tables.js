import { i18next } from 'gm-i18n'
import React, { useEffect } from 'react'
import { Flex, Popover, Modal, Drawer } from '@gmfe/react'
import { TableX, selectTableXHOC } from '@gmfe/table-x'
import { orderState, remarkType } from 'common/filter'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import Big from 'big.js'
import { TaskStore as taskStore } from './store'
import TaskPublishModal from './components/task_publish_modal'
import _ from 'lodash'
import globalStore from 'stores/global'

const convert2 = (num) => parseFloat(Number(num).toFixed(2))

const SelectTable = selectTableXHOC(TableX)

export const WithOrders = observer((props) => {
  const { skuIndex } = props
  const { tasks, sale_unit_name, status } = taskStore.taskList[skuIndex]
  const { taskSelected } = taskStore

  useEffect(() => {
    return () => taskStore.changeTaskSelected([])
  }, [])

  const handleSelect = (selected) => {
    taskStore.changeTaskSelected(selected)
  }

  const getPublishData = (orderIndex, type) => {
    const { order_request_release_amount_type } = globalStore.processInfo

    // 商品数据，tasks为关联订单数据
    const data = { ...taskStore.taskList[skuIndex] }
    const { stock } = data
    // 批量发布
    if (type === 'batch') {
      const { taskSelected } = taskStore

      data.ids = taskSelected.slice()
      let totalAmount = 0
      _.each(taskSelected, (selected) => {
        _.each(data.tasks, (task) => {
          if (task.id === selected) {
            totalAmount += task.order_amount
          }
        })
      })
      // 这里的下单数是所选订单下单数总和
      data.plan_amount = totalAmount
      const suggest = +Big(totalAmount).minus(stock).toFixed(2)
      const defaultReleaseAmount = +Big(
        order_request_release_amount_type === 1 ? suggest : totalAmount,
      ).toFixed(2) // 计划生产数跟着系统设置走，1为按建议计划生产数，2为按下单数

      data.req_release_amount =
        defaultReleaseAmount > 0 ? defaultReleaseAmount : 0 // 建议计划生产数可能是负数，将负数都改成0
    } else if (type === 'single') {
      const { id, order_amount } = data.tasks[orderIndex]
      data.ids = [id]
      data.plan_amount = order_amount

      const suggest = +Big(order_amount).minus(stock).toFixed(2)
      const defaultReleaseAmount = +Big(
        order_request_release_amount_type === 1 ? suggest : order_amount,
      ).toFixed(2) // 计划生产数跟着系统设置走，1为按建议计划生产数，2为按下单数

      data.req_release_amount =
        defaultReleaseAmount > 0 ? defaultReleaseAmount : 0 // 建议计划生产数可能是负数，将负数都改成0
    }

    return [data]
  }

  const handlePublish = (orderIndex, type) => {
    taskStore.setPublishData(getPublishData(orderIndex, type))
    Drawer.hide()
    setTimeout(() => {
      Modal.render({
        children: <TaskPublishModal viewType='edit' />,
        size: 'md',
        title: i18next.t('发布生产任务'),
        onHide: Modal.hide,
      })
    })
  }

  return (
    <SelectTable
      data={tasks.slice()}
      keyField='id'
      onSelect={handleSelect}
      selected={taskSelected}
      isSelectorDisable={() => status > 1}
      className='gm-margin-top-5'
      columns={[
        {
          Header: i18next.t(''),
          accessor: 'operate',
          width: '30',
          Cell: (cellProps) => {
            const {
              index,
              original: { id },
            } = cellProps.row
            const hasSelected = taskSelected.includes(id)
            return status > 1 ? null : (
              <Popover
                showArrow
                left
                component={<div />}
                type='hover'
                popup={
                  // eslint-disable-next-line gm-react-app/no-deprecated-react-gm
                  <div
                    className='gm-text-white gm-cursor btn-primary gm-padding-lr-15'
                    onClick={() =>
                      handlePublish(index, hasSelected ? 'batch' : 'single')
                    }
                  >
                    {hasSelected ? i18next.t('批量发布') : i18next.t('发布')}
                  </div>
                }
              >
                {hasSelected ? (
                  <i className='xfont xfont-down-box text-primary gm-text-16 gm-cursor' />
                ) : (
                  <i className='xfont xfont-down-box-o gm-text-16 gm-cursor text-primary' />
                )}
              </Popover>
            )
          },
        },
        {
          Header: i18next.t('订单号'),
          accessor: 'order_id',
        },
        {
          Header: i18next.t('线路'),
          accessor: 'route_name',
        },
        {
          Header: i18next.t('司机'),
          accessor: 'driver_name',
        },
        {
          Header: i18next.t('商户名'),
          accessor: 'resname',
        },
        {
          Header: i18next.t('商户标签'),
          accessor: 'address_label',
        },
        {
          Header: i18next.t('订单状态'),
          accessor: 'order_status',
          Cell: ({ row: { original } }) =>
            `${orderState(original.order_status)} (${
              original.sort_id ? original.sort_id : '-'
            })`,
        },
        {
          Header: i18next.t('下单数'),
          accessor: 'order_amount',
          Cell: (cellProps) => {
            const { original } = cellProps.row
            return `${original.order_amount}${sale_unit_name}`
          },
        },
      ]}
    />
  )
})

WithOrders.propTypes = {
  skuIndex: PropTypes.number.isRequired,
}

export const MaterialInfo = observer((props) => {
  const { materials, taskList } = taskStore
  const { plan_amount } = taskList[props.skuIndex]

  return (
    <TableX
      data={materials.slice()}
      className='gm-margin-top-5'
      columns={[
        {
          Header: i18next.t('物料名'),
          accessor: 'ingredient_name',
          Cell: ({ row: { original } }) =>
            `${original.ingredient_name}(${original.ingredient_id})`,
        },
        {
          Header: i18next.t('商品类型'),
          accessor: 'remark_type',
          Cell: (cellProps) => remarkType(cellProps.row.original.remark_type),
        },
        {
          Header: (
            <Flex column>
              <div>{i18next.t('所需数量')}</div>
              <div>{i18next.t('(基本单位)')}</div>
            </Flex>
          ),
          accessor: 'proportion',
          Cell: ({ row: { original } }) =>
            `${convert2(plan_amount * original.proportion)}${
              original.std_unit_name
            }`,
        },
        {
          Header: i18next.t('规格'),
          accessor: 'ratio',
          Cell: ({ row: { original } }) => {
            const { std_unit_name, sale_unit_name } = original
            return std_unit_name === sale_unit_name
              ? `${i18next.t('按')}${std_unit_name}`
              : `${original.ratio}${std_unit_name}/${sale_unit_name}`
          },
        },
        {
          Header: (
            <Flex column>
              <div>{i18next.t('所需数量')}</div>
              <div>{i18next.t('(包装单位)')}</div>
            </Flex>
          ),
          accessor: 'ratio',
          Cell: ({ row: { original } }) =>
            `${convert2((plan_amount * original.proportion) / original.ratio)}${
              original.sale_unit_name
            }`,
        },
      ]}
    />
  )
})

MaterialInfo.propTypes = {
  skuIndex: PropTypes.number.isRequired,
}
