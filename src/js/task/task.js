import { i18next } from 'gm-i18n'
import React from 'react'
import { RightSideModal } from '@gmfe/react'
import TaskList from './task_list'

class Task extends React.Component {
  constructor(props) {
    super(props)

    this.handleTaskListShow = ::this.handleTaskListShow
  }

  handleTaskListShow() {
    RightSideModal.render({
      children: <TaskList />,
      noCloseBtn: true,
      onHide: RightSideModal.hide,
      opacityMask: true,
      style: {
        width: '300px',
      },
    })
  }

  render() {
    return (
      <div className='b-task gm-padding-5' onClick={this.handleTaskListShow}>
        {i18next.t('任务')}
      </div>
    )
  }
}

export default Task
