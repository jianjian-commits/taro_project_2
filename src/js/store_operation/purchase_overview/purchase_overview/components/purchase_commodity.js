import React from 'react'
import { Price, Box } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import Store from '../store'
import UiStyle from '../../ui_style'
import PurchaseOverviewTitle from '../../../common/purchase_overview_title'
import FourCornerBorder from 'common/components/four_corner_border'

import BaseECharts from 'common/components/customize_echarts/base_echarts'
import barEChartsHoc from 'common/components/customize_echarts/bar_echarts_hoc'

const BarECharts = barEChartsHoc(BaseECharts)

@observer
class PurchaseCommodity extends React.Component {
  contentComponent = () => {
    const { begin_time, end_time } = Store.purchaseFilter
    const { purchaseCommodity, isFullScreen } = Store

    return (
      <Box hasGap style={UiStyle.getModalBackgroundColor(isFullScreen)}>
        <PurchaseOverviewTitle
          title={i18next.t('采购商品TOP10')}
          style={isFullScreen ? { color: '#daeeff' } : ''}
          type={isFullScreen ? 'fullScreen' : 'more'}
          linkRoute={
            '/supply_chain/purchase/analysis?tab=0&begin_time=' +
            begin_time +
            '&end_time=' +
            end_time
          }
          linkText={i18next.t('查看更多')}
        />

        <BarECharts
          data={purchaseCommodity.slice().reverse()}
          axisGroup={[{ y: 'sku_name', x: 'purchase_sum_money' }]}
          axisGroupName={['实际采购金额']}
          axisName={{ x: i18next.t('金额') + `(${Price.getUnit()})` }}
          style={{ height: '408px', width: '100%', marginTop: '10px' }}
          isGradualChange={isFullScreen}
          customOption={{
            barWidth: '20px',
            linearGradientColor: [
              [
                {
                  offset: 0,
                  color: '#056aff',
                },
                {
                  offset: 1,
                  color: '#36f1fd',
                },
              ],
            ],
            linearGradientDirection: [0, 0, 1, 1],
          }}
          onSetCustomOption={(option) => {
            return {
              ...option,
              grid: {
                ...option.grid,
                left: '15%',
                right: '8%',
                bottom: '55px',
              },
              xAxis: isFullScreen
                ? {
                    ...option.xAxis,
                    nameTextStyle: {
                      color: '#657ca8', // x轴描述颜色('金额元')
                    },
                    axisLabel: {
                      color: '#657ca8', // x轴坐标值颜色
                    },
                    axisLine: {
                      lineStyle: {
                        color: '#173f82', // x轴颜色
                      },
                    },
                    splitLine: {
                      lineStyle: {
                        color: '#173f82', // 垂直x轴竖线颜色
                      },
                    },
                  }
                : option.xAxis,
              yAxis: isFullScreen
                ? {
                    ...option.yAxis,
                    axisLabel: {
                      color: '#657ca8', // y轴坐标值颜色
                    },
                    axisLine: {
                      lineStyle: {
                        color: '#173f82', // y轴颜色
                      },
                    },
                  }
                : option.yAxis,
              legend: isFullScreen
                ? {
                    ...option.legend,
                    textStyle: {
                      color: '#c3cad9',
                    },
                  }
                : option.legend,
            }
          }}
          hasNoData={purchaseCommodity.length === 0}
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

export default PurchaseCommodity
