import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex } from '@gmfe/react'
import { QuickPanel, QuickFilter } from '@gmfe/react-deprecated'
import _ from 'lodash'
import ServiceTimeItem from '../common/service_time_item/index'
import { returnDateByFlag } from '../../common/filter'
import SortingListTable from './components/sorting.list.table'
import SortingDetail from './components/sorting.detail'
import ClassNames from 'classnames'
import './reducer'
import './actions'
import actions from '../../actions'
import moment from 'moment'
import globalStore from '../../stores/global'

class SortingList extends React.Component {
  constructor(props) {
    super(props)
    this.renderServiceTimePanel = ::this.renderServiceTimePanel
    this.handleSelectValueChange = ::this.handleSelectValueChange
    this.handleChangeContainerOuter = ::this.handleChangeContainerOuter
    this.handleClickDetail = ::this.handleClickDetail
    this.handleClickBack = ::this.handleClickBack
    this.handleClickTheBatch = ::this.handleClickTheBatch
    this.getSortingList = ::this.getSortingList
    this.state = {
      detail: [], // 要打印的分拣详情数据
      detailModuleHidden: true, // 时候显示分拣详情
    }
  }

  async componentDidMount() {
    const { location } = this.props
    const query = {
      cycle_days: 2,
      id: location.query.service_time,
    }
    // 获取服务时间
    await actions.sorting_get_service_time()

    // 获取任务周期
    await actions.sorting_get_task_cycle(query)

    // 获取分拣列表
    this.getSortingList()
  }

  // 点击返回行为处理
  handleClickBack() {
    // 清空detail数据,隐藏SortingDetail组件,显示服务时间分拣列表
    this.setState({
      detail: [],
      detailModuleHidden: true,
    })
  }

  // 点击sheet列表中详情行为处理: 隐藏服务时间分拣列表,渲染分拣详情
  handleClickDetail(listId) {
    const { sorting } = this.props
    const detail = sorting.dataByCategory[listId - 1]
    this.setState({
      detail: detail,
      detailModuleHidden: false,
    })
  }

  // 改变开始任务周期行为处理
  async handleSelectValueChange(e) {
    actions.sorting_change_loading(true)
    await actions.sorting_change_cycle_selected(e.target.value)
    this.getSortingList()
  }

  // 改变是否包含出库行为处理
  async handleChangeContainerOuter() {
    const checked = this.containOuter.checked
    actions.sorting_change_loading(true)
    await actions.sorting_change_contain_outer(checked)
    this.getSortingList()
  }

  // 选择批次
  async handleClickTheBatch(batch) {
    const { sorting, location } = this.props
    // 获取station id
    const cycleSelected = sorting.cycleSelected - 1
    const query = {
      station_id: globalStore.stationId,
      batch: batch,
      time_config_id: location.query.service_time,
      cycle_start_time: moment(
        sorting.cycle[cycleSelected].cycle_start_time
      ).format('YYYY-MM-DD-HH-mm-ss'),
    }
    actions.sorting_change_loading(true)
    await actions.sorting_active_the_batch(query)

    // 主动重新请求数据
    this.getSortingList()
  }

  async getSortingList() {
    const { sorting, location } = this.props
    const cycleSelected = sorting.cycleSelected - 1
    // 通过任务周期和出库情况请求数据
    if (sorting.cycle[0]) {
      const newQuery = {
        station_id: globalStore.stationId,
        time_config_id: location.query.service_time,
        cycle_start_time: moment(
          sorting.cycle[cycleSelected].cycle_start_time
        ).format('YYYY-MM-DD-HH-mm-ss'),
        out_stock_filter: sorting.containOuter,
      }

      await actions.sorting_get_sorting_list(newQuery)
    }

    await actions.sorting_change_loading(false)
  }

