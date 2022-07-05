import React from 'react'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import { Flex, Box } from '@gmfe/react'
import scheduleStore from './store'
import uiStyle from './ui_style'
import PurchaseOverviewTitle from '../../common/purchase_overview_title'
import SvgRefresh from '../../../../svg/refresh.svg'
import FourCornerBorder from 'common/components/four_corner_border'
import schedulePieEChartsHoc from 'common/components/customize_echarts/schedule_pie_echarts_hoc'
import BaseECharts from 'common/components/customize_echarts/base_echarts'
import CommonEmptySvg from '../../common/common_empty_svg'
import _ from 'lodash'

const SchedulePieECharts = schedulePieEChartsHoc(BaseECharts)

const SchedulePie = observer(() => {
  const { isFullScreen } = scheduleStore
  const { skus } = scheduleStore.merchandiseData

  const rowNum = Math.ceil(skus.length / 8)

  const currentSkuList = []

  _.times(rowNum, (index) => {
    const begin = index * 8
    const end = begin + 8
    currentSkuList[index] = skus.slice(begin, end)
  })

  return (
    <Flex column style={{ width: '100%' }}>
      {_.times(rowNum, (index) => {
        return (
          <SchedulePieECharts
            data={currentSkuList[index]}
            itemFieldName={{
              finishedFieldName: 'finished',
              totalFieldName: 'total',
              titleFieldName: 'name',
            }}
            showText={{
              finishedText: '已完成分拣数',
              unFinishedText: '未完成分拣数',
            }}
            isHalfColor
            isGradualChange={isFullScreen}
            titlePosition={{ bottom: '0' }}
            style={{ height: '120px', width: '100%' }}
          />
        )
      })}
    </Flex>
  )
})

@observer
class MerchandiseSchedule extends React.Component {
  // 当商品等于15时 显示换一批
  nextButtonContent = () => {
    const { isFullScreen } = scheduleStore
    const { skus } = scheduleStore.merchandiseData

    return (
      <div>
        {skus.length === 15 && !isFullScreen && (
          <Flex
            alignCenter
            className='gm-cursor text-primary'
            onClick={() => scheduleStore.getMerchandiseScheduleData()}
          >
            <span className='gm-margin-lr-5'>
              <SvgRefresh />
            </span>
            {i18next.t('换一批')}
          </Flex>
        )}
      </div>
    )
  }

  contentComponent = () => {
    const { isFullScreen } = scheduleStore
    const { skus } = scheduleStore.merchandiseData

    const rowNum = Math.ceil(skus.length / 8)
    const extraHeight = rowNum === 0 ? 0 : (rowNum - 1) * 120

    return (
      <Box
        ref={(ref) => {
          ref && scheduleStore.setMerchandiseRef(ref)
        }}
        style={{
          backgroundColor: uiStyle.getOrderBackgroundColor(isFullScreen),
        }}
        className='gm-padding-tb-10 gm-padding-lr-20'
      >
        <PurchaseOverviewTitle
          title={i18next.t('商品分拣进度')}
          type={!isFullScreen ? 'more' : 'fullScreen'}
          linkRoute='/supply_chain/sorting/detail?tab=0'
          linkText={i18next.t('查看更多')}
          leftChildren={this.nextButtonContent()}
        />
        <Flex
          alignCenter
          justifyCenter
          style={{
            backgroundColor: uiStyle.getMerchandiseBackgroundColor(
              isFullScreen
            ),
            marginTop: '10px',
            height: isFullScreen
              ? extraHeight + 160 + `px`
              : extraHeight + 120 + `px`,
          }}
        >
          {skus.length === 0 ? (
            <CommonEmptySvg
              text={i18next.t('没有更多数据了')}
              isFullScreen={isFullScreen}
            />
          ) : (
            <SchedulePie />
          )}
        </Flex>
      </Box>
    )
  }

  render() {
    const { isFullScreen } = scheduleStore

    return isFullScreen ? (
      <FourCornerBorder>{this.contentComponent()}</FourCornerBorder>
    ) : (
      this.contentComponent()
    )
  }
}

export default MerchandiseSchedule
