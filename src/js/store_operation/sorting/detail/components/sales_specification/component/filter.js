/* eslint-disable gm-react-app/no-deprecated-react-gm */
import React, { useEffect } from 'react'
import {
  FormButton,
  FormItem,
  Option,
  BoxForm,
  Select,
  FormBlock,
  MoreSelect,
  Button,
  FilterSelect,
} from '@gmfe/react'
import _ from 'lodash'
import { i18next } from 'gm-i18n'
import { salesSpecificationsTimeTypeMap, timeTypeAdapter } from '../util'
import store from '../store/list_store'
import { observer } from 'mobx-react'
import moment from 'moment'
import {
  INSPECT_STATUS_SKU,
  PRINT_STATUS,
  PERF_WAY,
  WEIGHT_STATUS,
  STATUS_OF_STOCK_2,
} from 'common/enum'
import Customer from 'common/components/dashboard/select_component/customer_search'

import DateFilter from 'common/components/date_range_filter'
import globalStore from 'stores/global'
import CategoryPinleiFilter from 'common/components/category_filter_hoc'
import OrderTypeSelector from 'common/components/order_type_selector'

const QueryFilter = observer(() => {
  const {
    queryFilter,
    serviceTime,
    queryFilter: {
      begin,
      search_text,
      sorter_id,
      categoryFilter,
      salemenuSelected,
      sorting_is_print,
      perf_method,
      inspect_status,
      orderType,
      sorting_is_weighted,
      sorting_out_of_stock,
    },
    salemenuList,
    sorterList,
  } = store

  useEffect(() => {
    store.getSaleMenuList()
    // store.reset()
  }, [])

  const handleWithFilter = (list, query) => {
    return _.filter(list, (v) => v.name.indexOf(query) > -1)
  }

  const handleFilterSelectChange = (type, value) => {
    store.changeFilter(type, value)
  }

  const handleFilterMoreSelectChange = (name, selected) => {
    store.changeFilter(name, selected ? selected.value : '')
  }

  const handleFilterChange = (e) => {
    store.changeFilter('search_text', e.target.value)
  }

  const handleDateChange = (begin, end) => {
    store.changeFilter('begin', begin)
    store.changeFilter('end', end)
  }

  const handleDateFilterChange = (value) => {
    if (value.dateType) {
      handleFilterSelectChange('type', value.dateType)
    } else if (value.time_config_id) {
      handleFilterSelectChange('time_config_id', value.time_config_id)
    } else if (value.begin && value.end) {
      handleDateChange(value.begin, value.end)
    }
  }

  const handleSearch = () => {
    store.ref?.doFirstRequest && store.ref.doFirstRequest()
  }

  const endDisabledDate = (date) => {
    return (
      moment(begin).add(1, 'M').isBefore(date) || moment(begin).isAfter(date)
    )
  }

  const getCycleDateLimit = () => {
    const endProps = {
      disabledDate: (date) => endDisabledDate(date),
      min: moment(),
    }
    return { endProps }
  }

  const dateFilterTypeData = {
    dateFilterData: [...timeTypeAdapter(salesSpecificationsTimeTypeMap)],
    service_times: [...serviceTime],
  }

  const filterForDateFilter = {
    ...queryFilter,
    dateType: queryFilter.type,
  }

  const limitDates = [null, null, getCycleDateLimit, null]

  const resetValueRef = React.useRef(null)

  useEffect(() => {
    store.resetValueRef = resetValueRef
  }, [])

  const { isCStation } = globalStore.otherInfo

  return (
    <BoxForm
      btnPosition='left'
      labelWidth='100px'
      colWidth='380px'
      onSubmit={handleSearch}
    >
      <FormBlock col={3}>
        <DateFilter
          data={dateFilterTypeData}
          filter={filterForDateFilter}
          onDateFilterChange={handleDateFilterChange}
          limitDates={limitDates}
          enabledTimeSelect
        />

        <FormItem label={i18next.t('搜索')}>
          <input
            name='search_text'
            value={search_text}
            onChange={handleFilterChange}
            type='text'
            className='form-control'
            placeholder={
              isCStation
                ? i18next.t('输入商品名、商品ID')
                : i18next.t('输入商品名、商品ID')
            }
          />
        </FormItem>
      </FormBlock>
      <BoxForm.More>
        <FormBlock col={3}>
          <FormItem label={i18next.t('客户')}>
            <Customer
              isReset
              resetValueRef={resetValueRef}
              onChange={(value) => {
                handleFilterSelectChange('shop_id', value?.id ?? '')
              }}
            />
          </FormItem>
          <FormItem label={i18next.t('绩效类型')}>
            <Select
              value={perf_method}
              onChange={(status) =>
                handleFilterSelectChange('perf_method', status)
              }
            >
              {_.map(PERF_WAY, (s) => (
                <Option key={s.value} value={s.value}>
                  {s.name}
                </Option>
              ))}
            </Select>
          </FormItem>
        </FormBlock>
        <FormBlock col={3}>
          <FormItem label={i18next.t('分拣员')}>
            <MoreSelect
              renderListFilterType='pinyin'
              name='username'
              data={sorterList
                .map((it) => ({
                  text: it.username,
                  value: it,
                }))
                .slice()}
              selected={sorterList
                .slice()
                .map((it) => ({
                  text: it.username,
                  value: it,
                }))
                .find((it) => it?.value.user_id === sorter_id)}
              onSelect={(v) => {
                handleFilterSelectChange('sorter_id', v?.value.user_id ?? '')
              }}
            />
          </FormItem>
          <FormItem label={i18next.t('分拣情况')}>
            <Select
              value={sorting_is_weighted}
              onChange={(status) =>
                handleFilterSelectChange('sorting_is_weighted', status)
              }
            >
              {_.map(WEIGHT_STATUS, (s) => (
                <Option key={s.value} value={s.value}>
                  {s.name}
                </Option>
              ))}
            </Select>
          </FormItem>
        </FormBlock>
        <FormBlock col={3}>
          <FormItem label={i18next.t('打印情况')}>
            <Select
              value={sorting_is_print}
              onChange={(status) =>
                handleFilterSelectChange('sorting_is_print', status)
              }
            >
              {_.map(PRINT_STATUS, (s) => (
                <Option key={s.value} value={s.value}>
                  {s.name}
                </Option>
              ))}
            </Select>
          </FormItem>
          {!isCStation && (
            <FormItem label={i18next.t('报价单')}>
              <FilterSelect
                id='salemenu_id'
                list={salemenuList}
                style={{ minWidth: '120px' }}
                selected={salemenuSelected}
                withFilter={handleWithFilter}
                onSelect={(selected) =>
                  handleFilterSelectChange('salemenuSelected', selected)
                }
                placeholder={i18next.t('全部报价单')}
              />
            </FormItem>
          )}
        </FormBlock>

        <FormBlock col={3}>
          <FormItem label={i18next.t('商品筛选')}>
            <CategoryPinleiFilter
              selected={categoryFilter}
              onChange={(selected) =>
                handleFilterSelectChange('categoryFilter', selected)
              }
            />
          </FormItem>
        </FormBlock>
        <FormBlock col={3}>
          {!isCStation && (
            <FormItem label={i18next.t('订单类型')}>
              <OrderTypeSelector
                orderType={orderType}
                onChange={(value) =>
                  handleFilterSelectChange('orderType', value)
                }
              />
            </FormItem>
          )}
        </FormBlock>
        <FormBlock col={3}>
          <FormItem label={i18next.t('验货状态')}>
            <Select
              value={inspect_status}
              onChange={(status) =>
                handleFilterSelectChange('inspect_status', status)
              }
            >
              {_.map(INSPECT_STATUS_SKU, (s) => (
                <Option key={s.value} value={s.value}>
                  {s.name}
                </Option>
              ))}
            </Select>
          </FormItem>
          <FormItem label={i18next.t('标记缺货')}>
            <Select
              value={sorting_out_of_stock}
              onChange={(status) => {
                handleFilterSelectChange('sorting_out_of_stock', status)
              }}
            >
              {_.map(STATUS_OF_STOCK_2, (s) => (
                <Option key={s.value} value={s.value}>
                  {s.name}
                </Option>
              ))}
            </Select>
          </FormItem>
        </FormBlock>
      </BoxForm.More>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {i18next.t('搜索')}
        </Button>
        <div className='gm-gap-10' />
        <BoxForm.More>
          <div className='gm-gap-10' />
          <Button
            onClick={() => {
              store.reset()
              resetValueRef.current && resetValueRef.current()
            }}
          >
            {i18next.t('重置')}
          </Button>
        </BoxForm.More>
      </FormButton>
    </BoxForm>
  )
})

export default QueryFilter
