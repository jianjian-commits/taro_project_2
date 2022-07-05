import { t } from 'gm-i18n'
import React from 'react'
import {
  Price,
  Tip,
  RightSideModal,
  FormItem,
  Select,
  DateRangePicker,
  FormButton,
  Button,
  Uploader,
  Flex,
  Input,
  BoxTable,
  DatePicker,
  BoxForm,
  FormBlock,
} from '@gmfe/react'
import { ManagePagination } from '@gmfe/business'
import moment from 'moment'
import Big from 'big.js'
import './actions'
import './reducer'
import actions from '../../actions'
import TableTotalText from 'common/components/table_total_text'
import { urlToParams, idConvert2Show } from '../../common/util'
import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'
import _ from 'lodash'
import TaskList from '../../task/task_list'
import globalStore from '../../stores/global'
import { cycleDateRangePickerInputValue } from '../../common/filter'
import { Table } from '@gmfe/table'
import CategorySelect from '../../common/components/category_filter_hoc'
import PropTypes from 'prop-types'
const { More } = BoxForm

class OutStockRecording extends React.Component {
  timeType = {
    1: t('按出库日期'),
    2: t('按建单日期'),
    3: t('按运营周期'),
    4: t('按收货日期'),
  }

  columns = [
    { Header: t('商品ID'), accessor: 'spu_id' },
    { Header: t('出库规格ID'), accessor: 'sku_id' },
    { Header: t('出库规格名'), accessor: 'name' },
    { Header: t('商品分类'), accessor: 'category_name_2' },
    { Header: t('出库单号'), accessor: 'order_id' },
    {
      Header: () => (
        <div>
          {t('商户名')}
          <br />
          {t('(商户ID)')}
        </div>
      ),
      accessor: 'default',
      width: 150,
      Cell: ({ original: { address_name, address_id } }) =>
        address_id && address_name
          ? `${address_name}（${idConvert2Show(address_id, 'S')}）`
          : '-',
    },
    {
      Header: () => (
        <div>
          {t('出库数')}
          <br />
          {t('(基本单位)')}
        </div>
      ),
      accessor: 'default',
      Cell: ({ original: { out_stock_base, std_unit_name } }) =>
        `${parseFloat(Big(out_stock_base).toFixed(2))}${std_unit_name}`,
    },
    {
      Header: () => (
        <div>
          {t('出库数')}
          <br />
          {t('(销售单位)')}
        </div>
      ),
      accessor: 'default',
      Cell: ({ original: { out_stock_sale, sale_unit_name } }) =>
        `${parseFloat(Big(out_stock_sale).toFixed(2))}${sale_unit_name}`,
    },
    {
      Header: t('出库成本价'),
      accessor: 'price',
      Cell: ({ original: { price, std_unit_name } }) =>
        `${parseFloat(
          Big(price).div(100).toFixed(2),
        )}${Price.getUnit()}/${std_unit_name}`,
    },
    {
      Header: t('货值'),
      accessor: 'money',
      Cell: ({ original: { price, out_stock_base } }) =>
        `${parseFloat(
          Big(price || 0)
            .times(out_stock_base || 0)
            .div(100)
            .toFixed(2),
        )}${Price.getUnit()}`,
    },
    {
      Header: t('出库时间'),
      accessor: 'create_time',
      Cell: ({ original: { create_time } }) =>
        moment(create_time).format('YYYY-MM-DD'),
    },
    { Header: t('操作人'), accessor: 'operator' },
  ]

  constructor(props) {
    super(props)
    const now = new Date()

    this.state = {
      pagination: {
        offset: 0,
        limit: 10,
      },
      filter: {
        begin: moment(now).format('YYYY-MM-DD'),
        end: moment(now).format('YYYY-MM-DD'),
      },
    }

    this.outStockRecordingRef = React.createRef()
  }

  componentDidMount() {
    this.renderTimeColumn(this.props.inventory.searchOption.time_type)
    actions.product_inventory_get_service_time()

    this.outStockRecordingRef.current.apiDoFirstRequest()
  }

