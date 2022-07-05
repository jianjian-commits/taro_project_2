// 暂时应用于移动端，后续废弃
import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Dialog, Button } from '@gmfe/react'
import _ from 'lodash'
import moment from 'moment'
import { taskCycleList } from '../util'
import { history, gioTrackEvent } from '../../common/service'
import orderDetailStore from './detail_store_old'

class BatchImportDialogOld extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      time_config_id: '',
      cycleIndex: '',
      cycleList: [],
      file: null,

      service_time_msg: null,
      cycle_flag_msg: null,
    }

    this.handleUploadFileSelect = ::this.handleUploadFileSelect
    this.handleUploadFileChoosen = ::this.handleUploadFileChoosen
    this.handleTimeConfigChange = ::this.handleTimeConfigChange
    this.handleOrderUpload = ::this.handleOrderUpload
    this.handleCycleChange = ::this.handleCycleChange
    this.handleOrderUploadCancel = ::this.handleOrderUploadCancel
    this.handleExport = ::this.handleExport
  }

  handleTimeConfigChange(e) {
    const { service_times } = this.props
    const { value } = e.target
    const currentDate = moment(new Date()).format('HH:mm')
    const serviceTime = _.find(service_times, (s) => s._id === value)
    const start_order = serviceTime.order_time_limit.start

    // 如果当前时间小于下单的开始和结束时间，则为上个周期
    if (moment(currentDate, 'HH:mm').isBefore(moment(start_order, 'HH:mm'))) {
      serviceTime.receive_time_limit.s_span_time--
      serviceTime.receive_time_limit.e_span_time--
    }

    this.setState({
      cycleList: taskCycleList(serviceTime),
      cycleIndex: '',
      time_config_id: value,
      service_time_msg: '',
    })
  }

  handleCycleChange(e) {
    this.setState({
      cycleIndex: e.target.value,
    })
  }

  handleOrderUpload() {
    const { service_times } = this.props
    const { time_config_id, cycleList, cycleIndex } = this.state

    if (!time_config_id) {
      this.setState({
        service_time_msg: i18next.t('请选择运营时间！'),
      })
      return false
    } else if (!cycleIndex) {
      this.setState({
        service_time_msg: null,
        cycle_flag_msg: i18next.t('请选择任务周期！'),
      })
      return false
    } else if (!this.state.file) {
      this.setState({
        service_time_msg: null,
        cycle_flag_msg: null,
        file_msg: i18next.t('请选择文件上传!'),
      })
      return false
    }
    const cycle = cycleList[cycleIndex]
    const serviceTime = _.find(service_times, (s) => s._id === time_config_id)
    const config = { flagStartMin: cycle.startFlag, flagEndMax: cycle.endFlag }
    gioTrackEvent('station_order_list_batch_confirm', 1, {})
    try {
      orderDetailStore
        .batchUpload(
          this.state.time_config_id,
          this.state.file,
          serviceTime,
          config
        )
        .then(() => {
          history.push('/order_manage/order/list/batch')
        })
    } catch (err) {
      if (err.message === 'skuNumErr') {
        this.setState({
          time_config_id: '',
          cycleIndex: '',
          cycleList: [],
          file: null,
          file_msg: err.message,

          service_time_msg: null,
          cycle_flag_msg: null,
        })
      }
    } finally {
      this.props.onHide()
    }
  }

  handleOrderUploadCancel() {
    gioTrackEvent('station_order_list_batch_cancel', 1, {})
    this.setState({
      time_config_id: '',
      cycleIndex: '',
      cycleList: [],
      file: null,
    })
    this.props.onHide()
  }

  handleUploadFileChoosen() {
    this.setState({ file: this.refBatchXlsx.files[0] })
  }

  handleUploadFileSelect() {
    this.refBatchXlsx.click()
  }

  handleExport() {
    const { time_config_id } = this.state

    if (!time_config_id) {
      this.setState({
        service_time_msg: i18next.t('请选择运营时间！'),
      })
      return false
    }
    window.open(`/station/order/batch/export?time_config_id=${time_config_id}`)
  }

  render() {
    const { service_times, show } = this.props
    const {
      time_config_id,
      cycleIndex,
      cycleList,
      file,
      service_time_msg,
      cycle_flag_msg,
      file_msg,
    } = this.state
    return (
      <Dialog
        show={show}
        title={i18next.t('批量导入订单')}
        onOK={this.handleOrderUpload}
        onCancel={this.handleOrderUploadCancel}
        disableMaskClose
      >
        <div>
          <div>{i18next.t('第一步：选择运营时间和收货日期')}</div>
          <ul style={{ fontSize: '12px' }}>
            <li className='gm-margin-top-5'>
              {i18next.t('运营时间')}：
              <div className='gm-inline-block gm-margin-right-5'>
                <select
                  name='time_config_id'
                  value={time_config_id}
                  onChange={this.handleTimeConfigChange}
                  className='form-control input-sm b-order-service-time-select'
                >
                  <option value=''>{i18next.t('请选择')}</option>
                  {_.map(service_times, (s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {service_time_msg && (
                  <span className='gm-text-red'>{service_time_msg}</span>
                )}
              </div>
            </li>
            <li className='gm-margin-top-5'>
              {i18next.t('任务周期')}：
              <div className='gm-inline-block gm-margin-right-5'>
                <select
                  name='cycleIndex'
                  value={cycleIndex}
                  onChange={this.handleCycleChange}
                  className='form-control input-sm b-order-service-time-select'
                >
                  <option value=''>{i18next.t('请选择')}</option>
                  {_.map(cycleList, (s, index) => (
                    <option key={index} value={index}>
                      {s.text}
                    </option>
                  ))}
                </select>
                {cycle_flag_msg && (
                  <span className='gm-text-red'>{cycle_flag_msg}</span>
                )}
              </div>
            </li>
          </ul>
        </div>
        <div>
          <div>
            {i18next.t('第二步：下载当前运营时间下的')}
            <a onClick={this.handleExport} href='javascript:;' target='_blank'>
              {i18next.t('xlsx模板')}
            </a>
            {i18next.t('后，请根据以下要求填入内容')}
          </div>
          <div>
            <ul style={{ fontSize: '12px' }}>
              <li>{i18next.t('商户ID：若为空，则读取上一行的商户ID')}</li>
              <li>
                {i18next.t(
                  '商品ID：若与自定义编码列同时存在，则优先读取商品ID列，此时不得为空'
                )}
              </li>
              <li>
                {i18next.t('自定义编码：若通过自定义编码识别商品，则需')}
                <span className='gm-text-red'>{i18next.t('删除')}</span>
                {i18next.t('商品ID列，此时不得为空')}
              </li>
              <li>{i18next.t('下单数：必填')}</li>
              <li>{i18next.t('单价：若为空，则读取默认单价')}</li>
              <li>{i18next.t('备注：商品备注，可为空')}</li>
              <li>
                {i18next.t(
                  '可以为辅助信息增加列（如“商品名”、“单位”），但系统不做解析'
                )}
              </li>
            </ul>
          </div>
        </div>
        <div>
          <div>{i18next.t('第三步：上传xlsx文件')}</div>
          <div>
            <Button onClick={this.handleUploadFileSelect}>
              {file ? i18next.t('重新上传') : i18next.t('上传')}
            </Button>
            <input
              type='file'
              ref={(ref) => {
                this.refBatchXlsx = ref
              }}
              onChange={this.handleUploadFileChoosen}
              style={{ display: 'none' }}
            />
            {file ? (
              <span className='gm-text-desc gm-margin-left-5'>{file.name}</span>
            ) : null}
          </div>
          {file_msg && <span className='gm-text-red'>{file_msg}</span>}
        </div>
      </Dialog>
    )
  }
}

BatchImportDialogOld.propTypes = {
  service_times: PropTypes.array.isRequired,
  show: PropTypes.bool.isRequired,
}

export default BatchImportDialogOld
