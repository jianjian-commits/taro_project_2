import React from 'react'
import ScheduleRightModal from './schedule_right_modal'
import { i18next } from 'gm-i18n'
import { inject, observer } from 'mobx-react'

@inject('store')
@observer
class ScheduleBtn extends React.Component {
  handleOpenModal = () => {
    ScheduleRightModal.render()
  }

  render() {
    return this.props.store.distributeOrderList.length ? (
      <div
        className='b-overview gm-border gm-padding-5'
        onClick={this.handleOpenModal}
      >
        {i18next.t('总览')}
      </div>
    ) : null
  }
}

export default ScheduleBtn
