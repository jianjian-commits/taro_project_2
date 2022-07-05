import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import {
  Form,
  Price,
  FormItem,
  FormButton,
  DateRangePicker,
  Select,
  Option,
  Button,
  Box,
  BoxTable,
} from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { Table } from '@gmfe/table'
import moment from 'moment'
import _ from 'lodash'
import { Store } from './store'
import { convertNumber2Sid } from 'common/filter'
import TableTotalText from 'common/components/table_total_text'

@observer
class MearchantGoodsDetail extends React.Component {
  paginationRef = React.createRef()

  constructor(props) {
    super(props)
    this.store = new Store(props.location.query)
  }

  componentDidMount() {
    this.store.setPagination(this.paginationRef.current)
    this.store.handleSearch()
  }

  getColumns() {
    return [
      {
        Header: i18next.t('操作时间'),
        accessor: 'op_time',
      },
      {
        Header: i18next.t('变动类型'),
        id: 'op_type',
        accessor: (d) => this.store.getOperationName(d.op_type),
      },
      {
        Header: i18next.t('变动数量'),
        id: 'delta_stock',
        accessor: (d) => d.delta_stock + d.std_unit_name,
      },
      {
        Header: i18next.t('单价'),
        id: 'std_unit_price',
        accessor: (d) =>
          d.std_unit_price + Price.getUnit() + '/' + d.std_unit_name,
      },
      {
        Header: i18next.t('金额'),
        id: 'amount',
        accessor: (d) => d.amount + Price.getUnit(),
      },
      {
        Header: i18next.t('变动前库存'),
        id: 'old_stock',
        accessor: (d) => d.old_stock + d.std_unit_name,
      },
      {
        Header: i18next.t('变动后库存'),
        id: 'stock',
        accessor: (d) => d.stock + d.std_unit_name,
      },
      {
        Header: i18next.t('操作人'),
        accessor: 'op_user',
      },
    ]
  }

  renderTitle() {
    const { summary } = this.store
    return (
      <TableTotalText
        data={[
          {
            label: i18next.t('商户'),
            content: summary.address_name,
          },
          {
            label: i18next.t('商户ID'),
            content: convertNumber2Sid(summary.address_id),
          },
          {
            label: i18next.t('商品'),
            content: summary.spu_name,
          },
          {
            label: i18next.t('商品ID'),
            content: summary.spu_id,
          },
          {
            label: i18next.t('库存'),
            content: summary.stock + summary.std_unit_name,
          },
          {
            label: i18next.t('货值'),
            content: summary.stock_value + Price.getUnit(),
          },
        ]}
      />
    )
  }

  disabledDate = (d, { begin, end }) => {
    const {
      filter: { start_time },
    } = this.store

    // begin && end 相差一个月
    if (+moment(start_time) === +moment(begin)) {
      return false
    } else {
      if (
        +moment(d) <= +moment(begin).add(1, 'month') &&
        +moment(d) >= +moment(begin).subtract(1, 'month')
      ) {
        return false
      }
      return true
    }
  }

  render() {
    const {
      operationTypes,
      filter: { start_time, end_time, op_type },
      fetchList,
      list,
      isLoading,
      handleFilterChange,
      handleSearch,
      handleExport,
    } = this.store

    return (
      <>
        <Box hasGap>
          <Form inline>
            <FormItem label={i18next.t('按日期')}>
              <DateRangePicker
                begin={start_time}
                end={end_time}
                disabledDate={this.disabledDate}
                onChange={(start_time, end_time) => {
                  handleFilterChange('start_time', start_time)
                  handleFilterChange('end_time', end_time)
                }}
              />
            </FormItem>
            <FormItem label={i18next.t('变动类型')}>
              <Select
                value={op_type}
                onChange={(val) => handleFilterChange('op_type', val)}
              >
                {_.map(operationTypes, ({ value, name }) => (
                  <Option key={value} value={value}>
                    {name}
                  </Option>
                ))}
              </Select>
            </FormItem>

            <FormButton>
              <Button type='primary' htmlType='submit' onClick={handleSearch}>
                {i18next.t('搜索')}
              </Button>
              <div className='gm-gap-10' />
              <Button onClick={handleExport}>{i18next.t('导出')}</Button>
            </FormButton>
          </Form>
        </Box>

        <BoxTable info={<BoxTable.Info>{this.renderTitle()}</BoxTable.Info>}>
          <ManagePaginationV2
            id='pagination_in_product_merchant_goods_detail_list'
            disablePage
            onRequest={fetchList}
            ref={this.paginationRef}
          >
            <Table
              loading={isLoading}
              data={list.slice()}
              columns={this.getColumns()}
            />
          </ManagePaginationV2>
        </BoxTable>
      </>
    )
  }
}

export default MearchantGoodsDetail
