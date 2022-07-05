import { t } from 'gm-i18n'
import React, { useState } from 'react'
import { Col, Row, Flex, Button } from '@gmfe/react'
import moment from 'moment'

import DateButton from 'common/components/report/date_button'
import AnalyseSkus from './analyse_skus'
import AnalyseMerchant from './analyse_merchant'
import { doExportReport } from '../util'
import globalStore from '../../../stores/global'

const SkuReport = props => {
  const [days, setDays] = useState(7)

  const handleChange = date => {
    setDays(date.value)
  }

  const handleOrdersReportExport = () => {
    const begin = moment()
      .subtract(days - 1, 'day')
      .format('YYYY-MM-DD')
    const end = moment().format('YYYY-MM-DD')

    // 沿用ma的商品分析导出接口，跟后台约定下面参数直接默认定义
    // 商品明细默认按规格名查看
    const aggregate_type = 1
    // 商品明细查看方式聚合默认为: 按站点，按商户，按每日
    const aggregate_list = [1, 2, 3]

    doExportReport(
      {
        start_time: begin,
        end_time: end,
        aggregate_type,
        aggregate_list: JSON.stringify(aggregate_list)
      },
      'sku'
    )
  }

  return (
    <>
      <Flex alignCenter height='50px' className='b-home-panel'>
        <Flex className='gm-text-16 gm-text-bold gm-margin-right-10'>
          {t('商品分析概况')}
        </Flex>
        <DateButton range={[1, 7, 15, 30]} onChange={handleChange} />
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
        <Col lg={12} md={24} sm={24}>
          {/* 分类统计 */}
          <AnalyseSkus days={days} />
        </Col>
        <Col lg={12} md={24} sm={24} className='b-home-bottom-right'>
          {/* 商户销量分布 */}
          <AnalyseMerchant days={days} />
        </Col>
      </Row>
    </>
  )
}

export default SkuReport
