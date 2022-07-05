import { i18next } from 'gm-i18n'
import React from 'react'
import {
  FormItem,
  FormButton,
  MoreSelect,
  Cascader,
  FormBlock,
  BoxForm,
  Button,
  RightSideModal,
} from '@gmfe/react'
import store from './store'
import { observer } from 'mobx-react'
import DateFilter from '../../../common/components/date_range_filter'
import { toJS } from 'mobx'
import _ from 'lodash'
import { dateFilterData } from 'common/enum'
import { Request } from '@gm-common/request'
import moment from 'moment'
import { endDateRanger } from '../../../order/util'
import TaskList from '../../../task/task_list'

const formatTime = (date) => moment(date).format('MM月DD日 HH时mm分')

@observer
class SearchFilter extends React.Component {
  componentDidMount() {
    store.getDriverList()
    store.getRouteList()
  }

  handleSearch = () => {
    store.pagination && store.pagination.doFirstRequest()
  }

  handleExport = () => {
    Request('/station/point/reward_sku/exchange/export')
      .data({ ...store.getFilterParam, query_type: +store.filter.dateType })
      .get()
      .then(() => {
        RightSideModal.render({
          children: <TaskList />,
          onHide: RightSideModal.hide,
          style: {
            width: '300px',
          },
        })
      })
  }

  getJsonData = (list) => {
    return _.map(list, (item) => {
      return {
        [i18next.t('积分商品名')]: item.sku_name,
        [i18next.t('规格')]: item.sale_unit,
        [i18next.t('兑换数')]: item.quantity,
        [i18next.t('成本价')]: _.isNil(item.sku_cost) ? '-' : item.sku_cost,
        [i18next.t('订单号/分拣序号')]: item.order_id + '/' + item.sort_num,
        [i18next.t('司机')]: item.driver,
        [i18next.t('线路')]: item.route,
        [i18next.t('商户名')]: item.address_name,
        [i18next.t('收货时间')]:
          formatTime(item.receive_begin_time) +
          '～' +
          formatTime(item.receive_end_time),
      }
    })
  }

  disableDate = (d, { begin, end }) => {
    const { filter, serviceTime } = store
    const { dateType } = filter

    const maxEndConfig = _.maxBy(
      serviceTime,
      (serviceTime) => serviceTime.receive_time_limit.e_span_time
    )

    const dMax = endDateRanger(
      dateType,
      maxEndConfig &&
        maxEndConfig.receive_time_limit &&
        maxEndConfig.receive_time_limit.e_span_time,
      begin
    ).max
    const dMin = moment(begin).subtract(61, 'd')

    return !(+moment(d) <= +dMax && +moment(d) >= +dMin)
  }

  getCycleDateLimit = () => {
    const { filter, serviceTime } = store
    const { dateType, begin, time_config_id } = filter

    const maxEndConfig = _.maxBy(
      serviceTime,
      (serviceTime) => serviceTime.receive_time_limit.e_span_time
    )

    const endProps = endDateRanger(
      dateType,
      maxEndConfig &&
        maxEndConfig.receive_time_limit &&
        maxEndConfig.receive_time_limit.e_span_time,
      begin
    )

    let maxSpanEnd = null

    // 按运营周期
    if (dateType === '2') {
      const currentServiceTime = _.find(
        serviceTime,
        (s) => s._id === time_config_id
      )
      maxSpanEnd =
        currentServiceTime && currentServiceTime.receive_time_limit.e_span_time
    }

    const beginMax = moment().add(maxSpanEnd, 'd')
    const beginProps = { max: beginMax }

    return { beginProps, endProps }
  }

  render() {
    const { filter, routeList, carrierDriverList, serviceTime } = store
    const { carrier_id_and_driver_id, search_text, routeSelected } = filter

    const dateFilerDataTotal = {
      dateFilterData: [...dateFilterData],
      service_times: [...serviceTime.slice()],
    }

    const limitDates = [
      this.disableDate,
      this.getCycleDateLimit,
      this.disableDate,
    ]

    return (
      <BoxForm
        btnPosition='left'
        onSubmit={this.handleSearch}
        labelWidth='96px'
      >
        <FormBlock col={3}>
          <DateFilter
            data={dateFilerDataTotal}
            filter={filter}
            onDateFilterChange={(value) => store.setFilter(value)}
            limitDates={limitDates}
          />
          <FormItem label={i18next.t('搜索')} col={1}>
            <input
              type='text'
              className='form-control'
              placeholder={i18next.t('输入订单号、商户名或商品名称搜索')}
              value={search_text}
              onChange={(e) => store.setFilter({ search_text: e.target.value })}
            />
          </FormItem>
        </FormBlock>
        <BoxForm.More>
          <FormBlock col={3}>
            <FormItem label={i18next.t('线路筛选')}>
              <div style={{ minWidth: '120px' }}>
                <MoreSelect
                  data={routeList.slice()}
                  selected={routeSelected}
                  onSelect={(selected) =>
                    store.setFilter({ routeSelected: selected })
                  }
                  renderListFilterType='pinyin'
                />
              </div>
            </FormItem>
            <FormItem label={i18next.t('司机筛选')}>
              <Cascader
                filtrable
                name='carrier_id_and_driver_id'
                data={toJS(carrierDriverList)}
                onChange={(selected) =>
                  store.setFilter({ carrier_id_and_driver_id: selected })
                }
                value={carrier_id_and_driver_id.slice()}
              />
            </FormItem>
          </FormBlock>
        </BoxForm.More>
        <FormButton>
          <Button htmlType='submit' type='primary'>
            {i18next.t('搜索')}
          </Button>
          <BoxForm.More>
            <div className='gm-gap-10' />
            <Button onClick={() => store.reset()}>{i18next.t('重置')}</Button>
          </BoxForm.More>
          <div className='gm-gap-10' />
          <Button onClick={this.handleExport}>{i18next.t('导出')}</Button>
        </FormButton>
      </BoxForm>
    )
  }
}

export default SearchFilter
