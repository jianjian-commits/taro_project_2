import { t } from 'gm-i18n'
import React, { useState, useEffect } from 'react'
import { Col, Row, Flex, Button } from '@gmfe/react'
import moment from 'moment'

import globalStore from '../../../stores/global'

import Profix from './profit'
import SummaryPanel from './summary_panel'
import DateButton from 'common/components/report/date_button'
import { doExportReport, fetchData } from '../util'

const initSummary = {
  sale_profit: '0.00',
  sale_profit_exclude_freight: '0.00',
  sale_profit_rate_exclude_freight: '-%',
  sale_profit_rate: '-%',
  account_price: '0.00',
  account_price_exclude_freight: '0.00',
}

const OrderReport = (props) => {
  const initLineChar = { lists: [], begin: '', end: '' }
  const [lineChar, setLineChar] = useState(initLineChar)
  const [summary, setSummary] = useState(initSummary)

  const setData = (days, begin, end) => {
    fetchData(days, 'profit').then((data) => {
      //  销售额趋势 ,单位是元
      setLineChar({
        begin,
        end,
        lists: data.date_detail_list || [],
      })
      const {
        sale_profit,
        sale_profit_exclude_freight,
        sale_profit_rate_exclude_freight,
        sale_profit_rate,
        account_price,
        account_price_exclude_freight,
      } = data
      setSummary({
        sale_profit,
        sale_profit_exclude_freight,
        sale_profit_rate_exclude_freight,
        sale_profit_rate,
        account_price,
        account_price_exclude_freight,
      })
    })
  }

  // 接口 -- toC返回结构与之前不同
  useEffect(() => {
    if (globalStore.otherInfo.authority.role === 6) return
    const begin = moment().subtract(6, 'day').format('YYYY-MM-DD')
    const end = moment().format('YYYY-MM-DD')
    setData(7, begin, end)
  }, [])

  const handleChange = (date) => {
    const begin = moment()
      .subtract(date.value - 1, 'day')
      .format('YYYY-MM-DD')
    const end = moment().format('YYYY-MM-DD')
    setData(date.value, begin, end)
  }

  const handleOrdersReportExport = () => {
    const { begin, end } = lineChar

    // 沿用ma的订单分析导出接口，跟后台约定下面参数直接默认定义
    // 订单明细查看方式聚合默认为: 按站点，按商户，按每日
    const aggregate_list = [1, 2, 3]
    doExportReport(
      {
        start_time: begin,
        end_time: end,
        aggregate_list: JSON.stringify(aggregate_list),
      },
      'order',
    )
  }

  return (
    <Col className='gm-margin-top-10' lg={24} md={24} sm={24}>
      <Flex alignCenter height='50px' className='b-home-panel'>
        <Flex className='gm-text-16 gm-text-bold gm-margin-right-10'>
          {t('订单分析概况')}
        </Flex>
        <DateButton range={[7, 15, 30]} onChange={handleChange} />
        {globalStore.hasPermission('export_operation_report') && (
          <Button
            className='gm-margin-left-10'
            onClick={handleOrdersReportExport}
          >
            {t('导出')}
          </Button>
        )}
      </Flex>
      <Row>
        <div style={{ flex: '2 1 40px' }}>
          {/* 销售额趋势 */}
          <Profix lineChar={lineChar} />
        </div>
        <div className='gm-flex-flex'>
          {/* 销售数据展示 */}
          <SummaryPanel summary={summary} />
        </div>
      </Row>
    </Col>
  )
}

export default OrderReport
