import React from 'react'
import { i18next } from 'gm-i18n'
import { DateRangePicker, Flex, RightSideModal, Button } from '@gmfe/react'
import _ from 'lodash'
import queryString from 'query-string'
import { Request } from '@gm-common/request'
import TaskList from '../task/task_list'

import moment from 'moment'

/**
 * @deprecated
 */
class CustomizeExport extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      invoicing_detail: {
        begin: moment(),
        end: moment(),
      },
      invoicing_total: {
        begin: moment(),
        end: moment(),
      },
      receipt_detail: {
        begin: moment(),
        end: moment(),
      },
      receipt_total: {
        begin: moment(),
        end: moment(),
      },
      ship_detail: {
        begin: moment(),
        end: moment(),
      },
      ship_tatal: {
        begin: moment(),
        end: moment(),
      },
    }
  }

  handleOnChange = (id, begin, end) => {
    this.setState({
      ...this.state,
      [id]: {
        ...this.state[id],
        begin,
        end,
      },
    })
  }

  handleExport = (item) => {
    const params = {
      customer_export: 1,
      customer_export_type: item.customer_export_type,
      view_type: item.view_type,
      begin: moment(this.state[item.id].begin).format('YYYY-MM-DD'), // 后台旧接口这两个字段不统一
      start: moment(this.state[item.id].begin).format('YYYY-MM-DD'),
      end: moment(this.state[item.id].end).format('YYYY-MM-DD'),
      type: 2,
      status: 2,
      limit: 99999,
    }
    if (item.id === 'invoicing_detail' || item.id === 'invoicing_total') {
      Request(item.path).data(params).get()
      RightSideModal.render({
        children: <TaskList />,
        onHide: RightSideModal.hide,
        style: {
          width: '300px',
        },
      })
      return
    }
    const url = `${item.path}?${queryString.stringify(params)}`
    window.open(url, '_self')
  }

  render() {
    const exportList = [
      {
        title: i18next.t('进销存明细表'),
        id: 'invoicing_detail',
        view_type: 1,
        path: 'report/value_export',
      },
      {
        title: i18next.t('进销存汇总表'),
        id: 'invoicing_total',
        view_type: 2,
        path: 'report/value_export',
      },
      {
        title: i18next.t('收货（入库）明细表'),
        id: 'receipt_detail',
        customer_export_type: 1,
        path: 'stock/in_stock_sku',
      },
      {
        title: i18next.t('收货汇总表'),
        id: 'receipt_total',
        customer_export_type: 2,
        path: 'stock/in_stock_sku',
      },
      {
        title: i18next.t('发货（出库成本）明细表'),
        id: 'ship_detail',
        path: 'stock/out_stock_sku',
      },
      {
        title: i18next.t('发货（出库成本）汇总表'),
        id: 'ship_tatal',
        path: 'stock/out_stock_sheet/list',
      },
    ]
    return (
      <div>
        {_.map(exportList, (item) => (
          <div key={item.title}>
            <h2>{item.title}</h2>
            <Flex>
              <DateRangePicker
                begin={this.state[item.id].begin}
                end={this.state[item.id].end}
                onChange={(begin, end) =>
                  this.handleOnChange(item.id, begin, end)
                }
              />
              <Button
                onClick={() => this.handleExport(item)}
                className='gm-margin-left-10'
              >
                {i18next.t('导出')}
              </Button>
            </Flex>
          </div>
        ))}
      </div>
    )
  }
}

export default CustomizeExport
