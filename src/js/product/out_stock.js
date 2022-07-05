import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  DateRangePicker,
  Pagination,
  PaginationText,
  RightSideModal,
  Form,
  FormItem,
  FormButton,
  FormBlock,
  Select,
  Option,
  Modal,
  Flex,
  Price,
  Button,
} from '@gmfe/react'
import { QuickPanel, QuickFilter } from '@gmfe/react-deprecated'
import moment from 'moment'
import _ from 'lodash'

import './actions'
import './reducer'
import actions from '../actions'
import { cycleDateRangePickerInputValue } from '../common/filter'
import { calculateCycleTime, urlToParams } from '../common/util'
import TaskList from '../task/task_list'
import OutStockConfim from './components/out_stock_confim'
import globalStore from '../stores/global'
import { Table } from '@gmfe/table'

import CycleDateRangePicker from '../common/components/cycle_date_range_picker'
class OutStock extends React.Component {
  column = [
    {
      Header: i18next.t('出库日期'),
      accessor: 'out_stock_time',
      Cell: ({ original: { out_stock_time } }) =>
        out_stock_time === '-'
          ? out_stock_time
          : moment(out_stock_time).format('YYYY-MM-DD'),
    },
    { Header: i18next.t('下单号'), accessor: 'id' },
    { Header: i18next.t('商户信息'), accessor: 'out_stock_target' },
    {
      Header: i18next.t('成本金额'),
      accessor: 'money',
      Cell: ({ original: { money } }) =>
        money === '-' ? money : money + Price.getUnit(),
    },
    {
      Header: i18next.t('单据状态'),
      accessor: 'status',
      Cell: ({ original: { status } }) => {
        const { outStockStatusMap } = this.props.product
        return outStockStatusMap[status]
      },
    },
    {
      Header: () => (
        <i className='xfont xfont-fun' style={{ color: 'rgb(19,193,159' }} />
      ),
      accessor: 'default',
      Cell: ({ original: { id } }) => (
        <Link
          to={`/sales_invoicing/stock_out/product/detail/${id}`}
          target='_blank'
        >
          <i className='xfont xfont-detail' />
        </Link>
      ),
    },
  ]

  constructor(props) {
    super(props)
    this.handleCreate = ::this.handleCreate
    this.handleDateChange = ::this.handleDateChange
    this.handlePageChange = ::this.handlePageChange
    this.handleSearch = ::this.handleSearch
    this.handleExport = ::this.handleExport
    this.handleBtach = ::this.handleBtach
    this.renderDateFilter = ::this.renderDateFilter
    this.renderDateRangePickerInputValue =
      ::this.renderDateRangePickerInputValue
  }

  componentWillMount() {
    // 从其他页面进入，清理数据
    this.handleChangeDateType(this.props.product.outStock.filter.type)
    if (this.props.location.action === 'REPLACE') {
      actions.product_out_stock_clear()
    }
  }

  // componentWillMount中清理数据过后需要setTimeout才能拿到新的props
  componentDidMount() {
    const { list } = this.props.product.outStock
    setTimeout(async () => {
      // 返回的时候不搜索数据
      if (
        this.props.location.action !== 'POP' ||
        (this.props.location.action === 'POP' && !list.length)
      ) {
        // 按运营时间搜索 需要先拿到 timelist
        await actions.product_out_stock_get_service_time()
        const reqData = this.getDataList()
        actions.product_out_stock_list(reqData).then(() => {
          actions.product_out_stock_filter_change('pagination', {
            offset: 0,
            limit: 10,
          })
        })
      }
    }, 0)
  }

  handleDateChange(begin, end) {
    actions.product_out_stock_filter_change('begin', begin)
    actions.product_out_stock_filter_change('end', end)
  }

  handleFilterChange(e) {
    const { name, value } = e.target
    actions.product_out_stock_filter_change(name, value)
  }

  handleChangeDateType(type) {
    switch (type) {
      case 1:
        this.column.splice(0, 1, {
          Header: i18next.t('出库日期'),
          accessor: 'out_stock_time',
          Cell: ({ original: { out_stock_time } }) =>
            out_stock_time === '-'
              ? out_stock_time
              : moment(out_stock_time).format('YYYY-MM-DD'),
        })
        break
      case 4:
        this.column.splice(0, 1, {
          Header: i18next.t('收货时间'),
          accessor: 'receive_begin_time',
          Cell: ({ original: { receive_begin_time } }) =>
            receive_begin_time === '-'
              ? receive_begin_time
              : moment(receive_begin_time).format('YYYY-MM-DD'),
        })
        break
      default:
        this.column.splice(0, 1, {
          Header: i18next.t('建单时间'),
          accessor: 'date_time',
          Cell: ({ original: { date_time } }) =>
            date_time === '-'
              ? date_time
              : moment(date_time).format('YYYY-MM-DD'),
        })
    }
  }

