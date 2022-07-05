import React from 'react'
import {
  Flex,
  BoxForm,
  FormBlock,
  FormButton,
  Button,
  RightSideModal,
  Storage,
} from '@gmfe/react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import moment from 'moment'
import { observer } from 'mobx-react'
import _ from 'lodash'
import DateFilter from 'common/components/date_range_filter'
import categoryStore from '../../stores/category'
import TaskList from 'common/../task/task_list'
import { requestSaleTableList } from '../../service'
import { PRODUCT_LIST_ENUM } from '../../../constants'
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
  const { sortField, sortDirection, filter } = categoryStore
  const handleSearch = () => {
    Storage.set('category_goods_analysis', filter.type) // 存进去我的操作
    categoryStore.handleSearch()
  }

  const handleDate = (value) => {
    const { begin, end, dateType } = value
    categoryStore.setFilter(
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

  // const handleInput = (e) => {
  //   categoryStore.setFilter({
  //     searchText: e.target.value,
  //   })
  // }

  const handleExport = () => {
    const params = {
      ...categoryStore.getParams(),
      export: 1,
    }
    params.query_expr.reverse = sortDirection === 'desc' ? 1 : 0
    return requestSaleTableList(params, {}, PRODUCT_LIST_ENUM[sortField]).then(
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
              begin: categoryStore.filter.begin_time,
              end: categoryStore.filter.end_time,
              dateType: categoryStore.filter.type,
            }}
            data={dateConfig}
            onDateFilterChange={handleDate}
          />
          {/* <FormItem label={t('搜索')}>
            <input
              className='form-control'
              type='text'
              value={categoryStore.filter.searchText}
              name='query'
              placeholder={t('输入商品名称或ID')}
              onChange={handleInput}
            />
          </FormItem> */}
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
