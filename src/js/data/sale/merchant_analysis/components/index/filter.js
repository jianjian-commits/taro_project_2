import React from 'react'
import {
  Flex,
  BoxForm,
  FormBlock,
  FormItem,
  FormButton,
  Button,
  RightSideModal,
  Storage,
} from '@gmfe/react'
import { t } from 'gm-i18n'
import moment from 'moment'
import { observer } from 'mobx-react'
import _ from 'lodash'
import DateFilter from 'common/components/date_range_filter'
import store from '../../stores/index'
import TaskList from 'common/../task/task_list'
import CustomerSearch from 'common/components/dashboard/select_component/customer_search'
import { requestTableDataFromMerchant } from '../../service'
import { COUNT_LIST_ENUM } from '../../../constants'

const dateConfig = {
  dateFilterData: [
    {
      type: 'order_time',
      name: '按下单日期',
      expand: false,
    },
    {
      type: 'receive_begin_time',
      name: '按收货日期',
      expand: false,
    },
  ],
}

const Filter = () => {
  const {
    filter: { begin_time, end_time, type },
    sortField,
    sortDirection,
  } = store

  const handleSearch = () => {
    // 更改filter的地址触发更新
    Storage.set('merchant_analysis', store.filter.type)
    store.handleSearch({})
  }

  const handleDate = (value) => {
    const { begin, end, dateType } = value
    store.changeFilter(
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

  const handleChangeFilter = (value) => {
    store.changeFilter({ searchText: value?.id })
  }

  // 导出
  const handleExport = () => {
    const params = {
      ...store.getParams(),
      export: 1,
    }
    params.query_expr.reverse = sortDirection === 'desc' ? 1 : 0
    requestTableDataFromMerchant(params, {}, COUNT_LIST_ENUM[sortField]).then(
      (res) => {
        RightSideModal.render({
          children: <TaskList />,
          onHide: RightSideModal.hide,
          style: {
            width: '300px',
          },
        })
      },
    )
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

          {/* 按商户搜索 */}
          <FormItem label={t('商户')}>
            <CustomerSearch onChange={handleChangeFilter} />
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

export default observer(Filter)
