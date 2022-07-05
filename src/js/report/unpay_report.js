import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import {
  Sheet,
  SheetColumn,
  Pagination,
  DateRangePicker,
  Form,
  FormButton,
  FormItem,
  Button,
} from '@gmfe/react'
import { QuickPanel, QuickFilter } from '@gmfe/react-deprecated'
import actions from '../actions'
import Big from 'big.js'
import './actions'
import './reducer'

class DaterangepickerWrap extends React.Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }

  render() {
    const filter = this.props.report.unpay_filter
    return (
      <DateRangePicker
        begin={filter.begin}
        end={filter.end}
        onChange={this.handleChange}
      />
    )
  }

  handleChange(begin, end) {
    actions.report_unpay_filter({ begin: begin, end: end })
  }
}

class UnpayReport extends React.Component {
  constructor(props) {
    super(props)
    this.handleSearchBtn = this.handleSearchBtn.bind(this)
    this.handleExportData = this.handleExportData.bind(this)
    this.handlePage = this.handlePage.bind(this)
  }

  componentDidMount() {
    actions.report_unpay_data({
      begin: moment(this.props.report.unpay_search_filter.begin).format(
        'YYYY-MM-DD'
      ),
      end: moment(this.props.report.unpay_search_filter.end).format(
        'YYYY-MM-DD'
      ),
    })
  }

  render() {
    const dataList = this.props.report.unpay_data.dataList.map((d) => {
      return {
        id: d.id || '--',
        name: d.name || '--',
        company_name: d.company_name || '--',
        cur_unpay: Big(d.cur_unpay || 0)
          .div(100)
          .toFixed(2),
        cur_pay: Big(d.cur_pay || 0)
          .div(100)
          .toFixed(2),
        early_unpay: Big(d.early_unpay || 0)
          .div(100)
          .toFixed(2),
        unpay: Big(d.cur_unpay).plus(d.early_unpay).div(100).toFixed(2),
      }
    })

    const pagination = this.props.report.unpay_data.pagination

    return (
      <div>
        <QuickFilter>
          <Form inline onSubmit={this.handleSearchBtn}>
            <FormItem label={i18next.t('入库时间')}>
              <DaterangepickerWrap {...this.props} />
            </FormItem>
            <FormButton>
              <Button type='primary' htmlType='submit'>
                {i18next.t('搜索')}
              </Button>
              <div className='gm-gap-10' />
              <Button title={i18next.t('导出')} onClick={this.handleExportData}>
                {i18next.t('导出')}
              </Button>
            </FormButton>
          </Form>
        </QuickFilter>
        <QuickPanel icon='bill' title={i18next.t('结款列表')}>
          <Sheet list={dataList}>
            <SheetColumn field='id' name={i18next.t('供应商编号')} />
            <SheetColumn field='name' name={i18next.t('供应商名称')} />
            <SheetColumn
              field='company_name'
              name={i18next.t('供应商公司名')}
            />
            <SheetColumn field='cur_unpay' name={i18next.t('本期未支付')} />
            <SheetColumn field='cur_pay' name={i18next.t('本期已支付')} />
            <SheetColumn field='early_unpay' name={i18next.t('往期未支付')} />
            <SheetColumn field='unpay' name={i18next.t('期末未支付')} />
            <Pagination data={pagination} toPage={this.handlePage} />
          </Sheet>
        </QuickPanel>
      </div>
    )
  }

  handleSearchBtn(e) {
    e.preventDefault()
    const filter = this.props.report.unpay_filter
    actions.report_unpay_data({
      begin: moment(filter.begin).format('YYYY-MM-DD'),
      end: moment(filter.end).format('YYYY-MM-DD'),
    })
    actions.report_unpay_search_filter(filter)
  }

  handleExportData() {
    const filter = this.props.report.unpay_filter
    const paras =
      'begin=' +
      moment(filter.begin).format('YYYY-MM-DD') +
      '&end=' +
      moment(filter.end).format('YYYY-MM-DD')
    window.open('/station/report/settlement?&export=1&' + paras)
  }

  handlePage(page) {
    const filter = this.props.report.unpay_search_filter
    const reqData = Object.assign(page, {
      begin: moment(filter.begin).format('YYYY-MM-DD'),
      end: moment(filter.end).format('YYYY-MM-DD'),
    })
    actions.report_unpay_data(reqData)
  }
}

UnpayReport.propTypes = {
  report: PropTypes.object,
}
export default UnpayReport
