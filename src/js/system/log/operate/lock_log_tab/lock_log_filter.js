import { i18next, t } from 'gm-i18n'
import React from 'react'
import { FormBlock, Form, FormItem, Select, Box, Button } from '@gmfe/react'
import DateRangeHOC from '../../../../common/components/date_range_hoc'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'

const lockOpType = [
  { text: t('全部'), value: 0 },
  { text: t('新建'), value: 1 },
  { text: t('编辑'), value: 2 },
]

// 刷选条件后面可能会不一样,所以写了两份,没有抽离出来
@observer
class LockLogFilter extends React.Component {
  handleSearch = () => {
    // doFirstRequest有paginationBox提供
    this.props.lockLogStore.doFirstRequest()
  }

  handleSelectOpType = (val) => {
    this.props.lockLogStore.setFilterType(val)
  }

  handleChangeText = (e) => {
    const text = e.target.value
    this.props.lockLogStore.setFilterSearchText(text)
  }

  handleChangeRangePick = (begin, end) => {
    this.props.lockLogStore.setFilterOpTime(begin, end)
  }

  handleExport = () => {
    const { lockLogStore } = this.props
    lockLogStore.exportLog()
  }

  render() {
    const {
      search_text,
      op_type,
      begin_time,
      end_time,
    } = this.props.lockLogStore.filter

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
                data={lockOpType}
                onChange={this.handleSelectOpType}
                value={op_type}
              />
            </FormItem>
            <FormItem label={i18next.t('搜索')}>
              <input
                type='text'
                className='form-control'
                placeholder={i18next.t('输入锁价规则编号、操作人')}
                value={search_text}
                onChange={this.handleChangeText}
              />
            </FormItem>
            <Button type='primary' htmlType='submit'>
              {i18next.t('搜索')}
            </Button>
            <div className='gm-gap-10' />
            <Button onClick={this.handleExport}>{i18next.t('导出')}</Button>
          </FormBlock>
        </Form>
      </Box>
    )
  }
}

LockLogFilter.propTypes = {
  lockLogStore: PropTypes.object,
}

export default LockLogFilter
