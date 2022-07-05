import React from 'react'
import { observer } from 'mobx-react'
import { BoxForm, Button, Select, Flex } from '@gmfe/react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import store from '../store'
import DropDownDateFilter from 'common/components/drop_down_date_filter'
import { cycleDateRangePickerInputValue } from 'common/filter'
import { dateFilterData } from 'common/enum'
import { getDateRangeByType } from 'common/util'

const filterData = _.map(dateFilterData, (item) => ({
  value: item.type,
  text: item.name,
}))

@observer
class Filter extends React.Component {
  // 时间类型和运营时间选择
  handleSelectFilterChange = (value, key) => {
    store.setFilterValue(value, key)
  }

  handleSearch = () => {
    store.fetchList()
  }

  // 处理render展示的数据
  renderDateRangeInputValue = () => {
    const { time_config_id, dateType, dateRangeType } = store.filter
    const { serviceTimes } = store
    let renderInputValue = null
    const dateRange = getDateRangeByType(dateRangeType)
    if (dateType === '2' && time_config_id) {
      // 运营时间
      const time_config = _.find(serviceTimes, (v) => v._id === time_config_id)
      renderInputValue =
        cycleDateRangePickerInputValue(dateRange.begin_time, time_config) +
        '~' +
        cycleDateRangePickerInputValue(dateRange.end_time, time_config)
    } else {
      // 下单 || 收货时间
      renderInputValue = `${dateRange.begin_time}~${dateRange.end_time}`
    }

    return renderInputValue
  }

  // 选择时间段
  handleDateFilterChange = (obj) => {
    store.setDateFilterChange(obj)
  }

  render() {
    const { filter, serviceTimesSelectList } = store
    const { dateType, time_config_id, dateRangeType } = filter

    return (
      <BoxForm>
        <Flex>
          <Select
            clean
            data={filterData}
            value={dateType}
            onChange={(value) =>
              this.handleSelectFilterChange(value, 'dateType')
            }
          />
          {dateType === '2' && (
            <Select
              className='gm-margin-right-10'
              data={serviceTimesSelectList.slice()}
              value={time_config_id}
              onChange={(value) =>
                this.handleSelectFilterChange(value, 'time_config_id')
              }
            />
          )}
          <DropDownDateFilter
            type={dateRangeType}
            renderDate={this.renderDateRangeInputValue}
            onChange={this.handleDateFilterChange}
          />
        </Flex>

        <Button
          type='primary'
          className='gm-margin-left-10'
          onClick={this.handleSearch}
        >
          {t('搜索')}
        </Button>
      </BoxForm>
    )
  }
}

export default Filter
