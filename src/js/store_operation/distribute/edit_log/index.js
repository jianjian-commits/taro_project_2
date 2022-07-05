import { i18next } from 'gm-i18n'
import React from 'react'
import {
  FormBlock,
  Form,
  FormItem,
  FormButton,
  Pagination,
  PaginationText,
  Box,
  BoxTable,
  Flex,
  Button,
} from '@gmfe/react'
import moment from 'moment'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import editLogStore from './store'
import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'
import { searchDateTypes, dateFilterData } from '../../../common/enum'
import _ from 'lodash'
import util from '../util'
import Big from 'big.js'
import { cycleDateRangePickerInputValue } from '../../../common/filter'
import globalStore from '../../../stores/global'
import DateFilter from '../../../common/components/date_range_filter'
import { getCycleDateLimit } from '../../../order/components/date_range_limit'

import { Table } from '@gmfe/table'

const { endDateRanger, startDateRanger } = util

@observer
class EditLog extends React.Component {
  constructor(props) {
    super(props)
    this.handleTextChange = ::this.handleTextChange
    this.handleSubmit = ::this.handleSubmit
    this.renderDateRangePickerInputValue =
      ::this.renderDateRangePickerInputValue
    this.handleDatePicked = ::this.handleDatePicked
    this.handleTimeConfigIdChange = ::this.handleTimeConfigIdChange
    this.handlePageChange = ::this.handlePageChange
  }

  handlePageChange(pagination) {
    editLogStore.fetchEditLog(pagination)
  }

  componentDidMount() {
    editLogStore.getServerTimes()
    editLogStore.fetchEditLog()
  }

  handleTextChange(e) {
    editLogStore.setSearchFilter('search_text', e.target.value)
  }

  handleSubmit(e) {
    e.preventDefault()
    editLogStore.fetchEditLog({ offset: 0 })
  }

  async handleBatchExport(e) {
    e.preventDefault()
    const jsonList = await editLogStore.batchExport()

    requireGmXlsx((res) => {
      const { jsonToSheet } = res
      jsonToSheet(jsonList, {
        SheetNames: [
          i18next.t('订单明细'),
          i18next.t('商品明细'),
          i18next.t('异常明细'),
        ],
        fileName: i18next.t('KEY209', {
          VAR1: moment().format('YYYY-MM-DD HH-mm-ss'),
        }) /* src:`配送单编辑记录_${moment().format('YYYY-MM-DD HH-mm-ss')}.xlsx` => tpl:配送单编辑记录_${VAR1}.xlsx */,
      })
    })
  }

  async handleSingleExport(id) {
    const jsonList = await editLogStore.singleExport(id)

    requireGmXlsx((res) => {
      const { jsonToSheet } = res
      jsonToSheet(jsonList, {
        SheetNames: [
          i18next.t('订单明细'),
          i18next.t('商品明细'),
          i18next.t('异常明细'),
        ],
        fileName: i18next.t('KEY209', {
          VAR1: moment().format('YYYY-MM-DD HH-mm-ss'),
        }) /* src:`配送单编辑记录_${moment().format('YYYY-MM-DD HH-mm-ss')}.xlsx` => tpl:配送单编辑记录_${VAR1}.xlsx */,
      })
    })
  }

  handleTimeConfigIdChange(value) {
    editLogStore.setSearchFilter('time_config_id', value)
  }

  handleDatePicked(beginTime, endTime) {
    editLogStore.setSearchFilter('begin_time', beginTime)
    editLogStore.setSearchFilter('end_time', endTime)
  }

  renderDateRangePickerInputValue(date) {
    const {
      service_times,
      filter: { time_config_id },
    } = editLogStore
    const time = _.find(service_times, (v) => v._id === time_config_id)

    return cycleDateRangePickerInputValue(date, time)
  }

  getMaxEndConfig = (service_times) => {
    const maxEndConfig = _.maxBy(
      service_times,
      (s) => s.receive_time_limit.e_span_time
    )
    return maxEndConfig
  }

  getMaxSpanEnd = () => {
    const {
      filter: { date_type, time_config_id },
      service_times,
    } = editLogStore

    let maxSpanEnd = null
    const maxEndConfig = this.getMaxEndConfig(service_times)

    if (date_type === searchDateTypes.CYCLE.type) {
      maxSpanEnd = _.find(service_times, (s) => s._id === time_config_id)
        .receive_time_limit.e_span_time
    } else if (
      date_type === searchDateTypes.RECEIVE.type ||
      date_type === searchDateTypes.ORDER.type
    ) {
      maxSpanEnd = maxEndConfig && maxEndConfig.receive_time_limit.e_span_time
    }

    return maxSpanEnd
  }

