import React from 'react'
import {
  FormButton,
  FormItem,
  Option,
  BoxForm,
  Select,
  FormBlock,
  MoreSelect,
  Button,
} from '@gmfe/react'
import _ from 'lodash'
import { i18next } from 'gm-i18n'
import {
  outStockTimeTypeMap,
  outStockStatusMap,
  outStockTimeTypeAdapter,
  remarkType,
} from '../util'
import store from '../store/list_store'
import { observer } from 'mobx-react'
import moment from 'moment'
import { urlToParams } from 'common/util'

import DateFilter from '../../../../common/components/date_range_filter'
import globalStore from 'stores/global'

const QueryFilter = observer(() => {
  const {
    queryFilter,
    serviceTime,
    addressLabelList,
    addressRouteList,
    queryFilter: {
      begin,
      status,
      search_text,
      has_remark,
      address_label_id,
      route_id,
    },
  } = store

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
    store.fetchOutStockList().then(() => {
      store.changePagination({
        offset: 0,
        limit: 10,
      })
    })
  }

  const handleExport = () => {
    const url = urlToParams(store.getReqDataList())
    window.open('/stock/out_stock_sheet/list?export=1&' + url)
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
    dateFilterData: [...outStockTimeTypeAdapter(outStockTimeTypeMap)],
    service_times: [...serviceTime],
  }

  const filterForDateFilter = {
    ...queryFilter,
    dateType: queryFilter.type,
  }

  const limitDates = [null, null, getCycleDateLimit, null]

  const address_label_selected = _.find(
    addressLabelList,
    (v) => v.value === address_label_id,
  )
  const route_selected = _.find(addressRouteList, (v) => v.value === route_id)
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
          className='gm-margin-bottom-10'
          data={dateFilterTypeData}
          filter={filterForDateFilter}
          onDateFilterChange={handleDateFilterChange}
          limitDates={limitDates}
          enabledTimeSelect
        />
        <FormItem label={i18next.t('出库单筛选')}>
          <Select
            name='status'
            value={status}
            onChange={handleFilterSelectChange.bind(this, 'status')}
          >
            <Option value={0}>{i18next.t('全部单据状态')}</Option>
            {_.map(outStockStatusMap, (status, key) => (
              <Option value={_.toNumber(key)} key={key}>
                {status}
              </Option>
            ))}
          </Select>
        </FormItem>
        {!isCStation && (
          <FormItem label={i18next.t('商户标签')}>
            <MoreSelect
              renderListFilterType='pinyin'
              name='address_label_id'
              data={addressLabelList.slice()}
              selected={address_label_selected}
              onSelect={handleFilterMoreSelectChange.bind(
                this,
                'address_label_id',
              )}
            />
          </FormItem>
        )}
        <FormItem label={i18next.t('搜索')} className='gm-margin-bottom-10'>
          <input
            name='search_text'
            value={search_text}
            onChange={handleFilterChange}
            type='text'
            className='form-control'
            placeholder={
              isCStation
                ? i18next.t('请输入单号，客户名')
                : i18next.t('请输入单号，商户名')
            }
          />
        </FormItem>
      </FormBlock>
      <BoxForm.More>
        <FormBlock col={3}>
          {!isCStation && (
            <FormItem label={i18next.t('线路筛选')}>
              <MoreSelect
                renderListFilterType='pinyin'
                name='route_id'
                data={addressRouteList.slice()}
                selected={route_selected}
                onSelect={handleFilterMoreSelectChange.bind(this, 'route_id')}
              />
            </FormItem>
          )}
          <FormItem label={i18next.t('单据备注')}>
            <Select
              name='remark'
              value={has_remark}
              data={remarkType}
              onChange={handleFilterSelectChange.bind(this, 'has_remark')}
            />
          </FormItem>
        </FormBlock>

        {/* <FormBlock></FormBlock> */}
      </BoxForm.More>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {i18next.t('搜索')}
        </Button>
        <div className='gm-gap-10' />
        <Button onClick={handleExport}>{i18next.t('导出')}</Button>
      </FormButton>
    </BoxForm>
  )
})

export default QueryFilter
