import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Flex, Progress, Tip, RightSideModal, Loading } from '@gmfe/react'
import { QuickTab } from '@gmfe/react-deprecated'
import { Request } from '@gm-common/request'
import { SvgRemove } from 'gm-svg'

import _ from 'lodash'
import './task_list.less'
import { history } from '../common/service'
import globalStore from 'stores/global'

class TaskList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tabKey: props.tabKey || 0,
      taskList: [],
    }

    this.handleChangeTab = ::this.handleChangeTab
    this.handleClearTaskCompleted = ::this.handleClearTaskCompleted
  }

  componentDidMount() {
    Request('/task/list')
      .get()
      .then((json) => {
        this.setState({ taskList: json.data.tasks })
        const finish = json.data.finish

        if (!finish) {
          this.timer = setInterval(() => {
            Request('/task/list')
              .get()
              .then((res) => {
                this.setState({ taskList: res.data.tasks })
                if (res.data.finish) {
                  clearTimeout(this.timer)
                }
              })
          }, 2000)
        }
      })
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
  }

  async updateTaskList() {
    await Request('/task/list')
      .get()
      .then((json) => {
        this.setState({ taskList: json.data.tasks })
      })
  }

  async handleClearTaskCompleted() {
    const task_ids = JSON.stringify(
      _.compact(
        _.map(this.state.taskList, (task) =>
          task.task_id ? task.task_id : null,
        ),
      ),
    )

    const user_task_ids = JSON.stringify(
      // 过滤空值
      _.compact(
        _.map(this.state.taskList, (task) =>
          task.user_task_id ? task.user_task_id : null,
        ),
      ),
    )

    await Request('/task/clear_show')
      .data({
        task_ids,
        user_task_ids,
      })
      .post()

    this.updateTaskList().then(() => Tip.success(i18next.t('清除任务成功')))
  }

  handleChangeTab(key) {
    this.setState({ tabKey: key })
  }

  handleError(task) {
    switch (task.type) {
      case 0:
        return history.push(
          `/order_manage/order/list/batch?async_task_id=${task.result.link}`,
        )
      case 3:
        return history.push(
          `/order_manage/order/list/sync_price?task_id=${task.task_id}&type=${task.type}`,
        )
      case 4:
        return history.push(
          `/merchandise/manage/list/smart_price?type=${task.task_id}`,
        )
      case 6:
        return history.push(
          `/sales_invoicing/base/supplier/quotation_error_list?task_id=${task.task_id}`,
        )
      case 9:
        return history.push(
          `/merchandise/manage/list/cloud_goods/error_list?id=${task.task_id}`,
        )
      case 10:
        return history.push(
          globalStore.isCleanFood()
            ? `/sales_invoicing/inventory/stock_overview/error?task_id=${task.task_id}`
            : `/sales_invoicing/inventory/product/error/show?task_id=${task.task_id}`,
        ) // 净菜站点路由和毛菜不同
      // 批量修改供应商
      case 13:
        return history.push(
          `/merchandise/manage/sale/priority_supplier/error_list?task_id=${task.task_id}`,
        )
      // 批量新建采购条目
      case 14:
        return history.push({
          pathname: '/supply_chain/purchase/task/batch_modify_retry',
          query: {
            task_id: task.task_id,
          },
        })
      case 15:
      case 16:
      case 23:
        return window.open(task.result.target)
      // 订单价格同步至报价单
      case 17:
        return history.push(
          `/order_manage/order/list/sync_price?task_id=${task.task_id}&type=${task.type}`,
        )
      // 手动修改商品单价
      case 18:
        return history.push(
          `/order_manage/order/list/sync_price?task_id=${task.task_id}&type=${task.type}`,
        )
      // 批量替换商品
      case 19:
        return history.push(
          `/order_manage/order/list/replace_result?task_id=${task.task_id}`,
        )
      // 批量删除商品
      case 20:
        return history.push(
          `/order_manage/order/list/delete_result?task_id=${task.task_id}`,
        )
      // 保存计划（净菜）
      case 24:
        return history.push(
          `/supply_chain/process/plan/create/error_list?task_id=${task.task_id}`,
        )
      case 33: {
        return history.push(
          `/order_manage/order_review/error_list?task_id=${task.task_id}`,
        )
      }
      default:
        return null
    }
  }

  // 取消任务
  async handleCancel(task_id) {
    await Request('/task/cancel').data({ task_id }).post()

    this.updateTaskList()
  }

  renderTaskMsg = (task) => {
    if (+task.status === 3) {
      if (task.result.target) {
        return (
          <a className='gm-cursor' onClick={this.handleError.bind(this, task)}>
            {task.result.msg}
          </a>
        )
      }
      if (task.result.link) {
        return (
          <a href={task.result.link} className='gm-cursor'>
            {task.result.msg}
          </a>
        )
      }
      return <span className='b-task-primary-color'>{task.result.msg}</span>
    }

    if (+task.status === 4 || +task.status === 5) {
      return <span className='b-task-red'>{task.result.msg}</span>
    }

    if (task.status !== 12) {
      return (
        <Flex>
          <Progress percentage={task.progress} style={{ width: '95%' }} />
          {task.can_cancel && (
            <span
              className='gm-cursor'
              onClick={this.handleCancel.bind(this, task.task_id)}
            >
              <SvgRemove />
            </span>
          )}
          {/* 取消中加个loading */}
          {task.status === 11 && <Loading size={16} />}
        </Flex>
      )
    }

    // status = 12 取消成功 显示文案
    return task.result.msg && <span>{task.result.msg}</span>
  }

  renderTask(list, TabKey) {
    // type  M  int 任务类型，0-订单列表批量导入, 1-导出, 2-成品出库处理，3-订单列表批量同步单价 4-批量智能定价 5-采购询价批量导入 7-删除报价单
    // 17-订单价格同步至报价单 18-手动修改商品价格(订单)
    // status M int 任务状态, 1-已经提交, 2-正在执行, 3-已经完成, 4-部分成功, 停止执行, 5-执行失败(全部失败), 停止执行
    // 11-取消中, 12-任务取消, 11 12是新异步系统才有的
    // result.target O int 前后端约定, 表示前端路由跳转
    // can_cancel bool 是否显示取消按钮
    return _.map(list, (task) => {
      return (
        <div key={task.task_id} className='gm-padding-tb-5 gm-border-bottom'>
          {+task.status === 3 && TabKey === 1 ? (
            <a href={task.result.link}>{task.task_name}&nbsp;&nbsp;</a>
          ) : (
            <span className='gm-margin-bottom-5'>
              {task.task_name}&nbsp;&nbsp;
            </span>
          )}

          {this.renderTaskMsg(task)}
        </div>
      )
    })
  }

  render() {
    const { taskList, tabKey } = this.state

    const exportTaskList = _.filter(taskList, (task) => {
      return +task.type === 1
    })

    const batchTaskList = _.filter(taskList, (task) => {
      return +task.type !== 1
    })

    return (
      <Flex column className='b-task-list'>
        <Flex flex column>
          <QuickTab
            active={tabKey}
            justified
            tabs={[i18next.t('导出任务'), i18next.t('批量任务')]}
            onChange={this.handleChangeTab}
          >
            <div className='gm-border-top-0 b-task-content'>
              <Flex flex column className='gm-padding-15'>
                {this.renderTask(exportTaskList, 1).length === 0 ? (
                  <div className='text-center gm-text-desc'>
                    {i18next.t('暂无导出任务')}
                  </div>
                ) : (
                  this.renderTask(exportTaskList, 1)
                )}
              </Flex>
            </div>
            <div className='gm-border-top-0 b-task-content'>
              <Flex flex column className='gm-padding-15'>
                {this.renderTask(batchTaskList, 2).length === 0 ? (
                  <div className='text-center gm-text-desc'>
                    {i18next.t('暂无批量任务')}
                  </div>
                ) : (
                  this.renderTask(batchTaskList, 2)
                )}
              </Flex>
            </div>
          </QuickTab>
        </Flex>
        <Flex column className='b-task-bottom'>
          {+tabKey === 0 ? (
            <Flex
              justifyCenter
              alignCenter
              className='gm-text-desc b-task-desc'
            >
              {i18next.t('导出文件有效期24小时，过期自动删除')}
            </Flex>
          ) : null}
          <Flex
            justifyCenter
            className='b-task-clear gm-padding-10 gm-border-top'
            onClick={this.handleClearTaskCompleted}
          >
            <i className='xfont xfont-delete gm-margin-right-5' />
            {i18next.t('清空已完成任务')}
          </Flex>
        </Flex>
      </Flex>
    )
  }
}

TaskList.propTypes = {
  tabKey: PropTypes.number,
}

export default TaskList

const showTaskPanel = (modalParams, taskParams) => {
  RightSideModal.render({
    children: <TaskList {...taskParams} />,
    noCloseBtn: true,
    onHide: RightSideModal.hide,
    opacityMask: true,
    style: {
      width: '300px',
    },
    ...modalParams,
  })
}

export { showTaskPanel }
