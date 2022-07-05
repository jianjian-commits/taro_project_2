import React from 'react'
import {
  Flex,
  BoxForm,
  FormBlock,
  FormItem,
  FormButton,
  Button,
  RightSideModal,
} from '@gmfe/react'
import { t } from 'gm-i18n'
import moment from 'moment'
import { observer } from 'mobx-react'
import _ from 'lodash'
import CustomerSearch from 'common/components/dashboard/select_component/customer_search'
import DateFilter from 'common/components/date_range_filter'
import store from '../../stores/detail'
import TaskList from '../../../../../task/task_list'
import { requestTableList } from '../../service'
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
  const { sortField, sortDirection } = store
  const handleSearch = () => {
    store.onSearch()
  }

  const handleDate = (value) => {
    const { begin, end, dateType } = value
    store.setFilter(
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

  const handleExport = () => {
    const params = {
      ...store.getParams(),
      export: 1,
    }
    params.query_expr.reverse = sortDirection === 'desc' ? 1 : 0
    requestTableList(params, {}, COUNT_LIST_ENUM[sortField]).then((res) => {
      RightSideModal.render({
        children: <TaskList />,
        onHide: RightSideModal.hide,
        style: {
          width: '300px',
        },
      })
    })
  }

  const onFilterChange = (value) => {
    store.setFilter({ id: value?.id })
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
              begin: store.filter.begin_time,
              end: store.filter.end_time,
              dateType: store.filter.type,
            }}
            data={dateConfig}
            onDateFilterChange={handleDate}
          />
          <FormItem label={t('商户')}>
            <CustomerSearch
              onChange={onFilterChange}
              defaultValue={store.filter.id}
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

export default observer(Filter)
