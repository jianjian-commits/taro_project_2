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
import _ from 'lodash'
import DateFilter from 'common/components/date_range_filter'
import store from '../../stores/goods'
import { observer } from 'mobx-react'
import SelectSearch from './select_search'
import ShopSelectSearch from './select_shopSearch'
import { requestSaleTableList } from '../../service'
import { PRODUCT_LIST_ENUM } from '../../../constants'
import TaskList from 'common/../task/task_list'

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
    Storage.set('shop_goods_analysis', store.filter.type)

    // 更改filter的地址触发更新
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

  const handleExport = () => {
    const params = {
      ...store.getParams(),
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
        colWidth='350px'
        onSubmit={handleSearch}
      >
        <FormBlock col={3}>
          <FormItem>
            <DateFilter
              filter={{
                begin: store.filter.begin_time,
                end: store.filter.end_time,
                dateType: store.filter.type,
              }}
              data={dateConfig}
              onDateFilterChange={handleDate}
            />
          </FormItem>
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

export default observer(Filter)
