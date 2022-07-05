import { i18next } from 'gm-i18n'
import React from 'react'
import {
  DateRangePicker,
  Form,
  FormItem,
  FormButton,
  RightSideModal,
  Box,
  Button,
} from '@gmfe/react'
import store from './store'
import { Request } from '@gm-common/request'
import { observer } from 'mobx-react'
import TaskList from '../../../task/task_list'

@observer
class SearchFilter extends React.Component {
  handleDateChange = (begin, end) => {
    store.setFilterDate(begin, end)
  }

  handleChangeValue = (e) => {
    store.setFilter('q', e.target.value)
  }

  handleSearch = () => {
    store.pagination && store.pagination.doFirstRequest()
  }

  handleExport = () => {
    Request('/stock/spu_adjust_logs/list')
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
    const { begin_time, end_time, q } = store.filter
    return (
      <Box hasGap>
        <Form inline onSubmit={this.handleSearch} disabledCol>
          <FormItem label={i18next.t('调整日期')}>
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
              placeholder={i18next.t('输入商品名称、单号')}
              value={q}
              onChange={this.handleChangeValue}
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

export default SearchFilter
