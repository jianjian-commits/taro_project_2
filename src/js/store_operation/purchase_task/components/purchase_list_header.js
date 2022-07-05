import { i18next } from 'gm-i18n'
import React from 'react'
import {
  BoxForm,
  FormItem,
  FormBlock,
  FormButton,
  Select,
  Option,
  DropDownItem,
  DropDownItems,
  DropDown,
  MultipleFilterSelect,
  Flex,
  RightSideModal,
  Modal,
  Storage,
  Button,
  MoreSelect,
  Tip,
} from '@gmfe/react'
import { FilterSearchSelect } from '@gmfe/react-deprecated'
import _ from 'lodash'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import {
  PURCHASE_TASK_STATUS,
  purchaseTaskSearchDateTypes,
  filterStatusList,
  SORT_STATUS,
  HAS_CREATED_PURCHASE_SHEET_STATUS,
  dateFilterData,
  PURCHASE_ORIGIN_STATUS,
  ORDER_CLIENTS,
} from '../../../common/enum'
import CategoryFilter from '../../../common/components/category_filter_hoc'
import DateFilter from '../../../common/components/date_range_filter'
import DiyTabModal from '../../../common/components/diy_tab_modal'

import '../actions.js'
import '../reducer.js'
import actions from '../../../actions'
import { pinYinFilter } from '@gm-common/tool'
import { Request } from '@gm-common/request'
import moment from 'moment'
import { cycleDateRangePickerInputValue } from '../../../common/filter'
import {
  getExportInfo,
  getRequestField,
  removedFieldOfCPurchase,
} from '../../../common/diy_export_key'
import qs from 'querystring'
import styles from '../style.module.less'
import generateQuotationExcel from '../../../finance/supplier/quotation_list_excel'
import globalStore from '../../../stores/global'
import TaskList from '../../../task/task_list'
import { observer } from 'mobx-react'
import PurchaseExportModal from './purchase_export_model'
import { getSearchOption } from '../util'

function endDateRanger(type, e_span_time, begin) {
  const today = moment()
  const days30 = moment(begin).add(30, 'd')
  const daysWithSpan = moment().add(e_span_time, 'd')
  let maxTemp = daysWithSpan.isAfter(days30) ? days30 : daysWithSpan
  if (purchaseTaskSearchDateTypes.ORDER.type === +type) {
    maxTemp = daysWithSpan.isAfter(today) ? today : daysWithSpan
  }
  return {
    min: begin,
    max: maxTemp,
  }
}

