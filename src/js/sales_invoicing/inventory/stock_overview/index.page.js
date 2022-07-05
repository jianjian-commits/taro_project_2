import { t } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import {
  Flex,
  Price,
  ToolTip,
  BoxTable,
  Button,
  FunctionSet,
  RightSideModal,
  Modal,
  Popover,
} from '@gmfe/react'
import {
  TableX,
  TableXUtil,
  diyTableXHOC,
  selectTableXHOC,
  fixedColumnsTableXHOC,
} from '@gmfe/table-x'
import store from './store'
import { ManagePagination } from '@gmfe/business'
import TableTotalText from 'common/components/table_total_text'
import Filter from './filter'
import { history } from 'common/service'
import globalStore from 'stores/global'
import SecurityCostCell from './components/security_cost_cell'
import RetentionWarningCell from './components/retention_warning_cell'
import SafeStock from 'common/../product/inventory/components/safe_stock_modal'
import DelayStock from 'common/..//product/inventory/components/delay_stock_modal.js'
import TaskList from '../../../task/task_list'
import Big from 'big.js'
import ProductStockList from './components/product_stock_list'

const DiyTableX = selectTableXHOC(diyTableXHOC(fixedColumnsTableXHOC(TableX)))

@observer
class StockOverview extends React.Component {
  constructor(props) {
    super(props)
    this.paginationRef = React.createRef(null)
  }

  componentDidMount() {
    store.setDoApiDoFirstSearchFunc(
      this.paginationRef.current.apiDoFirstRequest,
    )

    this.paginationRef.current.apiDoFirstRequest()
  }

  handlePageChange = (pagination) => {
    return store.fetchStockList(pagination)
  }

  handleEditBatchSafe = (data) => {
    const { upValue, downValue, isSetUp, isSetDown } = data
    // 当值不传时，代表不处理该项，如：upper_threshold为空，则不传，则不处理上限
    const req = {
      upper_threshold: isSetUp ? upValue : undefined,
      lower_threshold: isSetDown ? downValue : undefined,
      set_upper_threshold: isSetUp ? 1 : 2,
      set_lower_threshold: isSetDown ? 1 : 2,
      ...this.getBatchFilterData(),
    }

    store.setBatchSafeStock(req).then(() => {
      store.apiDoFirstRequest()
      RightSideModal.render({
        children: <TaskList tabKey={1} />,
        onHide: RightSideModal.hide,
        style: {
          width: '300px',
        },
      })
    })
  }

  handleBatchSafeStock = () => {
    const { isSelectAll } = store
    Modal.render({
      title: t('批量设置安全库存'),
      size: 'md',
      children: (
        <SafeStock isSelectAll={isSelectAll} onOk={this.handleEditBatchSafe} />
      ),
      onHide: () => Modal.hide(),
    })
  }

  handleEditBatchDelay = (data) => {
    const { value, isSet } = data
    const req = {
      retention_warning_day: isSet ? value : undefined,
      set_retention_warning_day: isSet ? 1 : 2,
      ...this.getBatchFilterData(),
    }

    store.setBatchDelayStock(req).then(() => {
      this.paginationRef.current.apiDoFirstRequest()
      RightSideModal.render({
        children: <TaskList tabKey={1} />,
        onHide: RightSideModal.hide,
        style: {
          width: '300px',
        },
      })
    })
  }

  handleBatchDelayStock = () => {
    const { isSelectAll } = store
    Modal.render({
      title: t('批量设置呆滞预警'),
      size: 'md',
      children: (
        <DelayStock
          isSelectAll={isSelectAll}
          onOk={this.handleEditBatchDelay}
        />
      ),
      onHide: () => Modal.hide(),
    })
  }

  getBatchFilterData = () => {
    const { selected, isSelectAll } = store

    let data = {
      all: isSelectAll ? 1 : 0,
    }

    if (isSelectAll) {
      // 全选页---筛选字段
      data = Object.assign({}, data, this.handleReqFilter())
    } else {
      data = { ...data, spu_ids: JSON.stringify(selected) }
    }
    return data
  }

