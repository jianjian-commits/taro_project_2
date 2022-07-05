import React from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import {
  Box,
  Form,
  FormItem,
  DateRangePicker,
  FormButton,
  Button,
} from '@gmfe/react'
import { observer } from 'mobx-react'

import CategoryFilter from 'common/components/category_filter_hoc'
import { urlToParams } from 'common/util'
import store from './store'
import moment from 'moment'

@observer
class ReportFilter extends React.Component {
  handleChangeCategoryFilter = (data) => {
    _.unset(data, 'pinlei_ids')
    store.setFilter('categoryFilter', data)
  }

  handleChange = (e) => {
    store.setFilter(e.target.name, e.target.value)
  }

  handleExport = () => {
    const url = urlToParams(store.filterSearchData)
    window.open('/stock/process/report/export?' + url)
  }

  handleSearch = () => {
    store.doFirstRequest()
  }

  // 选择日期 往前/往后一个月可选
  disabledDate = (d, { begin, end }) => {
    const { filter } = store
    const dMin = moment(begin).subtract(1, 'month').startOf('day')
    const dMax = moment(begin).add(1, 'month').startOf('day')
    const day = moment(d).startOf('day')

    // 初始不设置最大值
    if (
      +moment(begin).startOf('day') === +moment(filter.begin).startOf('day')
    ) {
      return !(+day >= +dMin)
    }
    return !(+day >= +dMin && +day <= +dMax)
  }

  render() {
    const { filter } = store

    return (
      <Box hasGap>
        <Form onSubmit={this.handleSearch} colWidth='360px' inline>
          <FormItem label={t('时间')}>
            <DateRangePicker
              style={{ width: '280px' }}
              begin={filter.begin}
              end={filter.end}
              onChange={(begin, end) => {
                store.setFilter('begin', begin)
                store.setFilter('end', end)
              }}
              disabledDate={this.disabledDate}
            />
          </FormItem>
          <FormItem label={t('商品筛选')}>
            <CategoryFilter
              level={2}
              disablePinLei
              selected={filter.categoryFilter}
              onChange={this.handleChangeCategoryFilter}
            />
          </FormItem>
          <FormItem label={t('搜索')} className='gm-margin-left-20'>
            <input
              className='form-control'
              type='text'
              value={filter.q}
              name='q'
              placeholder={t('输入商品名称或ID')}
              onChange={this.handleChange}
            />
          </FormItem>
          <FormButton>
            <Button
              type='primary'
              htmlType='submit'
              className='gm-margin-right-5'
            >
              {t('搜索')}
            </Button>
            <Button onClick={this.handleExport}>{t('导出')}</Button>
          </FormButton>
        </Form>
      </Box>
    )
  }
}

export default ReportFilter
