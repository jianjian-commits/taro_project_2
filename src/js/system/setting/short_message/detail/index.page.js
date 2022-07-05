import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Form,
  FormBlock,
  FormItem,
  Select,
  FormButton,
  DateRangePicker,
  Tip,
  Box,
  Button,
} from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { Table } from '@gmfe/table'
import { observer } from 'mobx-react'
import store from './stores.js'
import _ from 'lodash'
import { idConvert2Show } from '../../../../common/util'
import moment from 'moment'
import { withBreadcrumbs } from 'common/service'

@withBreadcrumbs([i18next.t('短信发送明细')])
@observer
class SendDetail extends React.Component {
  componentDidMount() {
    this.pagination.apiDoFirstRequest()
  }

  handleSearchChange = (e) => {
    store.setQuerytFilter('search_text', e.target.value)
  }

  handleSearch = () => {
    const { start_date, end_date } = store.getQueryFilter()
    if (moment(start_date).add(30, 'days').isBefore(moment(end_date))) {
      Tip.warning(i18next.t('时间范围不能超过31天'))
      return
    }
    this.pagination.apiDoFirstRequest()
  }

  handleExport = () => {
    store.export()
  }

  render() {
    const {
      queryFilter: { start_date, end_date, status, search_text },
      statusOrder,
      statusMap,
    } = store
    return (
      <div>
        <Box hasGap>
          <Form onSubmit={this.handleSearch} inline>
            <FormBlock col={3}>
              <FormItem label={i18next.t('发送日期')}>
                <DateRangePicker
                  begin={start_date}
                  end={end_date}
                  onChange={(begin, end) => {
                    store.setQuerytFilter('start_date', begin)
                    store.setQuerytFilter('end_date', end)
                  }}
                />
              </FormItem>
              <FormItem label={i18next.t('接收状态')}>
                <Select
                  value={status}
                  onChange={(value) => store.setQuerytFilter('status', value)}
                  data={_.map(statusOrder, (v) => ({
                    value: v,
                    text: statusMap[v],
                  }))}
                />
              </FormItem>
              <FormItem>
                <input
                  type='text'
                  value={search_text}
                  onChange={this.handleSearchChange}
                  placeholder={i18next.t('输入商户名称或联系电话')}
                  autoComplete='off'
                />
              </FormItem>
            </FormBlock>
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
          id='pagination_in_short_message_detail_list'
          disablePage
          onRequest={store.requestSendDetailList}
          ref={(ref) => (this.pagination = ref)}
        >
          <Table
            data={store.sendDetailList.slice()}
            columns={[
              {
                Header: i18next.t('日期'),
                accessor: 'send_time',
              },
              {
                Header: i18next.t('消费对象'),
                id: 'receive_name',
                accessor: (d) => {
                  if (!d.id) {
                    return '-'
                  }
                  // 团长id
                  if (d.business_type === 3) {
                    return (
                      <div>
                        {d.receive_name || '-'}/{d.id}
                      </div>
                    )
                    // 非团长id
                  } else {
                    return (
                      <div>
                        {d.receive_name}/{idConvert2Show(d.id, 'S')}
                      </div>
                    )
                  }
                },
              },
              {
                Header: i18next.t('联系电话'),
                accessor: 'receive_phone',
              },
              {
                Header: i18next.t('短信模板'),
                id: 'business_type',
                accessor: (d) => store.smsTemplateMap[d.business_type],
              },
              {
                Header: i18next.t('接收状态'),
                id: 'status',
                accessor: (d) => {
                  return store.statusMap[d.status]
                },
              },
              {
                Header: i18next.t('备注'),
                accessor: 'remark',
              },
            ]}
          />
        </ManagePaginationV2>
      </div>
    )
  }
}

export default SendDetail
