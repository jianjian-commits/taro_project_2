import { i18next, t } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { Tip, Price, Popover, RightSideModal, Flex } from '@gmfe/react'
import { ManagePagination } from '@gmfe/business'
import { BATCH_ORIGIN_TYPE } from 'common/enum'
import _ from 'lodash'

import './actions'
import './reducer'
import actions from '../../actions'
import Big from 'big.js'
import styles from '../product.module.less'
import DragWeight from '../../common/components/weight/drag_weight'
import weightStore from '../../stores/weight'
import globalStore from '../../stores/global'
import { TableX, TableXUtil } from '@gmfe/table-x'
import BatchPopConfirm from './batch_pop_confirm'
import bridge from '../../bridge/index'
import BatchBatchFilter from './batch_batch_filter'
// import TableTotalText from 'common/components/table_total_text'
import TaskList from '../../task/task_list'
import SupplierDel from '../../common/components/supplier_del_sign'
import ToolTip from '@gmfe/react/src/component/tool_tip'
import classNames from 'classnames'
import HeaderTip from '../../common/components/header_tip'
import { Select } from '@gmfe/react'
import moment from 'moment'

const { OperationHeader, EditButton, OperationDetail } = TableXUtil

@observer
class BatchManagementRecording extends React.Component {
  stock_method = globalStore.user.stock_method
  p_edit = globalStore.hasPermission('edit_sku_stocks')
  filter = {}

