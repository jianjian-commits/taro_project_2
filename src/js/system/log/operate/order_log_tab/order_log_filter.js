import { i18next, t } from 'gm-i18n'
import React from 'react'
import { Form, FormItem, FormBlock, Button, Select, Box } from '@gmfe/react'
import DateRangeHOC from '../../../../common/components/date_range_hoc'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import moment from 'moment'

const orderOpType = [
  { text: t('全部'), value: 0 },
  { text: t('新增'), value: 1 },
  { text: t('编辑'), value: 2 },
  { text: t('删除'), value: 3 },
]

const orderFromType = [
  { text: t('全部'), value: 0 },
  { text: t('订单编辑'), value: 1 },
  { text: t('分拣'), value: 2 },
]

// 刷选条件后面可能会不一样,所以写了两份,没有抽离出来
@observer
class OrderLogFilter extends React.Component {
  handleSearch = () => {
    // doFirstRequest有paginationBox提供
    this.props.orderLogStore.doFirstRequest()
  }

  handleSelectOpType = (val) => {
    this.props.orderLogStore.setFilterType(val)
  }

  handleSelectOpSource = (val) => {
    this.props.orderLogStore.setFilterSource(val)
  }

  handleChangeText = (e) => {
    const text = e.target.value
    this.props.orderLogStore.setFilterSearchText(text)
  }

  handleChangeRangePick = (begin, end) => {
    this.props.orderLogStore.setFilterOpTime(begin, end)
  }

  handleExport = () => {
    const { orderLogStore } = this.props
    orderLogStore.exportLog()
  }

  render() {
    const {
      search_text,
      op_type,
      begin_time,
      end_time,
      order_op_source,
    } = this.props.orderLogStore.filter

    return (
      <Box hasGap>
        <Form onSubmit={this.handleSearch} inline labelWidth='62px'>
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
                data={orderOpType}
                onChange={this.handleSelectOpType}
                value={op_type}
              />
            </FormItem>
            <FormItem label={i18next.t('操作来源')}>
              <Select
                data={orderFromType}
                onChange={this.handleSelectOpSource}
                value={order_op_source}
              />
            </FormItem>
            <FormItem label={i18next.t('搜索')}>
              <input
                type='text'
                placeholder={i18next.t('订单号、商户名、分拣序号、操作人')}
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

OrderLogFilter.propTypes = {
  orderLogStore: PropTypes.object,
}

export default OrderLogFilter
