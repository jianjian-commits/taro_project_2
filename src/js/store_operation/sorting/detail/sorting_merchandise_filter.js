import React from 'react'
import _ from 'lodash'
import { i18next } from 'gm-i18n'
import { Observer, observer } from 'mobx-react'
import {
  BoxForm,
  FormItem,
  FormBlock,
  FormButton,
  FilterSelect,
  Tip,
  Select,
  Option,
  Button,
} from '@gmfe/react'
import moment from 'moment'

import SoringRangeDatePicker from '../sorting_range_date_picker'
import merchandiseStore from './merchandise_store'
import store from '../store'
import CategoryPinleiFilter from '../../../common/components/category_filter_hoc'
import { COMPONENT_TYPE_SELECT, INSPECT_STATUS_SKU } from '../../../common/enum'
import OrderTypeSelector from '../../../common/components/order_type_selector'
import { Customize } from 'common/components/customize'
import globalStore from 'stores/global'
import { parseCustomizeRadioList } from '../../../common/util'

@observer
class SortingMerchandiseFilter extends React.Component {
  componentDidMount() {
    merchandiseStore.getSaleMenuList()
  }

  // 运营周期
  handleChangeTimeConfigId = (time_config_id) => {
    merchandiseStore.setFilter('time_config_id', time_config_id)
  }

  // 选择日期
  handleChangeDate = (begin, end) => {
    if (moment(begin).add(31, 'd').isBefore(end)) {
      Tip.warning(i18next.t('时间范围不能超过一个月'))
      return
    }
    merchandiseStore.setFilterDate(begin, end)
  }

  handleWithFilter = (list, query) => {
    return _.filter(list, (v) => v.name.indexOf(query) > -1)
  }

  handleFilterChange = (name, value) => {
    merchandiseStore.setFilter(name, value)
  }

  handleCustomizeInfoChange = (key, value) => {
    const customizedField = {
      ...merchandiseStore.merchandiseFilter.customized_field,
      [key]: value,
    }
    this.handleFilterChange('customized_field', customizedField)
  }

  handleCustomizeDetailChange = (key, value) => {
    const customizedField = {
      ...merchandiseStore.merchandiseFilter.detail_customized_field,
      [key]: value,
    }
    this.handleFilterChange('detail_customized_field', customizedField)
  }

  // 搜索
  handleSearch = () => {
    merchandiseStore.pagination && merchandiseStore.pagination.doFirstRequest()
  }

  render() {
    const { serviceTime } = store
    const { merchandiseFilter, salemenuList } = merchandiseStore
    const {
      start_date,
      end_date,
      time_config_id,
      search,
      categoryFilter,
      salemenuSelected,
      inspect_status,
      orderType,
      customized_field,
      detail_customized_field,
    } = merchandiseFilter
    const { isCStation } = globalStore.otherInfo
    const infoConfigs = globalStore.customizedInfoConfigs.filter(
      (v) =>
        v.permission.read_station_sorting &&
        v.field_type === COMPONENT_TYPE_SELECT,
    )
    const detailConfigs = globalStore.customizedDetailConfigs.filter(
      (v) =>
        v.permission.read_station_sorting &&
        v.field_type === COMPONENT_TYPE_SELECT,
    )

    return (
      <BoxForm
        labelWidth='90px'
        btnPosition='left'
        colWidth='350px'
        onSubmit={this.handleSearch}
      >
        <FormBlock col={3}>
          <FormItem col={2} label={i18next.t('按运营周期')}>
            <SoringRangeDatePicker
              begin={start_date}
              end={end_date}
              serviceTimes={serviceTime}
              timeConfigId={time_config_id}
              onChangeDate={this.handleChangeDate}
              onChangeTimeConfigId={this.handleChangeTimeConfigId}
            />
          </FormItem>
          <FormItem label={i18next.t('搜索')}>
            <input
              name='orderInput'
              value={search}
              onChange={(e) =>
                this.handleFilterChange('search', e.target.value)
              }
              placeholder={i18next.t('输入商品名、商品ID')}
            />
          </FormItem>
        </FormBlock>
        <BoxForm.More>
          <FormBlock col={3}>
            <FormItem col={2} label={i18next.t('商品筛选')}>
              <CategoryPinleiFilter
                selected={categoryFilter}
                onChange={(selected) =>
                  this.handleFilterChange('categoryFilter', selected)
                }
              />
            </FormItem>
            {!isCStation && (
              <FormItem label={i18next.t('报价单')}>
                <FilterSelect
                  id='salemenu_id'
                  list={salemenuList}
                  style={{ minWidth: '120px' }}
                  selected={salemenuSelected}
                  withFilter={this.handleWithFilter}
                  onSelect={(selected) =>
                    this.handleFilterChange('salemenuSelected', selected)
                  }
                  placeholder={i18next.t('全部报价单')}
                />
              </FormItem>
            )}
            <FormItem label={i18next.t('验货状态')}>
              <Select
                value={inspect_status}
                onChange={(status) =>
                  this.handleFilterChange('inspect_status', status)
                }
                style={{ minWidth: '120px' }}
              >
                {_.map(INSPECT_STATUS_SKU, (s) => (
                  <Option key={s.value} value={s.value}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </FormItem>
            {!isCStation && (
              <FormItem label={i18next.t('订单类型')}>
                <OrderTypeSelector
                  orderType={orderType}
                  onChange={(value) =>
                    this.handleFilterChange('orderType', value)
                  }
                />
              </FormItem>
            )}
            {_.map(infoConfigs, (v) => {
              const radioList = parseCustomizeRadioList(v.radio_list)
              return (
                <FormItem label={v.field_name}>
                  <Observer>
                    {() => (
                      <Customize
                        type={v.field_type}
                        value={customized_field[v.id]}
                        onChange={this.handleCustomizeInfoChange.bind(
                          this,
                          v.id,
                        )}
                        data={radioList}
                      />
                    )}
                  </Observer>
                </FormItem>
              )
            })}
            {_.map(detailConfigs, (v) => {
              const radioList = parseCustomizeRadioList(v.radio_list)
              return (
                <FormItem label={v.field_name}>
                  <Observer>
                    {() => (
                      <Customize
                        type={v.field_type}
                        value={detail_customized_field[v.id]}
                        onChange={this.handleCustomizeDetailChange.bind(
                          this,
                          v.id,
                        )}
                        data={radioList}
                      />
                    )}
                  </Observer>
                </FormItem>
              )
            })}
          </FormBlock>
        </BoxForm.More>
        <FormButton>
          <Button type='primary' htmlType='submit'>
            {i18next.t('搜索')}
          </Button>
          <BoxForm.More>
            <div className='gm-gap-10' />
            <Button onClick={() => merchandiseStore.reset()}>
              {i18next.t('重置')}
            </Button>
          </BoxForm.More>
        </FormButton>
      </BoxForm>
    )
  }
}

export default SortingMerchandiseFilter
