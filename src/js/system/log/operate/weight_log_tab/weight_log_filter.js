import { i18next, t } from 'gm-i18n'
import React from 'react'
import { Box, Form, FormItem, FormBlock, Select, Button } from '@gmfe/react'
import DateRangeHOC from '../../../../common/components/date_range_hoc'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'

const weightOpType = [
  { text: t('全部'), value: 0 },
  { text: t('称重'), value: 4 },
  { text: t('缺货'), value: 5 },
  { text: t('打印'), value: 6 },
  { text: t('标记'), value: 7 },
]

@observer
class WeightLogFilter extends React.Component {
  handleSearch = () => {
    // doFirstRequest有ManagePaginationV2提供
    this.props.weightLogStore.doFirstRequest()
  }

  handleSelectOpType = (val) => {
    this.props.weightLogStore.setFilterType(val)
  }

  handleChangeText = (e) => {
    const text = e.target.value
    this.props.weightLogStore.setFilterSearchText(text)
  }

  handleChangeRangePick = (begin, end) => {
    this.props.weightLogStore.setFilterOpTime(begin, end)
  }

  handleExport = () => {
    const { weightLogStore } = this.props
    weightLogStore.exportLog()
  }

  render() {
    const {
      search_text,
      op_type,
      begin_time,
      end_time,
    } = this.props.weightLogStore.filter

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
                data={weightOpType}
                onChange={this.handleSelectOpType}
                value={op_type}
              />
            </FormItem>
            <FormItem label={i18next.t('搜索')}>
              <input
                type='text'
                placeholder={i18next.t(
                  '商品名和ID、订单ID、商户名、分拣序号、操作人',
                )}
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

WeightLogFilter.propTypes = {
  weightLogStore: PropTypes.object,
}

export default WeightLogFilter
