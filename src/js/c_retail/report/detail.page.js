import React from 'react'
import { Col, Row } from '@gmfe/react'

import TodaySituation from './today_situation'
import OrderReport from './order_report'
import SkuReport from './sku_report'

class Report extends React.Component {
  render() {
    return (
      <Col
        style={{ backgroundColor: '#f6f7fb' }}
        className='gm-padding-lr-20 gm-padding-tb-10 b-home'
      >
        <Row>
          <Col lg={24} md={24} sm={24}>
            {/* 今日概况 */}
            <TodaySituation />
            {/** 订单分析概况 */}
            <OrderReport />
          </Col>
        </Row>
        <Col className='gm-padding-top-10'>
          {/** 商品分析概况 */}
          <SkuReport />
        </Col>
      </Col>
    )
  }
}

export default Report
