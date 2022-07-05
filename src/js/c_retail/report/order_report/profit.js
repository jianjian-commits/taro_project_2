import { t } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'

import Panel from 'common/components/report/panel'
import BaseECharts from 'common/components/customize_echarts/base_echarts'
import lineEChartsHoc from 'common/components/customize_echarts/line_echarts_hoc'

const LineECharts = lineEChartsHoc(BaseECharts)

const Profit = props => {
  const { lineChar } = props
  const { lists, begin, end } = lineChar

  return (
    <Panel title={t('销售额趋势')}>
      <LineECharts
        data={lists}
        axisGroup={[
          { x: 'date', y: 'order_price' },
          { x: 'date', y: 'outstock_price' },
          { x: 'date', y: 'account_price' },
          { x: 'date', y: 'account_price_exclude_freight' }
        ]}
        axisGroupName={[
          t('下单金额'),
          t('出库金额'),
          t('销售额（含运费）'),
          t('销售额（不含运费）')
        ]}
        fillAndFormatDate={{
          begin: begin,
          end: end,
          fillItemName: 'date',
          dateFormatType: 'MM-DD'
        }}
        style={{ height: '381px', width: '100%' }}
        hasNoData={!lists.length}
        customOption={{
          mainColor: ['#007EFF', '#10CE6E', '#F95A59', '#FFB822']
        }}
        onSetCustomOption={option => ({
          ...option,
          grid: {
            ...option.grid,
            left: '50px',
            right: '5%',
            bottom: '45px'
          },
          legend: {
            ...option.legend,
            top: '10px'
          }
        })}
      />
    </Panel>
  )
}

Profit.propTypes = {
  lineChar: PropTypes.object
}

export default Profit
