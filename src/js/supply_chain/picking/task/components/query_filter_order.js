import { i18next } from 'gm-i18n'
import React, { Component } from 'react'
import {
  FormBlock,
  FormItem,
  BoxForm,
  Select,
  FormButton,
  Cascader,
  Option,
  Button,
  RightSideModal,
} from '@gmfe/react'
import TaskList from '../../../../task/task_list'
import _ from 'lodash'
import { FilterSearchSelect } from '@gmfe/react-deprecated'
import { Observer, observer } from 'mobx-react'
import { dateFilterData, filterStatusList } from 'common/enum'
import AreaSelect from 'common/components/area_select'
import store from '../store/store_order'
import PropTypes from 'prop-types'
import { toJS } from 'mobx'
import { pinYinFilter } from '@gm-common/tool'
import globalStore from 'stores/global'
import LimitDateFilter from './date_filter'
import { COMPONENT_TYPE_SELECT } from '../../../../common/enum'
import { Customize } from '../../../../common/components/customize'
import { parseCustomizeRadioList } from '../../../../common/util'

const More = BoxForm.More

@observer
class QueryFilter extends Component {
  handleChange = (v, k) => {
    let format = v
    if (k === 'search_text') {
      format = v.trim()
    }
    if (k === 'routeSelected') {
      if (v === null) {
        format = []
      } else if (v.length > 1 && v.find(({ id }) => id === 0)) {
        if (store.searchQuery.routeSelected.find(({ id }) => id === 0)) {
          format.shift()
        } else {
          format = [format.pop()]
        }
      }
    }
    store.changeSearchQuery({ [k]: format })
  }

  handleAreaChange = (idArr) => {
    let area_id = null
    let area_level = null
    if (idArr) {
      idArr = idArr && idArr.filter(Boolean)
      area_id = idArr.slice().pop()
      area_level = idArr.length - 1
    }

    store.changeSearchQuery({
      area_id,
      area_level,
    })
  }

  handlInputFilter = (list, query) => {
    return pinYinFilter(list, query, (route) => route.name)
  }

  areaReset = null
  reset = () => {
    this.areaReset()
    store.reset()
  }

  search = () => {
    store.resetPagination()
    this.props.getData()
  }

  handleCustomizeInfoChange(key, value) {
    const customizedField = {
      ...store.searchQuery.customized_field,
      [key]: value,
    }
    store.changeSearchQuery({ customized_field: customizedField })
  }

  // 参数
  formatQuery = () => {
    const {
      // 订单号、商户
      search_text,
      order_status,
      area_id,
      area_level,
      routeSelected,
      carrier_id_and_driver_id,
      sort_remark,
      detail_customized_field,
      customized_field,
    } = store.searchQuery
    const { limit, offset } = store.pagination
    return {
      export: 1,
      search_text,
      limit,
      offset,
      carrier_id: carrier_id_and_driver_id[0] || null,
      driver_id: carrier_id_and_driver_id[1] || null,
      route_ids: routeSelected.length
        ? JSON.stringify(
            routeSelected.reduce((res, r) => {
              if (r.id !== 0) {
                res.push(r.id)
              }
              return res
            }, []),
          )
        : null,
      order_status: order_status || null,
      area_id,
      area_level,
      sort_remark: sort_remark || null,
      customized_field: _.keys(customized_field).length
        ? JSON.stringify(customized_field)
        : null,
      detail_customized_field: _.keys(detail_customized_field).length
        ? JSON.stringify(detail_customized_field)
        : null,
    }
  }

  handleExport = () => {
    const data = this.formatQuery()
    data.export = 1
    store.handleExport(data).then((json) => {
      if (json.data.async === 1) {
        RightSideModal.render({
          children: <TaskList tabKey={0} />,
          onHide: RightSideModal.hide,
          style: {
            width: '300px',
          },
        })
      }
    })
  }