function startDateRanger(type, e_span_time) {
  if (
    (+type === purchaseTaskSearchDateTypes.RECEIVE.type ||
      +type === purchaseTaskSearchDateTypes.CYCLE.type) &&
    e_span_time
  ) {
    return {
      min: moment().add(-3, 'month').startOf('month'),
      max: moment().add(e_span_time, 'd'),
    }
  }

  return {
    min: moment().add(-3, 'month').startOf('month'),
    max: moment(),
  }
}
@observer
class PurchaseListHeader extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      routeSelected: [],
    }

    this.handleExport = ::this.handleExport
    this.handleExportWithTable = ::this.handleExportWithTable
    this.handleExportWithTableBySupplier =
      ::this.handleExportWithTableBySupplier
    this.handleBatchExport = ::this.handleBatchExport
    this.handleFilterChange = ::this.handleFilterChange
    this.renderDateRangePickerInputValue =
      ::this.renderDateRangePickerInputValue
    this.handleDateChange = ::this.handleDateChange
    this.handleExportPurchaseTemExcel = ::this.handleExportPurchaseTemExcel
  }

  handleInputFilter(list, query) {
    return pinYinFilter(list, query, (supplier) => supplier.name)
  }

  handleExportWithTable() {
    this.handleExport(2)
  }

  handleExportWithTableBySupplier() {
    this.handleExport(3)
  }

  handleBatchExport(templateId, templateName) {
    this.handleExport(1, templateId, templateName)
  }

  handleReset = () => {
    this.setState({
      routeSelected: [],
    })
    actions.purchase_task_header_filter_clear()
  }

  handleExport(type, templateId, templateName) {
    const condition = this.props.getSearchOption({})
    condition.type = type
    delete condition.limit
    delete condition.offset
    const { isCStation } = globalStore.otherInfo
    const purchase_task_type = isCStation ? 'CpurchaseTask' : 'purchaseTask'
    const purchase_task_items_type = isCStation
      ? 'CpurchaseTaskItems'
      : 'purchaseTaskItems'

    // c站点处理导出字段
    if (type === 1) {
      // 采购导出自定义
      Object.assign(condition, {
        export_fields: JSON.stringify({
          purchase_task: getRequestField(purchase_task_type, isCStation),
          purchase_task_items: getRequestField(
            purchase_task_items_type,
            isCStation,
          ),
        }),
        template_id: templateId,
        template_name: templateName,
      })

      return Request('/purchase/task/export_v2')
        .data(condition)
        .get()
        .then((res) => {
          // type = 1 导出都是异步
          if (res.data && res.data.async === 1) {
            RightSideModal.render({
              children: <TaskList />,
              onHide: RightSideModal.hide,
              style: {
                width: '300px',
              },
            })
          }
        })
    } else {
      window.open(`/purchase/task/export?${qs.stringify(condition)}`)
    }
  }

  handleExportQuotationExcel = async () => {
    const condition = this.props.getSearchOption({})
    delete condition.limit
    delete condition.offset
    const { data } = await Request('/purchase/quote_price/template/export')
      .data(condition)
      .get()
    generateQuotationExcel(data)
  }

  handleExportPurchaseTemExcel = () => {
    const { limit } = this.props.purchase_task.taskListPagination
    // const { headerFilter } = this.props.purchase_task
    const query = getSearchOption(this.props.purchase_task, {
      offset: 0,
      limit,
    })
    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: { width: '300px' },
      children: (
        <PurchaseExportModal
          query={query}
          closeModal={RightSideModal.hide}
          onHandleShowSetModal={this.handleShowSetModal}
          onHandleBatchExport={this.handleBatchExport}
        />
      ),
    })
  }

  handleDateChange(begin, end) {
    if (moment(begin).isAfter(moment(end))) {
      end = begin
    }

    actions.purchase_task_header_filter_change({ begin, end })
  }

  handleFilterChange(key, e) {
    const value = e && e.target ? e.target.value : e
    actions.purchase_task_header_filter_change({ [key]: value })

    // 如果筛选条件选择供应商,那么就去清楚总览里的supplierPurchaserId
    if (key === 'supplier') {
      actions.purchase_task_side_bar_choose_id_clear()
    }

    if (key === 'time_config_id' || key === 'cycle_start_time') {
      this.props.onSearch()
    }
  }

  handleSearch(value) {
    const pagination = { offset: 0, limit: 10 }
    actions.purchase_sourcer_search(value, pagination)
  }

  renderDateRangePickerInputValue(date) {
    const { serviceTimes, headerFilter } = this.props.purchase_task
    const time = _.find(
      serviceTimes,
      (v) => v._id === headerFilter.time_config_id,
    )

    return cycleDateRangePickerInputValue(date, time)
  }

  handleWithFilter = (list, query) => {
    return _.filter(list, (v) => {
      return v.name.indexOf(query) > -1
    })
  }

  handleRouteSelect = (selected = []) => {
    const selectValue = selected.find((item) => item.value === -1)
    if (selectValue) {
      this.setState({
        routeSelected: [selectValue],
      })
      const route_ids = [selectValue.value]

      this.handleFilterChange('route_ids', JSON.stringify(route_ids))
      Tip.info(i18next.t('如果需要选择其他线路,需手动删除无线路!'))
    } else {
      this.setState({
        routeSelected: selected,
      })
      const route_ids = selected.map((item) => item.value)

      this.handleFilterChange('route_ids', JSON.stringify(route_ids))
    }
  }

  handleDateFilterChangeOnce = (value) => {
    if (value.dateType) {
      this.handleFilterChange('dateType', +value.dateType)
    } else if (value.time_config_id) {
      this.handleFilterChange('time_config_id', value.time_config_id)
    } else if (value.begin && value.end) {
      this.handleDateChange(value.begin, value.end)
    }
  }

  getDateLimit = () => {
    const { headerFilter, serviceTimes } = this.props.purchase_task
    const { dateType, begin, time_config_id } = headerFilter
    let maxSpanEnd

    if (Number(dateType) === purchaseTaskSearchDateTypes.ORDER.type) {
      const maxOrderEndConfig = _.maxBy(serviceTimes, (serviceTime) => {
        return serviceTime.order_time_limit.e_span_time
      })
      maxSpanEnd =
        maxOrderEndConfig && maxOrderEndConfig.order_time_limit.e_span_time
    } else if (Number(dateType) === purchaseTaskSearchDateTypes.RECEIVE.type) {
      const maxOrderEndConfig = _.maxBy(serviceTimes, (serviceTime) => {
        return serviceTime.receive_time_limit.e_span_time
      })
      maxSpanEnd =
        maxOrderEndConfig && maxOrderEndConfig.receive_time_limit.e_span_time
    } else if (Number(dateType) === purchaseTaskSearchDateTypes.CYCLE.type) {
      _.find(serviceTimes, (serviceTime) => {
        if (serviceTime._id === time_config_id && serviceTime.type === 2) {
          maxSpanEnd = serviceTime.receive_time_limit.e_span_time
        } else if (
          serviceTime._id === time_config_id &&
          serviceTime.type !== 2
        ) {
          maxSpanEnd = serviceTime.order_time_limit.e_span_time
        }
      })
    }

    const beginProps = startDateRanger(dateType, maxSpanEnd)
    const endProps = endDateRanger(dateType, maxSpanEnd, begin)

    return { beginProps, endProps }
  }

  disabledDate = (d, { begin, end }) => {
    const data = this.getDateLimit()
    const dMin = data.beginProps.min
    const dMax = data.endProps.max

    return !(+moment(d) <= +dMax && +moment(d) >= +dMin)
  }

  handleShowSetModal = () => {
    const exportInfo = getExportInfo('purchaseTask&&purchaseTaskItems')

    const exportTabTitle = [
      i18next.t('采购任务统计'),
      i18next.t('采购任务条目详情'),
    ]
    const { isCStation } = globalStore.otherInfo

    Modal.render({
      disableMaskClose: true,
      title: i18next.t('导出设置'),
      noContentPadding: true,
      size: 'lg',
      onHide: Modal.hide,
      children: (
        <DiyTabModal
          isCStation={isCStation}
          removedField={isCStation ? removedFieldOfCPurchase : null}
          exportInfo={exportInfo}
          tabTitle={exportTabTitle}
          onSave={this.handleColumnsSave}
          onHandleExportPurchaseTemExcel={this.handleExportPurchaseTemExcel}
        />
      ),
    })
  }

  handleColumnsSave = (newColumns) => {
    _.each(newColumns, (item, key) => {
      Storage.set(key, newColumns[key])
    })
  }

  render() {
    const { onSearch, purchase_task } = this.props

    console.log(this.props);
    const {
      headerFilter,
      suppliers,
      routeList,
      purchaseSourcer,
      serviceTimes,
      siteList,
      addressLabelList,
      merchandiseList,
    } = purchase_task

    const { dateType, begin, end, time_config_id } = headerFilter
    const isSupplierUser = globalStore.isSettleSupply()
    const purchaseDimensional = globalStore.hasPermission(
      'get_purchase_dimensional',
    )
    const sortStatus = globalStore.hasPermission(
      'get_purchase_task_by_sort_status',
    ) // 分拣状态 权限

    const siteSelectShow =
      (globalStore.groupId === 244 && globalStore.stationId === 'T4969') ||
      (globalStore.groupId === 1232 && globalStore.stationId === 'T39044')

    const dateFilerDataTotal = {
      dateFilterData: [...dateFilterData],
      service_times: [...serviceTimes.slice()],
    }

    const limitDates = [this.disabledDate, this.getDateLimit, this.disabledDate]

    // 非净菜站点去掉采购来源的预生产计划选项(value:4)
    const PURCHASE_ORIGIN_STATUS_DATA = globalStore.isCleanFood()
      ? PURCHASE_ORIGIN_STATUS
      : _.filter(PURCHASE_ORIGIN_STATUS, (item) => {
          return item.value !== 4
        })

    const { isCStation } = globalStore.otherInfo

    const getExtraServiceTime = (serviceTimes) => {
      const extraServiceTime = [...serviceTimes]
      extraServiceTime.unshift({
        _id: '',
        name: '全部运营时间',
      })
      return extraServiceTime
    }

    return (
      <div>
        <BoxForm
          labelWidth='100px'
          colWidth='380px'
          onSubmit={onSearch}
          btnPosition='left'
        >
          <FormBlock col={3}>
            <DateFilter
              data={dateFilerDataTotal}
              filter={{ begin, end, time_config_id, dateType: `${dateType}` }}
              onDateFilterChange={this.handleDateFilterChangeOnce}
              limitDates={limitDates}
              enabledTimeSelect
            />
            {dateType !== 2 && (
              <FormItem label={i18next.t('选择运营时间')}>
                <Select
                  value={headerFilter.operateStatus || ''}
                  onChange={this.handleFilterChange.bind(this, 'operateStatus')}
                  data={_.map(getExtraServiceTime(serviceTimes), (s) => ({
                    value: s._id,
                    text: s.name,
                  }))}
                />
              </FormItem>
            )}
            <FormItem label={i18next.t('搜索')}>
              <input
                name='search_text'
                value={headerFilter.search_text}
                onChange={this.handleFilterChange.bind(this, 'search_text')}
                className='form-control gm-inline-block'
                placeholder={i18next.t('输入订单号、商品名称信息搜索')}
              />
            </FormItem>
          </FormBlock>
          <BoxForm.More>
            <FormBlock col={3}>
              <FormItem col={2} label={i18next.t('商品')}>
                <CategoryFilter
                  selected={headerFilter.categoryFilter}
                  onChange={this.handleFilterChange.bind(
                    this,
                    'categoryFilter',
                  )}
                />
              </FormItem>
              {!isSupplierUser ? (
                <FormItem label={i18next.t('订单状态')}>
                  <Flex>
                    <Select
                      name='taskStatus'
                      value={headerFilter.taskStatus}
                      onChange={this.handleFilterChange.bind(
                        this,
                        'taskStatus',
                      )}
                      className='gm-inline-block'
                      style={{ minWidth: 100 }}
                    >
                      <Option value=''>{i18next.t('全部任务')}</Option>
                      {_.map(PURCHASE_TASK_STATUS, (st) => (
                        <Option value={st.value} key={st.value}>
                          {st.name}
                          {i18next.t('任务')}
                        </Option>
                      ))}
                    </Select>
                    <FilterSearchSelect
                      key='order_status_select'
                      selected={headerFilter.orderStatus}
                      list={filterStatusList}
                      onSelect={this.handleFilterChange.bind(
                        this,
                        'orderStatus',
                      )}
                      onFilter={this.handleInputFilter}
                      placeholder={i18next.t('选择订单状态')}
                      multiple
                      className='gm-margin-left-5 gm-inline-block'
                    />
                  </Flex>
                </FormItem>
              ) : null}
              {!isSupplierUser ? (
                <FormItem label={i18next.t('供应商')}>
                  <MoreSelect
                    multiple
                    data={suppliers}
                    selected={headerFilter.supplier}
                    onSelect={(selected) =>
                      this.handleFilterChange('supplier', selected)
                    }
                    placeholder={i18next.t('全部供应商')}
                  />
                </FormItem>
              ) : null}
              {!isSupplierUser ? (
                <FormItem label={i18next.t('采购员')}>
                  <FilterSearchSelect
                    key={
                      'purchase_supplier_' +
                      ((headerFilter.purchaser && headerFilter.purchaser.id) ||
                        'all')
                    }
                    selected={headerFilter.purchaser}
                    onSelect={this.handleFilterChange.bind(this, 'purchaser')}
                    onFilter={this.handleInputFilter}
                    list={purchaseSourcer}
                    // selected={headerFilter.purchaser || ''}
                    // onSelect={(selected) =>
                    //   this.handleFilterChange('purchaser', selected)
                    // }
                    // onSearch={(value) => this.handleSearch(value)}
                    placeholder={i18next.t('全部采购员')}
                    className={`${styles.supplierSelector}`}
                  />
                </FormItem>
              ) : null}

              {!isCStation && (
                <FormItem label={i18next.t('线路')}>
                  <MultipleFilterSelect
                    id='route'
                    list={routeList}
                    selected={this.state.routeSelected}
                    withFilter={this.handleWithFilter}
                    onSelect={this.handleRouteSelect}
                    placeholder={i18next.t('全部线路')}
                  />
                </FormItem>
              )}

              {sortStatus && (
                <FormItem label={i18next.t('分拣状态')}>
                  <Select
                    value={headerFilter.sortStatus}
                    onChange={this.handleFilterChange.bind(this, 'sortStatus')}
                  >
                    <Option value=''>{i18next.t('全部状态')}</Option>
                    {_.map(SORT_STATUS, (s) => (
                      <Option key={s.value} value={s.value}>
                        {s.name}
                      </Option>
                    ))}
                  </Select>
                </FormItem>
              )}
              {/*  江苏一乙需求 */}
              {siteSelectShow && (
                <FormItem label={i18next.t('站点任务')}>
                  <Select
                    onChange={this.handleFilterChange.bind(this, 'siteTask')}
                    value={headerFilter.siteTask}
                  >
                    {_.map(siteList, (s) => (
                      <Option key={s.id} value={s.id}>
                        {s.name}
                      </Option>
                    ))}
                  </Select>
                </FormItem>
              )}

              {!isSupplierUser && (
                <FormItem label={i18next.t('采购单状态')}>
                  <Select
                    value={headerFilter.has_created_sheet}
                    onChange={this.handleFilterChange.bind(
                      this,
                      'has_created_sheet',
                    )}
                  >
                    <Option value=''>{i18next.t('全部状态')}</Option>
                    {_.map(HAS_CREATED_PURCHASE_SHEET_STATUS, (s) => (
                      <Option key={s.value} value={s.value}>
                        {s.name}
                      </Option>
                    ))}
                  </Select>
                </FormItem>
              )}

              <FormItem label={i18next.t('采购来源')}>
                <Select
                  value={headerFilter.source_type}
                  data={PURCHASE_ORIGIN_STATUS_DATA}
                  onChange={this.handleFilterChange.bind(this, 'source_type')}
                />
              </FormItem>
              {!isCStation && (
                <FormItem label={i18next.t('商户')}>
                  <MoreSelect
                    multiple
                    data={merchandiseList}
                    selected={headerFilter.addresses}
                    onSelect={(selected) =>
                      this.handleFilterChange('addresses', selected)
                    }
                    placeholder={i18next.t(
                      '输入商户名、商户ID、商户账号或自定义编码搜索',
                    )}
                  />
                </FormItem>
              )}
              {!isCStation && (
                <FormItem label={i18next.t('商户标签')}>
                  <MoreSelect
                    data={addressLabelList}
                    selected={headerFilter.addressLabel}
                    onSelect={(selected) =>
                      this.handleFilterChange('addressLabel', selected)
                    }
                    placeholder={i18next.t('全部标签')}
                  />
                </FormItem>
              )}

              {!isSupplierUser && (
                <FormItem label={i18next.t('差异状态')}>
                  <Select
                    value={headerFilter.changeOption}
                    onChange={this.handleFilterChange.bind(
                      this,
                      'changeOption',
                    )}
                  >
                    <Option value='0' key='0'>
                      {i18next.t('全部')}
                    </Option>
                    <Option value='1' key='1'>
                      {i18next.t('只看有差异')}
                    </Option>
                  </Select>
                </FormItem>
              )}
              <FormItem label={i18next.t('订单来源')}>
                <Select
                  value={headerFilter.client}
                  onChange={this.handleFilterChange.bind(this, 'client')}
                >
                  <Option value=''>{i18next.t('全部来源')}</Option>
                  {_.map(ORDER_CLIENTS, (s) => (
                    <Option key={s.value} value={s.value}>
                      {s.name}
                    </Option>
                  ))}
                </Select>
              </FormItem>
            </FormBlock>
          </BoxForm.More>
          <FormButton>
            <Button type='primary' htmlType='submit'>
              {i18next.t('搜索')}
            </Button>
            <div className='gm-gap-10' />
            <BoxForm.More>
              <>
                <Button onClick={this.handleReset}>{i18next.t('重置')}</Button>
                <div className='gm-gap-10' />
              </>
            </BoxForm.More>
            <DropDown
              split
              popup={
                !isSupplierUser || purchaseDimensional ? (
                  <DropDownItems>
                    {!isSupplierUser && (
                      <DropDownItem
                        onClick={this.handleExportWithTableBySupplier}
                      >
                        {i18next.t('按供应商导出')}
                      </DropDownItem>
                    )}
                    {purchaseDimensional && (
                      <DropDownItem onClick={this.handleExportWithTable}>
                        {i18next.t('二维表导出')}
                      </DropDownItem>
                    )}
                    {globalStore.hasPermission(
                      'get_purchase_task_quote_price_template',
                    ) && (
                      <DropDownItem onClick={this.handleExportQuotationExcel}>
                        {i18next.t('询价模板导出')}
                      </DropDownItem>
                    )}
                  </DropDownItems>
                ) : (
                  <div />
                )
              }
            >
              <Button onClick={this.handleExportPurchaseTemExcel}>
                {i18next.t('导出')}
              </Button>
            </DropDown>
          </FormButton>
        </BoxForm>
      </div>
    )
  }
}

PurchaseListHeader.propTypes = {
  purchase_task: PropTypes.object,
  onSearch: PropTypes.func,
  getSearchOption: PropTypes.func,
}

// 需要的数据通过connect进来
export default connect((state) => {
  console.log(state, 'state...');
  return ({
    purchase_task: state.purchase_task,
  })
})(PurchaseListHeader)
