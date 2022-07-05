import React, { Component } from 'react'
import { observer } from 'mobx-react'
import {
  Button,
  DateRangePicker,
  Flex,
  FormButton,
  Form,
  Box,
  FormItem,
  Input,
  Select,
} from '@gmfe/react'
import { t } from 'gm-i18n'
import store from '../store'
import { urlToParams } from 'common/util'

@observer
class Filter extends Component {
  handleChangeFilter = (value, key) => {
    const { mergeFilter } = store
    mergeFilter({ [key]: value })
  }

  handleSearch = () => {
    const { setSelected } = store
    setSelected([])
    store.doFirstRequest()
  }

  handleExport = (e) => {
    e.preventDefault()
    const { searchFilter } = store
    const params = urlToParams(searchFilter)
    window.open(`/stock/process/process_order/export?${params}`)
  }

  render() {
    const { filter } = store
    const { date_type, q, begin, end, status } = filter
    return (
      <Box hasGap>
        <Form
          inline
          labelWidth='80px'
          colWidth='320px'
          onSubmit={this.handleSearch}
        >
          <FormItem labelWidth='0'>
            <Flex>
              <Select
                clean
                onChange={(value) =>
                  this.handleChangeFilter(value, 'date_type')
                }
                data={[
                  { value: 6, text: t('下达日期') },
                  { value: 2, text: t('计划完成日期') },
                ]}
                value={date_type}
              />
              <Flex flex={1} column>
                <DateRangePicker
                  begin={begin}
                  end={end}
                  onChange={(begin, end) => {
                    this.handleChangeFilter(begin, 'begin')
                    this.handleChangeFilter(end, 'end')
                  }}
                />
              </Flex>
            </Flex>
          </FormItem>
          <FormItem label={t('状态筛选')}>
            <Select
              value={status}
              data={[
                { value: 0, text: t('全部状态') },
                { value: 2, text: t('未开工') },
                { value: 4, text: t('已开工') },
                { value: 3, text: t('已完成') },
              ]}
              onChange={(value) => this.handleChangeFilter(value, 'status')}
            />
          </FormItem>
          <FormItem label={t('搜索')}>
            <Input
              className='form-control'
              value={q}
              placeholder={t('输入成品信息或计划编号')}
              onChange={(e) => this.handleChangeFilter(e.target.value, 'q')}
            />
          </FormItem>
          <FormButton>
            <Button
              type='primary'
              htmlType='submit'
              className='gm-margin-right-10'
            >
              {t('搜索')}
            </Button>
            <Button onClick={this.handleExport}>{t('导出')}</Button>
          </FormButton>
        </Form>
      </Box>
    )
  }
}

export default Filter
