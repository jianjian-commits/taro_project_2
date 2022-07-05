import React, { Component } from 'react'
import { observer } from 'mobx-react'
import {
  Box,
  Form,
  FormItem,
  FormButton,
  DateRangePicker,
  Select,
  Input,
  Button,
  RightSideModal,
} from '@gmfe/react'
import { t } from 'gm-i18n'

import store from '../store'
import { auditStatusEnum } from 'common/enum'
import TaskList from '../../../../task/task_list'

@observer
class Filter extends Component {
  handleChange = (value, key) => {
    const { mergeFilter } = store
    mergeFilter({ [key]: value })
  }

  handleSearch = () => {
    const { pagination } = store
    pagination.current.apiDoFirstRequest()
  }

  handleExport = () => {
    const { handleExport } = store
    handleExport().then(() => {
      RightSideModal.render({
        children: <TaskList />,
        style: {
          width: '300px',
        },
        onHide: RightSideModal.hide,
      })
    })
  }

  render() {
    const { filter } = store
    const { begin, end, auditStatus, text } = filter
    const auditStatusList = []
    auditStatusEnum.forEach((value, key) => {
      auditStatusList.push({ value: key, text: value })
    })

    return (
      <Box hasGap>
        <Form
          inline
          onSubmit={this.handleSearch}
          colWidth='390px'
          labelWidth='70px'
        >
          <FormItem label={t('改单日期')}>
            <DateRangePicker
              begin={begin}
              end={end}
              enabledTimeSelect
              onChange={(begin, end) => {
                this.handleChange(begin, 'begin')
                this.handleChange(end, 'end')
              }}
            />
          </FormItem>
          <FormItem label={t('审核状态')}>
            <Select
              onChange={(value) => this.handleChange(value, 'auditStatus')}
              data={auditStatusList}
              value={auditStatus}
            />
          </FormItem>
          <FormItem label={t('按订单/商户名/ID')} labelWidth='120px'>
            <Input
              className='form-control'
              placeholder={t('请输入订单号/商户名/ID')}
              value={text}
              onChange={(event) =>
                this.handleChange(event.target.value, 'text')
              }
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
    )
  }
}

export default Filter
