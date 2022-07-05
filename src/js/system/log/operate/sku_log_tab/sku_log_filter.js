import { i18next, t } from 'gm-i18n'
import React from 'react'
import { Box, Form, FormItem, FormBlock, Select, Button } from '@gmfe/react'
import DateRangeHOC from '../../../../common/components/date_range_hoc'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'

const skuOpType = [
  { text: t('全部'), value: 0 },
  { text: t('新增'), value: 1 },
  { text: t('编辑'), value: 2 },
  { text: t('删除'), value: 3 },
  { text: t('恢复'), value: 15 },
  { text: t('彻底删除'), value: 16 },
]

// 刷选条件后面可能会不一样,所以写了两份,没有抽离出来
@observer
class SkuLogFilter extends React.Component {
  handleSearch = () => {
    // doFirstRequest有ManagePaginationV2提供
    this.props.skuLogStore.doFirstRequest()
  }

  handleSelectOpType = (val) => {
    this.props.skuLogStore.setFilterType(val)
  }

  handleChangeText = (e) => {
    const text = e.target.value
    this.props.skuLogStore.setFilterSearchText(text)
  }

  handleChangeRangePick = (begin, end) => {
    this.props.skuLogStore.setFilterOpTime(begin, end)
  }

  handleExport = () => {
    const { skuLogStore } = this.props
    skuLogStore.exportLog()
  }

  render() {
    const {
      search_text,
      op_type,
      begin_time,
      end_time,
    } = this.props.skuLogStore.filter

    return (
      <Box hasGap>
        <Form onSubmit={this.handleSearch} labelWidth='62px' inline>
          <FormBlock col={4}>
            <FormItem label={i18next.t('操作时间')}>
              <DateRangeHOC
                begin={begin_time}
                end={end_time}
                onChange={this.handleChangeRangePick}
              />
            </FormItem>
            <FormItem label={i18next.t('操作类型')}>
              <Select
                data={skuOpType}
                onChange={this.handleSelectOpType}
                value={op_type}
              />
            </FormItem>
            <FormItem label={i18next.t('搜索')}>
              <input
                type='text'
                className='form-control'
                placeholder={i18next.t('商品ID、商品名称、操作人')}
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

SkuLogFilter.propTypes = {
  skuLogStore: PropTypes.object,
}

export default SkuLogFilter