  handleSearch = () => {
    const option = this.getSearchOption()
    const { time_type } = option
    this.renderTimeColumn(time_type)

    this.outStockRecordingRef.current.apiDoFirstRequest()
  }

  handleExport = () => {
    const option = this.getSearchOption()
    window.open(`/stock/out_stock_sku?export=1&${urlToParams(option)}`)
  }

  getSearchOption = () => {
    const { searchOption } = this.props.inventory
    const option = {}
    _.forEach(searchOption, (value, key) => {
      if (value) {
        switch (key) {
          case 'begin':
            option[key] = moment(value).format('YYYY-MM-DD')
            break
          case 'end':
            option[key] = moment(value).format('YYYY-MM-DD')
            break
          case 'category1_ids':
            if (value.length) {
              option.category_id_1 = JSON.stringify(value.map((i) => i.value))
            }
            break
          case 'category2_ids':
            if (value.length) {
              option.category_id_2 = JSON.stringify(value.map((i) => i.value))
            }
            break
          case 'text':
            option.text = _.trim(value)
            break
          default:
            option[key] = value
        }
      }
    })

    if (option.time_type === '3') {
      option.status = 3
    } else {
      delete option.status
      delete option.time_config_id
    }

    return option
  }

  handlePageChange = (pagination) => {
    const option = this.getSearchOption()
    return actions
      .product_inventory_out_stock_list({ ...option, ...pagination })
      .then((json) => {
        this.setState({ pagination: json.pagination })
        return json
      })
  }

  handleBatchData = (files) => {
    this.setState({ file: null })
    requireGmXlsx((res) => {
      const { sheetToJson } = res
      sheetToJson(files[0]).then((json) => {
        const sheetData = _.values(json[0])[0]
        sheetData.shift()

        if (sheetData.length === 0) {
          Tip.warning(t('没有可导入数据，请确认表格数据有效'))
          return
        }
        const arr = _.map(sheetData, (v) => {
          return {
            sheet_id: v[0],
            sku_id: v[1],
            price: v[3],
          }
        })
        actions.product_inventory_update_out_stock_price(arr).then(() => {
          RightSideModal.render({
            children: <TaskList />,
            noCloseBtn: true,
            onHide: RightSideModal.hide,
            opacityMask: true,
            style: {
              width: '300px',
            },
          })
        })
      })
    })
  }

  handleFilterSelectChange = (value, name) => {
    actions.out_stock_filter_change(value, name)
  }

  handleDateChange = (begin, end) => {
    actions.out_stock_filter_change(begin, 'begin')
    actions.out_stock_filter_change(end, 'end')
  }

  renderDatePicker = () => {
    const { searchOption, serviceTimes } = this.props.inventory
    const { time_config_id, begin, end } = searchOption
    return (
      <Flex>
        <Select
          value={time_config_id}
          onChange={(event) =>
            this.handleFilterSelectChange(event, 'time_config_id')
          }
          className='gm-margin-left-10'
          style={{ width: '120px' }}
          data={_.map(serviceTimes, (item) => ({
            value: item._id,
            text: item.name,
          }))}
        />
        <Flex alignCenter>
          <span className='gm-padding-lr-10'>{t('起始周期')}</span>
          <DatePicker
            style={{ minWidth: '260px' }}
            date={begin}
            onChange={(event) => this.handleFilterSelectChange(event, 'begin')}
            renderDate={this.renderDateRangePickerInputValue}
          />
          <span className='gm-padding-lr-10'>{t('截止周期')}</span>
          <DatePicker
            style={{ minWidth: '260px' }}
            onChange={(event) => this.handleFilterSelectChange(event, 'end')}
            date={end}
            renderDate={this.renderDateRangePickerInputValue}
          />
        </Flex>
      </Flex>
    )
  }

  renderDateRangePickerInputValue = (date) => {
    const { searchOption, serviceTimes } = this.props.inventory
    const { time_config_id } = searchOption
    const time = _.find(serviceTimes, (v) => v._id === time_config_id)
    return cycleDateRangePickerInputValue(date, time)
  }

