import { i18next } from 'gm-i18n'
import React from 'react'
import {
  FormGroup,
  FormPanel,
  TimeSpanPicker,
  Tip,
  Form,
  FormItem,
  Flex,
  Dialog,
  MultipleFilterSelect,
  Button,
} from '@gmfe/react'
import moment from 'moment'
import _ from 'lodash'
import { observer } from 'mobx-react'
import DaySelect from '../component/day_select'
import { HHmmToDate, getDayList, getPreSmmRange, HHmmToMoment } from '../util'
import { history } from '../../../../common/service'
import { RECEIVE_LIMIT_BY_DAYS } from '../../../../common/enum'
import { convertNumber2Date } from '../../../../common/util'
import store from '../store'
import globalStore from '../../../../stores/global'
import TimeSpanSelect from '../component/time_span_select'
import Img from 'img/bshop_receive_time.png'
import UnReceiveTimeSelector from '../component/un_receive_time_selector'

// 起步的时候时间判断设计不合理，就不优化了
@observer
class PreDetail extends React.Component {
  constructor(props) {
    super(props)
    this.handleBack = ::this.handleBack
    this.handleSubmit = ::this.handleSubmit
    this.canModify = ::this.canModify
    this.state = {
      img: false,
    }

    this.refform = React.createRef()
  }

  canModify() {
    let modify = false
    const { isCStation } = globalStore.otherInfo
    if (isCStation) {
      const { list } = store
      modify = list && list[0] && list[0].can_be_modified
    } else {
      const { location } = this.props
      modify = location.query.modify !== 'false'
    }

    const modifyPermission = globalStore.hasPermission(
      'edit_presale_service_time',
    )

    return modify && modifyPermission
  }

  componentDidMount() {
    const { isCStation } = globalStore.otherInfo
    if (isCStation) {
      store.getSmmList().then(() => {
        const { list } = store
        store.getServiceTimeInfo(list[0].id, true)
      })
      return
    }

    const {
      location: {
        query: { id },
      },
    } = this.props
    if (id) {
      store.getServiceTimeInfo(id, true)
    }
  }

  componentWillUnmount() {
    store.clear()
  }

  handleChangeByDay(name, value) {
    store.smmPreChange(name, ~~value)
  }

  handleChange(name, event) {
    let value = event.target.value
    if (name === 'name') value = _.trim(value)
    store.smmPreChange(name, value)
  }

  handleChangeValue = (name, value) => {
    store.smmPreChange(name, value)

    // 关闭不配送时间设置, 需要清空时间选择
    if (name === 'is_undelivery' && !value) {
      store.smmPreChange('undelivery_times', [{ start: null, end: null }])
    }
  }

  handleChangeByDate(name, value) {
    store.smmPreChange(name, moment(value).format('HH:mm'))
  }

  handleBack(event) {
    event.preventDefault()
    history.push('/system/setting/service_time')
  }

