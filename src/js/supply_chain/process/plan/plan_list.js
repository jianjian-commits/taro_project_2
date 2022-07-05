import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import {
  BoxForm,
  FormBlock,
  FormItem,
  FormButton,
  Button,
  BoxTable,
  DateRangePicker,
  Flex,
  Tip,
  Select,
  Option,
  Dialog,
} from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { TableX, selectTableXHOC, TableXUtil } from '@gmfe/table-x'
import _ from 'lodash'
import { planListStore } from './store'
import { toJS } from 'mobx'
import { history } from 'common/service'
import { urlToParams } from 'common/util'
import { DATE_TYPE_LIST, STATUS_LIST, PLAN_ORIGIN_STATUS } from 'common/enum'
import { getEnumValue } from 'common/filter'

import moment from 'moment'
import { postProcessDan } from './api'

const store = planListStore
const SelectTable = selectTableXHOC(TableX)

// 下达状态过滤
const filterForStatus = (value) => {
  const item = _.find(STATUS_LIST, (item) => item.value === value)
  if (item) {
    return item.name
  } else {
    return '-'
  }
}

@observer
class PlanList extends React.Component {
  componentDidMount() {
    store.setDoFirstRequest(this.pagination.apiDoFirstRequest)
    store.doFirstRequest()
  }

  handleFilterChange = (e) => {
    const { name, value } = e.target
    if (name === 'dateType') {
      store.setFilterDetail(name, +value)
    } else {
      store.setFilterDetail(name, value)
    }
  }

  handleDateRangeChange = (begin, end) => {
    store.setDateRangeDetail(begin, end)
  }

  handleSearch = () => {
    store.doFirstRequest()
  }

  handleExport = () => {
    const data = Object.assign({}, toJS(store.detail), {
      need_unrelease: 1,
    })
    const url = urlToParams(data)
    window.open(`/stock/process/process_order/export?` + url)
  }

  handleAssignProcess = () => {
    const { isSelectAllPage, detail, selectedPlanList } = store
    const idList = selectedPlanList.slice()
    if ((idList && idList.length) || isSelectAllPage) {
      const data = isSelectAllPage
        ? detail
        : { proc_order_ids: JSON.stringify(idList) }

      Dialog.confirm({
        title: '下达加工单',
        size: 'sm',
        children: <div>确认下达加工单吗？</div>,
        onOK: () => {
          postProcessDan(data).then((json) => {
            if (!json.code) {
              this.handleSearch()
              Tip.success(i18next.t('下达成功!'))
              store.setSelectedList([])
            }
          })
        },
      })
    } else {
      Tip.warning(i18next.t('请先选择计划编号!'))
      return null
    }
  }

  handleHistoryPush = (id) => {
    history.push(`/supply_chain/process/plan/detail?id=${id}`)
  }

  handleSearchRequest = (pagination) => {
    return store.getSearchList(pagination).then((json) => {
      // 重新获取数据需要清除表格选择
      store.clearTableSelect()
      store.setFilterDetail('list', json.data)
      return json
    })
  }

  handleNewProcessPlan = () => {
    window.open('#/supply_chain/process/plan/create')
  }

