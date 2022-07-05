import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import {
  Dialog,
  Collapse,
  Progress,
  Flex,
  Sheet,
  SheetColumn,
  Checkbox,
} from '@gmfe/react'
import Big from 'big.js'
import _ from 'lodash'
import classNames from 'classnames'
import store from '../store'

@observer
class TaskFinishDialog extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      detailShow: false,
    }
  }

  handleCollapse = () => {
    this.setState({ detailShow: !this.state.detailShow })
  }

  handleSelect = (index, event) => {
    store.taskSelect(index, event.target.checked)
  }

  render() {
    const { taskFinishDialogShow, finishTasks } = store
    const { detailShow } = this.state

    const completeNumber = _.filter(finishTasks, (t) => t._selected).length

    return (
      <Dialog
        show={taskFinishDialogShow}
        size='md'
        cancelBtn={false}
        OKBtn={i18next.t('完成')}
        title={i18next.t('确认任务状态')}
        onOK={() => store.taskFinish()}
        onCancel={() => store.taskCancel()}
        disableMaskClose
      >
        <Flex alignCenter justifyCenter className='b-psmd-finish-dialog-tip'>
          <i className='ifont ifont-success' /> {i18next.t('采购单据已提交！')}
        </Flex>

        {finishTasks.length > 0 ? (
          <div className='b-psmd-finish-dialog-content'>
            <div style={{ fontSize: '14px' }}>
              {i18next.t('确认以下任务已完成')}：{completeNumber}
            </div>
            <Collapse in={detailShow}>
              <Sheet list={finishTasks}>
                <SheetColumn
                  field='status'
                  style={{ width: '80px' }}
                  name={
                    <Checkbox
                      checked={!_.find(finishTasks, (task) => !task._selected)}
                      onChange={(event) =>
                        store.taskSelectAll(event.target.checked)
                      }
                    >
                      {' '}
                      {i18next.t('状态')}
                    </Checkbox>
                  }
                >
                  {(value, i) => {
                    const task = finishTasks[i]

                    return (
                      <Checkbox
                        checked={task._selected}
                        onChange={this.handleSelect.bind(this, i)}
                      />
                    )
                  }}
                </SheetColumn>
                <SheetColumn field='spec_name' name={i18next.t('商品名')} />
                <SheetColumn
                  field='already_purchased_amount'
                  name={i18next.t('已采/计划')}
                  style={{ width: '250px' }}
                >
                  {(already_purchased_amount, i) => {
                    const task = finishTasks[i]
                    const percent = Big(already_purchased_amount)
                      .div(task.plan_amount)
                      .toFixed(2)

                    return (
                      <Progress
                        strokeWidth={12}
                        text={`${task.already_purchased_amount}${task.std_unit_name}/${task.plan_amount}${task.std_unit_name}`}
                        percentage={percent > 1 ? 100 : percent * 100}
                      />
                    )
                  }}
                </SheetColumn>
              </Sheet>
            </Collapse>

            <Flex justifyCenter>
              <a href='javascript:;' onClick={this.handleCollapse}>
                {detailShow
                  ? i18next.t('收起详情 ')
                  : i18next.t('展开任务详情 ')}
                <i
                  className={classNames('ifont', {
                    'ifont-down': !detailShow,
                    'ifont-up': detailShow,
                  })}
                />
              </a>
            </Flex>
          </div>
        ) : null}
      </Dialog>
    )
  }
}

export default TaskFinishDialog
