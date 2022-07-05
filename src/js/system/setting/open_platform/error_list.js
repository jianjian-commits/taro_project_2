import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Form,
  FormItem,
  FormButton,
  DateRangePicker,
  Box,
  Button,
} from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { Table } from '@gmfe/table'
import { observer } from 'mobx-react'
import moment from 'moment'
import store from './store'

@observer
class ErrorList extends React.Component {
  componentDidMount() {
    this.firstRequest()
  }

  firstRequest() {
    this.pagination.apiDoFirstRequest()
  }

  getErrorList = (data) => {
    return store.getErrorList(data)
  }

  handleChangeRangePick = (start_date, end_date) => {
    store.updateErrorListFilter({ start_date, end_date })
  }

  handleSearch = () => {
    this.firstRequest()
  }

  render() {
    const { list, start_date, end_date } = store.failList
    return (
      <div>
        <Box hasGap>
          <Form inline onSubmit={this.handleSearch}>
            <FormItem label={i18next.t('创建时间')}>
              <DateRangePicker
                begin={start_date}
                end={end_date}
                onChange={this.handleChangeRangePick}
              />
            </FormItem>
            <FormButton>
              <Button
                type='primary'
                htmlType='submit'
                className='gm-margin-left-10'
              >
                {i18next.t('搜索')}
              </Button>
            </FormButton>
          </Form>
        </Box>
        <Box>
          <ManagePaginationV2
            id='pagination_in_open_platform_error_list'
            onRequest={this.getErrorList}
            ref={(ref) => {
              this.pagination = ref
            }}
            disablePage
          >
            <Table
              data={list.slice()}
              columns={[
                {
                  Header: i18next.t('应用'),
                  accessor: 'app_name',
                },
                {
                  Header: i18next.t('创建时间'),
                  id: 'create_time',
                  accessor: (d) =>
                    moment(d.create_time).format('YYYY-MM-DD HH:mm:ss'),
                },
                {
                  Header: i18next.t('内容'),
                  accessor: 'msg',
                },
              ]}
            />
          </ManagePaginationV2>
        </Box>
      </div>
    )
  }
}

export default ErrorList
