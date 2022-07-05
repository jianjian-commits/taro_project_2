import React from 'react'
import { observer } from 'mobx-react'
import { i18next } from 'gm-i18n'
import { Box, Button, Flex } from '@gmfe/react'
import _ from 'lodash'
import SortingRankRangePicker from './sorting_rank_range_date_picker'
import sorterStore from '../store'
import store from '../../../store'
import DBActionStorage from 'gm-service/src/action_storage'
import { cycleDateRangePickerInputValue } from '../../../../../common/filter'
import { getDateRangeByType } from 'common/util'

@observer
class SearchFilter extends React.Component {
  async componentDidMount() {
    await store.getServiceTime().then((serviceTime) => {
      // 运营周期默认取第一个
      const { time_config_id } = sorterStore.filter
      const { validateServiceTimeId } = DBActionStorage.helper
      validateServiceTimeId(time_config_id, serviceTime, (val) => {
        sorterStore.setFilter('time_config_id', val)
      })
    })
    sorterStore.getSorterRankData()
  }

  // 运营周期
  handleChangeTimeConfigId = (time_config_id) => {
    sorterStore.setFilter('time_config_id', time_config_id)
  }

  // 选择日期
  handleChangeDateRange = (dateRange) => {
    sorterStore.setFilter('begin_time', dateRange.begin_time)
    sorterStore.setFilter('end_time', dateRange.end_time)
    sorterStore.setFilter('type', dateRange.type)
  }

  renderDateRangePickerInputValue = () => {
    const { type, time_config_id } = sorterStore.filter
    const { serviceTime } = store
    const dateRange = getDateRangeByType(type)
    const time = _.find(serviceTime, (v) => v._id === time_config_id)
    return (
      cycleDateRangePickerInputValue(dateRange.begin_time, time) +
      '-' +
      cycleDateRangePickerInputValue(dateRange.end_time, time)
    )
  }

  handleSearch = () => {
    sorterStore.getSorterRankData()
  }

  render() {
    const { serviceTime } = store
    const { time_config_id, type } = sorterStore.filter
    return (
      <Box hasGap>
        <Flex>
          <Flex alignCenter>{i18next.t('按运营周期：')}</Flex>
          <SortingRankRangePicker
            rangeType={type}
            serviceTimes={serviceTime}
            timeConfigId={time_config_id}
            onChangeTimeConfigId={this.handleChangeTimeConfigId}
            onChangeRange={this.handleChangeDateRange}
            renderDate={this.renderDateRangePickerInputValue}
          />
          <Button
            type='primary'
            className='gm-margin-left-15'
            onClick={this.handleSearch}
          >
            {i18next.t('搜索')}
          </Button>
        </Flex>
      </Box>
    )
  }
}

export default SearchFilter
