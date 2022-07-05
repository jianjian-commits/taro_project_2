import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import {
  Form,
  FormItem,
  FormButton,
  Modal,
  Flex,
  InputNumber,
  Tip,
  Switch,
  DatePicker,
  Button,
} from '@gmfe/react'
import { SearchSelect, FilterSearchSelect } from '@gmfe/react-deprecated'
import '../actions.js'
import '../reducer.js'
import _ from 'lodash'
import actions from '../../../actions'
import { pinYinFilter } from '@gm-common/tool'
import moment from 'moment'
import { calculateCycleTime } from '../../../common/util'

class ItemCreateModal extends React.Component {
  constructor(props) {
    super(props)

    const { time_config_id } = this.props

    this.state = {
      spus: [],
      selectedSpu: {},
      spuSpecs: [],
      suppliers: [],
      count: '',
      selectedSupplier: null,
      isRelatedTasksCycle: false,
      time_config_id: time_config_id,
      cycle_start_time: moment(),
    }
    this.handleCreateItem = ::this.handleCreateItem
    this.handleSpuChoose = ::this.handleSpuChoose
    this.handleSpuSearch = ::this.handleSpuSearch
    this.handlePlanCountChange = ::this.handlePlanCountChange
    this.handleSupplierSelect = ::this.handleSupplierSelect
    this.handleSupplierFilter = ::this.handleSupplierFilter
    this.handleSpecChange = ::this.handleSpecChange
    this.handleChangeStatus = ::this.handleChangeStatus
    this.handleDateChange = ::this.handleDateChange
    this.handleCycleTimeChange = ::this.handleCycleTimeChange
  }

  handleCreateItem() {
    const skuID = this.refSpuSpec.value
    const {
      count,
      selectedSpu,
      selectedSupplier,
      cycle_start_time,
      time_config_id,
    } = this.state
    const { serviceTimes } = this.props
    const service_time = _.find(serviceTimes, (s) => s._id === time_config_id)

    if (selectedSpu === null || !selectedSpu.id) {
      Tip.warning(i18next.t('请输入有效的商品名'))
      return false
    } else if (!skuID) {
      Tip.warning(i18next.t('请选择采购规格'))
      return false
    } else if (!selectedSupplier || !selectedSupplier.id) {
      Tip.warning(i18next.t('请选择供应商'))
      return false
    } else if (!count || count <= 0) {
      Tip.warning(i18next.t('请填写大于0的采购量'))
      return false
    }

    const cycle_time =
      calculateCycleTime(cycle_start_time, service_time).begin + ':00'

    return actions
      .purchase_item_create(
        selectedSupplier.id,
        skuID,
        count,
        time_config_id,
        cycle_time,
        this.state.isRelatedTasksCycle
      )
      .then(() => {
        this.setState({
          spus: [],
          selectedSpu: {},
          spuSpecs: [],
          suppliers: [],
          count: '',
          selectedSupplier: null,
        })

        this.props.onCreate()
      })
  }

  handleSpuChoose(selectedSpu) {
    this.setState({ selectedSpu: selectedSpu || {} })

    selectedSpu &&
      actions.purchase_item_resource_get(selectedSpu.id).then((spes) => {
        this.setState({
          spuSpecs: spes,
          suppliers: [],
        })
      })
  }

  handleSpuSearch(text) {
    if (text !== '' && this.state.selectedSpu.name !== text) {
      actions.purchase_item_spus_get(text).then((json) => {
        this.setState({
          spus: json.data.map((spu) => ({
            name: spu.spu_name,
            id: spu.spu_id,
          })),
        })
      })
    }
  }

  handlePlanCountChange(count) {
    this.setState({ count })
  }

  handleSupplierSelect(supplier) {
    this.setState({
      selectedSupplier: supplier,
    })
  }

  handleSupplierFilter(list, query) {
    return pinYinFilter(list, query, (supplier) => supplier.name)
  }

  handleSpecChange(e) {
    const spec = _.find(
      this.state.spuSpecs,
      (spec) => spec.sku_id === e.target.value
    )

    this.setState({ suppliers: spec.settle_suppliers })
  }

  handleChangeStatus() {
    this.setState({
      isRelatedTasksCycle: !this.state.isRelatedTasksCycle,
    })
  }

  handleCycleTimeChange(e) {
    const value = e && e.target ? e.target.value : e

    this.setState({
      time_config_id: value,
      cycle_start_time: moment(),
    })
  }

  handleDateChange(date) {
    this.setState({
      cycle_start_time: date,
    })
  }

