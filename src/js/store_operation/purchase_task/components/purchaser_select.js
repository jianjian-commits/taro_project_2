import { i18next } from 'gm-i18n'
import React from 'react'
import { FilterSelect, Tip, Popover } from '@gmfe/react'
import { pinYinFilter } from '@gm-common/tool'
import { connect } from 'react-redux'
import _ from 'lodash'
import globalStore from '../../../stores/global'
import { getSearchOption } from '../util'
import TextToEdit from '../../../common/components/text_to_edit'
import actions from '../../../actions'

class PurchaserSelect extends React.Component {
  constructor(props) {
    super(props)
    const purchaserName = props.task.purchaser_name
    const curSelected = purchaserName
      ? { name: props.task.purchaser_name }
      : null
    this.state = {
      curSelected,
    }
  }

  handlePurchaserChange = (purchaser) => {
    this.setState({
      curSelected: purchaser,
    })
  }

  getSupplierBySku = () => {
    const { task } = this.props
    const options = getSearchOption(this.props.purchase_task)
    const { q_type, begin_time, end_time, time_config_id } = options
    // 获取供应商需要的参数
    const params = {
      q_type,
      begin_time,
      end_time,
      time_config_id,
      spec_id: task.spec_id,
    }
    actions.purchase_task_supplier_can_change_get(params)
  }

  handleOk = (orderIndex = null) => {
    const { curSelected } = this.state
    if (!curSelected || !curSelected.id) {
      Tip.warning(i18next.t('请选择采购员'))
      return
    }
    const { onOk } = this.props
    onOk(curSelected, orderIndex)
  }

  getSelectedTasksIndex() {
    const { taskListItem } = this.props.purchase_task
    const tasksIndex = []

    _.each(taskListItem, (task) => {
      _.each(task.tasks, (t, i) => {
        if (t._gm_select) {
          tasksIndex.push(i)
        }
      })
    })
    return tasksIndex
  }

  render() {
    const { taskSupplierMap } = this.props.purchase_task
    const { task } = this.props // task 结构 { orderIndex, editable, status, spec_id, settle_supplier_name}
    const { curSelected } = this.state
    const purchasers = []
    if (taskSupplierMap[task.spec_id]) {
      // const supplier =
      //   _.find(
      //     taskSupplierMap[task.spec_id],
      //     (item) => task.settle_supplier_id === item.id,
      //   ) || {}
      // console.log(taskSupplierMap[task.spec_id], task)
      const other_supplier =
        _.find(
          taskSupplierMap[task.spec_id].other_supplier,
          (item) => task.settle_supplier_id === item.id,
        ) || {}
      const otherSupplier = {
        label: i18next.t('其他'),
        children: _.map(other_supplier.purchasers, (item) => ({
          ...item,
          value: item.id,
          text: item.name,
        })),
      }
      const target_supplier =
        _.find(
          taskSupplierMap[task.spec_id].target_supplier,
          (item) => task.settle_supplier_id === item.id,
        ) || {}
      const targetSupplier = {
        label: i18next.t('推荐'),
        children: _.map(target_supplier.purchasers, (item) => ({
          ...item,
          value: item.id,
          text: item.name,
        })),
      }
      purchasers.push(targetSupplier, otherSupplier)
    }
    // console.log(taskSupplierMap, supplier, task.spec_id)
    const { orderIndex } = task
    const canEdit =
      task.status <= 2 &&
      globalStore.hasPermission('edit_released_purchase_task') &&
      task.editable &&
      !globalStore.isSettleSupply() /* 未发布 且 task.editable 且 不是供应商 或已发布有权限 */
    const id =
      task.id || `${task.spec_id}-${task.settle_supplier_id}-${task.status}`
    const tasksIndex = this.getSelectedTasksIndex()
    const selectedIndex = tasksIndex.length ? tasksIndex : orderIndex
    const defaultProps = {
      editingView: (
        <div style={{ width: '100px', display: 'inline-block' }}>
          <FilterSelect
            isGroupList
            id={`purchaser_${id}`}
            list={purchasers}
            selected={curSelected}
            onSelect={this.handlePurchaserChange}
            withFilter={(list, query) => {
              const allList = []
              const targetSupplier = {
                label: i18next.t('推荐'),
                children: _.map(
                  pinYinFilter(
                    list[0].children,
                    query,
                    (supplier) => supplier.name,
                  ),
                  (ts) => ({
                    ...ts,
                    value: ts.id,
                    text: ts.name,
                  }),
                ),
              }
              const otherSupplier = {
                label: i18next.t('其他'),
                children: _.map(
                  pinYinFilter(
                    list[1].children,
                    query,
                    (supplier) => supplier.name,
                  ),
                  (os) => ({
                    ...os,
                    value: os.id,
                    text: os.name,
                  }),
                ),
              }
              allList.push(targetSupplier, otherSupplier)
              return allList
            }}
            placeholder={i18next.t('选择采购员')}
          />
        </div>
      ),
      textView: <span>{task.purchaser_name || '-'}</span>,
      onEdit: this.getSupplierBySku,
      onOk: () => {
        this.handleOk(selectedIndex)
      },
    }
    if (tasksIndex.length && _.includes(tasksIndex, orderIndex)) {
      const popupRenderer = (content) => {
        return (
          <Popover
            showArrow
            center
            top
            type='hover'
            popup={
              <div className='gm-padding-5'>
                {i18next.t(
                  /* tpl:将批量编辑已选中的${num}个订单 */ 'editable_supplier_batch_select_tip',
                  { num: selectedIndex.length },
                )}
              </div>
            }
          >
            {content}
          </Popover>
        )
      }
      return (
        <TextToEdit
          {...Object.assign(defaultProps, {
            canEdit,
            textContainer: popupRenderer,
            editContainer: popupRenderer,
            editBtn: (
              <a className='xfont xfont-edit-batch gm-margin-left-5 b-hover-show-item b-color-active' />
            ),
          })}
        />
      )
    }
    return <TextToEdit {...Object.assign(defaultProps, { canEdit })} />
  }
}

export default connect((state) => ({
  purchase_task: state.purchase_task,
}))(PurchaserSelect)
