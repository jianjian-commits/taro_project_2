import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Tip,
  MoreSelect,
  Popover,
  Form,
  FormGroup,
  FormItem,
  Validator,
  RightSideModal,
  Switch,
  Select,
  Option,
  FormPanel,
} from '@gmfe/react'
import { observer } from 'mobx-react'
import TaskList from '../../../task/task_list'

import _ from 'lodash'
import { history, WithBreadCrumbs } from '../../../common/service'
import { returnDateByFlag } from '../../../common/filter'
import globalStore from '../../../stores/global'
import store from './store'

@observer
class Salemenu extends React.Component {
  constructor(props) {
    super(props)

    this.formRef = React.createRef()
    this.state = {
      saleTargets: [],
    }
  }

  async componentDidMount() {
    const {
      params: { viewType },
      location: { query },
    } = this.props
    store.getFeeList()
    if (viewType === 'update') {
      await store.getSalemenuDetails(query.salemenu_id)
    }

    await store.getServiceTime()
    await store.getSalemenuTargets().then((data) => {
      this.setState({
        saleTargets: data,
      })
    })
    await store.getAllSalemenuList()
  }

  componentWillUnmount() {
    store.clearSalemenuDetails()
  }

  handleSubmit = () => {
    const { viewType } = this.props.params

    if (viewType === 'create') {
      store.createSalemenu().then((json) => {
        if (json.data && json.data.async === 1) {
          Tip.success(i18next.t('正在异步新建报价单'))
          RightSideModal.render({
            children: <TaskList tabKey={1} />,
            onHide: RightSideModal.hide,
            style: { width: '300px' },
          })
        } else {
          Tip.success(i18next.t('新建报价单成功'))
        }
        history.push('/merchandise/manage/sale')
      })
    } else if (viewType === 'update') {
      store.updateSalemenu().then((json) => {
        if (json.code === 0) {
          Tip.success(i18next.t('修改报价单成功'))
          history.push('/merchandise/manage/sale')
        }
      })
    }
  }

  handleChangeInput = (e) => {
    const { name, value } = e.target
    store.changeDetails(name, value)
  }

  handleChangeSelect = (name, value) => {
    store.changeDetails(name, value)
  }

  handleSearch = (value) => {
    this.setState({
      saleTargets: _.filter(store.salemenuTargets.slice(), (v) => {
        return v.text.indexOf(value) > -1
      }),
    })
  }

  handleSelect = (selected) => {
    store.changeDetails('targets', selected)
  }

  handleCancel = () => {
    history.push('/merchandise/manage/sale')
  }

  handleCheckTimeConfig = (id) => {
    if (id === '-') {
      return i18next.t('请选择服务时间')
    }
    return ''
  }

  handleCheckCopySalemenu = (id) => {
    if (id === '-') {
      return i18next.t('请选择已有报价单')
    }
    return ''
  }

