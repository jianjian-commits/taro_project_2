import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import {
  Button,
  FormButton,
  FormItem,
  Form,
  BoxTable,
  Box,
  Select,
  DateRangePicker,
} from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { Table } from '@gmfe/table'
import TableTotalText from '../../../common/components/table_total_text'
import { emptyRender, formatPrice, formatDateTime } from '../../util'
import store from './store'
@observer
class Detail extends React.Component {
  componentDidMount() {
    const { location } = this.props
    store.initFilter(location.query)
    store.setPagination(this.pagination)
    this.pagination.apiDoFirstRequest()
  }

  handleSearch() {
    store.pagination.apiDoFirstRequest()
  }

  searchFilterRender = () => {
    const { operationType, handleFilterChange, filter } = store
    return (
      <Box hasGap>
        <Form inline onSubmit={this.handleSearch}>
          <FormItem label={i18next.t('按日期')}>
            <DateRangePicker
              begin={filter.start_date}
              end={filter.end_date}
              onChange={(begin, end) => {
                handleFilterChange('start_date', begin)
                handleFilterChange('end_date', end)
              }}
            />
          </FormItem>

          <FormItem label={i18next.t('操作类型')}>
            <Select
              value={filter.op_type}
              data={operationType}
              onChange={handleFilterChange.bind(this, 'op_type')}
            />
          </FormItem>

          {/* <FormItem label={i18next.t('搜索')}>
                <input
                  value={q}
                  onChange={(e) => {
                    handleFilterChange('q', e.target.value)
                  }}
                  className='form-control'
                  placeholder={i18next.t('输入商户名/商户ID/周转物名称搜索')}
                  style={{ width: '220px' }}
                />
              </FormItem> */}
          <FormButton>
            <Button type='primary' htmlType='submit'>
              {i18next.t('搜索')}
            </Button>
            <div className='gm-gap-10' />
            <Button onClick={store.handleExport}>{i18next.t('导出')}</Button>
          </FormButton>
        </Form>
      </Box>
    )
  }

  render() {
    const { materialDetail, getOperationType } = store
    const { op_list = [] } = materialDetail
    return (
      <div>
        {this.searchFilterRender()}
        <BoxTable
          info={
            <BoxTable.Info>
              <TableTotalText
                data={[
                  {
                    label: i18next.t('商户'),
                    content: materialDetail.sname,
                  },
                  {
                    label: i18next.t('商户ID'),
                    content: materialDetail.sid,
                  },
                  {
                    label: i18next.t('周转物'),
                    content: materialDetail.tname,
                  },
                ]}
              />
            </BoxTable.Info>
          }
        >
          <ManagePaginationV2
            id='pagination_in_material_manage_customer_detail_list'
            disablePage
            onRequest={store.fetchMaterialDetailList}
            ref={(pagination) => {
              this.pagination = pagination
            }}
          >
            <Table
              data={op_list.slice()}
              columns={[
                {
                  Header: i18next.t('操作时间'),
                  id: 'finish_time',
                  accessor: (d) => {
                    return (
                      <span>{emptyRender(d.finish_time, formatDateTime)}</span>
                    )
                  },
                },
                {
                  Header: i18next.t('关联单据'),
                  id: 'loan_sheet_id',
                  accessor: (d) => emptyRender(d.loan_sheet_id),
                },
                {
                  Header: i18next.t('操作类型'),
                  id: 'op_type',
                  accessor: (d) => {
                    const type = getOperationType(d.op_type)
                    return type.text
                  },
                },
                {
                  Header: i18next.t('变动数量'),
                  id: 'amount',
                  Cell: ({ original }) => {
                    // 借出 和 删除归还 为-
                    const sign =
                      original.op_type === 1 || original.op_type === 4
                        ? '-'
                        : '+'
                    return (
                      <div>
                        {sign + original.amount}
                        {materialDetail.unit_name}
                      </div>
                    )
                  },
                },
                {
                  Header: i18next.t('变动货值'),
                  id: 'price',
                  accessor: (d) => {
                    return formatPrice(d.price)
                  },
                },
                {
                  Header: i18next.t('司机'),
                  accessor: 'driver_name',
                },
              ]}
            />
          </ManagePaginationV2>
        </BoxTable>
      </div>
    )
  }
}
export default Detail