  renderTimeColumn = (type) => {
    switch (type) {
      case '1':
        this.columns.splice(10, 1, {
          Header: t('出库日期'),
          accessor: 'create_time',
          Cell: ({ original: { create_time } }) =>
            create_time === '-'
              ? create_time
              : moment(create_time).format('YYYY-MM-DD'),
        })
        break
      case '4':
        this.columns.splice(10, 1, {
          Header: t('收货日期'),
          accessor: 'receive_begin_time',
          Cell: ({ original: { receive_begin_time } }) =>
            receive_begin_time === '-'
              ? receive_begin_time
              : moment(receive_begin_time).format('YYYY-MM-DD'),
        })
        break
      default:
        this.columns.splice(10, 1, {
          Header: t('建单日期'),
          accessor: 'date_time',
          Cell: ({ original: { date_time } }) =>
            date_time === '-'
              ? date_time
              : moment(date_time).format('YYYY-MM-DD'),
        })
    }
  }

  handleChangeLevel = (event) => {
    _.forIn(event, (value, key) => actions.out_stock_filter_change(value, key))
  }

  render() {
    const { inventoryOutStockList, searchOption } = this.props.inventory
    const { time_type, begin, end, text } = searchOption
    const { list, loading } = inventoryOutStockList
    const { pagination } = this.state
    const canPriceRepair = globalStore.hasPermission(
      'import_out_stock_log_price_repair',
    )

    return (
      <div>
        <BoxForm
          onSubmit={this.handleSearch}
          labelWidth='92px'
          colWidth='360px'
          btnPosition='left'
        >
          <FormBlock col={3}>
            <FormItem col={time_type === '3' ? 3 : 1}>
              <Flex>
                <Select
                  clean
                  onChange={(event) =>
                    this.handleFilterSelectChange(event, 'time_type')
                  }
                  data={_.map(this.timeType, (value, key) => ({
                    value: key,
                    text: value,
                  }))}
                  value={time_type}
                />
                <Flex none flex column>
                  {time_type === '3' ? (
                    this.renderDatePicker()
                  ) : (
                    <DateRangePicker
                      begin={begin}
                      end={end}
                      onChange={this.handleDateChange}
                    />
                  )}
                </Flex>
              </Flex>
            </FormItem>
            <FormItem label={t('搜索')}>
              <Input
                className='form-control'
                placeholder={t('输入商品名或ID')}
                value={text}
                onChange={(event) =>
                  this.handleFilterSelectChange(event.target.value, 'text')
                }
              />
            </FormItem>
          </FormBlock>
          <More>
            <FormBlock col={3}>
              <FormItem label={t('商品筛选')}>
                <CategorySelect
                  disablePinLei
                  selected={searchOption}
                  onChange={this.handleChangeLevel}
                />
              </FormItem>
            </FormBlock>
          </More>
          <FormButton>
            <Button type='primary' htmlType='submit'>
              {t('搜索')}
            </Button>
            <div className='gm-gap-10' />
            <Button onClick={this.handleExport}>{t('导出')}</Button>
          </FormButton>
        </BoxForm>
        <ManagePagination
          id='out_stock_recording_managepagination'
          ref={this.outStockRecordingRef}
          onRequest={this.handlePageChange}
        >
          <BoxTable
            info={
              <TableTotalText
                data={[
                  {
                    label: t('商品总数'),
                    content: pagination.count || 0,
                  },
                ]}
              />
            }
            action={
              canPriceRepair && (
                <Uploader
                  onUpload={this.handleBatchData}
                  accept='.xlsx'
                  className='gm-dropper-wrap'
                >
                  <Button type='primary'>{t('修复出库数据')}</Button>
                </Uploader>
              )
            }
          >
            <Table data={list} columns={this.columns} loading={loading} />
          </BoxTable>
        </ManagePagination>
      </div>
    )
  }
}

OutStockRecording.propTypes = {
  inventory: PropTypes.object.isRequired,
}

export default OutStockRecording
