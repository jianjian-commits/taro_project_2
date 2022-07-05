import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { BoxForm, FormBlock, FormItem, FormButton, Button } from '@gmfe/react'
import PropTypes from 'prop-types'
import Store from '../store'
import moment from 'moment'
import _ from 'lodash'

import CategoryFilter from '../../../common/components/category_filter_hoc'
import DateFilter from '../../../common/components/date_range_filter'

import { PURCHASE_ANALYSIS_TYPE } from '../../../common/enum'

@observer
class FilterHeader extends React.Component {
  handleFilterChange = (key, e) => {
    const value = e && e.target ? e.target.value : e
    Store.setAnalysisFilter({ [key]: value })
  }

  handleDateChange = (begin, end) => {
    if (moment(begin).isAfter(moment(end))) {
      end = begin
    }
    const _date = { begin_time: begin, end_time: end }
    Store.setAnalysisFilter(_date)
  }

  handleSearch = () => {
    this.props.onSearch()
  }

  getDateMax = (dateType) => {
    if (+dateType === 1) {
      return moment().startOf('day')
    }
    return undefined
  }

  handleDateFilterChangeOnce = (value) => {
    if (value.dateType) {
      this.handleFilterChange('dateType', +value.dateType)
    } else if (value.begin && value.end) {
      this.handleDateChange(value.begin, value.end)
    }
  }

  disabledDate = (d) => {
    return !(+moment(d) <= +moment())
  }

  render() {
    const { exportAuthority, placeholder } = this.props
    const {
      begin_time,
      end_time,
      categoryFilter,
      dateType,
      search_text,
    } = Store.analysisFilter

    const limitDates = [this.disabledDate, null]

    return (
      <BoxForm
        labelWidth='100px'
        btnPosition='left'
        onSubmit={this.handleSearch}
      >
        <FormBlock col={3}>
          <DateFilter
            data={{
              dateFilterData: _.map(PURCHASE_ANALYSIS_TYPE, (item) => ({
                type: item.value,
                name: item.name,
              })),
            }}
            filter={{
              begin: begin_time,
              end: end_time,
              dateType: `${dateType}`,
            }}
            onDateFilterChange={this.handleDateFilterChangeOnce}
            limitDates={limitDates}
          />
          <FormItem label={i18next.t('搜索')}>
            <input
              name='search_text'
              value={search_text}
              onChange={this.handleFilterChange.bind(this, 'search_text')}
              className='form-control'
              placeholder={placeholder}
            />
          </FormItem>
        </FormBlock>
        <BoxForm.More>
          <FormBlock col={3}>
            <FormItem col={2} label={i18next.t('商品筛选')}>
              <CategoryFilter
                selected={categoryFilter}
                onChange={this.handleFilterChange.bind(this, 'categoryFilter')}
              />
            </FormItem>
          </FormBlock>
        </BoxForm.More>
        <FormButton>
          <Button
            type='primary'
            htmlType='submit'
            className='gm-margin-right-10'
          >
            {i18next.t('搜索')}
          </Button>

          <BoxForm.More>
            <Button className='gm-margin-right-10' onClick={() => Store.init()}>
              {i18next.t('重置')}
            </Button>
          </BoxForm.More>

          {exportAuthority && (
            <Button onClick={this.props.onHandleExport}>
              {i18next.t('导出')}
            </Button>
          )}
        </FormButton>
      </BoxForm>
    )
  }
}

FilterHeader.propTypes = {
  onSearch: PropTypes.func.isRequired,
  onHandleExport: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  isCollapseRender: PropTypes.bool,
  exportAuthority: PropTypes.bool,
}

FilterHeader.defaultProps = {
  placeholder: i18next.t('输入商品名称进行搜索'),
  isCollapseRender: false,
  exportAuthority: true,
}

export default FilterHeader
