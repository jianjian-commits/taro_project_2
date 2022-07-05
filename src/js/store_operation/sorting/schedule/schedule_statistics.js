import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { Box, Flex } from '@gmfe/react'
import scheduleStore from './store'
import uiStyle from './ui_style'
import _ from 'lodash'
import CommonVerticalLayout from '../../common/common_vertical_layout'
import FourCornerBorder from 'common/components/four_corner_border'

@observer
class ScheduleStatistics extends React.Component {
  contentComponet = (process) => {
    const { isFullScreen } = scheduleStore
    return (
      <Flex
        style={{
          height: uiStyle.getStatisticsHeight(isFullScreen, true),
        }}
      >
        {_.map(process, (item, i) => (
          <Flex flex={process.length} alignCenter>
            <CommonVerticalLayout
              name={item.name}
              value={item.value}
              color={item.color}
              key={i}
              className={item.className}
              numberClassName={isFullScreen ? item.numberClassName : null}
            />
            {i === 0 ? (
              <span
                style={{
                  height: '32px',
                  border: uiStyle.getStatisticsBorder(isFullScreen),
                }}
              />
            ) : null}
          </Flex>
        ))}
      </Flex>
    )
  }

  render() {
    const { isFullScreen, schedule } = scheduleStore
    const { total_schedule } = schedule
    const process = [
      {
        name: i18next.t('总任务数'),
        value: total_schedule.total_count,
        color: '#2993FF',
        numberClassName: 'b-full-screen-gradient-color-blue',
      },
      {
        name: i18next.t('已完成任务数'),
        value: total_schedule.finished_count,
        color: '#2993FF',
        numberClassName: 'b-full-screen-gradient-color-blue',
      },
      {
        name: i18next.t('缺货任务数'),
        value: total_schedule.out_of_stock_count,
        color: '#FF4D1C',
        numberClassName: 'b-full-screen-gradient-color-red',
      },
      {
        name: i18next.t('未完成任务数'),
        value: total_schedule.unfinished_count,
        color: '#FFBB00',
        numberClassName: 'b-full-screen-gradient-color-yellow',
      },
    ]

    const style = {
      background: uiStyle.getStatisticsBackgroundColor(
        scheduleStore.isFullScreen
      ),
      width: '100%',
    }

    return (
      <Box style={style}>
        {isFullScreen ? (
          <FourCornerBorder>{this.contentComponet(process)}</FourCornerBorder>
        ) : (
          this.contentComponet(process)
        )}
      </Box>
    )
  }
}

export default ScheduleStatistics
