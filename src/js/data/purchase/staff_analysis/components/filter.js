import React from 'react'
import {
  Flex,
  BoxForm,
  FormBlock,
  FormItem,
  FormButton,
  Button,
} from '@gmfe/react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import DateFilter from 'common/components/date_range_filter'
import store from '../store'
import moment from 'moment'
import _ from 'lodash'

const dateConfig = {
  dateFilterData: [
    {
      type: '1',
      name: '按下单日期',
      expand: false,
    },
    {
      type: '2',
      name: '按收货日期',
      expand: false,
    },
  ],
}

const Filter = () => {
  const {
    setFilter,

    filter: { begin_time, end_time, type, searchText },
  } = store

  const handleSearch = () => {
    store.onSearch()
  }

  const handleExport = () => {}

  const handleDate = (value) => {
    const { begin, end, dateType } = value
    setFilter(
      // 去掉null、undefined
      _.pickBy(
        {
          begin_time: begin ? moment(begin) : begin,
          end_time: end ? moment(end) : end,
          type: dateType,
        },
        _.identity,
      ),
    )
  }

  const handleInput = (e) => {
    setFilter({ searchText: e.target.value })
  }

  return (
    <Flex>
      <BoxForm
        btnPosition='left'
        labelWidth='100px'
        colWidth='385px'
        onSubmit={handleSearch}
      >
        <FormBlock col={3}>
          <DateFilter
            filter={{
              begin: begin_time,
              end: end_time,
              dateType: type,
            }}
            data={dateConfig}
            onDateFilterChange={handleDate}
          />
          <FormItem label={t('搜索')}>
            <input
              className='form-control'
              type='text'
              value={searchText}
              name='query'
              placeholder={t('请输入商品编码或商品名称')}
              onChange={handleInput}
            />
          </FormItem>
        </FormBlock>
        <FormButton>
          <Button type='primary' htmlType='submit'>
            {t('搜索')}
          </Button>

          <Button className='gm-margin-left-10' onClick={handleExport}>
            {t('导出')}
          </Button>
        </FormButton>
      </BoxForm>
    </Flex>
  )
}

Filter.propTypes = {
  xxxx: PropTypes.bool,
}
export default observer(Filter)
