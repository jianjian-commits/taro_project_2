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
import PropTypes from 'prop-types'
import moment from 'moment'
import { observer } from 'mobx-react'
import _ from 'lodash'
import DateFilter from 'common/components/date_range_filter'
import store from '../../stores/goods_detail'
import { PRODUCT_LIST_ENUM } from '../../../constants'
import TaskList from 'common/../task/task_list'
import SelectSearch from './select_search'
import ShopSelectSearch from './select_shopSearch'
import { requestGoodsTableList } from '../../service'

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
    store.handleSearch()
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

  const handleInput = (e) => {
    store.setFilter({
      searchText: e.target.value,
    })
  }

  const handleExport = () => {
    const params = {
      ...store.getParams(),
      export: 1,
    }
    params.query_expr.reverse = sortDirection === 'desc' ? 1 : 0
    requestGoodsTableList(params, {}, PRODUCT_LIST_ENUM[sortField]).then(
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
        colWidth='350px'
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
          <FormItem>
            <SelectSearch />
          </FormItem>
          <FormItem>
            <ShopSelectSearch />
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
