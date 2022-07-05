import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import {
  FormBlock,
  FormItem,
  Select,
  Option,
  FormButton,
  Cascader,
  MoreSelect,
  BoxForm,
  Button,
} from '@gmfe/react'
import { toJS } from 'mobx'
import _ from 'lodash'
import {
  ORDER_BOX_STATUS,
  BOX_TYPE,
  BOX_LABEL_PRINT_STATUS,
} from '../../../../common/enum'
import moment from 'moment'
import DateFilter from '../../../../common/components/date_range_filter'
import boxManageStore from '../box_manage_store'

@observer
class BoxManageListFilter extends React.Component {
  handleFilter = (filter) => {
    boxManageStore.filterChange(filter)
  }

  handleSearch = (e) => {
    e.preventDefault()
    boxManageStore.doFirstRequest()
  }

  handleDateFilterChangeOnce = (value) => {
    if (value.time_config_id) {
      this.handleSelectChange('time_config_id', value.time_config_id)
    } else if (value.begin && value.end) {
      this.handleDateChange(value.begin, value.end)
    }
  }

  handleDateChange = (begin, end) => {
    if (moment(begin).isAfter(moment(end))) {
      end = begin
    }
    this.handleFilter({ begin, end })
  }

  handleSelectChange(name, value) {
    this.handleFilter({ [name]: value })
  }

  handleRouteSelect = (selected) => {
    this.handleFilter({
      routeSelected: selected,
      route_id: selected ? selected.value : null,
    })
  }

  handleDriverChange = (carrier_id_and_driver_id) => {
    boxManageStore.driverSelect(carrier_id_and_driver_id)
  }

  handleInitFilter = () => {
    boxManageStore.initFilter()
  }

  render() {
    const {
      service_times,
      filter,
      routeList,
      carrierDriverList,
      carrier_id_and_driver_id,
    } = boxManageStore
    const {
      search,
      routeSelected,
      order_box_status,
      box_type,
      printed,
    } = filter
    const carrierDriverList2 = toJS(carrierDriverList)
    const dateFilerDataTotal = {
      dateFilterData: [
        {
          type: '2',
          name: '按运营周期',
          expand: true,
        },
      ],
      service_times: [...service_times.slice()],
    }

    return (
      <BoxForm
        btnPosition='left'
        labelWidth='100px'
        colWidth='360px'
        onSubmit={this.handleSearch}
      >
        <FormBlock col={2}>
          <DateFilter
            data={dateFilerDataTotal}
            filter={filter}
            onDateFilterChange={this.handleDateFilterChangeOnce}
            limitDates={null}
          />
          <FormItem label={i18next.t('搜索')}>
            <input
              name='search'
              value={search}
              onChange={(e) =>
                this.handleSelectChange(e.target.name, e.target.value)
              }
              placeholder={i18next.t('输入订单号、商户名、箱ID')}
            />
          </FormItem>
        </FormBlock>

        <BoxForm.More>
          <FormBlock col={3}>
            <FormItem label={i18next.t('线路筛选')}>
              <MoreSelect
                id='route'
                data={routeList.slice()}
                selected={routeSelected}
                onSelect={this.handleRouteSelect}
                renderListFilterType='pinyin'
                placeholder={i18next.t('全部线路')}
              />
            </FormItem>

            <FormItem label={i18next.t('司机筛选')}>
              <Cascader
                filtrable
                name='carrier_id_and_driver_id'
                data={carrierDriverList2}
                onChange={this.handleDriverChange}
                inputProps={{ placeholder: i18next.t('全部司机') }}
                value={carrier_id_and_driver_id.slice()}
              />
            </FormItem>

            <FormItem label={i18next.t('集包状态')}>
              <Select
                value={order_box_status}
                onChange={this.handleSelectChange.bind(
                  this,
                  'order_box_status'
                )}
              >
                {_.map(ORDER_BOX_STATUS, (s) => (
                  <Option key={s.value} value={s.value}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </FormItem>
            <FormItem label={i18next.t('装箱类型')}>
              <Select
                value={box_type}
                onChange={this.handleSelectChange.bind(this, 'box_type')}
              >
                {_.map(BOX_TYPE, (s) => (
                  <Option key={s.value} value={s.value}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </FormItem>

            <FormItem label={i18next.t('打印状态')}>
              <Select
                value={printed}
                onChange={this.handleSelectChange.bind(this, 'printed')}
              >
                {_.map(BOX_LABEL_PRINT_STATUS, (s) => (
                  <Option key={s.value} value={s.value}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </FormItem>
          </FormBlock>
        </BoxForm.More>

        <FormButton>
          <Button type='primary' htmlType='submit' onClick={this.handleSearch}>
            {i18next.t('搜索')}
          </Button>

          <BoxForm.More>
            <div className='gm-gap-10' />
            <Button onClick={this.handleInitFilter}>{i18next.t('重置')}</Button>
          </BoxForm.More>
        </FormButton>
      </BoxForm>
    )
  }
}

export default BoxManageListFilter