  // 渲染服务时间
  renderServiceTimePanel() {
    const { location, sorting } = this.props
    const id = location.query.service_time
    const serviceTime = sorting.serviceTime
    let serviceTimePanel = <ServiceTimeItem next={false} />
    for (let i = 0; i < serviceTime.length; i++) {
      if (serviceTime[i]._id === id) {
        const value = serviceTime[i]
        const itemName = value.name
        // 下单时间
        const orderTime = i18next.t('KEY242', {
          VAR1: value.order_time_limit.start,
          VAR2: returnDateByFlag(value.order_time_limit.e_span_time),
          VAR3: value.order_time_limit.end,
        })
        // 配送时间
        const deliveryTime =
          returnDateByFlag(value.receive_time_limit.s_span_time) +
          (value.type !== 2 ? value.receive_time_limit.start : '') +
          '~' +
          returnDateByFlag(value.receive_time_limit.e_span_time) +
          (value.type !== 2 ? value.receive_time_limit.end : '')
        // 出库时间
        const distributionTime =
          value.type !== 2
            ? returnDateByFlag(value.final_distribute_time_span) +
              value.final_distribute_time
            : null
        // 新任务开启时间
        const newTaskTime = value.task_begin_time

        serviceTimePanel = (
          <ServiceTimeItem
            itemId={id}
            itemName={itemName}
            orderTime={orderTime}
            deliveryTime={deliveryTime}
            next={false}
            bottomBorder={false}
            distributionTime={distributionTime}
            newTaskTime={newTaskTime}
          />
        )
      }
    }

    return serviceTimePanel
  }

  render() {
    const { sorting } = this.props
    const cycle = []
    const detailModuleCls = ClassNames({
      hide: this.state.detailModuleHidden,
    })
    const listModuleCls = ClassNames({
      hide: !this.state.detailModuleHidden,
    })

    // 映射 AdvanceSelect list数据
    sorting.cycle.map((v, index) => {
      cycle.push({
        value: index + 1, // 从1开始
        name: v.text,
      })
    })

    const sheetList = []

    // 映射sheet list数据
    sorting.dataByCategory.map((data, i) => {
      let tmp = {}
      tmp.listId = i + 1
      tmp.categoryName = data[0].category_title_1
      tmp.work = data.length
      tmp.detail = data
      sheetList.push(tmp)
    })

    return (
      <div>
        <div id='sorting-list-module' className={listModuleCls}>
          {/* 服务时间 */}
          {this.renderServiceTimePanel()}
          {/* 参数查询 */}
          <QuickFilter>
            <Flex>
              <Flex alignCenter flex={1}>
                <span>{i18next.t('当前任务周期')}:</span>
                <div className='gm-gap-10' />
                <select
                  className='form-control'
                  style={{ width: '250px' }}
                  name='cycles'
                  value={sorting.cycleSelected}
                  onChange={this.handleSelectValueChange}
                >
                  {_.map(cycle, (c, key) => (
                    <option value={c.value} key={key}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Flex>
              <Flex alignCenter flex={1}>
                <label className='gm-margin-0'>
                  <span style={{ fontWeight: 'normal' }}>
                    {i18next.t('是否已包含出库订单')}:
                  </span>
                  <div className='gm-gap-10' />
                  <input
                    type='checkbox'
                    defaultChecked={sorting.containOuter}
                    onChange={this.handleChangeContainerOuter}
                    ref={(ref) => {
                      this.containOuter = ref
                    }}
                  />
                </label>
              </Flex>
            </Flex>
          </QuickFilter>
          <div className='gm-padding-bottom-15' />
          {/* 分拣单列表 */}
          <QuickPanel icon='bill' title={i18next.t('分拣单列表')}>
            <Flex column>
              <SortingListTable
                loading={sorting.loading}
                list={sheetList}
                handleClickDetail={this.handleClickDetail}
              />
            </Flex>
          </QuickPanel>
        </div>
        <div id='sorting-detail-module' className={detailModuleCls}>
          <SortingDetail
            data={this.state.detail}
            handleClickBack={this.handleClickBack}
          />
        </div>
      </div>
    )
  }
}

export default SortingList
