import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Box,
  Form,
  FormItem,
  FormButton,
  Select,
  Option,
  DateRangePicker,
  Price,
  RightSideModal,
  Button,
} from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { Table } from '@gmfe/table'

import store from './store'
import globalStore from '../../../../stores/global'
import { observer } from 'mobx-react'
import _ from 'lodash'
import Big from 'big.js'
import moment from 'moment'

import { USAGESTATUS, usageStatus, splitPhone } from '../util'
import { idConvert2Show } from 'common/util'
import { System } from '../../../../common/service'
import TaskList from '../../../../task/task_list'

@observer
class CouponUsageList extends React.Component {
  constructor(props) {
    super(props)
    this.pagination = React.createRef()
  }

  componentDidMount() {
    this.pagination.current.apiDoFirstRequest()
  }

  componentWillUnmount() {
    store.init()
  }

  handleDateChange(begin, end) {
    store.changeDate(begin, end)
  }

  handleFilterSelectChange = (val) => {
    store.changeFilter('status', val)
  }

  handleFilterInputChange = (e) => {
    e.preventDefault()
    store.changeFilter('q', e.target.value)
  }

  handleSearch = () => {
    this.pagination.current.apiDoFirstRequest()
  }

  handleExport = (e) => {
    e.preventDefault()
    store.export().then(() => {
      RightSideModal.render({
        children: <TaskList />,
        onHide: RightSideModal.hide,
        style: {
          width: '300px',
        },
      })
    })
  }

  render() {
    const {
      filter: { status, q, collect_begin_time, collect_end_time },
      list,
    } = store

    return (
      <div>
        <Box hasGap>
          <Form inline onSubmit={this.handleSearch}>
            <FormItem label={i18next.t('领取日期')}>
              <DateRangePicker
                begin={collect_begin_time}
                end={collect_end_time}
                onChange={this.handleDateChange}
              />
            </FormItem>
            <FormItem label={i18next.t('优惠券状态')}>
              <Select
                value={status}
                name='is_active'
                onChange={this.handleFilterSelectChange}
              >
                {_.map(USAGESTATUS, (is_active, key) => (
                  <Option value={_.toNumber(key)} key={key}>
                    {is_active}
                  </Option>
                ))}
              </Select>
            </FormItem>
            <FormItem label={i18next.t('搜索')}>
              <input
                value={q}
                onChange={this.handleFilterInputChange}
                name='q'
                type='text'
                className='form-control'
                placeholder={
                  System.isC()
                    ? i18next.t('输入客户名、优惠券名称、订单号搜索')
                    : i18next.t('输入商户ID、商户名、优惠券名称、订单号搜索')
                }
              />
            </FormItem>
            <FormButton>
              <Button htmlType='submit' type='primary'>
                {i18next.t('搜索')}
              </Button>
              <div className='gm-gap-10' />
              <Button onClick={this.handleExport}>{i18next.t('导出')}</Button>
            </FormButton>
          </Form>
        </Box>
        <ManagePaginationV2
          id='pagination_in_coupon_usage_list'
          onRequest={store.getUsageList}
          ref={this.pagination}
        >
          <Table
            ref={(ref) => (this.table = ref)}
            data={list.slice()}
            columns={[
              {
                Header: i18next.t('领取时间'),
                id: 'collect_time',
                width: 170,
                accessor: (d) =>
                  moment(d.collect_time).format('YYYY-MM-DD HH:mm:ss'),
              },
              {
                Header: i18next.t('优惠券名称'),
                id: 'name',
                accessor: (d) => d.name,
              },
              {
                Header: i18next.t('面值') + `（${Price.getUnit()}）`,
                id: 'price_value',
                accessor: (d) => Big(d.price_value).toFixed(2),
              },
              {
                Header: i18next.t('使用条件'),
                id: 'min_total_price',
                width: 120,
                accessor: (d) =>
                  i18next.t(
                    /* src:`满${d.min_total_price}元可用` => tpl:满${num}可用 */ 'coupon_list_use_min_limit',
                    {
                      num: Big(d.min_total_price).toFixed(2) + Price.getUnit(),
                    }
                  ),
              },
              {
                Header: i18next.t('领取人'),
                id: 'user_id',
                accessor: (d) => {
                  if (System.isB()) {
                    return (
                      (d.user_name || '-') +
                      '/' +
                      idConvert2Show(d.user_id, 'K')
                    )
                  } else if (System.isC()) {
                    return splitPhone(d.user_name, globalStore.groupId)
                  }
                },
              },
              {
                Header: i18next.t('优惠券状态'),
                id: 'status',
                accessor: (d) => usageStatus(d.status),
              },
              {
                Header: i18next.t('使用时间'),
                id: 'last_use_time',
                width: 170,
                accessor: (d) =>
                  d.last_use_time
                    ? moment(d.last_use_time).format('YYYY-MM-DD HH:mm:ss')
                    : '-',
              },
              System.isB() && {
                Header: i18next.t('使用人'),
                id: 'address_id',
                accessor: (d) =>
                  d.address_id
                    ? (d.address_name || '-') +
                      '/' +
                      idConvert2Show(d.address_id, 'S')
                    : '-',
              },
              {
                Header: i18next.t('订单号'),
                id: 'order_id',
                accessor: (d) => (d.order_id ? d.order_id : '-'),
              },
            ].filter((_) => _)}
          />
        </ManagePaginationV2>
      </div>
    )
  }
}

export default CouponUsageList
