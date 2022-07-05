import { i18next } from 'gm-i18n'
import React from 'react'
import Big from 'big.js'
import PropType from 'prop-types'
import { FilterSelect, Tip, Popover, Price, MoreSelect } from '@gmfe/react'
import { pinYinFilter } from '@gm-common/tool'
import actions from '../../../../actions'
import { connect } from 'react-redux'
import TextToEdit from '../../../../common/components/text_to_edit'
import { saleReferencePrice } from '../../../../common/enum'
import { getSearchOption } from '../../util'
import _ from 'lodash'
import globalStore from '../../../../stores/global'

class SupplierSelect extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      curSelected: { name: props.task.settle_supplier_name },
    }
  }

  handleSupplierChange = (supplier) => {
    this.setState({
      curSelected: supplier,
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
    if (!curSelected.id) {
      Tip.warning(i18next.t('请选择供应商'))
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

  supplierNameRender = (supplier) => {
    const { reference_price_type } = this.props.purchase_task
    const { std_unit_name } = this.props.task
    let supplyRemain = supplier.supply_remain
    if (_.isNil(supplyRemain) || supplyRemain === '') {
      supplyRemain = '-'
    } else {
      supplyRemain = `${Big(supplyRemain).toFixed(2)}${std_unit_name}`
      if (supplier.supply_remain <= 0) {
        supplyRemain = <span className='gm-text-red'> {supplyRemain} </span>
      }
    }

    supplyRemain = (
      <span>
        {' '}
        {i18next.t('剩余可供')}:{supplyRemain}{' '}
      </span>
    )
    let suffixText = ''
    // 参考成本对应字段
    const referencePrice = _.find(saleReferencePrice, (item) => {
      if (item.type === reference_price_type) {
        return true
      }
    })

    const val = supplier[referencePrice.flag]
    suffixText += `，${referencePrice.name}:${
      _.isNil(val) || val === ''
        ? '-'
        : Big(val).div(100).toFixed(2) + Price.getUnit() + '/' + std_unit_name
    }`

    return (
      <div style={{ width: '180px' }}>
        {supplier.name}{' '}
        <span style={{ color: '#888' }}>
          {' '}
          ( {supplyRemain} {suffixText} ){' '}
        </span>
      </div>
    )
  }

  supplierSelectRender(props) {
    const { taskSupplierMap } = this.props.purchase_task
    const { task } = this.props // task 结构 { orderIndex, editable, status, spec_id, settle_supplier_name}
    const { curSelected } = this.state
    const { orderIndex } = task
    const id =
      task.id || `${task.spec_id}-${task.settle_supplier_id}-${task.status}`
    const list = []
    const supMap = taskSupplierMap[task.spec_id]
    if (supMap) {
      const { other_supplier, target_supplier } = supMap
      const targetSupplier = {
        label: i18next.t('推荐'),
        children: _.map(target_supplier, (ts) => ({
          ...ts,
          value: ts.id,
          text: ts.name,
        })),
      }
      const otherSupplier = {
        label: i18next.t('其他'),
        children: _.map(other_supplier, (os) => ({
          ...os,
          value: os.id,
          text: os.name,
        })),
      }
      list.push(targetSupplier, otherSupplier)
    }

    const defaultProps = {
      editingView: (
        <div style={{ width: '100px', display: 'inline-block' }}>
          <FilterSelect
            isGroupList
            id={id}
            list={list || []}
            selected={curSelected}
            onSelect={this.handleSupplierChange}
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
            renderItemName={this.supplierNameRender}
            placeholder={i18next.t('选择供应商')}
          />
          {/* <MoreSelect
            isGroupList
            style={{ minWidth: 150 }}
            isInPopup
            data={list}
            selected={curSelected}
            onSelect={this.handleSupplierChange}
          /> */}
        </div>
      ),
      textView: <span>{task.settle_supplier_name}</span>,
      onEdit: this.getSupplierBySku,
      onOk: () => {
        this.handleOk(orderIndex)
      } /* 有 orderIndex 为单个 task，没有为更新全部 task */,
    }

    props = Object.assign(defaultProps, props)
    return <TextToEdit {...props} />
  }

  render() {
    const { task } = this.props // task 结构 { orderIndex, editable, status, spec_id, settle_supplier_name}
    const { orderIndex } = task
    const canEdit =
      task.status !== 3 &&
      globalStore.hasPermission('edit_purchase_task_supplier') &&
      task.editable &&
      !globalStore.isSettleSupply() /* 未发布 且 task.editable 且 不是供应商 */
    if (!_.isNil(orderIndex)) {
      const selectedIndex = this.getSelectedTasksIndex()
      if (selectedIndex.includes(orderIndex) && canEdit) {
        const popupRenderer = (content) => {
          return (
            <Popover
              showArrow
              center
              top
              component={<div />}
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
        // tasks 的供应商当前行被选中 且 能编辑 则执行批量 1. hover要提示是批量分配 2. 编辑按钮变成批量的
        return this.supplierSelectRender({
          textContainer: (textContent) => {
            return popupRenderer(textContent)
          },
          editContainer: (editContent) => {
            return popupRenderer(editContent)
          },
          textView: <span>{task.settle_supplier_name}</span>,
          canEdit,
          editBtn: (
            <a className='xfont xfont-edit-batch gm-margin-left-5 b-hover-show-item b-color-active' />
          ),
          onOk: () => {
            this.handleOk(selectedIndex)
          },
        })
      }
    }
    return this.supplierSelectRender({ canEdit })
  }
}

SupplierSelect.propTypes = {
  task: PropType.object.isRequired,
  purchase_task: PropType.object.isRequired,
  onOk: PropType.func.isRequired,
}

export default connect((state) => ({
  purchase_task: state.purchase_task,
}))(SupplierSelect)
