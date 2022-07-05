import React from 'react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import { i18next } from 'gm-i18n'
import { Form, FormItem, FormBlock, Box, Button } from '@gmfe/react'
import DateRangeHOC from '../../../../../common/components/date_range_hoc'

@observer
class Filter extends React.Component {
  handleSearch = () => {
    // apiDoFirstRequest有paginationBox提供
    this.props.filterStore.apiDoFirstRequest()
  }

  handleSelectOpType = (val) => {
    this.props.filterStore.setFilterType(val)
  }

  handleChangeText = (e) => {
    const text = e.target.value
    this.props.filterStore.setFilterSearchText(text)
  }

  handleChangeRangePick = (begin, end) => {
    this.props.filterStore.setFilterOpTime(begin, end)
  }

  handleExport = () => {
    const { filterStore } = this.props
    filterStore.handleExport()
  }

  render() {
    const { search_text, start_time, end_time } = this.props.filterStore.filter
    return (
      <Box hasGap>
        <Form onSubmit={this.handleSearch} inline labelWidth='62px'>
          <FormBlock col={3}>
            <FormItem label={i18next.t('下单日期')}>
              <DateRangeHOC
                begin={start_time}
                end={end_time}
                onChange={this.handleChangeRangePick}
              />
            </FormItem>
            <FormItem label={i18next.t('搜索')}>
              <input
                type='text'
                placeholder={i18next.t('输入组合商品名搜索')}
                value={search_text}
                onChange={this.handleChangeText}
              />
            </FormItem>
            <Button type='primary' htmlType='submit'>
              {i18next.t('搜索')}
            </Button>
            <Button className='gm-margin-left-10' onClick={this.handleExport}>
              {i18next.t('导出')}
            </Button>
          </FormBlock>
        </Form>
      </Box>
    )
  }
}

Filter.propTypes = {
  filterStore: PropTypes.object,
}

export default Filter
