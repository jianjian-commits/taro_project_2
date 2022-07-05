import { i18next } from 'gm-i18n'
import React from 'react'
import {
  FormPanel,
  TimeSpanPicker,
  Tip,
  Form,
  FormItem,
  Flex,
  Dialog,
  FormGroup,
  Button,
} from '@gmfe/react'
import moment from 'moment'
import { observer } from 'mobx-react'
import _ from 'lodash'

import DaySelect from './component/day_select'
import TimeSpanSelect from './component/time_span_select'
import { HHmmToDate, HHmmToMoment, HHmmAdd30Minutes } from './util'
import { history } from '../../../common/service'
import store from './store'
import Img from 'img/bshop_receive_time.png'
import UnReceiveTimeSelector from './component/un_receive_time_selector'

// 起步的时候时间判断设计不合理，就不优化了
@observer
class Detail extends React.Component {
  constructor(props) {
    super(props)
    this.handleBack = ::this.handleBack
    this.handleSubmit = ::this.handleSubmit

    this.refform = React.createRef()

    this.state = {
      img: false,
    }
  }

  componentDidMount() {
    const {
      location: {
        query: { id },
      },
    } = this.props
    if (id) {
      store.getServiceTimeInfo(id, false)
    }
  }

  componentWillUnmount() {
    store.clear()
  }

  handleChangeByDay(name, value) {
    store.smmChange(name, value)
  }

  handleChange(name, event) {
    let value = event.target.value
    if (name === 'name') value = _.trim(value)
    store.smmChange(name, value)
  }

  handleChangeValue = (name, value) => {
    store.smmChange(name, value)

    // 关闭不配送时间设置, 需要清空时间选择
    if (name === 'is_undelivery' && !value) {
      store.smmChange('undelivery_times', [{ start: null, end: null }])
    }
  }

  handleChangeByDate(name, value) {
    store.smmChange(name, moment(value).format('HH:mm'))
  }

  handleBack(event) {
    event.preventDefault()
    history.push('/system/setting/service_time')
  }

  async handleSubmit(event) {
    const { location } = this.props
    const { smm } = store
    const { receive_time_limit, is_undelivery, undelivery_times } = smm
    const receiveTimeLimitEnd = HHmmToMoment(
      receive_time_limit.end,
      receive_time_limit.e_span_time,
    )
    const receiveTimeSpan = +receive_time_limit.receiveTimeSpan

    if (location.query.modify === 'false') {
      return
    }
    // 时间选择正确性已经在reducer纠正，这里只判断name desc

    if (_.trim(smm.name) === '') {
      Tip.info(i18next.t('请输入服务任务名称'))
      return
    }

    if (receive_time_limit.e_span_time - receive_time_limit.s_span_time > 1) {
      Tip.info(i18next.t('收货的最早和最晚时间不能超过24小时'))
      return
    }

    if (
      receive_time_limit.e_span_time === receive_time_limit.s_span_time &&
      receive_time_limit.start === receive_time_limit.end
    ) {
      Tip.info(i18next.t('收货的最早和最晚时间不能相等'))
      return
    }

    if (
      moment(receiveTimeLimitEnd)
        .add(-receiveTimeSpan, 'minutes')
        .isSameOrBefore(
          HHmmToMoment(
            receive_time_limit.start,
            receive_time_limit.s_span_time,
          ),
        )
    ) {
      Tip.info(i18next.t('当前收货时间间隔大于可选收货时间范围，请重新选择'))
      return
    }

    // 若开启了不配送时间设置，必须要选择时间
    if (is_undelivery) {
      const times = _.filter(undelivery_times, (u) => u.start && u.end)
      if (!times.length) {
        Tip.info(i18next.t('当前开启了部分时间不配送，请设置不配送时间段'))
        return
      }
    }

    if (location.query.modify === 'true') {
      await Dialog.confirm({
        children: i18next.t(
          '修改运营时间可能会导致采购任务汇总异常，分拣任务拉取异常，请确认是否修改？',
        ),
      })
    }

    store.smmSave(smm).then(() => {
      Tip.success(i18next.t('保存成功'))
      history.go(-1)
    })
  }

  handleAddItem = () => {
    const list = store.smm.undelivery_times.slice()
    list.push({ start: null, end: null })
    store.smmChange('undelivery_times', list)
  }

