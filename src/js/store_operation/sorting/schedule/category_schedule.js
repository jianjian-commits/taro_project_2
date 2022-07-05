import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { Box } from '@gmfe/react'
import scheduleStore from './store'
import _ from 'lodash'
import uiStyle from './ui_style'
import PurchaseOverviewTitle from '../../common/purchase_overview_title'
import FourCornerBorder from 'common/components/four_corner_border'
import barEChartsHoc from 'common/components/customize_echarts/bar_echarts_hoc'
import BaseECharts from 'common/components/customize_echarts/base_echarts'
const BarECharts = barEChartsHoc(BaseECharts)

@observer
class CategorySchedule extends React.Component {
  contentComponent = (mainList) => {
    const { isFullScreen } = scheduleStore

    return (
      <Box
        style={uiStyle.getQuickPanelStyle(scheduleStore.isFullScreen)}
        className='gm-padding-tb-10 gm-padding-lr-20'
      >
        <PurchaseOverviewTitle
          title={i18next.t('分类进度')}
          type={scheduleStore.isFullScreen ? 'fullScreen' : null}
        />
        <BarECharts
          data={mainList}
          axisGroup={[
            { y: 'unfinished_count', x: 'name', stack: 'schedule' },
            { y: 'out_of_stock_count', x: 'name', stack: 'schedule' },
            { y: 'finished_count', x: 'name', stack: 'schedule' },
          ]}
          isHorizontal={false}
          axisGroupName={[
            i18next.t('未完成任务数'),
            i18next.t('缺货任务数'),
            i18next.t('已完成任务数'),
          ]}
          axisName={{ y: i18next.t('任务数/个') }}
          customOption={{ mainColor: ['#515d74', '#FF4D1C', '#007eff'] }}
          style={{
            height: '490px',
            width: '100%',
            paddingTop: '18px',
            paddingBottom: '22px',
          }}
          onSetCustomOption={(option) => {
            return {
              ...option,
              grid: {
                ...option.grid,
                left: '8%',
                right: '5%',
                top: '68px',
                bottom: '24px',
              },
              yAxis: {
                ...option.yAxis,
                axisLine: {
                  ...option.yAxis.axisLine,
                  show: mainList.length === 0, // 没数据时显示，有数据时不显示
                },
                splitLine: {
                  ...option.yAxis.splitLine,
                  show: true,
                },
              },
            }
          }}
          hasNoData={mainList.length === 0}
          isGradualChange={isFullScreen}
        />
      </Box>
    )
  }

  render() {
    const { category_schedule } = scheduleStore.schedule

    // 种类超过7种，则剩下的所有种类都归为其他
    const sortList = _.orderBy(
      category_schedule.slice(),
      (c) => c.total_count,
      ['desc']
    )
    const mainList = _.sortBy(_.slice(sortList, 0, 7), (c) => c.total_count)
    if (sortList.length > 7) {
      let finished_count = 0
      let out_of_stock_count = 0
      let total_count = 0
      let unfinished_count = 0
      _.each(_.slice(sortList, 7, sortList.length), (o) => {
        finished_count += o.finished_count
        out_of_stock_count += o.out_of_stock_count
        total_count += o.total_count
        unfinished_count += o.unfinished_count
      })
      mainList.unshift({
        name: i18next.t('其他'),
        finished_count,
        out_of_stock_count,
        total_count,
        unfinished_count,
      })
    }

    return scheduleStore.isFullScreen ? (
      <FourCornerBorder>{this.contentComponent(mainList)}</FourCornerBorder>
    ) : (
      this.contentComponent(mainList)
    )
  }
}

export default CategorySchedule
