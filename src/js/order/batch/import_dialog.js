import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import {
  Dialog,
  Select,
  Option,
  Flex,
  Tip,
  Uploader,
  Button,
} from '@gmfe/react'
import _ from 'lodash'
import moment from 'moment'
import { Request } from '@gm-common/request'
import { taskCycleList } from '../util'
import { gioTrackEvent, history } from '../../common/service'
import batchStore from './store'

class ImportDialog extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      time_config_id: '',
      temp_id: '',
      temps: [],
      cycleIndex: null,
      cycleList: [],
      file: null,
    }
  }

  componentDidMount() {
    Request('/station/order/batch/template/list')
      .get()
      .then((json) => {
        this.handleStateChange({
          temps: json.data || [],
        })
      })
  }

  handleTimeConfigChange = (value) => {
    const { service_times } = this.props
    const currentDate = moment(new Date()).format('HH:mm')
    const serviceTime = _.find(service_times, (s) => s._id === value)
    const start_order = serviceTime.order_time_limit.start

    // 如果当前时间小于下单的开始和结束时间，则为上个周期
    if (moment(currentDate, 'HH:mm').isBefore(moment(start_order, 'HH:mm'))) {
      serviceTime.receive_time_limit.s_span_time--
      serviceTime.receive_time_limit.e_span_time--
    }

    this.handleStateChange({
      cycleList: taskCycleList(serviceTime),
      cycleIndex: null,
      time_config_id: value,
    })
  }

  handleStateChange = (state) => {
    this.setState(state)
  }

  reset = () => {
    this.handleStateChange({
      temp_id: '',
      time_config_id: '',
      cycleIndex: null,
      cycleList: [],
      file: null,
    })
  }

  validate = () => {
    const { time_config_id, cycleIndex, temp_id, file } = this.state
    if (!time_config_id) {
      return Promise.reject(new Error(i18next.t('请选择运营时间！')))
    } else if (!_.isNumber(cycleIndex)) {
      return Promise.reject(new Error(i18next.t('请选择任务周期！')))
    } else if (!temp_id) {
      return Promise.reject(new Error(i18next.t('请选择预设模板')))
    } else if (!file) {
      return Promise.reject(new Error(i18next.t('请选择文件上传')))
    }
    return Promise.resolve()
  }

  handleOrderUpload = async () => {
    const { service_times } = this.props
    const { time_config_id, cycleList, cycleIndex, temp_id, file } = this.state
    try {
      await this.validate()
    } catch (err) {
      Tip.info(err.message)
      return Promise.reject(err)
    }

    const cycle = cycleList[cycleIndex]
    const serviceTime = _.find(service_times, (s) => s._id === time_config_id)
    const receiveTime = {
      flagStartMin: cycle.startFlag,
      flagEndMax: cycle.endFlag,
    }
    gioTrackEvent('station_order_list_batch_confirm', 1, {})
    try {
      await batchStore
        .upload(
          {
            time_config_id,
            file,
            id: temp_id,
          },
          {
            serviceTime,
            receiveTime,
          },
        )
        .then(() => {
          history.push('/order_manage/order/list/batch')
        })
    } catch (err) {
      Promise.reject(err)
      this.reset()
    } finally {
      this.props.onHide()
    }
  }

  handleOrderUploadCancel = () => {
    gioTrackEvent('station_order_list_batch_cancel', 1, {})
    this.reset()
    this.props.onHide()
  }

  handleUploadFileChoosen = (files) => {
    const file = files[0]
    if (file.size > 1024 * 1024 * 10) {
      Tip.warning(i18next.t('文件不能超过10M'))
      return
    }
    this.handleStateChange({ file })
  }

  handleDownload = (e) => {
    const { time_config_id, temp_id } = this.state
    if (!time_config_id || !temp_id) e.preventDefault()
    if (!time_config_id) {
      return Tip.info(i18next.t('请选择运营时间！'))
    }
    if (!temp_id) {
      return Tip.info(i18next.t('请选择预设模板！'))
    }
    window.open(`/station/order/batch/template/download?id=${temp_id}`)
  }

  handleExportData = (e) => {
    const { time_config_id } = this.state
    if (!time_config_id) {
      e.preventDefault()
      return Tip.info(i18next.t('请选择运营时间！'))
    }
    time_config_id &&
      window.open(
        `/station/order/batch/export?time_config_id=${time_config_id}`,
      )
  }

  render() {
    const { service_times, show } = this.props
    const {
      time_config_id,
      cycleIndex,
      cycleList,
      file,
      temps,
      temp_id,
    } = this.state

    return (
      <Dialog
        show={show}
        title={i18next.t('批量导入订单')}
        onOK={this.handleOrderUpload}
        onCancel={this.handleOrderUploadCancel}
        disableMaskClose
      >
        <div className='gm-padding-lr-10'>
          <div className='gm-text-14'>
            {i18next.t('选择运营时间和收货日期')}
          </div>
          <div className='gm-padding-tb-10 gm-padding-lr-15 '>
            <Flex className='gm-margin-top-5'>
              <Flex alignCenter>{i18next.t('运营时间')}：</Flex>
              <Flex flex alignCenter className='gm-margin-right-5'>
                <Select
                  name='time_config_id'
                  value={time_config_id}
                  style={{ minWidth: 150 }}
                  onChange={this.handleTimeConfigChange}
                  className='b-order-service-time-select'
                >
                  {_.map(
                    [
                      {
                        _id: '',
                        name: i18next.t('请选择'),
                      },
                      ...service_times,
                    ],
                    (s) => (
                      <Option key={s._id} value={s._id}>
                        {s.name}
                      </Option>
                    ),
                  )}
                </Select>
              </Flex>
            </Flex>
            <Flex className='gm-margin-top-5'>
              <Flex alignCenter>{i18next.t('任务周期')}：</Flex>
              <Flex flex alignCenter className='gm-margin-right-5'>
                <Select
                  name='cycleIndex'
                  value={cycleIndex}
                  style={{ minWidth: 150 }}
                  onChange={(value) =>
                    this.handleStateChange({
                      cycleIndex: value,
                    })
                  }
                  className='b-order-service-time-select'
                >
                  <Option value={null}>{i18next.t('请选择')}</Option>
                  {_.map(cycleList, (s, index) => (
                    <Option key={index} value={index}>
                      {s.text}
                    </Option>
                  ))}
                </Select>
                {time_config_id && cycleIndex !== null ? (
                  <Flex flex justifyEnd alignCenter>
                    <a
                      onClick={this.handleExportData}
                      href='javascript:;'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='gm-cursor'
                    >
                      {i18next.t('下载带数据旧模板')}
                    </a>
                  </Flex>
                ) : null}
              </Flex>
            </Flex>
          </div>
        </div>
        <div className='gm-padding-lr-10'>
          <div className='gm-text-14'>{i18next.t('选择导入的预设模板')}</div>
          <Flex alignCenter className='gm-padding-tb-10 gm-padding-lr-15 '>
            <Select
              value={temp_id}
              style={{ minWidth: 150 }}
              onChange={(value) =>
                this.handleStateChange({
                  temp_id: value,
                })
              }
            >
              {_.map(
                [{ id: '', name: i18next.t('选择预设模板') }, ...temps],
                (item) => (
                  <Option key={item.id} value={item.id}>
                    {item.name}
                  </Option>
                ),
              )}
            </Select>
            <Flex className='gm-margin-left-10'>
              <a
                href='javascript:;'
                onClick={this.handleDownload}
                rel='noopener noreferrer'
                target='_blank'
              >
                {i18next.t('下载xlsx模板')}
              </a>
            </Flex>
            <Flex flex justifyEnd alignCenter>
              <a
                onClick={() =>
                  history.push(
                    '/system/setting/distribute_templete?activeType=7',
                  )
                }
                className='gm-cursor'
              >
                {i18next.t('模板设置')} &gt;
              </a>
            </Flex>
          </Flex>
        </div>
        <div className='gm-padding-lr-10'>
          <div className='gm-text-14'>{i18next.t('上传xlsx文件')}</div>
          <div className='gm-padding-tb-10 gm-padding-lr-15 '>
            <Uploader onUpload={this.handleUploadFileChoosen} accept='.xlsx'>
              <Button>
                {file ? i18next.t('重新上传') : i18next.t('上传')}
              </Button>
            </Uploader>
            {file ? (
              <span className='gm-text-desc gm-margin-left-5'>{file.name}</span>
            ) : null}
          </div>
          <div className='gm-padding-lr-15 gm-text-desc'>
            {i18next.t('如有预设模板可直接上传，无需下载系统空模板')}
          </div>
        </div>
      </Dialog>
    )
  }
}

ImportDialog.propTypes = {
  service_times: PropTypes.array.isRequired,
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func,
}

export default ImportDialog