  handleReqFilter = (filter) => {
    const {
      level1,
      level2,
      search_text,
      remainType,
      retention_type,
      safe_stock_type,
    } = filter || store.filter

    const reqFilter = {
      category_id_1: level1 || undefined,
      category_id_2: level2 || undefined,
      text: search_text || undefined,
      remain_status: +remainType !== 0 ? remainType : undefined,
      safe_stock_type: +safe_stock_type !== 0 ? safe_stock_type : undefined,
      retention_type: +retention_type !== 0 ? retention_type : undefined,
    }

    return reqFilter
  }

  handleReportOverflowAndLostBtn = (clean_food) => {
    const reqData = { ...this.getBatchFilterData(), clean_food }

    if (reqData) {
      store.setReportOverflowAndLostFilter(reqData)
      history.push(
        `/sales_invoicing/inventory/stock_overview/batch_report_overflow_lost`,
      )
    }
  }

  // 拉取成品库存列表
  handleProcuctStockList = (rowData) => {
    RightSideModal.render({
      onHide: RightSideModal.hide,
      title: t(rowData.name),
      style: { width: '820px' },
      children: (
        <ProductStockList
          onCancel={() => RightSideModal.hide()}
          rowData={rowData}
        />
      ),
    })
  }

  render() {
    const { list, selected, isSelectAll, stock_value_sum } = store
    const p_spuAdjustLog = globalStore.hasPermission('get_spu_adjust_log')

    return (
      <div>
        <Filter />
        <BoxTable
          icon='bill'
          info={
            <TableTotalText
              data={[
                { label: t('商品数'), content: store.pagination.count },
                {
                  label: t('库存参考总货值'),
                  content: stock_value_sum || 0,
                },
              ]}
            />
          }
          action={
            <>
              {globalStore.hasPermission('edit_sku_stocks') && (
                <FunctionSet
                  data={[
                    {
                      text: t('原料盘点'),
                      onClick: () =>
                        history.push(
                          '/sales_invoicing/inventory/stock_overview/batch?batchType=material',
                        ),
                    },
                    {
                      text: t('成品盘点'),
                      onClick: () =>
                        history.push(
                          '/sales_invoicing/inventory/stock_overview/batch?batchType=product',
                        ),
                    },
                  ]}
                  right
                >
                  <Button type='primary'>{t('批量盘点')}</Button>
                </FunctionSet>
              )}
              {p_spuAdjustLog && (
                <Button
                  type='primary'
                  plain
                  className='gm-margin-left-10'
                  onClick={() =>
                    history.push(
                      '/sales_invoicing/inventory/product/cost_detail',
                    )
                  }
                >
                  {t('成本调整明细')}
                </Button>
              )}
            </>
          }
        >
          <ManagePagination
            id='stock_overview_list_manage_pagination'
            ref={this.paginationRef}
            onRequest={this.handlePageChange}
          >
            <DiyTableX
              selected={selected.slice()}
              onSelect={(selected) => store.onSelect(selected)}
              data={list.slice()}
              fixedSelect
              id='stock_overview_DiyTableX_id'
              keyField='spu_id'
              columns={[
                {
                  Header: t('商品ID'),
                  accessor: 'spu_id',
                  width: 100,
                  fixed: 'left',
                },
                {
                  Header: t('商品名'),
                  accessor: 'name',
                  width: 100,
                  fixed: 'left',
                },
                {
                  Header: t('商品分类'),
                  accessor: 'category_name_2',
                  width: 80,
                },
                {
                  Header: t('总库存'),
                  width: 80,
                  accessor: 'remain',
                  Cell: (cellProps) => {
                    const { remain, std_unit_name } = cellProps.row.original
                    return parseFloat(remain) + std_unit_name
                  },
                },
                {
                  Header: (
                    <Flex alignCenter>
                      {t('待出库')}
                      <ToolTip
                        top
                        popup={
                          <div
                            className='gm-padding-5'
                            style={{ width: '200px' }}
                          >
                            {t(
                              '待出库库存：当前已有用户进行下单，在对应订单出库后扣减待出库状态的库存。待出库中的库存无法用于其他客户下单。',
                            )}
                          </div>
                        }
                      />
                    </Flex>
                  ),
                  accessor: 'frozen',
                  width: 80,
                  Cell: ({
                    row: {
                      original: { frozen, std_unit_name, spu_id },
                    },
                  }) => (
                    <Popover
                      type='hover'
                      showArrow
                      popup={
                        <div className='gm-padding-5 gm-cursor'>
                          {t('点击进入库存预览')}
                        </div>
                      }
                    >
                      <a
                        onClick={() =>
                          history.push(
                            `/sales_invoicing/inventory/stock_overview/stock_preview?spu_id=${spu_id}`,
                          )
                        }
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {`${parseFloat(
                          Big(frozen || 0).toFixed(2),
                        )}${std_unit_name}`}
                      </a>
                    </Popover>
                  ),
                },
                {
                  Header: (
                    <Flex alignCenter>
                      {t('加工中')}
                      <ToolTip
                        top
                        popup={
                          <div className='gm-padding-5'>
                            {t(
                              '加工中库存： 当前商品已被领取，处在加工流程中。',
                            )}
                          </div>
                        }
                      />
                    </Flex>
                  ),
                  accessor: 'processing_amount',
                  width: 80,
                  Cell: (cellProps) => {
                    const {
                      processing_amount,
                      std_unit_name,
                    } = cellProps.row.original

                    return parseFloat(processing_amount) + std_unit_name
                  },
                },
                {
                  Header: (
                    <Flex alignCenter>
                      {t('可用库存')}
                      <ToolTip
                        top
                        popup={
                          <div
                            className='gm-padding-5'
                            style={{ width: '160px' }}
                          >
                            {t(
                              '可用库存=总库存-待出库-加工中，表明目前可用于销售的库存。',
                            )}
                          </div>
                        }
                      />
                    </Flex>
                  ),
                  width: 80,
                  accessor: 'available_stock',
                  Cell: (cellProps) => {
                    const {
                      available_stock,
                      std_unit_name,
                    } = cellProps.row.original
                    return parseFloat(available_stock) + std_unit_name
                  },
                },
                {
                  Header: (
                    <Flex alignCenter>
                      {t('呆滞预警')}
                      <ToolTip
                        top
                        popup={
                          <div
                            className='gm-padding-5'
                            style={{ width: '160px' }}
                          >
                            {t(
                              '商品从入库开始计算，超过呆滞预警天数且库存数大于0为呆滞品',
                            )}
                          </div>
                        }
                      />
                    </Flex>
                  ),
                  width: 100,
                  accessor: 'retention_warning_day',
                  Cell: ({ row: { original } }) => (
                    <RetentionWarningCell original={original} />
                  ),
                },
                {
                  Header: (
                    <Flex alignCenter>
                      {t('库存均价')}
                      <ToolTip
                        top
                        popup={
                          <div className='gm-padding-5'>
                            {t('库存均价 = 库存参考货值 / 总库存')}
                          </div>
                        }
                      />
                    </Flex>
                  ),
                  width: 100,
                  accessor: 'avg_price',
                  Cell: (cellProps) => {
                    const { avg_price, std_unit_name } = cellProps.row.original
                    return (
                      parseFloat(avg_price) +
                      Price.getUnit() +
                      '/' +
                      std_unit_name
                    )
                  },
                },
                {
                  Header: (
                    <Flex alignCenter>
                      {t('库存参考货值')}
                      <ToolTip
                        top
                        popup={
                          <div
                            className='gm-padding-5'
                            style={{ width: '160px' }}
                          >
                            {t(
                              '库存参考货值 = 原料库存参考货值+成品库存参考货值',
                            )}
                          </div>
                        }
                      />
                    </Flex>
                  ),
                  width: 100,
                  accessor: 'stock_value',
                  Cell: (cellProps) => {
                    const { stock_value } = cellProps.row.original
                    return parseFloat(stock_value) + Price.getUnit()
                  },
                },
                {
                  Header: t('原料库存'),
                  width: 80,
                  accessor: 'material_stock',
                  Cell: (cellProps) => {
                    const {
                      material_stock,
                      std_unit_name,
                    } = cellProps.row.original

                    return parseFloat(material_stock) + std_unit_name
                  },
                },
                {
                  Header: t('原料库存均价'),
                  width: 100,
                  accessor: 'ingredient_avg_price',
                  Cell: (cellProps) => {
                    const {
                      ingredient_avg_price,
                      std_unit_name,
                    } = cellProps.row.original
                    return (
                      parseFloat(ingredient_avg_price) +
                      Price.getUnit() +
                      '/' +
                      std_unit_name
                    )
                  },
                },
                {
                  Header: (
                    <Flex alignCenter>
                      {t('原料库存参考货值')}
                      <ToolTip
                        top
                        popup={
                          <div className='gm-padding-5'>
                            {t(
                              '原料库存参考货值 = 原料总库存 x 原料当前库存均价',
                            )}
                          </div>
                        }
                      />
                    </Flex>
                  ),
                  width: 120,
                  accessor: 'ingredient_stock_value',
                  Cell: (cellProps) => {
                    const { ingredient_stock_value } = cellProps.row.original

                    return parseFloat(ingredient_stock_value) + Price.getUnit()
                  },
                },
                {
                  Header: (
                    <Flex alignCenter>
                      {t('原料安全库存')}
                      <ToolTip
                        top
                        popup={
                          <div
                            className='gm-padding-5'
                            style={{ width: '160px' }}
                          >
                            {t(
                              '原料安全库存：当前原料库存数小于等于安全库存时，请及时补货',
                            )}
                          </div>
                        }
                      />
                    </Flex>
                  ),
                  width: 130,
                  accessor: 'upper_threshold',
                  Cell: ({ row: { original } }) => (
                    <SecurityCostCell changeType='raw' original={original} />
                  ),
                },
                {
                  Header: t('成品库存'),
                  width: 100,
                  accessor: 'product_stock',
                  Cell: (cellProps) => {
                    const {
                      product_stock,
                      std_unit_name,
                    } = cellProps.row.original

                    return (
                      <a
                        onClick={() =>
                          this.handleProcuctStockList(cellProps.row.original)
                        }
                      >
                        {parseFloat(product_stock) + std_unit_name}
                      </a>
                    )
                  },
                },
                {
                  Header: t('成品库存均价'),
                  width: 100,
                  accessor: 'product_avg_price',
                  Cell: (cellProps) => {
                    const {
                      product: { product_avg_price },
                      std_unit_name,
                    } = cellProps.row.original
                    return (
                      Big(product_avg_price).toFixed(2) +
                      Price.getUnit() +
                      '/' +
                      std_unit_name
                    )
                  },
                },
                {
                  Header: (
                    <Flex alignCenter>
                      {t('成品库存参考货值')}
                      <ToolTip
                        top
                        popup={
                          <div className='gm-padding-5'>
                            {t(
                              '成品库存参考货值 = 成品总库存 x 成品当前库存均价',
                            )}
                          </div>
                        }
                      />
                    </Flex>
                  ),
                  width: 120,
                  accessor: 'product_stock_value',
                  Cell: (cellProps) => {
                    const {
                      product: { product_stock_value },
                    } = cellProps.row.original
                    return parseFloat(product_stock_value) + Price.getUnit()
                  },
                },
                {
                  Header: TableXUtil.OperationHeader,
                  accessor: 'operation',
                  fixed: 'right',
                  width: 110,
                  Cell: ({ row }) => (
                    <TableXUtil.OperationCell>
                      <TableXUtil.OperationDetail
                        href={`#/sales_invoicing/inventory/stock_overview/detail?id=${row.original.spu_id}`}
                        open
                      />
                    </TableXUtil.OperationCell>
                  ),
                },
              ].map((item) => ({ ...item, diyGroupName: '基础字段' }))}
              batchActionBar={
                selected.length > 0 ? (
                  <TableXUtil.BatchActionBar
                    batchActions={[
                      ...(globalStore.hasPermission('edit_sku_stocks')
                        ? [
                            {
                              name: t('原料一键报损报溢'),
                              onClick: () =>
                                this.handleReportOverflowAndLostBtn(),
                              type: 'business',
                            },
                            {
                              name: t('成品一键报损报溢'),
                              onClick: () =>
                                this.handleReportOverflowAndLostBtn(1),
                              type: 'business',
                            },
                          ]
                        : []),
                      {
                        name: t('批量设置原料安全库存'),
                        onClick: () => this.handleBatchSafeStock(),
                        type: 'business',
                      },
                      {
                        name: t('批量设置呆滞预警'),
                        onClick: () => this.handleBatchDelayStock(),
                        type: 'business',
                      },
                    ]}
                    isSelectAll={isSelectAll}
                    count={isSelectAll ? null : selected.length}
                    toggleSelectAll={(bool) => store.handleSelectAll(bool)}
                    onClose={() => store.onSelect([])}
                  />
                ) : null
              }
            />
          </ManagePagination>
        </BoxTable>
      </div>
    )
  }
}

export default StockOverview
