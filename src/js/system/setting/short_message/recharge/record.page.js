import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Box,
  Form,
  FormItem,
  FormButton,
  DateRangePicker,
  Tip,
  Price,
  Button,
} from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { Table } from '@gmfe/table'
import { observer } from 'mobx-react'
import store from './stores.js'
import Big from 'big.js'
import moment from 'moment'
import { withBreadcrumbs } from 'common/service'

@withBreadcrumbs([i18next.t('充值记录')])
@observer
class RechargeRecord extends React.Component {
  componentDidMount() {
    this.pagination.apiDoFirstRequest()
  }

  handleSearch = () => {
    const { start_date, end_date } = store.getQueryFilter()
    if (moment(start_date).add(30, 'days').isBefore(moment(end_date))) {
      Tip.warning(i18next.t('时间范围不能超过31天'))
      return
    }
    this.pagination.apiDoFirstRequest()
  }

  handleExport = async () => {
    store.export()
  }

  render() {
    return (
      <div>
        <Box hasGap>
          <Form onSubmit={this.handleSearch} inline>
            <FormItem label={i18next.t('充值日期')}>
              <DateRangePicker
                begin={store.queryFilter.start_date}
                end={store.queryFilter.end_date}
                onChange={(begin, end) => {
                  store.setQuerytFilter('start_date', begin)
                  store.setQuerytFilter('end_date', end)
                }}
              />
            </FormItem>
            <FormButton>
              <Button type='primary' htmlType='submit'>
                {i18next.t('搜索')}
              </Button>
              <div className='gm-gap-10' />
              <Button onClick={this.handleExport}>{i18next.t('导出')}</Button>
            </FormButton>
          </Form>
        </Box>

        <ManagePaginationV2
          id='pagination_in_short_message_recharge_record'
          disablePage
          onRequest={store.requestRechargeRecordList}
          ref={(ref) => (this.pagination = ref)}
        >
          <Table
            data={store.rechargeRecordList.slice()}
            columns={[
              {
                Header: i18next.t('日期'),
                accessor: 'recharge_date',
              },
              {
                Header: i18next.t('短信套餐包'),
                accessor: 'combo_name',
              },
              {
                Header: i18next.t('金额'),
                id: 'recharge_money',
                accessor: (d) => d.recharge_money + Price.getUnit(),
              },
              {
                Header: i18next.t('实购条数'),
                id: 'recharge_nums',
                accessor: (d) => d.recharge_nums + i18next.t('条'),
              },
              {
                Header: i18next.t('每条单价'),
                id: 'unit_price',
                accessor: (d) => {
                  const n = Big(d.recharge_money)
                    .div(d.recharge_nums)
                    .toFixed(3)
                  return n + Price.getUnit() + '/' + i18next.t('条')
                },
              },
            ]}
          />
        </ManagePaginationV2>
      </div>
    )
  }
}

export default RechargeRecord