  handleFilterSelectChange(name, value) {
    actions.product_out_stock_filter_change(name, value)
  }

  handlePageChange(page) {
    const reqData = this.getDataList()
    reqData.offset = page.offset

    actions.product_out_stock_list(reqData).then(() => {
      actions.product_out_stock_filter_change('pagination', page)
    })
  }

  handleCreate() {
    window.open('#/sales_invoicing/stock_out/product/pre_add')
  }

  handleSearch(event) {
    event.preventDefault()
    const reqData = this.getDataList()
    const { type } = reqData
    this.handleChangeDateType(type)
    actions.product_out_stock_list(reqData).then(() => {
      actions.product_out_stock_filter_change('pagination', {
        offset: 0,
        limit: 10,
      })
    })
  }

  handleExport(event) {
    event.preventDefault()
    const url = urlToParams(this.getDataList())
    window.open('/stock/out_stock_sheet/list?export=1&' + url)
  }

  getDataList() {
    const {
      begin,
      end,
      type,
      search_text,
      status,
      time_config_id,
    } = this.props.product.outStock.filter
    const start_date = moment(begin).format('YYYY-MM-DD')
    const end_date = moment(end).format('YYYY-MM-DD')
    const service_time = _.find(
      this.props.product.serviceTime,
      (s) => s._id === time_config_id
    )

    const reqData = {
      type: type,
      status,
      search_text,
      offset: 0,
      limit: 10,
    }

    if (type + '' === '1' || type + '' === '2' || type + '' === '4') {
      reqData.start = start_date
      reqData.end = end_date
    } else {
      reqData.time_config_id = time_config_id
      reqData.cycle_start_time = calculateCycleTime(
        start_date,
        service_time
      ).begin
      reqData.cycle_end_time = calculateCycleTime(end_date, service_time).end
    }

    return reqData
  }

  handleBtach() {
    const reqData = this.getDataList()
    delete reqData.limit
    delete reqData.offset
    actions.product_out_stock_batch_confirm({ ...reqData }).then((json) => {
      if (json.data && json.data.length) {
        Modal.render({
          children: (
            <Flex column>
              <OutStockConfim list={json.data} />
              <Flex justifyEnd className='gm-margin-top-5'>
                <Button className='gm-margin-right-5' onClick={Modal.hide}>
                  {i18next.t('取消操作')}
                </Button>
                <Button
                  type='primary'
                  onClick={() => {
                    this.handleSubmitAndClose(reqData)
                  }}
                >
                  {i18next.t('继续出库')}
                </Button>
              </Flex>
            </Flex>
          ),
          title: i18next.t('提醒'),
          style: { width: '500px' },
          onHide: Modal.hide,
        })
      } else {
        this.handleSubmit(reqData)
      }
    })
  }

  handleSubmitAndClose(reqData) {
    Modal.hide()
    this.handleSubmit(reqData)
  }

  handleSubmit(reqData) {
    actions.product_out_stock_confirm_batch(reqData).then(() => {
      RightSideModal.render({
        children: <TaskList tabKey={1} />,
        onHide: RightSideModal.hide,
        opacityMask: true,
        style: {
          width: '300px',
        },
      })
    })
  }

  renderDateFilter() {
    const { outStock, serviceTime } = this.props.product
    const { filter } = outStock
    const { begin, end, time_config_id } = filter

    return (
      <div className='gm-inline-block gm-margin-right-5'>
        <div className='gm-inline-block gm-margin-right-5'>
          <Select
            name='time_config_id'
            value={time_config_id}
            onChange={this.handleFilterSelectChange.bind(
              this,
              'time_config_id'
            )}
            style={{ width: '120px' }}
          >
            {_.map(serviceTime, (s) => (
              <Option key={s._id} value={s._id}>
                {s.name}
              </Option>
            ))}
          </Select>
        </div>
        <CycleDateRangePicker
          begin={begin}
          end={end}
          beginLabel={i18next.t('起始周期')}
          endLabel={i18next.t('截止周期')}
          onChange={this.handleDateChange}
          renderBeginDate={this.renderDateRangePickerInputValue}
          renderEndDate={this.renderDateRangePickerInputValue}
          endProps={{
            disabledDate: (date) =>
              moment(begin).add(1, 'M').isBefore(date) ||
              moment(begin).isAfter(date),
          }}
        />
      </div>
    )
  }

