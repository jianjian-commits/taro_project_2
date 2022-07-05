import { i18next } from 'gm-i18n'
import React, { Component } from 'react'
import {
  FormItem,
  Box,
  Select,
  FormButton,
  Form,
  DateRangePicker,
  Button,
} from '@gmfe/react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import moment from 'moment'

@observer
class SearchFilter extends Component {
  handleSearch = () => {
    this.props.store.handleSearch()
  }

  handleExport = () => {
    this.props.store.handleExport()
  }

  handleReset = () => {
    this.props.store.handleReset()
  }

  disabledDate = (d, { begin, end }) => {
    const {
      filter: { start_date },
    } = this.props.store

    if (+moment(start_date) === +moment(begin)) {
      return false
    } else {
      if (
        +moment(d) <= +moment(begin).add(1, 'month') &&
        +moment(d) >= +moment(begin).subtract(1, 'month')
      ) {
        return false
      }
      return true
    }
  }

  render() {
    const {
      filter: { start_date, end_date, q, status },
      statusList,
      dateLabel,
      handleFilterChange,
    } = this.props.store
    return (
      <Box hasGap>
        <Form inline onSubmit={this.handleSearch}>
          <FormItem label={dateLabel}>
            <DateRangePicker
              begin={start_date}
              end={end_date}
              disabledDate={this.disabledDate}
              onChange={(begin, end) => {
                handleFilterChange('start_date', begin)
                handleFilterChange('end_date', end)
              }}
            />
          </FormItem>
          <FormItem label={i18next.t('搜索')}>
            <input
              value={q}
              onChange={(e) => {
                handleFilterChange('q', e.target.value)
              }}
              className='form-control'
              placeholder={i18next.t('输入商户名/商户ID/周转物名称搜索')}
            />
          </FormItem>

          <FormItem label={i18next.t('状态')}>
            <Select
              value={status}
              onChange={handleFilterChange.bind(this, 'status')}
              data={statusList}
            />
          </FormItem>

          <FormButton>
            <Button type='primary' htmlType='submit'>
              {i18next.t('搜索')}
            </Button>
            <div className='gm-gap-10' />
            <Button onClick={this.handleExport}>{i18next.t('导出')}</Button>
          </FormButton>
        </Form>
      </Box>
    )
  }
}
SearchFilter.propTypes = {
  store: PropTypes.object,
}

export default SearchFilter
