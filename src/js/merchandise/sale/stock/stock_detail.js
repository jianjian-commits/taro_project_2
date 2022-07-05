import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import {
  Sheet,
  SheetColumn,
  Pagination,
  PaginationText,
  DateRangePicker,
  Button,
} from '@gmfe/react'
import { QuickPanel, QuickFilter } from '@gmfe/react-deprecated'
import moment from 'moment'

import store from './store'

import { urlToParams } from '../../../common/util'

@observer
class StockDetail extends React.Component {
  constructor() {
    super()

    this.state = {
      start_time: new Date(),
      end_time: new Date(),
      pagination: { offset: 0, limit: 10 },
    }

    this.handleSearch = ::this.handleSearch
    this.handleExport = ::this.handleExport
    this.handlePageChange = ::this.handlePageChange
    this.handleChangeDate = ::this.handleChangeDate
  }

  componentDidMount() {
    const { query } = this.props.location
    const req = {
      start_time: moment(new Date()).format('YYYY-MM-DD'),
      end_time: moment(new Date()).format('YYYY-MM-DD'),
      offset: 0,
      limit: 10,
      sku_id: query.sku_id,
    }

    store.getStockDetail(req).then(() => {
      this.setState({ pagination: { offset: 0, limit: 10 } })
    })
  }

  handleSearch(e) {
    e.preventDefault()
    const { query } = this.props.location
    const { start_time, end_time } = this.state
    const req = {
      start_time: moment(start_time).format('YYYY-MM-DD'),
      end_time: moment(end_time).format('YYYY-MM-DD'),
      offset: 0,
      limit: 10,
      sku_id: query.sku_id,
    }
    store.getStockDetail(req).then(() => {
      this.setState({ pagination: { offset: 0, limit: 10 } })
    })
  }

  handleExport(e) {
    e.preventDefault()
    const { query } = this.props.location
    const { start_time, end_time } = this.state
    const req = {
      start_time: moment(start_time).format('YYYY-MM-DD'),
      end_time: moment(end_time).format('YYYY-MM-DD'),
      sku_id: query.sku_id,
    }

    window.open(`/product/stocks/flow?export=1&${urlToParams(req)}`)
  }

  handlePageChange(page) {
    const { query } = this.props.location
    const { start_time, end_time } = this.state
    const req = Object.assign(
      {},
      {
        start_time: moment(start_time).format('YYYY-MM-DD'),
        end_time: moment(end_time).format('YYYY-MM-DD'),
      },
      page,
      { sku_id: query.sku_id }
    )

    store.getStockDetail(req).then(() => {
      this.setState({ pagination: page })
    })
  }

  handleChangeDate(begin, end) {
    this.setState({
      start_time: begin,
      end_time: end,
    })
  }

  render() {
    const { start_time, end_time, pagination } = this.state
    const { sku_id, name, ratio } = this.props.location.query
    const { stockDetailList } = store

    return (
      <div>
        <QuickFilter>
          <form className='form-inline' onSubmit={this.handleSearch}>
            <div className='form-group'>
              <span>{i18next.t('按日期')}</span>
              <DateRangePicker
                begin={start_time}
                end={end_time}
                onChange={this.handleChangeDate}
              />
            </div>
            <div className='gm-gap-10' />
            <div className='form-group'>
              <Button type='primary' htmlType='submit'>
                {i18next.t('搜索')}
              </Button>
            </div>
            <div className='gm-gap-10' />
            <div className='form-group'>
              <Button onClick={this.handleExport}>{i18next.t('导出')}</Button>
            </div>
          </form>
        </QuickFilter>
        <QuickPanel
          icon='bill'
          title={
            i18next.t('商品信息') +
            ':' +
            name +
            '(' +
            sku_id +
            ',' +
            ratio +
            ')'
          }
        >
          <Sheet list={stockDetailList} loading={false} enableEmptyTip>
            <SheetColumn field='create_time' name={i18next.t('操作时间')}>
              {(create_time) => {
                return moment(create_time).format('YYYY-MM-DD HH:mm')
              }}
            </SheetColumn>
            <SheetColumn field='old_stocks' name={i18next.t('变动前库存')}>
              {(old_stocks, index) => {
                return old_stocks === '-'
                  ? old_stocks
                  : old_stocks + stockDetailList[index].sale_unit_name
              }}
            </SheetColumn>
            <SheetColumn field='new_stocks' name={i18next.t('变动后库存')}>
              {(new_stocks, index) => {
                return new_stocks === '-'
                  ? new_stocks
                  : new_stocks + stockDetailList[index].sale_unit_name
              }}
            </SheetColumn>
            <SheetColumn field='flow_detail' name={i18next.t('库存明细')} />
            <Pagination
              data={pagination}
              toPage={this.handlePageChange}
              nextDisabled={stockDetailList.length < 10}
            />
            <PaginationText data={pagination} />
          </Sheet>
        </QuickPanel>
      </div>
    )
  }
}

export default StockDetail
