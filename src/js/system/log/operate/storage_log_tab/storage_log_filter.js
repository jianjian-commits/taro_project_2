import { i18next, t } from 'gm-i18n'
import React from 'react'
import { Box, Form, FormItem, Select, FormBlock, Button } from '@gmfe/react'
import DateRangeHOC from '../../../../common/components/date_range_hoc'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'

// 采购任务 操作类型
const purchaseOpType = [
  { value: 0, text: t('全部') },
  { value: 1, text: t('新建') },
  { value: 2, text: t('编辑') },
  { value: 17, text: t('入库调整') },
  // { value: 9, text: t('生成单据') },
]

@observer
class StorageLogFilter extends React.Component {
  handleSearch = () => {
    // doFirstRequest有paginationBox提供
    this.props.StorageLogStore.doFirstRequest()
  }

  handleSelectOpType = (val) => {
    this.props.StorageLogStore.setFilterType(val)
  }

  handleChangeText = (e) => {
    const text = e.target.value
    this.props.StorageLogStore.setFilterSearchText(text)
  }

  handleChangeRangePick = (begin, end) => {
    this.props.StorageLogStore.setFilterOpTime(begin, end)
  }

  handleExport = () => {
    const { StorageLogStore } = this.props
    StorageLogStore.exportLog()
  }

  render() {
    const {
      search_text,
      op_type,
      begin_time,
      end_time,
    } = this.props.StorageLogStore.filter

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
                data={purchaseOpType}
                onChange={this.handleSelectOpType}
                value={op_type}
              />
            </FormItem>
            <FormItem label={i18next.t('搜索')}>
              <input
                type='text'
                className='form-control'
                placeholder={i18next.t('请输入操作人')}
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

StorageLogFilter.propTypes = {
  StorageLogStore: PropTypes.object,
}

export default StorageLogFilter
