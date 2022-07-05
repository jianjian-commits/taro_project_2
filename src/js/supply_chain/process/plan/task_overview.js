import { t } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import _ from 'lodash'
import {
  Input,
  FormItem,
  FormButton,
  Select,
  Option,
  Drawer,
  Tip,
  Button,
  BoxForm,
  FormBlock,
  MoreSelect,
  LevelSelect,
  Modal,
} from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import styled from 'styled-components'
import { TaskStore } from './store'
import { TASK_STATUS, TASK_LIST_SEARCH_TYPE } from 'common/enum'
import { taskStatus, remarkType } from 'common/filter'
import OperatingCycleDataPicker from 'common/components/operating_cycle_data_picker'

import { selectTableXHOC, TableX, TableXUtil } from '@gmfe/table-x'
import TaskDetails from './task_detail'
import TaskPublishModal from './components/task_publish_modal'
import Big from 'big.js'
import HeaderTip from 'common/components/header_tip'
import globalStore from 'stores/global'

const store = TaskStore
const convert2 = (num) => parseFloat(Number(num).toFixed(2))
const SelectTable = selectTableXHOC(TableX)

const searchText = [
  '',
  t('输入商品名称信息搜索'),
  t('输入订单号搜索'),
  t('输入商户信息搜索'),
]

const TipTextStyled = styled.div`
  width: 400px;
`

@observer
class TaskOverView extends React.Component {
  constructor() {
    super()
    this.state = {
      tabKey: 0,
    }
  }

  async componentDidMount() {
    await store.getServiceTime()
    // 获取线路列表
    store.fetchRouteList()
    // 获取司机
    store.fetchDriverList()
    // 获取商户标签
    store.fetchAddressLabelList()
    // 获取商品加工标签
    store.fetchProcessLabelList()

    store.setDoFirstRequest(this.pagination.apiDoFirstRequest)
    store.doFirstRequest()
  }

  componentWillUnmount() {
    store.clearTaskList()
  }

  handleSearch = () => {
    store.doFirstRequest()
  }

  handleSearchRequest = (pagination) => {
    return store.getTaskList(pagination).then((json) => {
      // 每次获取新数据后，清除表格选择
      store.clearTableSelect()
      const { isAllSelected } = store
      isAllSelected && store.setItemSelect(isAllSelected)
      return json
    })
  }

  handleChangeValue = (type, value) => {
    store.setFilter(type, value)
  }

  handleChangeNumber = (index, value) => {
    store.setSelectedPlaneNum(index, value)
  }

  handleChangeTab = (tabKey) => {
    this.setState({ tabKey })
  }

  handleChangeDate = (begin, end) => {
    store.setDateRangeDetail(begin, end)
  }

  /**
   * @param {string} type 发布任务类型，shortage => 库存不足，all 全部任务
   */
  getSelectedList = (type) => {
    const { taskList, skuSelectedList } = store
    let result = []
    const { order_request_release_amount_type } = globalStore.processInfo

    result = _.map(skuSelectedList, (selected) => {
      const data = _.filter(taskList, (task) => {
        return task._index === selected
      })
      const { suggest_plan_amount, plan_amount } = data[0]

      const defaultReleaseAmount = +Big(
        order_request_release_amount_type === 1
          ? suggest_plan_amount
          : plan_amount,
      ).toFixed(2) // 计划生产数跟着系统设置走，1为按建议计划生产数，2为按下单数

      return {
        ...data[0],
        ids: _.map(data[0].tasks, (item) => item.id), // 整理任务ids
        req_release_amount: defaultReleaseAmount > 0 ? defaultReleaseAmount : 0, // 建议计划生产数可能是负数，将负数都改成0
      }
    })

    if (type === 'shortage') {
      result = result.filter((item) => item.suggest_plan_amount > 0)
    }

    return result
  }

  handlePublishTask = (type) => {
    const { skuSelectedList, isSelectAllPage } = store

    const isOnlyOutOfStock = type === 'shortage'

    if (isSelectAllPage) {
      Modal.render({
        children: (
          <TaskPublishModal
            viewType='view'
            isOnlyOutOfStock={isOnlyOutOfStock}
          />
        ),
        size: 'md',
        title: t('发布生产任务'),
        onHide: Modal.hide,
      })
    } else {
      if (skuSelectedList.length > 0) {
        // 设置待发布数据
        store.setPublishData(this.getSelectedList(type))

        // 当发布库存不足任务时，数据为空则提示，且不再弹窗
        if (store.publishSelectedData.length === 0 && isOnlyOutOfStock) {
          Tip.warning(t('无库存不足任务可发布'))
        } else {
          Modal.render({
            children: (
              <TaskPublishModal
                viewType='edit'
                isOnlyOutOfStock={isOnlyOutOfStock}
              />
            ),
            size: 'md',
            title: t('发布生产任务'),
            onHide: Modal.hide,
          })
        }
      } else {
        Tip.warning(t('请先选择要发布的任务!'))
        return null
      }
    }
  }