  disabledDates = (d, { begin, end }) => {
    const {
      filter: { date_type, begin_time },
      service_times,
    } = editLogStore

    const _begin = moment(begin).format('YYYY-MM-DD')
    const _initBegin = moment(begin_time).format('YYYY-MM-DD')
    const maxSpanEnd = this.getMaxSpanEnd()

    if (+moment(_begin) === +moment(_initBegin)) {
      const initMax = startDateRanger(date_type, maxSpanEnd, begin_time).max
      return !(+moment(d) <= +initMax)
    }

    const maxEndConfig = _.maxBy(
      service_times,
      (s) => s.receive_time_limit.e_span_time
    )
    const dMax = endDateRanger(
      date_type,
      maxEndConfig && maxEndConfig.receive_time_limit.e_span_time,
      begin_time
    ).max
    const dMin = moment(begin).subtract(30, 'd')

    return !(+moment(d) <= +dMax && +moment(d) >= +dMin)
  }

  handleStatusChange(field, value) {
    editLogStore.setSearchFilter(field, value)
  }

  handleDateFilterChangeOnce = (value) => {
    if (value.dateType) {
      this.handleStatusChange('date_type', value.dateType)
    } else if (value.time_config_id) {
      this.handleStatusChange('time_config_id', value.time_config_id)
    } else if (value.begin && value.end) {
      this.handleStatusChange('begin_time', value.begin)
      this.handleStatusChange('end_time', value.end)
    }
  }

  getCycleDateLimits = () => {
    const { filter, service_times } = editLogStore
    const filterData = {
      begin: filter.begin_time,
      end: filter.end_time,
      time_config_id: filter.time_config_id,
      dateType: filter.date_type,
    }
    return getCycleDateLimit(service_times, filterData)
  }

  render() {
    const {
      filter: { search_text },
      list,
      filter,
      pagination,
      service_times,
    } = editLogStore
    const canDistributionOrderExport = globalStore.hasPermission(
      'distribution_order_export'
    )
    const logList = list.slice()
    const paginationObj = toJS(pagination)

    const dateFilterDataTotal = {
      dateFilterData: [...dateFilterData],
      service_times: [...service_times.slice()],
    }

    const filterDatas = {
      begin: filter.begin_time,
      end: filter.end_time,
      time_config_id: filter.time_config_id,
      dateType: filter.date_type,
    }

    const limitDates = [
      this.disabledDates,
      this.getCycleDateLimits,
      this.disabledDates,
    ]

    return (
      <>
        <Box hasGap>
          <Form
            inline
            onSubmit={this.handleSubmit}
            labelWidth='90px'
            colWidth='320px'
          >
            <FormBlock col={3}>
              <DateFilter
                data={dateFilterDataTotal}
                filter={filterDatas}
                limitDates={limitDates}
                onDateFilterChange={this.handleDateFilterChangeOnce}
              />
              <FormItem label={i18next.t('搜索')}>
                <input
                  name='search_text'
                  value={search_text}
                  onChange={this.handleTextChange}
                  className='form-control gm-inline-block'
                  placeholder={i18next.t('输入订单号,商户名')}
                />
              </FormItem>
              <FormButton>
                <Button
                  type='primary'
                  htmlType='submit'
                  className='gm-margin-right-10'
                >
                  {i18next.t('搜索')}
                </Button>
                {canDistributionOrderExport && (
                  <Button
                    className='gm-margin-right-10'
                    onClick={this.handleBatchExport}
                  >
                    {i18next.t('导出')}
                  </Button>
                )}
              </FormButton>
            </FormBlock>
          </Form>
        </Box>

        <BoxTable info={<BoxTable.Info>{i18next.t('记录列表')}</BoxTable.Info>}>
          <Table
            data={logList}
            columns={[
              {
                Header: i18next.t('订单号/分拣序号'),
                id: 'idAndSort',
                accessor: (original) => (
                  <div>{`${original.order_id}/${original.sort_id || '-'}`}</div>
                ),
              },
              {
                Header: i18next.t('商户名'),
                accessor: 'res_name',
              },
              {
                Header: i18next.t('商品数'),
                accessor: 'sku_nums',
              },
              {
                Header: i18next.t('下单金额'),
                accessor: 'total_order_money',
              },
              {
                Header: i18next.t('应付金额'),
                id: 'total',
                accessor: (original) =>
                  Big(original.total_outstock_money)
                    .add(original.freight || 0)
                    .add(original.total_exception_money || 0)
                    .toFixed(2),
              },
              {
                Header: i18next.t('运费'),
                id: 'freight',
                accessor: (original) => original.freight || 0,
              },
              {
                Header: i18next.t('打印时间'),
                id: 'print_time',
                accessor: (original) =>
                  moment(original.print_time).format('YYYY-MM-DD HH:mm:ss'),
              },
              {
                Header: i18next.t('操作'),
                id: 'id',
                show: canDistributionOrderExport,
                accessor: (original) => (
                  <a
                    href='javascript:'
                    onClick={this.handleSingleExport.bind(this, original.id)}
                  >
                    {i18next.t('下载明细')}
                  </a>
                ),
              },
            ]}
          />
          <Flex
            justifyEnd
            alignCenter
            className='gm-padding-top-10 gm-padding-right-5'
          >
            <Pagination
              data={paginationObj}
              toPage={this.handlePageChange}
              nextDisabled={logList.length < pagination.limit}
            />
            <PaginationText data={paginationObj} />
          </Flex>
          <div className='gm-gap-10' />
        </BoxTable>
      </>
    )
  }
}

export default EditLog