  renderDateRangePickerInputValue(date) {
    const { outStock, serviceTime } = this.props.product
    const { filter } = outStock
    const { time_config_id } = filter
    const time = _.find(serviceTime, (v) => v._id === time_config_id)

    return cycleDateRangePickerInputValue(date, time)
  }

  render() {
    const {
      outStockStatusMap,
      outStock,
      outStockTimeTypeMap,
    } = this.props.product
    const { filter, in_query, in_query_search_text, loading } = outStock
    const { type, begin, end, search_text, status } = filter
    const can_edit_outstock_batch = globalStore.hasPermission(
      'edit_outstock_batch'
    )
    const can_add_out_stock = globalStore.hasPermission('add_out_stock')

    return (
      <div>
        <QuickFilter>
          <Form horizontal onSubmit={this.handleSearch}>
            <FormBlock inline>
              <FormItem label=''>
                <Select
                  clean
                  name='type'
                  value={type}
                  onChange={(event) =>
                    this.handleFilterSelectChange('type', event)
                  }
                  className='b-filter-select-clean-time'
                >
                  {_.map(outStockTimeTypeMap, (value, key) => (
                    <Option value={_.toNumber(key)} key={key}>
                      {value}
                    </Option>
                  ))}
                </Select>
                {type + '' === '3' ? (
                  this.renderDateFilter()
                ) : (
                  <DateRangePicker
                    begin={begin}
                    end={end}
                    onChange={this.handleDateChange}
                  />
                )}
              </FormItem>

              <FormItem label={i18next.t('出库单筛选')}>
                <Select
                  name='status'
                  value={status}
                  onChange={this.handleFilterSelectChange.bind(this, 'status')}
                  style={{ width: '120px' }}
                >
                  <Option value={0}>{i18next.t('全部单据状态')}</Option>
                  {_.map(outStockStatusMap, (status, key) => (
                    <Option value={_.toNumber(key)} key={key}>
                      {status}
                    </Option>
                  ))}
                </Select>
              </FormItem>
              <FormItem label={i18next.t('搜索')}>
                <input
                  name='search_text'
                  value={search_text}
                  onChange={this.handleFilterChange}
                  type='text'
                  className='form-control'
                  placeholder={i18next.t('请输入单号，商户名')}
                  style={{ width: '200px' }}
                />
              </FormItem>
              <FormButton>
                <Button type='primary' htmlType='submit'>
                  {i18next.t('搜索')}
                </Button>
                <div className='gm-gap-10' />
                <Button onClick={this.handleExport}>{i18next.t('导出')}</Button>
              </FormButton>
            </FormBlock>
          </Form>
        </QuickFilter>

        {in_query ? (
          <div className='gm-padding-10' style={{ color: '#cf4848' }}>
            {in_query_search_text}
            {i18next.t('不在筛选条件中，已在全部出库单中为您找到')}
          </div>
        ) : (
          <div className='gm-padding-top-15' />
        )}

        <QuickPanel
          icon='bill'
          title={i18next.t('出库列表')}
          right={
            !globalStore.otherInfo.cleanFood && (
              <div>
                {can_edit_outstock_batch ? (
                  <Button type='primary' plain onClick={this.handleBtach}>
                    {i18next.t('批量出库')}
                  </Button>
                ) : null}
                <div className='gm-gap-10' />
                {can_add_out_stock ? (
                  <Button type='primary' onClick={this.handleCreate}>
                    {i18next.t('新建出库单')}
                  </Button>
                ) : null}
              </div>
            )
          }
        >
          <Table
            data={outStock.list}
            columns={this.column}
            loading={loading}
            className='gm-margin-bottom-10'
          />
          <Flex justifyCenter alignCenter>
            <PaginationText data={filter.pagination} />
            <div className='gm-gap-10' />
            <Pagination
              data={filter.pagination}
              toPage={this.handlePageChange}
              nextDisabled={outStock.list && outStock.list.length < 10}
            />
          </Flex>
        </QuickPanel>
      </div>
    )
  }
}

OutStock.propTypes = {
  location: PropTypes.object,
  product: PropTypes.object,
}

export default connect((state) => ({
  product: state.product,
}))(OutStock)