  handleModal = (index) => {
    const detail = toJS(store.taskList[index])
    store.getProcessOrderStock(detail.sku_id, detail.sku_version)
    Drawer.render({
      children: <TaskDetails index={index} />,
      onHide: Drawer.hide,
      opacityMask: true,
      style: { width: '800px', height: '100%' },
    })
  }

  handleChangeSelectAllType = (bool) => {
    store.handleChangeSelectAllType(bool)

    const { taskList } = store
    const selected = taskList
      .slice()
      .filter((item) => item.status <= 1)
      .map((item) => item._index)
    store.handleTaskSelect(selected)
  }

  handleChangeRoute = (selected) => {
    store.changeRouteSelect(selected)
  }

  handleChangeDriver = (selected) => {
    store.changeDriverSelected(selected)
  }

  handleChangeAddressLabel = (selected) => {
    store.changeAddressLabelSelected(selected)
  }

  handleChangeProcessLabel = (selected) => {
    store.changeProcessLabelSelected(selected)
  }

  render() {
    const {
      filter: { beginDate, endDate, time_config_id, status, q, q_type },
      routeSelected,
      serviceTime,
      taskList,
      skuSelectedList,
      isSelectAllPage,
      routeList,
      carrierDriverList,
      driverSelected,
      addressLabelList,
      addressLabelSelected,
      processLabelSelected,
      processLabelList,
    } = store

    return (
      <>
        <BoxForm btnPosition='left' labelWidth='100px' colWidth='385px'>
          <FormBlock col={3}>
            <FormItem label={t('按运营周期')} col={2}>
              <OperatingCycleDataPicker
                begin={beginDate}
                end={endDate}
                serviceTimes={serviceTime.toJS()}
                timeConfigId={time_config_id}
                onChangeDate={this.handleChangeDate}
                onChangeTimeConfigId={this.handleChangeValue.bind(
                  this,
                  'time_config_id',
                )}
              />
            </FormItem>
            <FormItem>
              <Select
                clean
                value={q_type}
                data={TASK_LIST_SEARCH_TYPE}
                onChange={this.handleChangeValue.bind(this, 'q_type')}
                size='sm'
                className='gm-inline-block'
                style={{ minWidth: '100px' }}
              />
              <Input
                type='text'
                name='q'
                value={q}
                placeholder={searchText[q_type]}
                onChange={(e) => this.handleChangeValue('q', e.target.value)}
                className='gm-inline-block form-control'
                style={{ width: '275px' }}
              />
            </FormItem>
          </FormBlock>
          <BoxForm.More>
            <FormBlock col={3}>
              <FormItem label={t('线路筛选')}>
                <MoreSelect
                  id='route'
                  data={routeList.slice()}
                  selected={routeSelected}
                  onSelect={this.handleChangeRoute}
                  renderListFilterType='pinyin'
                  placeholder={t('全部线路')}
                />
              </FormItem>
              <FormItem label={t('司机筛选')}>
                <LevelSelect
                  data={toJS(carrierDriverList)}
                  onSelect={this.handleChangeDriver}
                  selected={driverSelected.slice()}
                  placeholder={t('全部司机')}
                />
              </FormItem>
              <FormItem label={t('商户标签')}>
                <MoreSelect
                  multiple
                  renderListFilterType='pinyin'
                  name='address_label_id'
                  data={addressLabelList.slice()}
                  selected={addressLabelSelected.slice()}
                  onSelect={this.handleChangeAddressLabel}
                  placeholder={t('全部商户标签')}
                />
              </FormItem>
              <FormItem label={t('状态筛选')}>
                <Select
                  value={status}
                  onChange={this.handleChangeValue.bind(this, 'status')}
                >
                  <Option value='0'>{t('全部任务')}</Option>
                  {_.map(TASK_STATUS, (type) => (
                    <Option value={type.value} key={type.value}>
                      {type.name}
                    </Option>
                  ))}
                </Select>
              </FormItem>
              <FormItem label={t('商品加工标签')}>
                <MoreSelect
                  multiple
                  renderListFilterType='pinyin'
                  name='process_label_id'
                  data={processLabelList.slice()}
                  selected={processLabelSelected.slice()}
                  onSelect={this.handleChangeProcessLabel}
                  placeholder={t('全部商品加工标签')}
                />
              </FormItem>
            </FormBlock>
          </BoxForm.More>

          <FormButton>
            <Button
              type='primary'
              htmlType='submit'
              onClick={this.handleSearch}
            >
              {t('搜索')}
            </Button>
          </FormButton>
        </BoxForm>

        <ManagePaginationV2
          id='pagination_in_clean_dishes_task_plan_list'
          onRequest={this.handleSearchRequest}
          ref={(ref) => {
            this.pagination = ref
          }}
          disablePage
        >
          <SelectTable
            data={taskList.slice()}
            keyField='_index'
            isSelectorDisable={(row) => row.status > 1}
            selected={skuSelectedList.slice()}
            onSelect={(selected) => store.handleTaskSelect(selected)}
            batchActionBar={
              skuSelectedList.length !== 0 ? (
                <TableXUtil.BatchActionBar
                  toggleSelectAll={(bool) =>
                    this.handleChangeSelectAllType(bool)
                  }
                  onClose={() => store.handleTaskSelect([])}
                  count={isSelectAllPage ? null : skuSelectedList.length}
                  isSelectAll={isSelectAllPage}
                  batchActions={[
                    {
                      name: t('发布全部任务'),
                      onClick: () => this.handlePublishTask('all'),
                      type: 'business',
                    },
                    {
                      name: t('发布库存不足任务'),
                      onClick: () => this.handlePublishTask('shortage'),
                      type: 'business',
                    },
                  ]}
                />
              ) : null
            }
            columns={[
              {
                Header: t('商品'),
                id: 'name',
                Cell: ({ row: { original, index } }) => (
                  <a onClick={this.handleModal.bind(this, index)}>
                    {original.name}
                  </a>
                ),
              },
              {
                Header: t('商品加工标签'),
                accessor: 'process_label',
              },
              {
                Header: t('分类'),
                id: 'pinlei_name',
                Cell: ({ row: { original } }) =>
                  `${original.category1_name}/${original.category2_name}/${original.pinlei_name}`,
              },
              {
                Header: t('商品类型'),
                accessor: 'remark_type',
                Cell: ({
                  row: {
                    original: { remark_type },
                  },
                }) => remarkType(remark_type),
              },
              {
                Header: t('下单数'),
                accessor: 'plan_amount',
                Cell: ({ row: { original } }) =>
                  `${parseFloat(Big(original.plan_amount || 0).toFixed(2))}${
                    original.sale_unit_name
                  }`,
              },
              {
                Header: (
                  <HeaderTip
                    title={t('建议计划生产数')}
                    tip={
                      <TipTextStyled>
                        {t(
                          '建议计划生产数=下单数-当前库存，任务发布后此数值将保持不变；若当前库存小于0，则建议计划生产数=下单数；若建议计划生产数小于0，则建议计划生产数为“当前库存充足“',
                        )}
                      </TipTextStyled>
                    }
                  />
                ),
                accessor: 'suggest_plan_amount',
                Cell: (cellProps) => {
                  const {
                    suggest_plan_amount,
                    sale_unit_name,
                  } = cellProps.row.original
                  return Number(suggest_plan_amount) > 0
                    ? `${Big(suggest_plan_amount).toFixed(2)}${sale_unit_name}`
                    : t('当前库存充足')
                },
              },
              {
                Header: t('计划生产数'),
                accessor: 'release_amount',
                Cell: ({ row: { original } }) =>
                  original.status === 1
                    ? '-'
                    : `${convert2(original.release_amount)}${
                        original.sale_unit_name
                      }`,
              },
              {
                Header: t('当前库存'),
                accessor: 'stock',
                Cell: ({ row: { original } }) =>
                  `${convert2(original.stock)}${original.sale_unit_name}`,
              },
              {
                Header: t('任务状态'),
                accessor: 'status',
                Cell: ({ row: { original } }) => taskStatus(original.status),
              },
            ]}
          />
        </ManagePaginationV2>
      </>
    )
  }
}

export default TaskOverView
