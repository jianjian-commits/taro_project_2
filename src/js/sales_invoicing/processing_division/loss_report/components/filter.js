import React, { useCallback, useEffect } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import {
  Box,
  Button,
  DateRangePicker,
  Form,
  FormButton,
  FormItem,
  Input,
  RightSideModal,
} from '@gmfe/react'
import store from '../store'
import TaskList from '../../../../task/task_list'

const Filter = () => {
  const { params } = store
  const { q, begin, end } = params

  useEffect(() => {
    const { paginationRef } = store
    paginationRef.current.apiDoFirstRequest()
  }, [])

  const handleChange = useCallback((key, value) => {
    const { mergeParams } = store
    mergeParams(key, value)
  }, [])

  const handleSearch = useCallback(() => {
    const { paginationRef } = store
    paginationRef.current.apiDoFirstRequest()
  }, [])

  const handleExport = useCallback(async () => {
    const { fetchList } = store
    await fetchList({ export: 1 })
    RightSideModal.render({
      children: <TaskList />,
      onHide: RightSideModal.hide,
      style: { width: '300px' },
    })
  }, [])

  return (
    <Box hasGap>
      <Form inline onSubmit={handleSearch}>
        <FormItem label={t('分割日期')}>
          <DateRangePicker
            begin={begin}
            end={end}
            onChange={(begin, end) => {
              handleChange('begin', begin)
              handleChange('end', end)
            }}
          />
        </FormItem>
        <FormItem label={t('搜索')}>
          <Input
            className='form-control'
            value={q}
            placeholder={t('输入待分割品ID/名称搜索')}
            onChange={(event) => handleChange('q', event.target.value)}
          />
        </FormItem>
        {/*
        <FormItem label={t('按每日')}>
          <RadioGroup
            name='aggregate_by_day'
            onChange={(value) => handleChange('aggregate_by_day', value)}
            value={aggregate_by_day}
            inline
          >
            <Radio value={1}>{t('是')}</Radio>
            <Radio value={0}>{t('否')}</Radio>
          </RadioGroup>
        </FormItem>
        */}
        <FormButton>
          <Button type='primary' htmlType='submit'>
            {t('搜索')}
          </Button>
          <div className='gm-gap-10' />
          <Button onClick={handleExport}>{t('导出')}</Button>
        </FormButton>
      </Form>
    </Box>
  )
}

export default observer(Filter)
