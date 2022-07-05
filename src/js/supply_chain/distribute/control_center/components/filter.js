import React from 'react'
import { i18next } from 'gm-i18n'
import {
  Cascader,
  Box,
  Form,
  FormItem,
  Option,
  DatePicker,
  Select,
  Button,
} from '@gmfe/react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { toJS } from 'mobx'
import { searchDateTypes } from '../../../../common/enum'
import { inject, observer } from 'mobx-react'
import SoringDatePicker from '../../../../store_operation/sorting/sorting_date_picker'

@inject('store')
@observer
class Filter extends React.Component {
  componentDidMount() {
    this.props.store.fetchData()
  }

  handleSearch = () => {
    this.props.store.fetchData()
  }

  setFilter(key, value) {
    this.props.store.setFilter(key, value)
  }

  renderDatePick = () => {
    const {
      filter: { date_type, start_time, time_config_id, cycle_start_time },
      service_times,
    } = this.props.store

    switch (date_type) {
      case '2':
        return (
          <SoringDatePicker
            date={cycle_start_time}
            serviceTimes={service_times.slice()}
            timeConfigId={time_config_id}
            onChangeDate={this.setFilter.bind(this, 'cycle_start_time')}
            onChangeTimeConfigId={this.setFilter.bind(this, 'time_config_id')}
          />
        )
      default:
        return (
          <DatePicker
            date={start_time}
            onChange={this.setFilter.bind(this, 'start_time')}
          />
        )
    }
  }

  render() {
    const {
      filter: { date_type, search, carrier_id_and_driver_id },
      carrierDriverList,
    } = this.props.store

    return (
      <Box hasGap>
        <Form inline onSubmit={this.handleSearch} colWidth='300px'>
          <Select
            clean
            name='date_type'
            onChange={this.setFilter.bind(this, 'date_type')}
            value={date_type}
            className='b-filter-select-clean-time'
          >
            {_.map(searchDateTypes, (dateType, type) => (
              <Option value={dateType.type} key={type}>
                {dateType.name}
              </Option>
            ))}
          </Select>
          {this.renderDatePick()}
          <div className='gm-gap-10' />
          <FormItem label={i18next.t('搜索')}>
            <input
              type='text'
              placeholder={i18next.t('请输入订单号')}
              value={search}
              onChange={(e) => this.setFilter('search', e.target.value)}
            />
          </FormItem>
          <FormItem label={i18next.t('司机筛选')}>
            <Cascader
              filtrable
              name='carrier_id_and_driver_id'
              data={toJS(carrierDriverList)}
              onChange={this.setFilter.bind(this, 'carrier_id_and_driver_id')}
              value={carrier_id_and_driver_id.slice()}
            />
          </FormItem>
          <Button type='primary' htmlType='submit'>
            {i18next.t('搜索')}
          </Button>
        </Form>
      </Box>
    )
  }
}

Filter.propTypes = {
  store: PropTypes.object,
}

export default Filter
