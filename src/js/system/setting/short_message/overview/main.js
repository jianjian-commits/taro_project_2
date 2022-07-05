import { i18next } from 'gm-i18n'
import React from 'react'
import { FormPanel } from '@gmfe/react'
import { observer } from 'mobx-react'
import store from './stores'
import BaseECharts from 'common/components/customize_echarts/base_echarts'
import lineEChartsHoc from 'common/components/customize_echarts/line_echarts_hoc'

const LineECharts = lineEChartsHoc(BaseECharts)

@observer
class OverviewMain extends React.Component {
  render() {
    const { overviewDetailList, dateRange } = store

    return (
      <FormPanel
        title={i18next.t('近30天发送统计')}
        className='gm-margin-lr-20'
      >
        <LineECharts
          data={overviewDetailList.slice()}
          axisGroup={[
            { x: 'send_date', y: 'total_send_nums' },
            { x: 'send_date', y: 'send_success_nums' },
          ]}
          axisGroupName={[i18next.t('发送量'), i18next.t('计费量')]}
          axisName={{
            y: i18next.t('单位/条'),
          }}
          fillAndFormatDate={{
            begin: dateRange.start_date,
            end: dateRange.end_date,
            fillItemName: 'send_date',
            dateFormatType: 'MM-DD',
          }}
          style={{ height: '460px', width: '100%' }}
          hasNoData={overviewDetailList.length === 0}
          onSetCustomOption={(option) => {
            return {
              ...option,
              grid: {
                ...option.grid,
                left: '40px',
                right: '40px',
              },
            }
          }}
        />
      </FormPanel>
    )
  }
}
export default OverviewMain