  columns = [
    {
      Header: i18next.t('批次号'),
      accessor: 'batch_number',
      Cell: ({
        row: {
          original: { batch_number },
        },
      }) => (
        <Popover showArrow type='hover' popup={this.hoverTips(batch_number)}>
          <span>{this.interceptBatchNum(batch_number)}</span>
        </Popover>
      ),
    },
    {
      Header: i18next.t('批次来源'),
      accessor: 'origin_type',
      Cell: (cellProps) => {
        const { origin_type } = cellProps.row.original
        return BATCH_ORIGIN_TYPE[origin_type]
      },
    },
    {
      Header: (
        <Flex>
          {i18next.t('入库规格ID')}
          <ToolTip
            className='gm-margin-left-5'
            showArrow
            popup={
              <div className='gm-padding-5'>
                {i18next.t('入库规格ID：展示规格ID，如无规格则展示商品ID')}
              </div>
            }
          />
        </Flex>
      ),
      accessor: 'sku_id',
      Cell: (cellProps) => {
        const { sku_id, spu_id } = cellProps.row.original
        return sku_id || spu_id || '-'
      },
    },
    {
      Header: (
        <Flex>
          {i18next.t('入库规格名')}
          <ToolTip
            className='gm-margin-left-5'
            showArrow
            popup={
              <div className='gm-padding-5'>
                {i18next.t('入库规格名：展示规格名，如无规格名则展示商品名')}
              </div>
            }
          />
        </Flex>
      ),
      accessor: 'sku_name',
      Cell: (cellProps) => {
        const { sku_name, spu_name } = cellProps.row.original
        return sku_name || spu_name || '-'
      },
    },
    {
      Header: () => (
        <>
          {i18next.t('库存数')}
          <br />
          {i18next.t('(基本单位)')}
        </>
      ),
      accessor: 'std_unit',
      Cell: ({ row: { original } }) => {
        const { remain, std_unit } = original
        return (
          <div className={styles.productModify}>
            <span>
              {remain}
              {std_unit}
            </span>
            {this.stock_method === 2 ? (
              this.p_edit && globalStore.hasPermission('edit_sku_stocks') ? (
                <EditButton
                  popupRender={(closePopup) => {
                    return (
                      <BatchPopConfirm
                        onCancel={closePopup}
                        value={original}
                        onOk={this.handleEditOk}
                      />
                    )
                  }}
                />
              ) : null
            ) : null}
          </div>
        )
      },
    },
    {
      Header: (
        <HeaderTip
          tip={t(
            '在库时间：商品批次从入库时间至今的天数，当存储天数大于可存储天数，且库存大于0时，标记为呆滞品',
          )}
          title={t('在库时间')}
        />
      ),
      accessor: 'retention_warning_day',
      Cell: ({ row: { original } }) => {
        const { retention_warning_day, on_stock_day, remain } = original

        return (
          <div
            className={classNames({
              [styles.warnings]:
                !_.isNil(retention_warning_day) &&
                remain > 0 &&
                retention_warning_day < on_stock_day,
            })}
          >
            {on_stock_day}
            {t('天')}
          </div>
        )
      },
    },
    {
      Header: i18next.t('入库规格'),
      accessor: 'ratio',
      Cell: (cellProps) => {
        const {
          std_unit,
          purchase_unit,
          ratio,
          origin_type,
        } = cellProps.row.original
        if (origin_type === 7) {
          // 分割单时不展示
          return '-'
        }
        // 仓内移库存在特殊逻辑，有可能移动分割单
        if (origin_type === 8 && _.isNil(ratio) && _.isNil(purchase_unit)) {
          return '-'
        }
        return `${ratio}${std_unit}/${purchase_unit}`
      },
    },
    {
      Header: () => (
        <>
          {i18next.t('库存数')}
          <br />
          {i18next.t('(采购单位)')}
        </>
      ),
      accessor: 'purchase_unit',
      Cell: ({
        row: {
          original: { remain, ratio, purchase_unit },
        },
      }) =>
        _.isNumber(remain) && _.isNumber(ratio)
          ? `${parseFloat(Big(remain).div(ratio).toFixed(2))}${purchase_unit}`
          : '-',
    },
    {
      Header: i18next.t('批次库存均价'),
      accessor: 'price',
      Cell: ({
        row: {
          original: { std_unit, price },
        },
      }) =>
        `${parseFloat(
          Big(price).div(100).toFixed(2),
        )}${Price.getUnit()}/${std_unit}`,
    },
    {
      Header: i18next.t('供应商信息'),
      accessor: 'supplier_name',
      width: '180',
      Cell: (cellProps) => {
        const {
          origin_type,
          supplier_customer_id,
          supplier_name,
          supplier_status,
        } = cellProps.row.original
        // 分割单不存在供应商信息
        if (origin_type === 7) {
          return '-'
        }
        // 逻辑同入库规格名
        if (origin_type === 8 && _.isNil(supplier_customer_id)) {
          return '-'
        }
        return (
          <Flex>
            {supplier_status === 0 && <SupplierDel />}
            {`${supplier_name}(${supplier_customer_id})`}
          </Flex>
        )
      },
    },
    {
      Header: i18next.t('批次状态'),
      accessor: 'status',
      Cell: ({
        row: {
          original: { status, batch_number },
          index,
        },
      }) => {
        // status: 1  // M, int,-1，删除；1，待提交（净菜）；2，正常；3，损坏；4，临期；5，过期
        if ([-1, 1].includes(status)) return '-'
        const map = {
          2: '正常',
          3: '损坏',
          4: '临期',
          5: '过期',
        }
        // eslint-disable-next-line no-prototype-builtins
        if (!map.hasOwnProperty(status)) return '-'

        const array = Object.entries(map).map(([key, value]) => ({
          value: key,
          text: value,
        }))

        const onChange = (v) => {
          this.handleEditStatus({ batch_number, status: +v })
        }

        return (
          <Select value={status.toString()} data={array} onChange={onChange} />
        )
      },
    },
    {
      Header: i18next.t('存放货位'),
      accessor: 'shelf_name',
      Cell: ({
        row: {
          original: { shelf_name },
        },
      }) => {
        const length = shelf_name ? shelf_name.length : 0
        if (Big(length).gt(7)) {
          return (
            <Popover showArrow type='hover' popup={this.hoverTips(shelf_name)}>
              <p className={styles.shelf}>{shelf_name}</p>
            </Popover>
          )
        }
        return shelf_name || '-'
      },
    },
    {
      Header: i18next.t('生产日期'),
      accessor: 'production_time',
      Cell: ({
        row: {
          original: { production_time },
        },
      }) => production_time || '-',
    },
    {
      Header: i18next.t('到期日'),
      accessor: 'life_time',
      Cell: ({
        row: {
          original: { life_time },
        },
      }) => life_time || '-',
    },
  ]

  constructor(props) {
    super(props)

    this.batchManagementRecordingRef = React.createRef()
    this.state = {
      pagination: {
        offset: 0,
        limit: 10,
      },
    }

    if (this.props.location.query.q) {
      this.filter.text = this.props.location.query.q
    }

    if (this.stock_method === 2) {
      this.columns.push({
        Header: OperationHeader,
        accessor: 'operation',
        Cell: ({
          row: {
            original: { batch_number },
          },
        }) => (
          <div className='text-center'>
            <OperationDetail
              href={`#/sales_invoicing/inventory/product/change_record?id=${batch_number}`}
            />
          </div>
        ),
      })
    }
  }

