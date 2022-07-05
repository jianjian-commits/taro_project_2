import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import {
  Box,
  Form,
  FormItem,
  FormButton,
  RightSideModal,
  BoxTable,
  Button,
} from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { Table } from '@gmfe/table'
import _ from 'lodash'
import store from './store'
import EditContent from './edit_content'
import { asyncImportExcel, convertNumber2Date } from 'common/util'
import TaskList from '../../../../../task/task_list'
import TableTotalText from '../../../../../common/components/table_total_text'
import { convertNumber2Sid } from 'common/filter'

@observer
class ReceiveDays extends React.Component {
  componentDidMount() {
    const time_config_id = this.props.location.query.time_config_id
    store.getServiceTimeFromID(time_config_id)
    this.pagination.apiDoFirstRequest()
  }

  handleChangeSearchText = (e) => {
    store.setFilter('q', e.target.value)
  }

  handleSearchBtn = () => {
    this.pagination.apiDoFirstRequest()
  }

  handleExportBtn = () => {
    const time_config_id = this.props.location.query.time_config_id
    store.listExport(time_config_id).then(async (json) => {
      if (json.data.async === 1) {
        RightSideModal.render({
          children: <TaskList />,
          onHide: RightSideModal.hide,
          style: {
            width: '300px',
          },
        })
      } else {
        const { doExport } = await asyncImportExcel()
        const data = json.data.customer_weekdays_info
        const header = data.shift()
        const exportData = _.map(data, (item) => {
          return {
            [`${header[0]}`]: item[0],
            [`${header[1]}`]: item[1],
            [`${header[2]}`]: item[2],
          }
        })
        doExport([exportData], { fileName: json.data.file_name + '.xlsx' })
      }
    })
  }

  getCustomerList = (pagination) => {
    const time_config_id = this.props.location.query.time_config_id
    return store.getCustomerList(time_config_id, pagination)
  }

  handleEdit = (index) => {}

  render() {
    const {
      filter: { q },
      customerList: { list },
      loading,
      smmWeekdays,
    } = store
    const { time_config_id } = this.props.location.query
    const customers = list.slice()
    const receiveDays = convertNumber2Date(+smmWeekdays)

    return (
      <div>
        <Box hasGap>
          <Form inline onSubmit={this.handleSearchBtn}>
            <FormItem col={1}>
              <input
                ref={(ref) => {
                  this.search_text = ref
                }}
                type='text'
                placeholder={i18next.t('输入商户名，商户ID搜索')}
                value={q}
                onChange={this.handleChangeSearchText}
              />
            </FormItem>
            <FormButton>
              <Button type='primary' htmlType='submit'>
                {i18next.t('搜索')}
              </Button>
              &nbsp;&nbsp;
              <Button onClick={this.handleExportBtn}>
                {i18next.t('导出')}
              </Button>
            </FormButton>
          </Form>
        </Box>
        <BoxTable
          info={
            <BoxTable.Info>
              <TableTotalText
                data={[
                  {
                    label: i18next.t('当前运营时间'),
                    content: time_config_id,
                  },
                  {
                    label: i18next.t('可选收货日'),
                    content: _.join(_.map(receiveDays, 'name'), '，'),
                  },
                ]}
              />
            </BoxTable.Info>
          }
        >
          <ManagePaginationV2
            id='pagination_in_service_time_receive_days_list'
            disablePage
            onRequest={this.getCustomerList}
            ref={(ref) => {
              this.pagination = ref
            }}
          >
            <div>
              <Table
                ref={(ref) => (this.table = ref)}
                loading={loading}
                data={customers}
                columns={[
                  {
                    Header: i18next.t('商户SID'),
                    accessor: 'address_id',
                    Cell: ({ original }) =>
                      `${convertNumber2Sid(original.address_id)}`,
                  },
                  {
                    Header: i18next.t('商户名'),
                    accessor: 'restaurant_name',
                  },
                  {
                    Header: i18next.t('可收货自然日'),
                    id: 'weekdays',
                    Cell: (row) => (
                      <EditContent
                        row={row}
                        time_config_id={time_config_id}
                        defaultReceiveDays={receiveDays}
                      />
                    ),
                  },
                ]}
              />
            </div>
          </ManagePaginationV2>
        </BoxTable>
      </div>
    )
  }
}

export default ReceiveDays
