import { i18next } from 'gm-i18n'
import React from 'react'
import { Modal, Select, Option, Button } from '@gmfe/react'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { editStatusArr } from '../../common/enum'
import store from './store'

@observer
class SubWarehouseActionModal extends React.Component {
  constructor(props) {
    super(props)
    const timeConfig =
      store.statusServiceTime && store.statusServiceTime.length
        ? store.statusServiceTime[0]._id
        : '-1'
    this.state = {
      taskCycle: '',
      orderStatus: 5,
      timeConfig,
    }
  }

  handleChangeOrderStatus = (value) => {
    this.setState({
      orderStatus: parseInt(value, 10),
    })
  }

  handelSelect = (value) => {
    this.setState({
      taskCycle: value,
    })
  }

  handleChangeServiceTime = (value) => {
    const timeConfig = value
    this.setState(
      {
        timeConfig,
        taskCycle: '',
      },
      () => {
        store.getStatusTaskCycle(timeConfig)
      },
    )
  }

  handleHide = () => {
    Modal.hide()
  }

  handleSubmit = () => {
    const serviceTimeId = this.state.timeConfig
    const cycleStartTime = this.state.taskCycle
    const status = this.state.orderStatus
    const remark =
      this.state.orderStatus === 5 && this.orderRemark.value
        ? this.orderRemark.value
        : undefined
    store
      .orderStatusSubWarehouseUpdate(
        serviceTimeId,
        cycleStartTime,
        status,
        remark,
      )
      .then(() => {
        store.doFirstRequest()
        this.handleHide()
      })
  }

  render() {
    const serviceTime = store.statusServiceTime.slice()
    const taskCycle = store.statusTaskCycle.slice()
    return (
      <form onSubmit={(event) => event.preventDefault()}>
        <div className='form-group'>
          {i18next.t('请选择运营时间')}&nbsp;&nbsp;&nbsp;
          <div className='gm-gap-10' />
          <Select
            value={this.state.timeConfig}
            onChange={this.handleChangeServiceTime}
            className='gm-margin-right-10'
            style={{ display: 'inline-block' }}
          >
            {_.map(serviceTime, (st) => {
              return (
                <Option value={st._id} key={st._id}>
                  {st.name}
                </Option>
              )
            })}
          </Select>
          <Select
            value={this.state.taskCycle}
            onChange={this.handelSelect}
            className='gm-margin-right-10'
            style={{ minWidth: '250px', display: 'inline-block' }}
          >
            <Option value=''>{i18next.t('请选择')}</Option>
            {_.map(taskCycle, (tc) => {
              return (
                <Option value={tc.cycle_start_time} key={tc.cycle_start_time}>
                  {tc.text}
                </Option>
              )
            })}
          </Select>
        </div>
        <div className='form-group'>
          {i18next.t('将订单状态修改为')}
          <div className='gm-gap-10' />
          <Select
            value={this.state.orderStatus}
            onChange={this.handleChangeOrderStatus}
            className='gm-margin-right-10'
            style={{ width: '100px', display: 'inline-block' }}
          >
            {_.map(editStatusArr, (status) => {
              return (
                <Option value={status.id} key={status.id}>
                  {status.text}
                </Option>
              )
            })}
          </Select>
          {this.state.orderStatus === 5 ? (
            <input
              placeholder={i18next.t('分拣备注')}
              ref={(ref) => {
                this.orderRemark = ref
              }}
              className='form-control input-sm'
              style={{ width: '150px', display: 'inline-block' }}
            />
          ) : null}
        </div>
        <div className='form-group gm-text-desc'>
          {i18next.t('将修改下游分仓同一运营时间内的全部订单状态')}
        </div>
        <div className='form-group text-right'>
          <Button onClick={this.handleHide}>{i18next.t('取消')}</Button>
          <div className='gm-gap-10' />
          <Button type='primary' onClick={this.handleSubmit}>
            {i18next.t('确定')}
          </Button>
        </div>
      </form>
    )
  }
}

export default SubWarehouseActionModal