  async handleSubmit() {
    const { location } = this.props
    const { smmPre, list } = store
    const { receive_time_limit, is_undelivery, undelivery_times } = smmPre
    const receiveTimeSpan = +receive_time_limit.receiveTimeSpan
    const { isCStation } = globalStore.otherInfo

    let modify = false
    if (isCStation) {
      modify = list && list[0] && list[0].can_be_modified
    } else {
      modify = location.query.modify !== 'false'
    }

    if (!this.canModify()) {
      return
    }
    // 时间选择正确性已经在reducer纠正，这里只判断name desc

    if (_.trim(smmPre.name) === '') {
      Tip.info(i18next.t('请输入服务任务名称'))
      return
    }
    const currentReceiveTimeLimitEnd = HHmmToMoment(
      receive_time_limit.end,
      Number(receive_time_limit.receiveEndSpan),
    )

    if (
      moment(currentReceiveTimeLimitEnd)
        .add(-receiveTimeSpan, 'minutes')
        .isSameOrBefore(HHmmToMoment(receive_time_limit.start))
    ) {
      Tip.info(i18next.t('当前收货时间间隔大于可选收货时间范围，请重新选择'))
      return
    }

    if (!receive_time_limit.weekdays) {
      Tip.info(i18next.t('必须选择一个可收货的自然日'))
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

    if (modify && this.canModify()) {
      await Dialog.confirm({
        size: 'md',
        children: (
          <div>
            <div className='gm-padding-bottom-5 gm-padding-left-10'>
              {i18next.t(
                '修改运营时间会可能会造成如下信息变动，请确认是否修改：',
              )}
            </div>
            <div className='gm-padding-left-10'>
              {i18next.t(
                '1. 修改运营时间上的可下单或可收货时间，可能会导致采购任务汇总异常，分拣任务拉取异常；',
              )}
            </div>
            <div className='gm-padding-left-10'>
              {i18next.t('2. 修改可选收货日可能会导致客户的可选收货日变动；')}
            </div>
          </div>
        ),
      })
    }

    store.smmSave(smmPre).then(() => {
      Tip.success(i18next.t('保存成功'))
      !isCStation && history.go(-1)
    })
  }

  handleSelect = (selected) => {
    store.selectReceiveDays(selected)
  }

  handleAddItem = () => {
    const list = store.smmPre.undelivery_times.slice()
    list.push({ start: null, end: null })
    store.smmPreChange('undelivery_times', list)
  }

  handleDeleteItem = (index) => {
    const list = store.smmPre.undelivery_times.slice()

    // 当前只有一条数据时不可删除
    if (list.length === 1) {
      list.splice(index, 1, { start: null, end: null })
    } else {
      list.splice(index, 1)
    }

    store.smmPreChange('undelivery_times', list)
  }

  handleNotReceiveTimeChange = (index, type, time) => {
    const list = store.smmPre.undelivery_times.slice()
    let item = { ...list[index] }
    item[type] = moment(time).format('HH:mm')

    // 选择开始时间时，清空结束时间
    if (type === 'start') {
      item = { ...item, end: null }
    }

    list[index] = item
    store.smmPreChange('undelivery_times', list)
  }

  render() {
    const { location } = this.props
    const { smmPre, list } = store
    const {
      receive_time_limit: { weekdays },
    } = smmPre

    const modify = this.canModify()
    const {
      minDairyReceiveStart,
      minDairyReceiveEnd,
      maxDairyReceiveEnd,
      minDistribute,
      maxDistribute,
    } = getPreSmmRange(smmPre)
    const receiveDays = convertNumber2Date(weekdays)

    // C站点没有传过来的id，只有一个运营时间，直接拿store
    const { isCStation } = globalStore.otherInfo
    // 表示toc的运营时间，toc不需要展示收货自然日部分
    let is_c_service = false
    let id = ''
    if (isCStation) {
      id = list && list[0] && list[0].id
      is_c_service = list && list[0] && list[0].service_type === 2
    } else {
      id = location.query.id
      const service_time = _.find(list, (v) => v.id === id)
      is_c_service = service_time && service_time.service_type === 2
    }

    return (
      <FormGroup
        formRefs={[this.refform]}
        onCancel={isCStation ? null : this.handleBack}
        onSubmit={this.handleSubmit}
        saveText={
          isCStation
            ? i18next.t('保存')
            : id
            ? i18next.t('保存')
            : i18next.t('添加')
        }
      >
        <FormPanel
          title={id ? `${smmPre.name}-${smmPre.id}` : '新建预售运营时间'}
        >
          <Form ref={this.refform} labelWidth='212px'>
            <FormItem col={2} label={i18next.t('运营时间名称')}>
              <input
                type='text'
                name='name'
                value={smmPre.name}
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
                className='form-control input-sm'
                value={smmPre.desc}
                disabled={!modify}
                onChange={this.handleChange.bind(this, 'desc')}
              />
            </FormItem>

            <FormItem col={2} label={i18next.t('用户下单时间限制')}>
              <div>
                <Flex alignCenter>
                  <TimeSpanPicker
                    date={HHmmToDate(smmPre.order_time_limit.start)}
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
                    value={smmPre.order_time_limit.e_span_time}
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
                      smmPre.order_time_limit.e_span_time === 0
                        ? HHmmToDate(smmPre.order_time_limit.start)
                        : null
                    }
                    max={
                      smmPre.order_time_limit.e_span_time === 1
                        ? HHmmToDate(smmPre.order_time_limit.start)
                        : null
                    }
                    date={HHmmToDate(smmPre.order_time_limit.end)}
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
            <FormItem col={2} label={i18next.t('用户可选最早收货日期')}>
              <Flex alignCenter>
                <DaySelect
                  days={getDayList(30)}
                  value={smmPre.receive_time_limit.s_span_time}
                  disabled={!modify}
                  onChange={this.handleChangeByDay.bind(
                    this,
                    'receive_time_limit.s_span_time',
                  )}
                />
                <div className='gm-gap-10' />
                <span>{i18next.t('用户可选最晚收货日期')}：</span>
                <DaySelect
                  days={getDayList(30)}
                  value={smmPre.receive_time_limit.e_span_time}
                  disabled={!modify}
                  min={smmPre.receive_time_limit.s_span_time}
                  onChange={this.handleChangeByDay.bind(
                    this,
                    'receive_time_limit.e_span_time',
                  )}
                />
              </Flex>
            </FormItem>
            {!isCStation && !is_c_service && (
              <FormItem col={2} label={i18next.t('收货自然日限制')}>
                <Flex alignCenter>
                  <MultipleFilterSelect
                    className='b-receive-days-filter'
                    disableSearch
                    disabled={!modify}
                    id='receive_time_limit'
                    list={RECEIVE_LIMIT_BY_DAYS}
                    selected={receiveDays}
                    onSelect={this.handleSelect}
                    delay={100}
                    placeholder='设置客户可选收货自然日'
                  />
                  {id && (
                    <Button
                      type='link'
                      target='_blank'
                      href={`#/system/setting/service_time/pre_detail/receive_days?time_config_id=${id}`}
                    >
                      {i18next.t('设置单客户可选收货自然日')}
                    </Button>
                  )}
                </Flex>
                <div className='gm-text-desc gm-margin-top-5'>
                  {i18next.t(
                    '设置收货自然日后，用户只能选择符合要求的日期收货。如运营时间限制只能周一，周二收货，则用户只能选择在周一或周二收货（如收货时间跨日了，如用户选择周二22:00~周三01：00收货，也可以成功）。可以进一步设置客户的收货日，如当前运营时间是周一，周二可收货，可限制客户只能周一收货。',
                  )}
                  <br />
                  {i18next.t('保存后可以进一步为每个商户设置不同的的收货日')}
                </div>
              </FormItem>
            )}
            <FormItem col={2} label={i18next.t('每日的收货时间范围')}>
              <Flex wrap alignCenter>
                <TimeSpanPicker
                  min={minDairyReceiveStart}
                  date={HHmmToDate(smmPre.receive_time_limit.start)}
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
                  value={smmPre.receive_time_limit.receiveEndSpan}
                  disabled={!modify}
                  className='form-control input-sm day-select'
                  min={
                    smmPre.receive_time_limit.s_span_time === 0
                      ? smmPre.order_time_limit.e_span_time
                      : null
                  }
                  days={[
                    {
                      id: 0,
                      text: i18next.t('当天'),
                    },
                    {
                      id: 1,
                      text: i18next.t('后一天'),
                    },
                  ]}
                  onChange={this.handleChangeByDay.bind(
                    this,
                    'receive_time_limit.receiveEndSpan',
                  )}
                />
                <div className='gm-gap-10' />
                <TimeSpanPicker
                  min={minDairyReceiveEnd}
                  max={maxDairyReceiveEnd}
                  date={HHmmToDate(smmPre.receive_time_limit.end)}
                  disabled={!modify}
                  onChange={this.handleChangeByDate.bind(
                    this,
                    'receive_time_limit.end',
                  )}
                  style={{ width: '80px' }}
                />
                <div className='gm-gap-10' />
                <span>{i18next.t('收货间隔')}：</span>
                <TimeSpanSelect
                  value={smmPre.receive_time_limit.receiveTimeSpan}
                  disabled={!modify}
                  onChange={this.handleChangeValue.bind(
                    this,
                    'receive_time_limit.receiveTimeSpan',
                  )}
                />
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
            </FormItem>
            {/** c端屏蔽入口 */}
            {!isCStation && smmPre.service_type !== 2 && (
              <FormItem col={3} label={i18next.t('是否开启部分时间不配送')}>
                <UnReceiveTimeSelector
                  isPre
                  onChange={(value) =>
                    this.handleChangeValue('is_undelivery', ~~value)
                  }
                  disabled={!modify}
                  onAddItem={this.handleAddItem}
                  onDeleteItem={this.handleDeleteItem}
                  onTimeChange={this.handleNotReceiveTimeChange}
                />
              </FormItem>
            )}
            <FormItem col={2} label={i18next.t('最晚出库时间设置')}>
              <Flex alignCenter>
                <DaySelect
                  value={smmPre.final_distribute_time_span}
                  max={smmPre.receive_time_limit.receiveEndSpan + 1}
                  disabled={!modify}
                  days={[
                    {
                      id: 0,
                      text: i18next.t('当天'),
                    },
                    {
                      id: 1,
                      text: i18next.t('后一天'),
                    },
                  ]}
                  onChange={this.handleChangeByDay.bind(
                    this,
                    'final_distribute_time_span',
                  )}
                />
                <div className='gm-gap-10' />
                <TimeSpanPicker
                  min={minDistribute}
                  max={maxDistribute}
                  date={HHmmToDate(smmPre.final_distribute_time)}
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
            </FormItem>
          </Form>
        </FormPanel>
      </FormGroup>
    )
  }
}

export default PreDetail
