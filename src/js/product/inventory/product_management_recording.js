import { i18next } from 'gm-i18n'
import React from 'react'
import {
  BoxTable,
  Flex,
  FunctionSet,
  Modal,
  Price,
  RightSideModal,
  Tip,
  ToolTip,
  Uploader,
  Button,
  Popover,
} from '@gmfe/react'
import { ManagePagination } from '@gmfe/business'
import Big from 'big.js'
import SearchFilter from '../../common/components/product_search_filter'

import './actions'
import './reducer'
import actions from '../../actions'
import { urlToParams } from '../../common/util'
import { history } from '../../common/service'
import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'
import _ from 'lodash'
import styles from '../product.module.less'
import TaskList from '../../task/task_list'
import globalStore from '../../stores/global'
import store from './store'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import DragWeight from '../../common/components/weight/drag_weight'
import { selectTableV2HOC, Table, TableUtil } from '@gmfe/table'
import SvgEditPen from 'svg/edit_pen.svg'
import TableTotalText from 'common/components/table_total_text'
import InventoryEditBubbleConfirm from './inventory_edit_bubble_confirm'
import SafeInventoryEditBubbleConfirm from './safe_inventory_edit_bubble_confirm'
import bridge from '../../bridge/index'
import classNames from 'classnames'
import SafeStock from './components/safe_stock_modal'
import DelayStock from './components/delay_stock_modal'
import styled from 'styled-components'

const SpanStyled = styled.span`
  cursor: ${(props) => {
    if (props.noPermission) {
      return 'default !important'
    }
    return 'pointer !important'
  }};
`

const { Info } = BoxTable

const isNotSet = (data) => data === null || data === undefined || data === ''
const SelectTable = selectTableV2HOC(Table)
const {
  BatchActionBar,
  OperationCell,
  OperationDetail,
  OperationHeader,
  referOfWidth,
  EditButton,
} = TableUtil

@observer
class ProductManagementRecording extends React.Component {
  filter = {
    begin: new Date(),
    end: new Date(),
    remainType: 0,
    level: {},
    search_text: '',
    safe_stock_type: 0, // ??????????????????
    retention_type: 0, // ??????????????????
  }

  renderTipWarning = (msg) => {
    return (
      <div className='gm-padding-5 gm-bg' style={{ width: '200px' }}>
        {msg}
      </div>
    )
  }

  constructor(props) {
    super(props)

    this.productManagementRecordingRef = React.createRef()
    if (this.props.location.query.q) {
      this.filter.search_text = this.props.location.query.q
    }

    this.state = {
      pagination: {
        offset: 0,
        limit: 10,
        count: 0,
      },
      sort: {
        name: '',
        opt: null,
      },
      isEditing: false,
      file: null,
      selected: [],
      isSelectAll: false,
    }
  }

  componentDidMount() {
    this.productManagementRecordingRef.current.apiDoFirstRequest()
  }

  handleSort(select_name) {
    const { name, opt } = this.state.sort
    let new_opt = null
    if (name && name === select_name) {
      if (opt === null) {
        new_opt = 'desc'
      } else {
        new_opt = opt === 'desc' ? 'asc' : 'desc'
      }
    } else {
      new_opt = 'desc'
    }

    const new_sort = {
      name: select_name,
      opt: new_opt,
    }
    this.setState({ sort: new_sort }, () => this.onSearch(this.filter))
  }

  handleReqFilter = (filter) => {
    const {
      level1,
      level2,
      search_text,
      remainType,
      retention_type,
      safe_stock_type,
    } = filter || this.filter

    const reqFilter = {
      category_id_1: level1 || undefined,
      category_id_2: level2 || undefined,
      text: search_text || undefined,
      remain_status: +remainType !== 0 ? remainType : undefined,
      safe_stock_type: +safe_stock_type !== 0 ? safe_stock_type : undefined,
      retention_type: +retention_type !== 0 ? retention_type : undefined,
    }

    return Object.assign({}, reqFilter)
  }

  handleSetSort(data) {
    const { name, opt } = this.state.sort
    if (name !== '' && opt !== null) {
      return Object.assign({}, data, {
        sort_depend_word: name,
        sort_way: opt === 'desc' ? -1 : 1,
      })
    } else {
      return data
    }
  }

  onSearch = (filter) => {
    this.filter = filter

    this.productManagementRecordingRef.current.apiDoFirstRequest()
  }

  onExport = (filter) => {
    let url = ''
    // ???????????????filter??????????????????
    url = urlToParams(this.handleReqFilter(filter))

    window.open('/stock/list?export=1&' + url)
  }

