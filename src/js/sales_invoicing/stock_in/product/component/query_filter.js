import React from 'react'
import {
  BoxForm,
  Button,
  FormBlock,
  FormButton,
  FormItem,
  Input,
  Option,
  Select,
  RightSideModal,
} from '@gmfe/react'
import _ from 'lodash'
import {
  PRODUCT_STATUS,
  PRODUCT_TIME_TYPE,
  STOCK_IN_PRINT_STATUS,
} from '../../../../common/enum'
import store from '../store/list_store'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import DateFilter from 'common/components/date_range_filter'
import { inStockTimeTypeAdapter, STOCK_IN_SEARCH_TYPE } from '../../util'
import { urlToParams } from 'common/util'
import { Request } from '@gm-common/request'
import TaskList from '../../../../task/task_list'

const SearchType = observer(() => {
  const { search_type } = store.filter

  const handleChange = (value) => {
    store.changeFilter('search_type', value)
  }

  return (
    <Select
      data={STOCK_IN_SEARCH_TYPE}
      clean
      style={{ minWidth: '100px' }}
      className='gm-inline-block'
      canShowClose={false}
      onChange={handleChange}
      value={search_type}
    />
  )
})

const QueryFilter = observer(() => {
  const {
    filter: { type, begin, end, search_text, status, is_print },
  } = store

  const handleSearch = () => {
    store.apiDoFirstRequest()
  }

  const handleFilterSelectChange = (name, value) => {
    store.changeFilter(name, value)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    store.changeFilter(name, value)
  }

  const handleDateChange = (begin, end) => {
    store.changeFilter('begin', begin)
    store.changeFilter('end', end)
  }

  const handleFilterTypeChange = (name, value) => {
    store.changeFilter(name, value)
  }

  const handleExport = (e) => {
    e.preventDefault()

    const url = urlToParams(store.getSearchData())
    window.open('/stock/in_stock_sheet/material/list?export=1&' + url)

    // const params = Object.assign({ export: 1 }, store.getSearchData())
    // Request('/stock/in_stock_sheet/material/list')
    //   .data(params)
    //   .get()
    //   .then((json) => {
    //     RightSideModal.render({
    //       children: <TaskList tabKey={0} />,
    //       onHide: RightSideModal.hide,
    //       style: {
    //         width: '300px',
    //       },
    //     })
    //   })
  }

  const handleDateFilterChange = (value) => {
    if (value.dateType) {
      handleFilterTypeChange('type', +value.dateType)
    } else if (value.begin && value.end) {
      handleDateChange(value.begin, value.end)
    }
  }

  return (
    <BoxForm
      onSubmit={handleSearch}
      labelWidth='100px'
      colWidth='385px'
      btnPosition='left'
    >
      <FormBlock col={3}>
        <DateFilter
          data={{
            dateFilterData: [...inStockTimeTypeAdapter(PRODUCT_TIME_TYPE)],
          }}
          filter={{ begin, end, dateType: type }}
          onDateFilterChange={handleDateFilterChange}
          enabledTimeSelect
        />
        <FormItem>
          <SearchType />
          <Input
            value={search_text}
            onChange={handleInputChange}
            name='search_text'
            type='text'
            style={{ width: '275px' }}
            className='gm-inline-block form-control'
            placeholder={t('请输入单号、供应商信息')}
          />
        </FormItem>
      </FormBlock>
      <BoxForm.More>
        <FormBlock col={2}>
          <FormItem label={t('入库单筛选')}>
            <Select
              value={status}
              name='status'
              onChange={(value) => handleFilterSelectChange('status', value)}
            >
              <Option value='5'>{t('全部单据状态')}</Option>
              {_.map(PRODUCT_STATUS, (status, key) => (
                <Option value={_.toNumber(key)} key={key}>
                  {status}
                </Option>
              ))}
            </Select>
          </FormItem>
          <FormItem label={t('打印状态')}>
            <Select
              value={is_print}
              onChange={(value) => handleFilterSelectChange('is_print', value)}
            >
              {_.map(STOCK_IN_PRINT_STATUS, (data) => (
                <Option value={_.toNumber(data.value)} key={data.value}>
                  {data.name}
                </Option>
              ))}
            </Select>
          </FormItem>
        </FormBlock>
      </BoxForm.More>

      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
        <div className='gm-gap-10' />
        <Button onClick={handleExport}>{t('导出')}</Button>
      </FormButton>
    </BoxForm>
  )
})

export default QueryFilter