  componentDidMount() {
    this.batchManagementRecordingRef.current.apiDoFirstRequest()
  }

  handleSearch = (filter) => {
    this.filter = {
      text: filter.text,
      delayType: filter.delayType,
      status: filter.status,
      start_time: filter.start_time,
      end_time: filter.end_time,
      remain_status: filter.remain_status,
    }

    this.batchManagementRecordingRef.current.apiDoFirstRequest()
  }

  handleEditOk = (option) => {
    const req = Object.assign({}, this.handleReqFilter(), {
      ...this.state.pagination,
    })
    return actions
      .product_inventory_batch_management_stock_edit(option)
      .then(() => {
        Tip.success(i18next.t('修改库存成功'))
        actions.product_inventory_batch_management_list(req)
      })
      .catch(() => {
        actions.product_inventory_batch_management_list(req)
        Tip.warning(i18next.t('修改库存失败'))
      })
  }

  handleEditStatus = (data) => {
    const req = Object.assign({}, this.handleReqFilter(), {
      ...this.state.pagination,
    })
    return actions
      .product_inventory_batch_edit_status(data)
      .then(() => {
        Tip.success(i18next.t('修改批次状态成功'))
        actions.product_inventory_batch_management_list(req)
      })
      .catch(() => {
        actions.product_inventory_batch_management_list(req)
        Tip.warning(i18next.t('修改批次状态失败'))
      })
  }

  handleReqFilter = (filter) => {
    const { text, delayType, status, start_time, end_time, remain_status } =
      filter || this.filter

    const reqFilter = {
      text: text || undefined,
      retention_type: +delayType !== 0 ? delayType : undefined,
      status: status !== 0 ? status : undefined,
      remain_status: remain_status !== 0 ? remain_status : undefined,
      start_time:
        start_time ??
        moment(new Date().setMonth(new Date().getMonth() - 3)).format(
          'YYYY-MM-DD',
        ),
      end_time: end_time ?? moment(new Date()).format('YYYY-MM-DD'),
    }

    return Object.assign({}, reqFilter)
  }

  handleExport = (filter) => {
    actions
      .product_inventory_batch_list_export(this.handleReqFilter(filter))
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

  handlePageChange = (page) => {
    const req = Object.assign({}, this.handleReqFilter(), page)

    return actions.product_inventory_batch_management_list(req).then((json) => {
      this.setState({ pagination: json.pagination })

      return json
    })
  }

  interceptBatchNum = (num) => {
    return _.split(num, '-').length === 1
      ? num
      : _.join(_.drop(_.split(num, '-'), 2), '-')
  }

  handleReadingPound = () => {
    const weightBridgeData = +(weightStore.data || 0)
    this.realityNum.value = weightBridgeData
  }

  hoverTips = (tips) => {
    return (
      <div
        className='gm-padding-10 gm-bg'
        style={{ minWidth: '160px', color: '#333' }}
      >
        {tips}
      </div>
    )
  }

  render() {
    const { inventoryBatchManagementList } = this.props.inventory
    const { list, loading } = inventoryBatchManagementList
    // const { pagination } = this.state
    // edit_sku_stocks
    const weigh_check = globalStore.groundWeightInfo.weigh_check
    const { isInstalled } = bridge.mes_app.getChromeStatus()

    return (
      <div>
        <BatchBatchFilter
          onSearch={this.handleSearch}
          onExport={this.handleExport}
          defaultFilter={this.filter}
          placeholder={t('输入商品名、商品ID、规格ID或批次号')}
          hasDelayStock
        />
        <ManagePagination
          id='batch_management_recording_managepagination'
          ref={this.batchManagementRecordingRef}
          onRequest={this.handlePageChange}
        >
          <TableX
            data={list.slice()}
            columns={this.columns}
            loading={loading}
          />
        </ManagePagination>
        {!!weigh_check && isInstalled && <DragWeight />}
      </div>
    )
  }
}

BatchManagementRecording.propTypes = {
  inventory: PropTypes.object,
}

export default BatchManagementRecording