  handleCustomizeDetailChange(key, value) {
    const customizedField = {
      ...store.searchQuery.detail_customized_field,
      [key]: value,
    }
    store.changeSearchQuery({ detail_customized_field: customizedField })
  }

  render() {
    const {
      searchQuery,
      routeList,
      carrierDriverList,
      sortRemarkList,
      service_times,
    } = store
    const {
      search_text,
      order_status,
      dateType,
      begin,
      end,
      time_config_id,
      routeSelected,
      carrier_id_and_driver_id,
      sort_remark,
      customized_field,
    } = searchQuery
    const dateFilerDataTotal = {
      dateFilterData: [...dateFilterData],
      service_times: [...service_times],
    }
    const infoConfigs = globalStore.customizedInfoConfigs.filter(
      (v) =>
        v.permission.read_station_picking &&
        v.field_type === COMPONENT_TYPE_SELECT,
    )

    return (
      <BoxForm
        btnPosition='left'
        labelWidth='100px'
        colWidth='360px'
        hasButtonInGroup
        // eslint-disable-next-line
        onSubmit={this.search}
      >
        <FormBlock col={3}>
          <LimitDateFilter
            type='order'
            data={dateFilerDataTotal}
            filter={{ dateType, begin, end, time_config_id }}
          />
          <FormItem label={i18next.t('搜索')}>
            <input
              value={search_text}
              onChange={(e) => this.handleChange(e.target.value, 'search_text')}
              placeholder={i18next.t('输入订单号、商户信息搜索')}
            />
          </FormItem>
        </FormBlock>

        <More>
          <FormBlock col={3}>
            <FormItem label={i18next.t('订单状态')}>
              <Select
                style={{ minWidth: '120px' }}
                value={order_status}
                data={filterStatusList.map((v) => ({
                  value: v.id,
                  text: v.name,
                }))}
                onChange={(v) => this.handleChange(v, 'order_status')}
              />
            </FormItem>
            <FormItem label={i18next.t('地理标签')}>
              <AreaSelect
                reset={(v) => (this.areaReset = v)}
                onSelect={this.handleAreaChange}
              />
            </FormItem>
            <FormItem label={i18next.t('线路筛选')}>
              <FilterSearchSelect
                // eslint-disable-next-line
                onFilter={this.handlInputFilter}
                selected={routeSelected.slice()}
                list={routeList.slice()}
                onSelect={(v) => this.handleChange(v, 'routeSelected')}
                multiple
                className='gm-margin-left-5 gm-inline-block'
                placeholder={routeSelected.slice().length ? '' : '选择线路'}
              />
            </FormItem>
            <FormItem label={i18next.t('司机筛选')}>
              <Cascader
                filtrable
                data={toJS(carrierDriverList)}
                onChange={(v) =>
                  this.handleChange(v, 'carrier_id_and_driver_id')
                }
                inputProps={{ placeholder: i18next.t('全部司机') }}
                value={carrier_id_and_driver_id.slice()}
              />
            </FormItem>
            <FormItem label={i18next.t('分拣备注')}>
              <Select
                style={{ minWidth: '120px' }}
                value={sort_remark}
                onChange={(v) => this.handleChange(v, 'sort_remark')}
              >
                <Option value={0}>{i18next.t('全部分拣备注')}</Option>
                {sortRemarkList.map((v) => (
                  <Option value={v} key={v}>
                    {v}
                  </Option>
                ))}
              </Select>
            </FormItem>
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
          </FormBlock>
        </More>

        <FormButton>
          <Button type='primary' htmlType='submit'>
            {i18next.t('搜索')}
          </Button>
          <BoxForm.More>
            <div className='gm-gap-10' />
            <Button onClick={this.reset}>{i18next.t('重置')}</Button>
          </BoxForm.More>
          <div className='gm-gap-10' />
          <Button onClick={this.handleExport}>{i18next.t('导出')}</Button>
        </FormButton>
      </BoxForm>
    )
  }
}

QueryFilter.propTypes = {
  getData: PropTypes.func.isRequired,
}

export default QueryFilter