  render() {
    const {
      params: { viewType },
    } = this.props
    const {
      salemenuDetails: {
        name,
        type,
        time_config,
        time_config_id,
        targets,
        supplier_name,
        about,
        is_copy_salemenu,
        copy_salemenu_id,
        is_active,
        fee_type,
      },
      serviceTime,
      salemenuTargets,
      allSalemenuList,
      feeList,
    } = store

    const targetsSelected = []
    if (salemenuTargets.length && targets && targets.length) {
      _.forEach(targets, (tg) => {
        const tgObject = _.find(
          salemenuTargets.slice(),
          (st) => st.value === tg.value
        )
        targetsSelected.push(tgObject)
      })
    }

    let feeSelected = _.find(feeList, (item) => item.type === fee_type) || {}
    const canSelectFee = globalStore.hasPermission('edit_salemenu_fee_type')

    const isCreate = viewType === 'create'
    // 是更新页面 && 有编辑权限 && 不是代售单
    const canEditServiceTime =
      !isCreate &&
      globalStore.hasPermission('edit_salemenu_time_config') &&
      type !== 2

    const serviceTimeList = serviceTime.slice()
    serviceTimeList.unshift({
      id: '-',
      name: i18next.t('请选择运营时间'),
    })

    const salemenuList = _.filter(
      allSalemenuList.slice(),
      (item) => item.type !== 2 && item.fee_type === fee_type
    )
    salemenuList.unshift({
      name: i18next.t('选择报价单'),
      id: '-',
    })

    let tooltip = <div>{i18next.t('加载中')}</div>
    if (time_config.length && !isCreate) {
      const {
        order_time_limit,
        receive_time_limit,
        final_distribute_time,
        final_distribute_time_span,
      } = time_config
      tooltip = (
        <React.Fragment>
          <div>
            {i18next.t('可下单时间')}:
            {
              i18next.t('KEY70', {
                VAR1: order_time_limit.start,
                VAR2: returnDateByFlag(order_time_limit.e_span_time),
                VAR3: order_time_limit.end,
              }) /* src:'当日 ' + order_time_limit.start + ' ~ ' + returnDateByFlag(order_time_limit.e_span_time) + ' ' + order_time_limit.end => tpl:当日 ${VAR1} ~ ${VAR2} ${VAR3} */
            }
          </div>
          <div>
            {i18next.t('可选收货时间')}:
            {returnDateByFlag(receive_time_limit.s_span_time) +
              receive_time_limit.start +
              ' ~ ' +
              returnDateByFlag(receive_time_limit.e_span_time) +
              receive_time_limit.end}
          </div>
          <div>
            {i18next.t('最晚出库时间')}:
            {returnDateByFlag(final_distribute_time_span) +
              final_distribute_time}
          </div>
        </React.Fragment>
      )
    }

    let bc = []
    if (viewType === 'create') {
      bc = [i18next.t('新建报价单')]
    } else if (viewType === 'update') {
      bc = [i18next.t('更改报价单')]
    }

    const labelWidh = isCreate ? '200px' : '190px'

    return (
      <div>
        <WithBreadCrumbs breadcrumbs={bc} />
        <FormGroup
          formRefs={[this.formRef]}
          onSubmitValidated={this.handleSubmit}
          onCancel={this.handleCancel}
        >
          <FormPanel
            title={isCreate ? i18next.t('新建报价单') : i18next.t('更改报价单')}
          >
            <Form
              hasButtonInGroup
              ref={this.formRef}
              // onSubmitValidated={this.handleSubmit}
              labelWidth={labelWidh}
              colWidth='470px'
            >
              <FormItem
                label={i18next.t('报价单名称')}
                required
                validate={Validator.create(
                  [Validator.TYPE.required],
                  _.trim(name)
                )}
              >
                <input
                  type='text'
                  className='form-control'
                  placeholder={i18next.t('输入报价单名称')}
                  value={name}
                  maxLength={36}
                  name='name'
                  onChange={this.handleChangeInput}
                />
              </FormItem>
              {canSelectFee ? (
                <FormItem label={i18next.t('货币类型')}>
                  {viewType === 'update' ? (
                    <div className='gm-margin-top-5'>{feeSelected.name}</div>
                  ) : (
                    <Select
                      style={formSelectStyle}
                      name='fee_rate'
                      value={fee_type || 'CNY'}
                      onChange={this.handleChangeSelect.bind(this, 'fee_type')}
                    >
                      {_.map(feeList, (st) => {
                        return (
                          <Option value={st.type} key={`fee_rate-${st.type}`}>
                            {st.name}
                          </Option>
                        )
                      })}
                    </Select>
                  )}
                </FormItem>
              ) : null}
              <FormItem
                label={i18next.t('运营时间')}
                required
                validate={Validator.create(
                  [],
                  time_config_id,
                  this.handleCheckTimeConfig.bind(this, time_config_id)
                )}
              >
                {isCreate || canEditServiceTime ? (
                  <Select
                    name='time_config_id'
                    value={time_config_id || '-'}
                    onChange={this.handleChangeSelect.bind(
                      this,
                      'time_config_id'
                    )}
                  >
                    {_.map(serviceTimeList, (st) => {
                      return (
                        <Option value={st.id} key={`serviceTime-${st.id}`}>
                          {st.name}
                        </Option>
                      )
                    })}
                  </Select>
                ) : (
                  <div style={{ marginTop: '6px' }}>
                    <span>{time_config.name}</span>
                    <div className='gm-gap-10' />
                    <Popover
                      showArrow
                      arrowBorderColor='#000'
                      arrowBgColor='#000'
                      type='hover'
                      popup={tooltip}
                    >
                      <span
                        style={{
                          cursor: 'default',
                          textDecoration: 'underline',
                        }}
                      >
                        {i18next.t('详情')}
                      </span>
                    </Popover>
                  </div>
                )}
              </FormItem>
              <FormItem label={i18next.t('选择销售对象')}>
                {/* todo MoreSelect */}
                <MoreSelect
                  multiple
                  data={this.state.saleTargets}
                  selected={targetsSelected}
                  onSearch={this.handleSearch}
                  onSelect={this.handleSelect}
                  placeholder={i18next.t(
                    '选择销售的站点信息，单仓模式无需选择'
                  )}
                />
              </FormItem>
              <FormItem
                label={i18next.t('报价单名称(对外)')}
                required
                validate={Validator.create(
                  [Validator.TYPE.required],
                  _.trim(supplier_name)
                )}
              >
                <input
                  type='text'
                  className='form-control'
                  maxLength={6}
                  placeholder={i18next.t('用于下单商城的展现，不超过6个字符')}
                  value={supplier_name}
                  name='supplier_name'
                  onChange={this.handleChangeInput}
                />
              </FormItem>
              <FormItem label={i18next.t('描述')}>
                <textarea
                  className='form-control'
                  rows={4}
                  value={about}
                  name='about'
                  style={{ width: '300px' }}
                  onChange={this.handleChangeInput}
                />
              </FormItem>
              {isCreate && (
                <FormItem
                  label={i18next.t('是否复制已有报价单')}
                  colWidth='580px'
                >
                  <Switch
                    name='is_copy_salemenu'
                    type='primary'
                    on={i18next.t('是')}
                    off={i18next.t('否')}
                    checked={is_copy_salemenu}
                    onChange={this.handleChangeSelect.bind(
                      this,
                      'is_copy_salemenu'
                    )}
                  />
                  <br />
                  {isCreate && !is_copy_salemenu && (
                    <div className='gm-padding-top-5'>
                      {i18next.t(
                        '选择复制已有报价单，可直接同步已有报价单的商品，无需手动新建'
                      )}
                    </div>
                  )}
                </FormItem>
              )}
              {isCreate && is_copy_salemenu && (
                <FormItem
                  label={i18next.t('选择需复制的报价单')}
                  validate={Validator.create(
                    [],
                    copy_salemenu_id,
                    this.handleCheckCopySalemenu.bind(this, copy_salemenu_id)
                  )}
                >
                  <Select
                    name='copy_salemenu_id'
                    value={copy_salemenu_id}
                    onChange={this.handleChangeSelect.bind(
                      this,
                      'copy_salemenu_id'
                    )}
                  >
                    {_.map(salemenuList, (st) => {
                      return (
                        <Option value={st.id} key={`salemenu${st.id}`}>
                          {st.name}
                        </Option>
                      )
                    })}
                  </Select>
                </FormItem>
              )}
              <FormItem label={i18next.t('激活状态')}>
                <Switch
                  name='is_active'
                  type='primary'
                  on={i18next.t('激活')}
                  off={i18next.t('不激活')}
                  checked={is_active}
                  onChange={this.handleChangeSelect.bind(this, 'is_active')}
                />
                <div className='gm-padding-top-5 gm-text-desc'>
                  {i18next.t('报价单激活后客户可正常下单，否则无法下单')}
                </div>
              </FormItem>
            </Form>
          </FormPanel>
        </FormGroup>
      </div>
    )
  }
}

export default Salemenu