  render() {
    const {
      dateType,
      beginDate,
      endDate,
      searchContent,
      status,
      isSelectAllPage,
      selectedPlanList,
      source_type,
    } = store

    const preList = toJS(store.list)

    const disabledStatus = [2, 3, 4] // 2: 已下达，3: 已完成，4: 已开工

    return (
      <>
        <BoxForm
          btnPosition='left'
          labelWidth={dateType === 5 ? '80px' : '110px'}
          colWidth='380px'
          onSubmit={this.handleSearch}
        >
          <FormBlock col={3}>
            <FormItem>
              <Flex flex none row>
                <Select
                  clean
                  value={dateType}
                  onChange={(value) => store.setFilterDetail('dateType', value)}
                  style={{ width: dateType === 5 ? '80px' : '110px' }}
                >
                  {_.map(DATE_TYPE_LIST, (item) => (
                    <Option key={item.value} value={item.value}>
                      {item.name}
                    </Option>
                  ))}
                </Select>

                <DateRangePicker
                  begin={beginDate}
                  end={endDate}
                  onChange={this.handleDateRangeChange}
                  style={{ width: '260px' }}
                />
              </Flex>
            </FormItem>

            <FormItem label={i18next.t('搜索')}>
              <input
                type='text'
                name='searchContent'
                value={searchContent}
                placeholder={i18next.t('输入成品信息或计划编号进行搜索')}
                onChange={this.handleFilterChange}
              />
            </FormItem>
          </FormBlock>

          <BoxForm.More>
            <FormBlock col={3}>
              <FormItem label={i18next.t('状态筛选')}>
                <Select
                  value={status}
                  onChange={(value) => store.setFilterDetail('status', value)}
                  style={{ width: '260px' }}
                >
                  {_.map(STATUS_LIST, (item) => (
                    <Option key={item.value} value={item.value}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </FormItem>
              <FormItem label={i18next.t('计划来源')}>
                <Select
                  value={source_type}
                  data={PLAN_ORIGIN_STATUS}
                  onChange={(value) =>
                    store.setFilterDetail('source_type', value)
                  }
                  size='sm'
                />
              </FormItem>
            </FormBlock>
          </BoxForm.More>

          <FormButton>
            <Button type='primary' htmlType='submit'>
              {i18next.t('搜索')}
            </Button>
            <div className='gm-gap-10' />
            <Button onClick={this.handleExport}>{i18next.t('导出')}</Button>
          </FormButton>
        </BoxForm>

        <BoxTable
          action={
            <Button
              type='primary'
              onClick={this.handleNewProcessPlan}
              className='gm-margin-left-5'
            >
              {i18next.t('新建计划')}
            </Button>
          }
        >
          <ManagePaginationV2
            id='pagination_in_clean_dishes_plan_list'
            onRequest={this.handleSearchRequest}
            ref={(ref) => {
              this.pagination = ref
            }}
            disablePage
          >
            <SelectTable
              data={preList}
              keyField='id'
              isSelectorDisable={(row) => disabledStatus.includes(row.status)}
              selected={selectedPlanList.slice()}
              onSelect={(selected) => store.setSelectedList(selected)}
              batchActionBar={
                selectedPlanList.length > 0 ? (
                  <TableXUtil.BatchActionBar
                    onClose={() => store.setSelectedList([])}
                    toggleSelectAll={(bool) =>
                      store.toggleIsSelectAllPage(bool)
                    }
                    batchActions={[
                      {
                        name: i18next.t('下达加工单'),
                        onClick: this.handleAssignProcess,
                        type: 'business',
                      },
                    ]}
                    count={isSelectAllPage ? null : selectedPlanList.length}
                    isSelectAll={isSelectAllPage}
                  />
                ) : null
              }
              columns={[
                {
                  Header: i18next.t('计划编号'),
                  id: 'id',
                  Cell: ({ row: { original } }) => {
                    const customId = original.custom_id
                    return (
                      <a
                        className='gm-cursor gm-padding-lr-5'
                        onClick={() => this.handleHistoryPush(original.id)}
                      >
                        {customId || original.id}
                      </a>
                    )
                  },
                },
                {
                  Header: i18next.t('创建日期'),
                  accessor: 'create_time',
                  Cell: ({ row: { original } }) =>
                    moment(original.create_time).format('YYYY-MM-DD'),
                },
                {
                  Header: i18next.t('生成成品'),
                  accessor: 'sku_name',
                },
                {
                  Header: (
                    <Flex column>
                      <div>{i18next.t('计划生产数')}</div>
                      <div>{i18next.t('(销售单位)')}</div>
                    </Flex>
                  ),
                  id: 'plan_amount',
                  Cell: ({ row: { original } }) => (
                    <span>
                      {original.plan_amount}
                      {original.sale_unit_name}
                    </span>
                  ),
                },
                {
                  Header: (
                    <Flex column>
                      <div>{i18next.t('已完成数')}</div>
                      <div>{i18next.t('(销售单位)')}</div>
                    </Flex>
                  ),
                  id: 'finish_amount',
                  Cell: ({ row: { original } }) => (
                    <span>
                      {original.finish_amount}
                      {original.sale_unit_name}
                    </span>
                  ),
                },
                {
                  Header: i18next.t('计划状态'),
                  accessor: 'status',
                  Cell: ({ row: { original } }) =>
                    filterForStatus(original.status),
                },
                {
                  Header: i18next.t('操作人'),
                  accessor: 'creator',
                },
                {
                  Header: i18next.t('计划来源'),
                  accessor: 'source_type',
                  Cell: (cellProps) => {
                    const { source_type } = cellProps.row.original
                    return getEnumValue(PLAN_ORIGIN_STATUS, source_type)
                  },
                },
              ]}
            />
          </ManagePaginationV2>
        </BoxTable>
      </>
    )
  }
}

export default PlanList
