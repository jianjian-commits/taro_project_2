import { t } from 'gm-i18n'
import React from 'react'
import {
  Form,
  FormItem,
  DateRangePicker,
  Select,
  FormButton,
  Box,
  Button,
} from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { Table, TableUtil } from '@gmfe/table'
import moment from 'moment'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { NOTIFY_TYPE } from 'common/enum'
import { notifyNavgation } from './util'
import notifyStore from './notify_store'

const { OperationHeader } = TableUtil

const types = _.map(NOTIFY_TYPE, (val, key) => ({
  text: val,
  value: Number(key),
}))

@observer
class Notice extends React.Component {
  constructor() {
    super()
    this.paginationRef = React.createRef()
  }

  componentDidMount() {
    this.paginationRef.current.apiDoFirstRequest()
  }

  handleFilterChange = (type, val) => {
    notifyStore.handleFilterChange(type, val)
  }

  handleDateChange = (begin, end) => {
    notifyStore.handleDateChange(begin, end)
  }

  handleSearch = () => {
    this.paginationRef.current.apiDoFirstRequest()
  }

  handleClick = (type, id) => {
    window.open(notifyNavgation(type, id).link)
  }

  render() {
    const {
      filter: { start_time, end_time, q_type },
      list,
    } = notifyStore
    return (
      <div className='b-notice'>
        <Box hasGap>
          <Form inline onSubmit={this.handleSearch}>
            <FormItem label={t('消息时间')}>
              <DateRangePicker
                begin={moment(start_time)}
                end={moment(end_time)}
                onChange={this.handleDateChange}
              />
            </FormItem>
            <FormItem label={t('消息类型')}>
              <Select
                value={q_type}
                data={types}
                onChange={(val) => this.handleFilterChange('q_type', val)}
              />
            </FormItem>
            <FormButton>
              <Button type='primary' htmlType='submit'>
                {t('搜索')}
              </Button>
            </FormButton>
          </Form>
        </Box>
        <ManagePaginationV2
          id='pagination_in_home_notify_list'
          onRequest={(pagination) => notifyStore.handlePageChange(pagination)}
          ref={this.paginationRef}
        >
          <Table
            data={list.slice()}
            columns={[
              { Header: t('通知时间'), accessor: 'date_time' },
              {
                Header: t('通知类型'),
                accessor: 'type',
                Cell: (item) => <div>{NOTIFY_TYPE[item.original.type]}</div>,
              },
              { Header: t('通知详情'), accessor: 'content' },
              {
                Header: OperationHeader,
                Cell: (item) => (
                  <div className='text-center'>
                    <a
                      rel='noopener noreferrer'
                      onClick={() =>
                        this.handleClick(
                          item.original.type,
                          item.original.key,
                        )
                      }
                      className='gm-text-12 text-primary'
                    >
                      {t('查看')}
                    </a>
                  </div>
                ),
              },
            ]}
          />
        </ManagePaginationV2>
      </div>
    )
  }
}

export default Notice
