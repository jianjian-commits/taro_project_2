import { i18next } from 'gm-i18n'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import {
  Flex,
  DateRangePicker,
  FormItem,
  FormButton,
  RightSideModal,
  Button,
  BoxForm,
  FormBlock,
  Input,
} from '@gmfe/react'
import actions from '../actions'
import { getSearchData, dateRangeMax, dateRangeMin } from './util'
import CategoryFilter from '../common/components/category_pinlei_filter'
import TaskList from '../task/task_list'
import moment from 'moment'

const { More } = BoxForm

class ValueReportHeader extends Component {
  constructor(props) {
    super(props)
    this.handleSearchBtn = ::this.handleSearchBtn
    this.handleExportBtn = ::this.handleExportBtn
    this.handleChangeCategoryFilter = ::this.handleChangeCategoryFilter
    this.handleChangeSearchText = ::this.handleChangeSearchText
    this.handleDatePickerChange = ::this.handleDatePickerChange
  }

  handleSearchBtn(event) {
    event.preventDefault()
    this.props.onSearch()
  }

  handleExportBtn(event) {
    event.preventDefault()
    const params = _.omit(getSearchData(this.props), 'view_type')
    actions.value_list_export(params).then(() => {
      RightSideModal.render({
        children: <TaskList />,
        onHide: RightSideModal.hide,
        style: {
          width: '300px',
        },
      })
    })
  }

  componentDidMount() {
    actions.report_sku_categories()
  }

  handleChangeCategoryFilter(selected) {
    actions.report_select_filter(selected)
  }

  handleChangeSearchText(e) {
    actions.report_search_text(e.target.value)
  }

  handleDatePickerChange(begin, end) {
    actions.report_value_filter({ begin: begin, end: end })
  }

  handleReset = (event) => {
    event.preventDefault()
    actions.report_reset()
  }

  disabledDate = (d, { begin, end }) => {
    const { report } = this.props
    const initBegin = moment(report.begin).format('YYYY-MM-DD')

    if (+moment(initBegin) === +moment(begin)) {
      return false
    }

    const dMax = dateRangeMax(begin)
    const dMin = dateRangeMin(begin)
    if (+moment(d) <= dMax && +moment(d) >= +dMin) {
      return false
    }
    return true
  }

  render() {
    const { report } = this.props
    const categories = report.report_sku_categories
    const { begin, end } = report.value_filter

    return (
      <BoxForm
        onSubmit={this.handleSearchBtn}
        labelWidth='70px'
        colWidth='360px'
        btnPosition='left'
      >
        <FormBlock col={3}>
          <FormItem label={i18next.t('选择周期')}>
            <DateRangePicker
              begin={begin}
              end={end}
              onChange={this.handleDatePickerChange}
              disabledDate={this.disabledDate}
            />
          </FormItem>
          <FormItem label={i18next.t('搜索')}>
            <Input
              className='form-control'
              placeholder={i18next.t('输入商品信息搜索')}
              value={report.search_text}
              onChange={this.handleChangeSearchText}
            />
          </FormItem>
        </FormBlock>
        <More>
          <FormBlock col={3}>
            <FormItem label={i18next.t('商品筛选')}>
              <Flex>
                <CategoryFilter
                  level={2}
                  selected={report.select_filter}
                  categories={categories}
                  onChange={this.handleChangeCategoryFilter}
                />
              </Flex>
            </FormItem>
          </FormBlock>
        </More>
        <FormButton>
          <Button type='primary' htmlType='submit'>
            {i18next.t('搜索')}
          </Button>
          <More>
            <div className='gm-gap-10' />
            <Button onClick={this.handleReset}>{i18next.t('重置')}</Button>
          </More>
          <div className='gm-gap-10' />
          <Button onClick={this.handleExportBtn}>{i18next.t('导出')}</Button>
        </FormButton>
      </BoxForm>
    )
  }
}

ValueReportHeader.propTypes = {
  onSearch: PropTypes.func,
  report: PropTypes.object,
}

export default ValueReportHeader
