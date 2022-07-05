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
  Flex,
  DateRangePicker,
  Dialog,
  TreeV2,
} from '@gmfe/react'
import { observer } from 'mobx-react'
import TaskList from '../../../../task/task_list'

import _ from 'lodash'
import { history, WithBreadCrumbs } from '../../../../common/service'
import { returnDateByFlag } from '../../../../common/filter'
import globalStore from '../../../../stores/global'
import store from './store'
import { Request } from '@gm-common/request'

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
      location: { query },
    } = this.props
    store.getFeeList()

    if (query.viewType === 'update') {
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

  askToSale = () => {
    const {
      salemenuDetails: { is_copy_salemenu },
    } = store
    if (is_copy_salemenu) return Promise.reject(new Error('cancel'))

    return Dialog.confirm({
      title: i18next.t('快速创建销售规格'),
      children: i18next.t(
        '是否快速为这个报价单新建销售规格，绑定该报价单的客户可以使用这些销售规格下单',
      ),
      cancelBtn: i18next.t('否，仅新建报价单'),
      OKBtn: i18next.t('是，新建销售规格'),
    })
  }

  createSalemenu = () => {
    return store.createSalemenu().then((json) => {
      if (json.data && json.data.async === 1) {
        Tip.success(i18next.t('正在异步新建报价单'))
        RightSideModal.render({
          children: <TaskList tabKey={1} />,
          onHide: RightSideModal.hide,
          style: { width: '300px' },
        })
        return Promise.reject(new Error('cancel'))
      } else {
        Tip.success(i18next.t('新建报价单成功'))
      }
      return json
    })
  }

  handleSubmit = () => {
    const { viewType } = this.props.location.query

    if (viewType === 'create') {
      this.askToSale()
        .then(() => {
          this.createSalemenu()
            .then((json) => {
              // 这里有点略坑，createSalemenu 接口会返回两种数据类型
              // 若所复制的报价单有商品的时候，会返回data: { async: 0-非异步，1-异步, salemenu_id: 报价单 id }
              // 若所复制报价单没有商品时，就返回data: 报价单 id
              Request('/salemenu/sale/detail')
                .data({
                  id: json.data.salemenu_id || json.data,
                })
                .get()
                .then((detailJson) => {
                  history.push({
                    pathname: '/merchandise/manage/sale/batch_categories',
                    // ?feeType=CNY&salemenuId=S35154&salemenuName=2222&salemenuType=4
                    query: {
                      feeType: detailJson.data.fee_type,
                      salemenuId: detailJson.data.id,
                      salemenuName: detailJson.data.name,
                      salemenuType: detailJson.data.type,
                    },
                  })
                })
            })
            .catch(() => {
              history.push('/merchandise/manage/sale')
            })
        })
        .catch(() => {
          this.createSalemenu().finally(() => {
            history.push('/merchandise/manage/sale')
          })
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

    if (name === 'copy_salemenu_id' && value !== '-') {
      store.getSkuList(value)
    }
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

  handleChangeDate = (begin, end) => {
    store.changeDetails('price_end_time', end)
    store.changeDetails('price_start_time', begin)
    // 开始或结束有不选的自动定价都设为false
    if (!begin || !end) {
      store.changeDetails('auto_set_price', false)
    }
  }

  render() {
    const {
      location: {
        query: { viewType },
      },
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
        auto_set_price,
        price_start_time,
        price_end_time,
        selectedSku,
      },
      serviceTime,
      salemenuTargets,
      allSalemenuList,
      feeList,
      skuTree,
    } = store

    const targetsSelected = []
    if (salemenuTargets.length && targets && targets.length) {
      _.forEach(targets, (tg) => {
        const tgObject = _.find(
          salemenuTargets.slice(),
          (st) => st.value === tg.value,
        )
        targetsSelected.push(tgObject)
      })
    }

    const feeSelected = _.find(feeList, (item) => item.type === fee_type) || {}
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
      (item) => item.type !== 2 && item.fee_type === fee_type,
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
        <>
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
        </>
      )
    }

    let bc = []
    if (viewType === 'create') {
      bc = [i18next.t('新建报价单')]
    } else if (viewType === 'update') {
      bc = [i18next.t('更改报价单')]
    }

    const labelWidh = isCreate ? '200px' : '190px'

    const isSelecteDate = price_end_time && price_end_time

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
                  _.trim(name),
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
                  this.handleCheckTimeConfig.bind(this, time_config_id),
                )}
              >
                {isCreate || canEditServiceTime ? (
                  <Select
                    name='time_config_id'
                    value={time_config_id || '-'}
                    onChange={this.handleChangeSelect.bind(
                      this,
                      'time_config_id',
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
                    '选择销售的站点信息，单仓模式无需选择',
                  )}
                />
              </FormItem>
              <FormItem
                label={i18next.t('报价单名称(对外)')}
                required
                validate={Validator.create(
                  [Validator.TYPE.required],
                  _.trim(supplier_name),
                )}
              >
                <input
                  type='text'
                  className='form-control'
                  maxLength={20}
                  placeholder={i18next.t('用于下单商城的展现，不超过20个字符')}
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
                      'is_copy_salemenu',
                    )}
                  />
                  <br />
                  {isCreate && !is_copy_salemenu && (
                    <div className='gm-padding-top-5 gm-text-desc'>
                      {i18next.t(
                        '选择复制已有报价单，可直接同步已有报价单的商品，无需手动新建',
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
                    this.handleCheckCopySalemenu.bind(this, copy_salemenu_id),
                  )}
                >
                  <Select
                    name='copy_salemenu_id'
                    value={copy_salemenu_id}
                    onChange={this.handleChangeSelect.bind(
                      this,
                      'copy_salemenu_id',
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
              {isCreate && is_copy_salemenu && copy_salemenu_id !== '-' && (
                <FormItem label={i18next.t('可供应食品')}>
                  <div style={{ height: '500px', width: '400px' }}>
                    <TreeV2
                      list={skuTree.slice()}
                      selectedValues={selectedSku.slice()}
                      onSelectValues={(values) =>
                        store.changeDetails('selectedSku', values)
                      }
                    />
                  </div>
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
              <FormItem label={i18next.t('定价周期')}>
                <DateRangePicker
                  begin={price_start_time}
                  end={price_end_time}
                  canClear
                  onChange={this.handleChangeDate}
                />
              </FormItem>
              <FormItem label={i18next.t('自动定价')} colWidth='700px'>
                <Switch
                  name='auto_set_price'
                  type='primary'
                  disabled={!isSelecteDate} // 未选择定价周期不可编辑
                  on={i18next.t('开启')}
                  off={i18next.t('关闭')}
                  checked={auto_set_price} // 未选择定价周期默认关闭
                  onChange={this.handleChangeSelect.bind(
                    this,
                    'auto_set_price',
                  )}
                />
                <Flex column className='gm-padding-top-5 gm-text-desc'>
                  <span>{i18next.t('开启后：')}</span>
                  <span>
                    {i18next.t(
                      '1.需设置定价周期，未设置则自动定价不生效，自动定价会按照预设公式进行智能定价；',
                    )}
                  </span>
                  <span>
                    {i18next.t(
                      '2.到达结束日期时系统会自动进行定价，并将定价周期自动顺延一个周期，可在批量任务中查看定价结果。',
                    )}
                  </span>
                </Flex>
              </FormItem>
            </Form>
          </FormPanel>
        </FormGroup>
      </div>
    )
  }
}

export default Salemenu