  handlePageChange = (page) => {
    const reqFilter = this.handleReqFilter()
    const req = this.handleSetSort(Object.assign({}, page, reqFilter))
    actions.product_inventory_product_management_sum(reqFilter)
    return actions
      .product_inventory_product_management_list(req)
      .then((json) => {
        this.setState({
          pagination: json.pagination,
          selected: [],
          isSelectAll: false,
        })
        return json
      })
  }

  handleClose = () => {
    Modal.hide()
  }

  handleEditProductStock = (data) => {
    const { stock_method } = globalStore.user
    // edit_sku_stocks
    const p_edit = globalStore.hasPermission('edit_sku_stocks')
    const canGetBatch = globalStore.hasPermission('get_check_batch_number')
    // ???????????????????????????????????????
    if (!p_edit || (stock_method === 2 && !canGetBatch)) {
      return false
    }

    // ???????????????pc??????????????????,?????????????????????
    const targetName = window.navigator.userAgent.includes('Electron')
      ? '_self'
      : '_blank'
    if (stock_method === 2) {
      window.open(
        `#/sales_invoicing/inventory/product?activeTab=batch&q=${data.spu_id}`,
        targetName,
      )
    }
  }

  handleBatchCheck = () => {
    // todo ??????????????????
    history.push('/sales_invoicing/inventory/product/batch')
  }

  handleBatchPrice = (files) => {
    this.setState({ file: null })
    requireGmXlsx((res) => {
      const { sheetToJson } = res
      sheetToJson(files[0]).then((json) => {
        const sheetData = _.values(json[0])[0]
        sheetData.shift()

        if (sheetData.length === 0) {
          Tip.warning(i18next.t('???????????????????????????????????????????????????'))
          return
        }
        const arr = _.map(sheetData, (v) => {
          return {
            spu_id: v[0],
            price: v[1],
          }
        })
        actions.product_inventory_update_avg_price(arr).then(() => {
          RightSideModal.render({
            children: <TaskList />,
            noCloseBtn: true,
            onHide: RightSideModal.hide,
            opacityMask: true,
            style: {
              width: '300px',
            },
          })
        })
      })
    })
  }

  handleSupply = () => {
    const data = this.handleReqFilter()
    actions.product_inventory_get_service_time().then(() => {
      // ?????????????????????
      actions.product_inventory_supplement_list(data).then((json) => {
        // ????????????
        // FIXME console.log(json) https://www.tapd.cn/my_worktable?source_user=181902850&workspace_id=23671581&workitem_type=bug&workitem_id=1123671581001024769#&filter_close=true
        if (json.data && json.data.length) {
          history.push('/sales_invoicing/inventory/product/supply')
        } else {
          Tip.warning(i18next.t('???????????????????????????????????????????????????'))
        }
      })
    })
  }

  handleSelectAll = (flag, list) => {
    this.setState({
      selected: flag ? _.map(list, (item) => item.spu_id) : [],
    })
  }

  getBatchFilterData = () => {
    const { selected, isSelectAll } = this.state

    let data = {
      all: isSelectAll ? 1 : 0,
    }

    if (isSelectAll) {
      // ?????????---????????????
      data = Object.assign({}, data, this.handleReqFilter())
    } else {
      data = { ...data, spu_ids: JSON.stringify(selected) }
    }
    return data
  }

  handleReportOverflowAndLostBtn = () => {
    const reqData = this.getBatchFilterData()
    if (reqData) {
      store.setReportOverflowAndLostFilter(reqData)
      history.push('/sales_invoicing/inventory/product/pending/inventory')
    }
  }

  handleCostDetail = () => {
    history.push('/sales_invoicing/inventory/product/cost_detail')
  }

  handleBatchDetail = (spu_id) => {
    const { stock_method } = globalStore.user
    if (stock_method === 2) {
      window.open(
        `#/sales_invoicing/inventory/product?activeTab=batch&q=${spu_id}`,
      )
    }
  }

  handleStockPreview = (spu_id) => {
    history.push(
      `/sales_invoicing/inventory/product/stock_preview?spu_id=${spu_id}`,
    )
  }

  handleEditBatchSafe = (data) => {
    const { upValue, downValue, isSetUp, isSetDown } = data
    // ????????????????????????????????????????????????upper_threshold???????????????????????????????????????
    const req = Object.assign(
      {},
      {
        upper_threshold: isSetUp ? upValue : undefined,
        lower_threshold: isSetDown ? downValue : undefined,
        set_upper_threshold: isSetUp ? 1 : 2,
        set_lower_threshold: isSetDown ? 1 : 2,
      },
      this.getBatchFilterData(),
    )
    store.setBatchSafeStock(req).then(() => {
      this.productManagementRecordingRef.current.apiDoFirstRequest()
      RightSideModal.render({
        children: <TaskList tabKey={1} />,
        onHide: RightSideModal.hide,
        style: {
          width: '300px',
        },
      })
    })
  }

