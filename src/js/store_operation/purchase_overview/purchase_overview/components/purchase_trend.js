import React from 'react'
import { i18next } from 'gm-i18n'
import { Box } from '@gmfe/react'
import { observer } from 'mobx-react'
import Store from '../store'
import FourCornerBorder from 'common/components/four_corner_border'
import PurchaseOverviewTitle from '../../../common/purchase_overview_title'
import UiStyle from '../../ui_style'

import BaseECharts from 'common/components/customize_echarts/base_echarts'
import lineEChartsHoc from 'common/components/customize_echarts/line_echarts_hoc'

const LineECharts = lineEChartsHoc(BaseECharts)

@observer
class PurchaseTrend extends React.Component {
  contentComponent = () => {
    const { trend, purchaseFilter, isFullScreen } = Store
    const { begin_time, end_time } = purchaseFilter

    return (
      <Box hasGap style={UiStyle.getModalBackgroundColor(isFullScreen)}>
        <PurchaseOverviewTitle
          style={isFullScreen ? { color: '#daeeff' } : ''}
          title={i18next.t('采购趋势')}
          type={isFullScreen ? 'fullScreen' : ''}
        />
        {/* 组件用法 */}
        <LineECharts
          data={trend.slice()}
          axisGroup={[
            { x: 'date', y: 'plan_money' },
            { x: 'date', y: 'purchase_money' },
          ]}
          axisGroupName={[i18next.t('参考采购金额'), i18next.t('实际采购金额')]}
          axisName={{ x: i18next.t('日期/天'), y: i18next.t('金额/元') }}
          fillAndFormatDate={{
            begin: begin_time,
            end: end_time,
            fillItemName: 'date',
            dateFormatType: 'MM-DD',
          }}
          style={{
            height: '408px',
            width: '100%',
            marginTop: '10px',
          }}
          hasNoData={trend.length === 0}
          customOption={
            isFullScreen
              ? {
                  mainColor: ['#ee5d1f', '#2a90fc'], // 自定义折线的色值
                }
              : null
          }
          onSetCustomOption={
            isFullScreen
              ? (option) => ({
                  ...option,
                  title: {
                    ...option.title,
                    textStyle: {
                      color: '#657ca8', // 没数据时的文案颜色
                      fontSize: '12',
                    },
                  },
                  xAxis: {
                    ...option.xAxis,
                    axisLabel: {
                      color: '#657ca8', // x轴坐标值颜色
                    },
                    nameTextStyle: {
                      color: '#657ca8', // x轴描述颜色('日期/天')
                    },
                    axisLine: {
                      lineStyle: {
                        color: 'rgba(101,124,168, 0.7)',
                      },
                    }, // x轴颜色
                    splitLine: {
                      show: true,
                      lineStyle: {
                        color: 'rgba(101,124,168, 0.7)', // 网格竖线颜色
                      },
                    },
                  },
                  yAxis: {
                    ...option.yAxis,
                    axisLabel: {
                      color: '#657ca8',
                    },
                    nameTextStyle: {
                      color: '#657ca8',
                    },
                    axisLine: {
                      lineStyle: {
                        color: 'rgba(101,124,168, 0.7)',
                      },
                    },
                    splitLine: {
                      show: true,
                      lineStyle: {
                        color: 'rgba(101,124,168, 0.7)', // 网格横线颜色
                      },
                    },
                  },
                  legend: {
                    ...option.legend,
                    textStyle: {
                      color: '#c3cad9', // 参考采购金额文案颜色
                    },
                  },
                })
              : null
          }
        />
      </Box>
    )
  }

  render() {
    const { isFullScreen } = Store

    return isFullScreen ? (
      <FourCornerBorder>{this.contentComponent()}</FourCornerBorder>
    ) : (
      this.contentComponent()
    )
  }
}

export default PurchaseTrend
