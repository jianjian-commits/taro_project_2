import React from 'react'
import { t } from 'gm-i18n'
import { Price } from '@gmfe/react'
import { observer } from 'mobx-react'
import moment from 'moment'

import Panel from 'common/components/report/panel'
import BaseECharts from 'common/components/customize_echarts/base_echarts'
import lineEChartsHoc from 'common/components/customize_echarts/line_echarts_hoc'
import { detailStore as store } from '../../store'

const LineECharts = lineEChartsHoc(BaseECharts)

const DetailPanel = observer(() => {
  const { start_time, end_time, fee_type } = store.detail
  const start_time_str = moment(start_time).format('YYYY-MM-DD')
  const end_time_str = moment(end_time).format('YYYY-MM-DD')

  return (
    <Panel title={`${t('销售单价趋势')}(${start_time_str}~${end_time_str})`}>
      <LineECharts
        data={store.summaryList}
        axisGroup={[{ x: 'date', y: 'price' }]}
        axisGroupName={[t('销售单价')]}
        axisName={{
          x: t('日期/天'),
          y: `${t('基本单位单价')}(${Price.getUnit(fee_type)})`,
        }}
        fillAndFormatDate={{
          begin: start_time,
          end: end_time,
          fillItemName: 'date',
          dateFormatType: 'MM-DD',
        }}
        style={{ height: '381px', width: '100%' }}
        hasNoData={!store.summaryList.length}
        customOption={{
          mainColor: ['#007EFF'],
        }}
        onSetCustomOption={(option) => ({
          ...option,
          grid: {
            ...option.grid,
            left: '50px',
            right: '5%',
            bottom: '45px',
          },
          legend: {
            ...option.legend,
            top: '10px',
          },
        })}
      />
    </Panel>
  )
})

export default DetailPanel
