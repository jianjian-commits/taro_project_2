import { t } from 'gm-i18n'
import React from 'react'
import {
  FormBlock,
  FormItem,
  Select,
  FormButton,
  MoreSelect,
  BoxForm,
  Button,
  Modal,
  RightSideModal,
  Storage,
} from '@gmfe/react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import moment from 'moment'

import {
  filterStatusList,
  payStatusList,
  PRINT_STATUS,
  REMARK_STATUS,
  RECEIVE_WAYS,
} from 'common/enum'
import TextTip from 'common/components/text_tip'
import DateFilter from 'common/components/date_range_filter'
import {
  getExportInfo,
  getRequestField,
  removedFieldOfCOrder,
} from 'common/diy_export_key'
import DiyTabModal from 'common/components/diy_tab_modal'
import TaskList from '../../../../task/task_list'
import { disabledDate } from '../../../../order/components/date_range_limit'

import {
  COrderDateFilter,
  getSelectData,
  searchText,
  ORDER_SEARCH_TYPE,
} from '../../util'

import store from './store'

const More = BoxForm.More

const OrderFilter = observer((props) => {
  const { orders } = store
  const { filter, pickUpList, service_times, shopList } = orders
  const {
    orderStatus,
    orderInput,
    payStatus,
    is_print,
    has_remark,
    receive_way,
    pickUpSelected,
    searchType,
    shopListSelected,
  } = filter

  // 收货方式
  const receiveWays = getSelectData([
    { name: t('全部'), value: '' },
    ...RECEIVE_WAYS,
  ])
  // 订单状态
  const orderStatusList = getSelectData(filterStatusList)
  // 支付状态 -- toc去掉部分支付，value === 5
  const filterPayStatusList = _.filter(
    getSelectData(payStatusList),
    (item) => item.value !== 5,
  )
  // 打印状态
  const printStatusList = getSelectData(PRINT_STATUS)
  // 订单备注
  const remarkStatusList = getSelectData(REMARK_STATUS)

  // 日期选择类型 -- c订单无运营时间选择
  const dateFilerDataTotal = {
    dateFilterData: [...COrderDateFilter],
  }

  const handleSelectChange = (name, value) => {
    store.filterChange({ [name]: value })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    store.filterChange({ sortType: '' })
    store.doFirstRequest()
  }

  const handleDateChange = (begin, end) => {
    if (moment(begin).isAfter(moment(end))) {
      end = begin
    }
    store.filterChange({ begin, end })
  }

  const handleDateFilterChangeOnce = (value) => {
    if (value.dateType) {
      handleSelectChange('dateType', value.dateType)
    } else if (value.begin && value.end) {
      handleDateChange(value.begin, value.end)
    }
  }

  const handleColumnsSave = (newColumns) => {
    _.each(newColumns, (item, key) => {
      Storage.set(`C${key}`, newColumns[key])
    })
  }

  const handleShowSetModal = () => {
    const exportInfo = getExportInfo('order&&spu')
    const exportTabTitle = [t('订单明细'), t('商品明细')]
    console.log(1111, exportInfo, removedFieldOfCOrder)
    Modal.render({
      disableMaskClose: true,
      title: t('导出设置'),
      noContentPadding: true,
      size: 'lg',
      onHide: Modal.hide,
      children: (
        <DiyTabModal
          isCStation
          exportInfo={exportInfo}
          removedField={removedFieldOfCOrder}
          tabTitle={exportTabTitle}
          onSave={handleColumnsSave}
        />
      ),
    })
  }

  const orderListExport = (data) => {
    // 订单商品导出自定义, toc订单导出字段前以‘C'开头
    Object.assign(data, {
      export_fields: JSON.stringify({
        orders: getRequestField('Corder', true),
        products: getRequestField('Cspu', true),
      }),
    })

    store.orderListExport(data).then((res) => {
      // 导出都是走异步
      if (res.data && res.data.async === 1) {
        RightSideModal.render({
          children: <TaskList />,
          onHide: RightSideModal.hide,
          style: {
            width: '300px',
          },
        })
      }
    })
  }

  const handleExport = () => {
    const params = store.searchData
    store.doFirstRequest()
    orderListExport(params)
  }

  // 日期查询限制
  const disabledDates = (d, { begin, end }) => {
    return disabledDate({ filter, service_times }, d, { begin, end })
  }
  const limitDates = [disabledDates, disabledDates]

  return (
    <BoxForm
      btnPosition='left'
      labelWidth='100px'
      colWidth='385px'
      onSubmit={handleSearch}
    >
      <FormBlock col={3}>
        <DateFilter
          data={dateFilerDataTotal}
          filter={{
            begin: filter.begin,
            end: filter.end,
            dateType: filter.dateType,
          }}
          onDateFilterChange={handleDateFilterChangeOnce}
          limitDates={limitDates}
          enabledTimeSelect
        />
        <FormItem>
          <Select
            clean
            style={{ minWidth: '100px' }}
            className='gm-inline-block'
            data={ORDER_SEARCH_TYPE}
            value={searchType}
            onChange={(value) => handleSelectChange('searchType', value)}
          />
          <input
            name='orderInput'
            className='gm-inline-block form-control'
            style={{ width: '275px' }}
            value={orderInput}
            onChange={(e) => handleSelectChange(e.target.name, e.target.value)}
            placeholder={searchText[searchType]}
          />
        </FormItem>
      </FormBlock>

      <More>
        <FormBlock col={3}>
          <FormItem label={t('订单状态')}>
            <Select
              name='orderStatus'
              style={{ minWidth: '120px' }}
              data={orderStatusList}
              value={orderStatus}
              onChange={(value) => handleSelectChange('orderStatus', value)}
            />
          </FormItem>
          <FormItem label={t('支付状态')}>
            <Select
              name='payStatus'
              data={filterPayStatusList}
              value={payStatus}
              style={{ minWidth: '120px' }}
              onChange={(value) => handleSelectChange('payStatus', value)}
            />
          </FormItem>
          <FormItem label={t('打印状态')}>
            <Select
              data={printStatusList}
              value={is_print}
              onChange={(value) => handleSelectChange('is_print', value)}
            />
          </FormItem>
          <FormItem label={t('订单备注')}>
            <Select
              data={remarkStatusList}
              value={has_remark}
              onChange={(value) => handleSelectChange('has_remark', value)}
            />
          </FormItem>
          <FormItem label={t('收货方式')}>
            <Select
              data={receiveWays}
              value={receive_way}
              onChange={(value) => handleSelectChange('receive_way', value)}
            />
          </FormItem>
          <FormItem label={t('自提点')}>
            <MoreSelect
              data={pickUpList.slice()}
              selected={pickUpSelected}
              onSelect={(selected) =>
                handleSelectChange('pickUpSelected', selected)
              }
              renderListFilterType='pinyin'
              placeholder={t('全部自提点')}
            />
          </FormItem>
          <FormItem label={t('社区店')}>
            <MoreSelect
              data={shopList.slice()}
              selected={shopListSelected}
              onSelect={(selected) =>
                handleSelectChange('shopListSelected', selected)
              }
              renderListFilterType='pinyin'
              placeholder={t('全部社区店')}
            />
          </FormItem>
        </FormBlock>
      </More>

      <FormButton>
        <Button type='primary' htmlType='submit' onClick={handleSearch}>
          {t('搜索')}
        </Button>
        <BoxForm.More>
          <div className='gm-gap-10' />
          <Button onClick={() => store.reset()}>{t('重置')}</Button>
        </BoxForm.More>
        <div className='gm-gap-10' />
        <TextTip
          content={
            <>
              <a className='gm-cursor' onClick={handleShowSetModal}>
                {t('点此设置')}
              </a>
              ，{t('自定义导出字段')}
            </>
          }
        >
          <Button onClick={handleExport}>{t('导出')}</Button>
        </TextTip>
      </FormButton>
    </BoxForm>
  )
})

export default OrderFilter
