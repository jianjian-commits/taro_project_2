import { i18next } from 'gm-i18n'
import React from 'react'
import {
  DateRangePicker,
  Form,
  FormItem,
  FormButton,
  Select,
  Option,
  RightSideModal,
  Button,
  Box,
} from '@gmfe/react'
import store from './store'
import { Request } from '@gm-common/request'
import { observer } from 'mobx-react'
import TaskList from '../../task/task_list'

@observer
class SearchFilter extends React.Component {
  handleDateChange = (begin, end) => {
    store.setFilterDate(begin, end)
  }

  handleChangeStatus = (value) => {
    store.setFilter('status', value)
  }

  handleChangeValue = (e) => {
    store.setFilter('q', e.target.value)
  }

  handleSearch = () => {
    store.pagination && store.pagination.doFirstRequest()
  }

  handleExport = () => {
    Request('/stock/in_stock_adjust_sheet/list')
      .data({ ...store.getFilterParam, export: 1 })
      .get()
      .then(() => {
        RightSideModal.render({
          children: <TaskList />,
          onHide: RightSideModal.hide,
          style: {
            width: '300px',
          },
        })
      })
  }

  render() {
    const { begin_time, end_time, status, q } = store.filter

    return (
      <Box hasGap>
        <Form inline onSubmit={this.handleSearch}>
          <FormItem label={i18next.t('建单时间')}>
            <DateRangePicker
              begin={begin_time}
              end={end_time}
              onChange={this.handleDateChange}
            />
          </FormItem>
          <FormItem label={i18next.t('搜索')}>
            <input
              type='text'
              className='form-control'
              placeholder={i18next.t('输入单号')}
              value={q}
              onChange={this.handleChangeValue}
            />
          </FormItem>

          <FormItem label={i18next.t('单据状态')}>
            <Select value={status} onChange={this.handleChangeStatus}>
              <Option value={0}>全部</Option>
              <Option value={1}>未生效</Option>
              <Option value={2}>已生效</Option>
              <Option value={-1}>已删除</Option>
            </Select>
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

export default SearchFilter
