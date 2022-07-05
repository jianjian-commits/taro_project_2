import React, { Component } from 'react'
import { observer } from 'mobx-react'
import {
  DateRangePicker,
  Box,
  Form,
  FormItem,
  Select,
  FormButton,
  Button,
  RightSideModal
} from '@gmfe/react'
import { t } from 'gm-i18n'
import { CHANGE_TYPE_STATUS } from 'common/enum'

import { store } from '../store'
import TaskList from '../../../../task/task_list'

const changeTypeStatus = [{ value: '', text: t('全部') }, ...CHANGE_TYPE_STATUS]

@observer
class Filter extends Component {
  handleDateChange = (begin, end) => {
    const { mergeFilter } = store
    mergeFilter({ start_time: begin, end_time: end })
  }

  handleSearch = () => {
    store.doFirstRequest()
  }

  handleExport = async () => {
    await store.handleExport()
    RightSideModal.render({
      children: <TaskList />,
      onHide: RightSideModal.hide,
      style: { width: '300px' }
    })
  }

  render() {
    const { filter } = store
    return (
      <>
        <Box hasGap>
          <Form inline onSubmit={this.handleSearch}>
            <FormItem label={t('变动日期')}>
              <DateRangePicker
                begin={filter.start_time}
                end={filter.end_time}
                onChange={this.handleDateChange}
              />
            </FormItem>
            <FormItem label={t('变动类型')}>
              <Select
                value={filter.type || ''}
                onChange={value => store.mergeFilter({ type: value || null })}
                data={changeTypeStatus}
              />
            </FormItem>

            <FormButton>
              <Button type='primary' htmlType='submit'>
                {t('搜索')}
              </Button>
              <div className='gm-gap-10' />
              <Button onClick={this.handleExport}>{t('导出')}</Button>
            </FormButton>
          </Form>
        </Box>
      </>
    )
  }
}

export default Filter
