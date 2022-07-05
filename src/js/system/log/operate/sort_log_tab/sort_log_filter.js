import { i18next, t } from 'gm-i18n'
import React from 'react'
import { Box, Form, FormItem, Select, FormBlock, Button } from '@gmfe/react'
import DateRangeHOC from '../../../../common/components/date_range_hoc'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'

// 分类任务 操作类型
const sortOpType = [
  { value: 0, text: t('全部') },
  { value: 1, text: t('新增') },
  { value: 2, text: t('编辑') },
  { value: 3, text: t('删除') },
]

@observer
class SortLogFilter extends React.Component {
  handleSearch = () => {
    // doFirstRequest有paginationBox提供
    this.props.sortLogStore.doFirstRequest()
  }

  handleSelectOpType = (val) => {
    this.props.sortLogStore.setFilterType(val)
  }

  handleChangeText = (e) => {
    const text = e.target.value
    this.props.sortLogStore.setFilterSearchText(text)
  }

  handleChangeRangePick = (begin, end) => {
    this.props.sortLogStore.setFilterOpTime(begin, end)
  }

  handleExport = () => {
    const { sortLogStore } = this.props
    sortLogStore.exportLog()
  }

  render() {
    const {
      search_text,
      op_type,
      begin_time,
      end_time,
    } = this.props.sortLogStore.filter

    return (
      <Box hasGap>
        <Form onSubmit={this.handleSearch} labelWidth='62px' inline>
          <FormBlock col={4}>
            <FormItem label={i18next.t('操作时间')}>
              <DateRangeHOC
                inputClassName='form-control'
                begin={begin_time}
                end={end_time}
                onChange={this.handleChangeRangePick}
              />
            </FormItem>
            <FormItem label={i18next.t('操作类型')}>
              <Select
                data={sortOpType}
                onChange={this.handleSelectOpType}
                value={op_type}
              />
            </FormItem>
            <FormItem label={i18next.t('搜索')}>
              <input
                type='text'
                className='form-control'
                placeholder={i18next.t('请输入分类名、操作人')}
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

SortLogFilter.propTypes = {
  sortLogStore: PropTypes.object,
}

export default SortLogFilter
