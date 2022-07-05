import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Flex, Modal, RightSideModal, Button, MoreSelect } from '@gmfe/react'
import { FilterSearchSelect } from '@gmfe/react-deprecated'
import { pinYinFilter } from '@gm-common/tool'
import _ from 'lodash'
import TaskList from '../../../task/task_list'
import '../actions.js'
import '../reducer.js'
import actions from '../../../actions'

class BatchModifyModal extends React.Component {
  constructor(props) {
    super(props)
    actions.purchase_task_batch_modify_change({
      selectedSupplier: null,
      selectedPurchaser: null,
    })
  }

  componentDidMount() {
    if (this.props.modifyType === 'supplier') {
      actions.purchase_task_settle_supplier_get().then((settle_suppliers) => {
        actions.purchase_task_batch_modify_change({
          selectedSupplier: settle_suppliers[0],
        })
      })
    } else {
      // TODO: 修改组件
      actions.purchase_sourcer_search('').then((json) => {
        actions.purchase_task_batch_modify_change({
          selectedPurchaser: json.data[0],
        })
      })
    }
  }

  handleSelect = (selected) => {
    const { modifyType } = this.props
    actions.purchase_task_batch_modify_change({
      [modifyType === 'supplier'
        ? 'selectedSupplier'
        : 'selectedPurchaser']: selected,
    })
  }

  hanleSearch = (value) => {
    actions.purchase_sourcer_search(value).then((json) => {
      actions.purchase_task_batch_modify_change({
        selectedPurchaser: json.data[0],
      })
    })
  }

  handleInputFilter = (list, query) => {
    return pinYinFilter(list, query, (supplier) => supplier.name)
  }

  handleTaskListOpen = () => {
    Modal.hide()
    RightSideModal.render({
      children: <TaskList tabKey={1} />,
      noCloseBtn: true,
      onHide: RightSideModal.hide,
      opacityMask: true,
      style: {
        width: '300px',
      },
    })
  }

  handleSubmit = () => {
    const {
      taskList,
      selectedAll,
      getSearchOption,
      purchase_task: { purchaseBatchModify },
    } = this.props
    const { selectedSupplier, selectedPurchaser } = purchaseBatchModify
    if (!selectedSupplier && !selectedPurchaser) {
      return
    }
    let options = {}
    let task_ids
    if (selectedAll) {
      options = getSearchOption()
    } else {
      const tasks = _.flatMap(taskList, (task) => task.tasks)
      task_ids = _.map(tasks, (task) => task.id)
    }
    actions
      .purchase_task_batch_modify_get({
        ...options,
        client: getSearchOption().client,
        task_ids: JSON.stringify(task_ids),
        all: selectedAll ? 1 : 0,
        change_settle_supplier: selectedSupplier && selectedSupplier.id,
        change_purchaser: selectedPurchaser && selectedPurchaser.id,
      })
      .then((json) => {
        this.handleTaskListOpen()
      })
  }

  render() {
    const { purchase_task } = this.props
    const {
      canUpdateSupliers,
      purchaseBatchModify,
      purchaseSourcer,
    } = purchase_task
    const { selectedSupplier, selectedPurchaser } = purchaseBatchModify
    const { taskList, modifyType, selectedAll } = this.props
    return (
      <Flex column>
        <div>
          {selectedAll
            ? i18next.t('已勾选所有采购任务，请选择批量修改的内容')
            : i18next.t(
                /* tpl:已勾选 ${VAR1} 个采购任务，请选择批量修改的内容 */ 'purchase_task_batch_modify',
                {
                  VAR1: taskList.length,
                },
              )}
        </div>
        <div className='gm-text-desc gm-margin-tb-5'>
          {modifyType === 'supplier'
            ? i18next.t(
                '请先确定供应商能供应勾选的采购任务，仅未发布的采购任务可修改供应商',
              )
            : i18next.t('未分配供应商或已经采购完成的采购任务无法修改采购员')}
        </div>
        <Flex alignCenter className='gm-margin-5'>
          <div>{i18next.t('修改成：')}</div>
          <div>
            {modifyType === 'supplier' ? (
              <FilterSearchSelect
                key={
                  'purchase_supplier_' +
                  ((selectedSupplier && selectedSupplier.id) || 'null')
                }
                list={canUpdateSupliers}
                selected={selectedSupplier}
                onSelect={this.handleSelect}
                onFilter={this.handleInputFilter}
              />
            ) : (
              <FilterSearchSelect
                key={
                  'purchase_purchaser_' +
                  ((selectedPurchaser && selectedPurchaser.id) || 'null')
                }
                onFilter={this.handleInputFilter}
                list={purchaseSourcer}
                selected={selectedPurchaser || ''}
                style={{ width: '100px' }}
                onSelect={this.handleSelect}
                // onSearch={(value) => this.hanleSearch(value)}
                placeholder={i18next.t('输入修改的采购员姓名')}
              />
            )}
          </div>
        </Flex>
        <Flex justifyEnd>
          <Button
            className='gm-margin-right-10'
            onClick={() => {
              Modal.hide()
            }}
          >
            {i18next.t('取消')}
          </Button>
          <Button type='primary' onClick={this.handleSubmit}>
            {i18next.t('确定')}
          </Button>
        </Flex>
      </Flex>
    )
  }
}

BatchModifyModal.propTypes = {
  taskList: PropTypes.array.isRequired,
  purchase_task: PropTypes.object,
  selectedAll: PropTypes.oneOf([0, 1]),
  getSearchOption: PropTypes.func,
  modifyType: PropTypes.oneOf(['supplier', 'purchaser']).isRequired,
}

BatchModifyModal.defaultProps = {
  selectedAll: 0,
}

export default connect((state) => ({
  purchase_task: state.purchase_task,
}))(BatchModifyModal)
// key={
//   'purchase_purchaser_' +
//   ((selectedPurchaser && selectedPurchaser.id) || 'null')
// }
// onFilter={this.handleInputFilter}