  handleDeleteItem = (index) => {
    const list = store.smm.undelivery_times.slice()

    if (list.length === 1) {
      list.splice(index, 1, { start: null, end: null })
    } else {
      list.splice(index, 1)
    }

    store.smmChange('undelivery_times', list)
  }

  handleNotReceiveTimeChange = (index, type, time) => {
    const list = store.smm.undelivery_times.slice()
    let item = { ...list[index] }
    item[type] = moment(time).format('HH:mm')

    // 选择开始时间时，清空结束时间
    if (type === 'start') {
      item = { ...item, end: null }
    }

    list[index] = item
    store.smmChange('undelivery_times', list)
  }

  render() {
    const { location } = this.props
    const { smm } = store
    const id = location.query.id
    const modify = !(location.query.modify === 'false')

    const receiveStart = HHmmToMoment(
      smm.receive_time_limit.start,
      smm.receive_time_limit.s_span_time,
    )
    const orderEnd = HHmmToMoment(
      smm.order_time_limit.end,
      smm.order_time_limit.e_span_time,
    )
    let minReceiveTimeEnd = null
    const minReceiveEndFlag =
      !smm.receive_time_limit.s_span_time && smm.order_time_limit.e_span_time
        ? 1
        : smm.receive_time_limit.s_span_time
    const maxReceiveEndFlag = smm.receive_time_limit.s_span_time + 2
    if (receiveStart < orderEnd) {
      minReceiveTimeEnd =
        smm.order_time_limit.e_span_time === smm.receive_time_limit.e_span_time
          ? HHmmToDate(smm.order_time_limit.end)
          : null
    } else {
      minReceiveTimeEnd =
        smm.receive_time_limit.s_span_time ===
        smm.receive_time_limit.e_span_time
          ? HHmmToDate(HHmmAdd30Minutes(smm.receive_time_limit.start))
          : null
    }

    return (
      <FormGroup
        formRefs={[this.refform]}
        onCancel={this.handleBack}
        onSubmit={this.handleSubmit}
        saveText={id ? i18next.t('保存') : i18next.t('添加')}
      >
        <FormPanel title={id ? `${smm.name}-${smm.id}` : '新建运营时间'}>
          <Form ref={this.refform} labelWidth='213px'>
            <FormItem col={2} label={i18next.t('运营时间名称')}>
              <input
                type='text'
                name='name'
                value={smm.name}
                disabled={!modify}
                onChange={this.handleChange.bind(this, 'name')}
              />
              <div className='gm-text-desc gm-margin-top-5'>
                {i18next.t(
                  '自定义一个运营时间名称，比如可以命名为“夜宵档运营时间”，后续用于一个报价单，为这个报价单配置服务时间',
                )}
              </div>
            </FormItem>
            <FormItem col={2} label={i18next.t('描述')}>
              <textarea
                value={smm.desc}
                disabled={!modify}
                onChange={this.handleChange.bind(this, 'desc')}
              />
            </FormItem>
            <FormItem col={2} label={i18next.t('用户下单时间限制')}>
              <div>
                <Flex alignCenter>
                  <TimeSpanPicker
                    date={HHmmToDate(smm.order_time_limit.start)}
                    disabled={!modify}
                    onChange={this.handleChangeByDate.bind(
                      this,
                      'order_time_limit.start',
                    )}
                    style={{ width: '80px' }}
                  />
                  <div className='gm-gap-5' />
                  ~
                  <div className='gm-gap-5' />
                  <DaySelect
                    value={smm.order_time_limit.e_span_time}
                    max={2}
                    disabled={!modify}
                    onChange={this.handleChangeByDay.bind(
                      this,
                      'order_time_limit.e_span_time',
                    )}
                  />
                  <div className='gm-gap-10' />
                  <TimeSpanPicker
                    min={
                      smm.order_time_limit.e_span_time === 0
                        ? HHmmToDate(smm.order_time_limit.start)
                        : null
                    }
                    max={
                      smm.order_time_limit.e_span_time === 1
                        ? HHmmToDate(smm.order_time_limit.start)
                        : null
                    }
                    date={HHmmToDate(smm.order_time_limit.end)}
                    disabled={!modify}
                    onChange={this.handleChangeByDate.bind(
                      this,
                      'order_time_limit.end',
                    )}
                    style={{ width: '80px' }}
                  />
                </Flex>
                <div className='gm-text-desc gm-margin-top-5'>
                  {i18next.t('设置用户可下单时间，超过该时间段用户无法下单')}
                </div>
              </div>
            </FormItem>
            <FormItem col={2} label={i18next.t('订单变为"配送中"时间')}>
              <div>
                <Flex alignCenter>
                  <DaySelect
                    value={smm.final_distribute_time_span}
                    disabled={!modify}
                    onChange={this.handleChangeByDay.bind(
                      this,
                      'final_distribute_time_span',
                    )}
                  />
                  <div className='gm-gap-5' />
                  <TimeSpanPicker
                    min={
                      smm.final_distribute_time_span ===
                      smm.order_time_limit.e_span_time
                        ? HHmmToDate(smm.order_time_limit.end)
                        : null
                    }
                    date={HHmmToDate(smm.final_distribute_time)}
                    disabled={!modify}
                    onChange={this.handleChangeByDate.bind(
                      this,
                      'final_distribute_time',
                    )}
                    style={{ width: '80px' }}
                  />
                </Flex>
                <div className='gm-text-desc gm-margin-top-5'>
                  {i18next.t('这个时间段之后，所有订单将变为配送中')}
                </div>
              </div>
            </FormItem>
            <FormItem col={2} label={i18next.t('收货时间限制')}>
              <div>
                <Flex alignCenter wrap>
                  <DaySelect
                    value={smm.receive_time_limit.s_span_time}
                    disabled={!modify}
                    onChange={this.handleChangeByDay.bind(
                      this,
                      'receive_time_limit.s_span_time',
                    )}
                  />
                  <div className='gm-gap-5' />
                  <TimeSpanPicker
                    min={
                      smm.receive_time_limit.s_span_time === 0
                        ? HHmmToDate(smm.order_time_limit.start)
                        : null
                    }
                    date={HHmmToDate(smm.receive_time_limit.start)}
                    disabled={!modify}
                    onChange={this.handleChangeByDate.bind(
                      this,
                      'receive_time_limit.start',
                    )}
                    style={{ width: '80px' }}
                  />
                  <div className='gm-gap-5' />
                  ~
                  <div className='gm-gap-5' />
                  <DaySelect
                    value={smm.receive_time_limit.e_span_time}
                    disabled={!modify}
                    min={minReceiveEndFlag}
                    max={maxReceiveEndFlag}
                    onChange={this.handleChangeByDay.bind(
                      this,
                      'receive_time_limit.e_span_time',
                    )}
                  />
                  <div className='gm-gap-5' />
                  <TimeSpanPicker
                    min={minReceiveTimeEnd}
                    max={
                      smm.receive_time_limit.s_span_time !==
                      smm.receive_time_limit.e_span_time
                        ? HHmmToDate(smm.receive_time_limit.start)
                        : null
                    }
                    date={HHmmToDate(smm.receive_time_limit.end)}
                    disabled={!modify}
                    onChange={this.handleChangeByDate.bind(
                      this,
                      'receive_time_limit.end',
                    )}
                    style={{ width: '80px' }}
                  />
                  <div className='gm-gap-5' />
                  <div className='gm-margin-top-5'>
                    <span>{i18next.t('收货间隔')}：</span>
                    <TimeSpanSelect
                      value={smm.receive_time_limit.receiveTimeSpan}
                      disabled={!modify}
                      onChange={this.handleChangeValue.bind(
                        this,
                        'receive_time_limit.receiveTimeSpan',
                      )}
                    />
                  </div>
                </Flex>
                <div className='gm-text-desc gm-margin-top-5'>
                  {i18next.t(
                    '设置商户可选的收货时间段的最小时间间隔，如图中展示的位置',
                  )}
                </div>
                <Button
                  type='link'
                  onClick={() => this.setState({ img: !this.state.img })}
                >
                  {i18next.t('查看示例')}
                </Button>
                {this.state.img && (
                  <img
                    src={Img}
                    alt=''
                    style={{
                      width: '400px',
                    }}
                  />
                )}
              </div>
            </FormItem>
            <FormItem col={3} label={i18next.t('是否开启部分时间不配送')}>
              <UnReceiveTimeSelector
                onChange={this.handleChangeValue.bind(
                  this,
                  'is_undelivery',
                  !store.smm.is_undelivery,
                )}
                disabled={!modify}
                onAddItem={this.handleAddItem}
                onDeleteItem={this.handleDeleteItem}
                onTimeChange={this.handleNotReceiveTimeChange}
              />
            </FormItem>
          </Form>
        </FormPanel>
      </FormGroup>
    )
  }
}

export default Detail
