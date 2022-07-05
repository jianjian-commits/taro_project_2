import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { store } from '../store'
import {
  Box,
  Button,
  Flex,
  Form,
  FormButton,
  FormItem,
  Input,
  Select,
  DateRangePicker,
} from '@gmfe/react'
import { t } from 'gm-i18n'
import { urlToParams } from 'common/util'

const Filter = ({ onSearch }) => {
  const { filter, trueFilter } = store
  const { query_type, begin_time, end_time, search_text, status } = filter

  const handleChangeFilter = (key, value) => {
    store.setFilter(key, value)
  }

  const handleSearch = () => {
    onSearch()
  }

  const handleExport = (event) => {
    event.preventDefault()
    window.open(
      `/food_security_report/list?${urlToParams({ ...trueFilter, export: 1 })}`
    )
  }
  return (
    <Box hasGap>
      <Form inline onSubmit={handleSearch}>
        <FormItem>
          <Flex>
            <Select
              data={[
                { text: t('按上传日期'), value: 1 },
                { text: t('按检测日期'), value: 2 },
              ]}
              value={query_type}
              onChange={(value) => handleChangeFilter('query_type', value)}
              clean
              className='b-filter-select-clean-time'
            />
            <Flex flex none column>
              <DateRangePicker
                begin={begin_time}
                end={end_time}
                onChange={(begin, end) => {
                  handleChangeFilter('begin_time', begin)
                  handleChangeFilter('end_time', end)
                }}
              />
            </Flex>
          </Flex>
        </FormItem>
        <FormItem label={t('有效状态')}>
          <Select
            onChange={(value) => handleChangeFilter('status', value)}
            data={[
              { value: 1, text: t('有效') },
              { value: 2, text: t('失效') },
            ]}
            value={status}
            placeholder={t('全部状态')}
            canShowClose
          />
        </FormItem>
        <FormItem label={t('搜索')}>
          <Input
            placeholder={t('请输入检测商品')}
            className='form-control'
            value={search_text}
            onChange={(event) =>
              handleChangeFilter('search_text', event.target.value)
            }
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
          <Button onClick={handleExport}>{t('导出')}</Button>
        </FormButton>
      </Form>
    </Box>
  )
}

Filter.propTypes = {
  onSearch: PropTypes.func.isRequired,
}

export default observer(Filter)
