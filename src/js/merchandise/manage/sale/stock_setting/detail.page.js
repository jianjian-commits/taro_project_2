import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import store from './detail_store'
import globalStore from 'stores/global'
import moment from 'moment'
import { urlToParams } from 'common/util'
import {
  Box,
  BoxTable,
  Form,
  FormItem,
  FormButton,
  DateRangePicker,
  Pagination,
  Flex,
  Button,
} from '@gmfe/react'
import { Table } from '@gmfe/table'
import TableTotalText from 'common/components/table_total_text'

@observer
class StockSettingDetail extends React.Component {
  componentDidMount() {
    globalStore.setBreadcrumbs([i18next.t('库存设置')])
    store.getList(store.searchData, this.props.location.query.sku_id)
  }

  componentWillUnmount() {
    globalStore.setBreadcrumbs([])
  }

  handleSearch = () => {
    store.getList(store.searchData, this.props.location.query.sku_id)
  }

  handleExport = (e) => {
    e.preventDefault()
    const { begin, end } = store.filter
    const req = {
      start_time: moment(begin).format('YYYY-MM-DD'),
      end_time: moment(end).format('YYYY-MM-DD'),
      sku_id: this.props.location.query.sku_id,
    }

    window.open(`/product/stocks/flow?export=1&${urlToParams(req)}`)
  }

  handleChangeDate = (begin, end) => {
    store.changeFilter('begin', begin)
    store.changeFilter('end', end)
  }

  handlePageChange = (page) => {
    store.changePage(page)
    store.getList(store.searchData, this.props.location.query.sku_id)
  }

  render() {
    const {
      filter: { begin, end },
      list,
      pagination,
    } = store
    const { sku_id, name, ratio } = this.props.location.query
    return (
      <>
        <Box hasGap>
          <Form onSubmit={this.handleSearch} inline>
            <FormItem label={i18next.t('按日期')}>
              <DateRangePicker
                begin={begin}
                end={end}
                onChange={this.handleChangeDate}
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
        <BoxTable
          info={
            <BoxTable.Info>
              <TableTotalText
                data={[
                  {
                    label: name,
                    content: sku_id + ',' + ratio,
                  },
                ]}
              />
            </BoxTable.Info>
          }
        >
          <Table
            data={list.slice()}
            columns={[
              {
                Header: i18next.t('操作时间'),
                id: 'create_time',
                accessor: (d) =>
                  moment(d.create_time).format('YYYY-MM-DD HH:mm'),
              },
              {
                Header: i18next.t('变动前库存'),
                id: 'old_stocks',
                accessor: (d) =>
                  d.old_stocks === '-' ? '-' : d.old_stocks + d.sale_unit_name,
              },
              {
                Header: i18next.t('变动后库存'),
                id: 'new_stocks',
                accessor: (d) =>
                  d.new_stocks === '-' ? '-' : d.new_stocks + d.sale_unit_name,
              },
              {
                Header: i18next.t('库存明细'),
                accessor: 'flow_detail',
              },
            ]}
          />
          <Flex justifyEnd alignCenter className='gm-padding-20'>
            <Pagination data={pagination} toPage={this.handlePageChange} />
          </Flex>
        </BoxTable>
      </>
    )
  }
}

export default StockSettingDetail
