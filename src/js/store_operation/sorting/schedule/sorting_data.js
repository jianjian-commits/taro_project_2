import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { Flex, Box } from '@gmfe/react'
import scheduleStore from './store'
import uiStyle from './ui_style'
import CommonVerticalLayout from '../../common/common_vertical_layout'
import FourCornerBorder from 'common/components/four_corner_border'

import globalStore from 'stores/global'

@observer
class SortingData extends React.Component {
  contentComponent = (sortDataList) => {
    return (
      <Flex
        style={{
          height: uiStyle.getStatisticsHeight(scheduleStore.isFullScreen, true),
        }}
      >
        {_.map(sortDataList, (item, i) => (
          <CommonVerticalLayout
            name={item.name}
            value={item.value}
            color={item.color}
            key={i}
            numberClassName={
              scheduleStore.isFullScreen ? item.numberClassName : null
            }
          />
        ))}
      </Flex>
    )
  }

  render() {
    const { sort_data } = scheduleStore.schedule
    const style = {
      background: uiStyle.getStatisticsBackgroundColor(
        scheduleStore.isFullScreen
      ),
      width: '100%',
    }
    if (scheduleStore.isFullScreen) {
      style.border = 'none'
    }
    const { isCStation } = globalStore.otherInfo

    const sortDataList = [
      {
        name: i18next.t('计重任务数'),
        value: sort_data.weight_count,
        color: '#515D74',
        numberClassName: 'b-full-screen-gradient-color-blue',
      },
      {
        name: i18next.t('商品种类数'),
        value: sort_data.sku_count,
        color: '#515D74',
        numberClassName: 'b-full-screen-gradient-color-blue',
      },
      {
        name: i18next.t('不计重任务数'),
        value: sort_data.unweight_count,
        color: '#515D74',
        numberClassName: 'b-full-screen-gradient-color-blue',
      },
      {
        name: isCStation ? i18next.t('客户数') : i18next.t('商户数'),
        value: sort_data.address_count,
        color: '#515D74',
        numberClassName: 'b-full-screen-gradient-color-blue',
      },
    ]

    return (
      <Box style={style}>
        {scheduleStore.isFullScreen ? (
          <FourCornerBorder>
            {this.contentComponent(sortDataList)}
          </FourCornerBorder>
        ) : (
          this.contentComponent(sortDataList)
        )}
      </Box>
    )
  }
}

export default SortingData