  render() {
    const {
      spus,
      selectedSpu,
      spuSpecs,
      suppliers,
      count,
      selectedSupplier,
      time_config_id,
      cycle_start_time,
    } = this.state
    const { serviceTimes } = this.props
    const skuID = this.refSpuSpec ? this.refSpuSpec.value : ''

    const serviceTime = _.find(
      serviceTimes,
      (serviceTime) => serviceTime._id === time_config_id
    )
    let e_span_time = _.find(serviceTimes, (s) => s._id === time_config_id)
      .order_time_limit.e_span_time
    if (serviceTime.type === 2) {
      e_span_time = _.find(serviceTimes, (s) => s._id === time_config_id)
        .receive_time_limit.e_span_time
    }

    return (
      <Form
        className='gm-margin-lr-15'
        onSubmit={this.handleCreateItem}
        labelWidth='80px'
        horizontal
      >
        <FormItem label={i18next.t('关联周期')}>
          <Flex alignCenter>
            <Switch
              type='primary'
              checked={this.state.isRelatedTasksCycle}
              on={i18next.t('是')}
              off={i18next.t('否')}
              onChange={this.handleChangeStatus}
            />
          </Flex>
        </FormItem>
        {this.state.isRelatedTasksCycle ? (
          <FormItem label={i18next.t('运营周期')}>
            <Flex>
              <select
                name='time_config_id'
                value={time_config_id}
                onChange={this.handleCycleTimeChange}
                className='form-control'
              >
                {_.map(serviceTimes, (s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Flex>
          </FormItem>
        ) : null}
        {this.state.isRelatedTasksCycle ? (
          <FormItem label=' '>
            <Flex>
              <DatePicker
                date={cycle_start_time}
                className='gm-margin-top-10 gm-flex-auto'
                onChange={this.handleDateChange}
                renderDate={() => {
                  const serviceTime = _.find(
                    serviceTimes,
                    (serviceTime) => serviceTime._id === time_config_id
                  )
                  const cycle = calculateCycleTime(
                    cycle_start_time,
                    serviceTime,
                    'M-D'
                  )
                  return `${cycle.begin}~${cycle.end}${
                    serviceTime.type === 2
                      ? i18next.t('收货')
                      : i18next.t('下单')
                  }`
                }}
                max={moment().add(e_span_time, 'd')}
              />
            </Flex>
          </FormItem>
        ) : null}
        <FormItem label={i18next.t('采购商品')}>
          <Flex column>
            <Flex>
              {/* eslint-disable-next-line */}
              <SearchSelect
                list={spus}
                selected={selectedSpu}
                onSelect={this.handleSpuChoose}
                onSearch={this.handleSpuSearch}
                placeholder={i18next.t('商品名称或ID')}
                isScrollToSelected
                className='gm-flex-auto'
              />
            </Flex>
            {selectedSpu ? null : (
              <Flex style={{ color: 'red' }}>
                {i18next.t('请输入有效的商品名')}
              </Flex>
            )}
          </Flex>
        </FormItem>
        <FormItem label={i18next.t('采购规格')}>
          <Flex>
            <select
              ref={(ref) => {
                this.refSpuSpec = ref
              }}
              value={skuID}
              className='form-control'
              onChange={this.handleSpecChange}
            >
              <option value=''>{i18next.t('请选择')}</option>
              {_.map(spuSpecs, (sku) => (
                <option key={sku.sku_id} value={sku.sku_id}>
                  {`${sku.sale_ratio}${sku.std_unit_name}/${sku.sale_unit_name}`}
                </option>
              ))}
            </select>
          </Flex>
          {selectedSpu.name && spuSpecs.length === 0 && (
            <Flex className='gm-margin-top-5'>
              <span className='gm-text-helper'>
                {i18next.t('所选商品无采购规格，')}
              </span>
              <a
                href='#/supply_chain/purchase/information?tab=1'
                target='_blank'
                style={{ textDecoration: 'underline' }}
              >
                {i18next.t('快速创建采购规格')}
              </a>
            </Flex>
          )}
        </FormItem>
        <FormItem label={i18next.t('供应商')}>
          <Flex>
            <FilterSearchSelect
              list={suppliers}
              selected={selectedSupplier}
              onSelect={this.handleSupplierSelect}
              onFilter={this.handleSupplierFilter}
              placeholder={i18next.t('请选择供应商')}
              className='gm-flex-auto'
            />
          </Flex>
        </FormItem>
        <FormItem label={i18next.t('采购量')}>
          <Flex alignCenter>
            <InputNumber
              value={count}
              onChange={this.handlePlanCountChange}
              className='form-control'
            />
            {spuSpecs[0] && (
              <div className='gm-padding-lr-10'>
                {spuSpecs[0].std_unit_name}
              </div>
            )}
          </Flex>
        </FormItem>
        <FormButton>
          <Flex justifyEnd>
            <Button
              className='gm-margin-right-10'
              onClick={() => {
                Modal.hide()
              }}
            >
              {i18next.t('取消')}
            </Button>
            <Button type='primary' htmlType='submit'>
              {i18next.t('确定')}
            </Button>
          </Flex>
        </FormButton>
        <Flex className='gm-margin-tb-10'>
          {!this.state.isRelatedTasksCycle ? (
            <div style={{ color: 'red', fontSize: '12px' }}>
              {i18next.t('注:未关联周期的条目仅在“按下单日期”下汇总')}
            </div>
          ) : null}
        </Flex>
      </Form>
    )
  }
}

ItemCreateModal.propTypes = {
  onCreate: PropTypes.func,
  time_config_id: PropTypes.string,
  serviceTimes: PropTypes.array,
}

export default ItemCreateModal