  handleEditBatchDelay = (data) => {
    const { value, isSet } = data
    const req = Object.assign(
      {},
      {
        retention_warning_day: isSet ? value : undefined,
        set_retention_warning_day: isSet ? 1 : 2,
      },
      this.getBatchFilterData(),
    )
    store.setBatchDelayStock(req).then(() => {
      this.productManagementRecordingRef.current.apiDoFirstRequest()
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
    const { isSelectAll } = this.state
    Modal.render({
      title: i18next.t('????????????????????????'),
      size: 'md',
      children: (
        <SafeStock isSelectAll={isSelectAll} onOk={this.handleEditBatchSafe} />
      ),
      onHide: () => Modal.hide(),
    })
  }

  handleBatchDelayStock = () => {
    const { isSelectAll } = this.state
    Modal.render({
      title: i18next.t('????????????????????????'),
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

  handleBatchDetail = (id) => {
    history.push(`/sales_invoicing/inventory/product?activeTab=batch&q=${id}`)
  }

  render() {
    // add_stock_threshold??????????????????
    const p_addThreshold = globalStore.hasPermission('edit_stock_threshold')
    const columns = [
      { Header: i18next.t('??????ID'), accessor: 'spu_id' },
      { Header: i18next.t('?????????'), accessor: 'name' },
      { Header: i18next.t('????????????'), accessor: 'category_name_2' },
      {
        Header: (
          <TableUtil.SortHeader
            onClick={() => this.handleSort('remain')}
            type={
              this.state.sort.name === 'remain' ? this.state.sort.opt : null
            }
          >
            <span>{i18next.t('??????')}</span>
          </TableUtil.SortHeader>
        ),
        accessor: 'remain',
        Cell: ({ original }) => {
          const { remain, std_unit_name } = original
          const edit_sku_stocks = globalStore.hasPermission('edit_sku_stocks')
          const canGetBatch = globalStore.hasPermission(
            'get_check_batch_number',
          )
          const { stock_method } = globalStore.user
          const { pagination } = this.state
          const xjxcEle = canGetBatch ? (
            <SvgEditPen className='react-table-edit-button gm-cursor gm-text gm-text-hover-primary' />
          ) : null
          return (
            <div
              className={styles.productModify}
              onClick={this.handleEditProductStock.bind(this, original)}
            >
              <SpanStyled
                noPermission={stock_method === 2 && !canGetBatch}
              >{`${parseFloat(
                Big(remain).toFixed(4),
              )}${std_unit_name}`}</SpanStyled>
              {edit_sku_stocks &&
                (stock_method === 2 ? (
                  xjxcEle
                ) : globalStore.hasPermission('edit_sku_stocks') ? (
                  <EditButton
                    popupRender={(close) => (
                      <InventoryEditBubbleConfirm
                        data={original}
                        onCancel={close}
                        onOk={() => this.handlePageChange(pagination)}
                      />
                    )}
                  />
                ) : null)}
            </div>
          )
        },
      },
      {
        Header: (
          <Flex alignCenter>
            {i18next.t('????????????')}
            <div className='gm-gap-5' />
            <ToolTip
              popup={this.renderTipWarning(
                '?????????????????????????????????????????????????????????????????????????????????????????????',
              )}
            />
          </Flex>
        ),
        accessor: 'threshold',
        Cell: ({ original }) => {
          let preWarning = false
          let upWarning = false
          const { pagination } = this.state
          const { threshold, remain, std_unit_name, upper_threshold } = original
          if (!isNotSet(threshold)) {
            preWarning = Big(threshold).minus(remain).toFixed(2) > 0
          }
          if (!isNotSet(upper_threshold)) {
            upWarning = Big(remain).minus(upper_threshold).toFixed(2) > 0
          }
          // ??????????????????
          const min = !_.isNil(threshold) ? threshold : null
          // ??????????????????
          const max = !_.isNil(upper_threshold) ? upper_threshold : null

          return (
            <Flex column>
              <span
                className={classNames(
                  { [styles.warnings]: upWarning },
                  'gm-margin-bottom-5',
                )}
              >
                {i18next.t('?????????')}
                {isNotSet(upper_threshold)
                  ? i18next.t('?????????')
                  : parseFloat(Big(upper_threshold).toFixed(2)) + std_unit_name}
                {p_addThreshold && (
                  <EditButton
                    popupRender={(close) => (
                      <SafeInventoryEditBubbleConfirm
                        value={original}
                        onOk={() => this.handlePageChange(pagination)}
                        onCancel={close}
                        type='upStock'
                        min={min}
                      />
                    )}
                  />
                )}
              </span>
              <span className={preWarning ? styles.warnings : null}>
                {i18next.t('?????????')}

                {isNotSet(threshold)
                  ? i18next.t('?????????')
                  : parseFloat(Big(threshold).toFixed(2)) + std_unit_name}
                {p_addThreshold && (
                  <EditButton
                    popupRender={(close) => (
                      <SafeInventoryEditBubbleConfirm
                        value={original}
                        onOk={() => this.handlePageChange(pagination)}
                        onCancel={close}
                        type='downStock'
                        max={max}
                      />
                    )}
                  />
                )}
              </span>
            </Flex>
          )
        },
      },
      {
        Header: (
          <Flex alignCenter>
            {i18next.t('????????????')}
            <div className='gm-gap-5' />
            <ToolTip
              popup={this.renderTipWarning(
                '????????????????????????????????????????????????????????????????????????0????????????',
              )}
            />
          </Flex>
        ),
        accessor: 'retention_warning_day',
        show: globalStore.user.stock_method === 2,
        Cell: ({ original }) => {
          const { pagination } = this.state
          const { retention_warning, retention_warning_day } = original

          return (
            <Flex
              className={classNames({
                [styles.warnings]:
                  retention_warning && !_.isNil(retention_warning_day),
              })}
            >
              <Popover
                type='hover'
                showArrow
                popup={
                  <div
                    className='gm-padding-5 gm-cursor'
                    onClick={this.handleBatchDetail.bind(this, original.spu_id)}
                  >
                    {i18next.t('??????????????????')}
                  </div>
                }
              >
                <div>
                  {isNotSet(retention_warning_day)
                    ? i18next.t('?????????')
                    : parseFloat(Big(retention_warning_day).toFixed(2)) +
                      i18next.t('???')}
                </div>
              </Popover>
              {p_addThreshold && (
                <EditButton
                  popupRender={(close) => (
                    <SafeInventoryEditBubbleConfirm
                      value={original}
                      onOk={() => this.handlePageChange(pagination)}
                      onCancel={close}
                      type='delayStock'
                    />
                  )}
                />
              )}
            </Flex>
          )
        },
      },
      {
        Header: (
          <Flex alignCenter>
            {i18next.t('?????????')}
            <div className='gm-gap-5' />
            <ToolTip
              popup={this.renderTipWarning(
                '??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????',
              )}
            />
          </Flex>
        ),
        accessor: 'frozen',
        Cell: ({ original: { frozen, std_unit_name, spu_id } }) => {
          return (
            <>
              <Popover
                type='hover'
                showArrow
                popup={
                  <div className='gm-padding-5 gm-cursor'>
                    {i18next.t('????????????????????????')}
                  </div>
                }
              >
                <a
                  onClick={this.handleStockPreview.bind(this, spu_id)}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {`${parseFloat(Big(frozen).toFixed(2))}${std_unit_name}`}
                </a>
              </Popover>
            </>
          )
        },
      },
      {
        Header: (
          <div>
            <TableUtil.SortHeader
              onClick={() => this.handleSort('available_stock')}
              type={
                this.state.sort.name === 'available_stock'
                  ? this.state.sort.opt
                  : null
              }
            >
              <span>{i18next.t('????????????')}</span>
            </TableUtil.SortHeader>
            <ToolTip
              className='gm-margin-left-15'
              popup={this.renderTipWarning(
                '????????????=??????-???????????????????????????????????????????????????',
              )}
            />
          </div>
        ),
        accessor: 'available_stock',
        Cell: ({ original: { available_stock, std_unit_name } }) =>
          `${parseFloat(Big(available_stock).toFixed(2))}${std_unit_name}`,
      },
      {
        Header: i18next.t('????????????'),
        accessor: 'avg_price',
        Cell: ({ original: { avg_price, std_unit_name } }) =>
          `${parseFloat(
            Big(avg_price).div(100).toFixed(2),
          )}${Price.getUnit()}/${std_unit_name}`,
      },
      {
        Header: (
          <Flex alignCenter>
            {i18next.t('??????????????????')}
            <div className='gm-gap-5' />
            <ToolTip
              right
              popup={this.renderTipWarning(
                '?????????????????? = ???????????????????????? ?? ??????????????????',
              )}
            />
          </Flex>
        ),
        accessor: 'stock_value',
      },
      {
        Header: OperationHeader,
        width: referOfWidth.operationCell,
        Cell: ({ original: { spu_id } }) => (
          <OperationCell>
            <OperationDetail
              href={`#/sales_invoicing/inventory/account/details?spu_id=${spu_id}`}
              open
            />
          </OperationCell>
        ),
      },
    ]
    const {
      skuCategories,
      inventoryProductManagementList,
      inventoryProductManagemenSum,
    } = this.props.inventory
    const { loading, list } = inventoryProductManagementList
    const { stock_value_sum } = inventoryProductManagemenSum
    const { pagination, selected, isSelectAll } = this.state
    const { count } = pagination
    // ??????????????????
    const p_priceRepair = globalStore.hasPermission(
      'import_stock_avg_price_repair',
    )
    // ????????????
    const p_supplement = globalStore.hasPermission('edit_supplement_list')
    const weigh_check = globalStore.groundWeightInfo.weigh_check
    // ????????????
    const p_spuAdjustLog = globalStore.hasPermission('get_spu_adjust_log')
    const { isInstalled } = bridge.mes_app.getChromeStatus()

    const functionSet = []

    if (globalStore.hasPermission('edit_sku_stocks')) {
      functionSet.unshift({
        onClick: this.handleBatchCheck,
        text: i18next.t('????????????'),
      })
    }

    if (p_spuAdjustLog) {
      functionSet.unshift({
        onClick: this.handleCostDetail,
        text: i18next.t('??????????????????'),
      })
    }

    if (p_supplement) {
      functionSet.unshift({
        onClick: this.handleSupply,
        text: i18next.t('????????????'),
      })
    }

    return (
      <div>
        <SearchFilter
          list={skuCategories}
          noTime
          hasStockFilter
          hasDelayStock={globalStore.user.stock_method === 2}
          hasSafeStock
          handleSearch={this.onSearch}
          handleExport={this.onExport}
          defaultFilter={this.filter} // ??????cache???????????????????????????????????????????????????????????????cache
        />
        <ManagePagination
          id='product_management_recording_managepagination'
          ref={this.productManagementRecordingRef}
          onRequest={this.handlePageChange}
        >
          <BoxTable
            action={
              <div>
                {p_priceRepair && (
                  <Uploader
                    className='gm-dropper-wrap'
                    onUpload={this.handleBatchPrice}
                    accept='.xlsx'
                  >
                    <Button type='primary'>
                      {i18next.t('??????????????????')}&nbsp;
                    </Button>
                  </Uploader>
                )}
                <div className='gm-gap-10' />

                <FunctionSet data={functionSet} right />
              </div>
            }
            info={
              <Info>
                <TableTotalText
                  data={[
                    {
                      label: i18next.t('????????????'),
                      content: count || 0,
                    },
                    {
                      label: i18next.t('?????????????????????'),
                      content: stock_value_sum || 0,
                    },
                  ]}
                />
              </Info>
            }
          >
            <SelectTable
              data={list}
              columns={columns}
              loading={loading}
              keyField='spu_id'
              selected={selected}
              onSelect={(selected) => this.setState({ selected })}
              onSelectAll={(event) => this.handleSelectAll(event, list)}
              batchActionBar={
                selected.length ? (
                  <BatchActionBar
                    onClose={() => this.handleSelectAll(false, list)}
                    isSelectAll={isSelectAll}
                    toggleSelectAll={(isSelectAll) =>
                      this.setState({ isSelectAll })
                    }
                    count={isSelectAll ? count : selected.length}
                    batchActions={[
                      ...(globalStore.hasPermission('edit_sku_stocks')
                        ? [
                            {
                              name: i18next.t('??????????????????'),
                              type: 'business',
                              onClick: this.handleReportOverflowAndLostBtn,
                            },
                          ]
                        : []),
                      {
                        name: i18next.t('????????????????????????'),
                        type: 'business',
                        onClick: this.handleBatchSafeStock,
                        show: p_addThreshold,
                      },
                      {
                        name: i18next.t('????????????????????????'),
                        type: 'business',
                        onClick: this.handleBatchDelayStock,
                        show:
                          p_addThreshold && globalStore.user.stock_method === 2,
                      },
                    ]}
                  />
                ) : null
              }
            />
          </BoxTable>
        </ManagePagination>

        {!!weigh_check && isInstalled && <DragWeight />}
      </div>
    )
  }
}

ProductManagementRecording.propTypes = {
  inventory: PropTypes.object,
  global: PropTypes.object,
}

export default ProductManagementRecording
