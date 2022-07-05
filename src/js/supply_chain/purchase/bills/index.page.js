/* eslint-disable react/jsx-handler-names */
import { ManagePaginationV2 } from '@gmfe/business'
import {
  BoxTable,
  Button,
  Dialog,
  Flex,
  Price,
  RightSideModal,
  Tip,
} from '@gmfe/react'
import {
  diyTableXHOC,
  fixedColumnsTableXHOC,
  selectTableXHOC,
  TableX,
  TableXUtil,
} from '@gmfe/table-x'
import Big from 'big.js'
import HeaderTip from 'common/components/header_tip'
import SupplierDel from 'common/components/supplier_del_sign'
import { i18next } from 'gm-i18n'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import moment from 'moment'
import qs from 'query-string'
import React from 'react'
import { Link } from 'react-router-dom'
import {
  getPurchaseSheetSource,
  getPurchaseSheetStatus,
  getRequireGoodsStatus,
} from '../../../common/filter'
import { history } from '../../../common/service'
import globalStore from '../../../stores/global'
import TaskList from '../../../task/task_list'
import ShareQrcode from '../components/share_qrcode'
import Filter from './components/filter'
import store from './store'

const SelectTable = selectTableXHOC(diyTableXHOC(fixedColumnsTableXHOC(TableX)))

@observer
class PurchaseBills extends React.Component {
  constructor(props) {
    super(props)
    this.pagination = React.createRef()
  }

  componentDidMount() {
    store.getSupplierList()
    this.pagination.current.apiDoFirstRequest()
  }

  componentWillUnmount() {
    store.init()
  }

  handleNewCreateBill = () => {
    history.push('/supply_chain/purchase/bills/detail/create')
  }

  handleExport = () => {
    const { start_time, end_time, ...rest } = store.filter
    const data = {
      ...rest,
      start_time_new: moment(store.filter.start_time).format(
        'YYYY-MM-DD HH:mm:ss',
      ),
      end_time_new: moment(store.filter.end_time).format('YYYY-MM-DD HH:mm:ss'),
      export: 1,
    }

    window.open('/stock/purchase_sheet/get?' + qs.stringify(data))
  }

  handlePageChange = (pagination) => {
    return store.getList(pagination)
  }

  handleSelect = (selected) => {
    store.setSelectAllType(false)
    store.selectSingle(selected)
  }

  handleChangeSelectAllType = (bool) => {
    store.setSelectAllType(bool)
  }

  // 发送要货申请
  handleSendRequiredGoodsApply = () => {
    const { selected, selectAllType } = store
    if (!selected.length) {
      Tip.info(i18next.t('请选择采购单据'))
      return
    }
    Dialog.confirm({
      children: i18next.t('发送后供应商可查看并编辑单据信息，是否确认发送？'),
    }).then(() => {
      const params = selectAllType ? null : selected
      store.apply(params).then(() => {
        this.pagination.current.apiDoFirstRequest()
        selectAllType
          ? Tip.success(i18next.t('发送要货全部成功'))
          : Tip.success(i18next.t('发送要货申请成功'))
      })
    })
  }

  /**
   * 批量提交采购单
   */
  handleBatchSubmitPurchaseSheets() {
    const { selectAllType, filter, selected } = store

    let purchaseSheets = {}
    if (selectAllType) {
      purchaseSheets = {
        start_time_new: filter.start_time.format('YYYY-MM-DD HH:mm:ss'),
        end_time_new: filter.end_time.format('YYYY-MM-DD HH:mm:ss'),
        ...filter,
      }
      delete purchaseSheets.start_time
      delete purchaseSheets.end_time
    } else {
      purchaseSheets = {
        sheet_no_list: JSON.stringify(toJS(selected)),
      }
    }

    store.submitPurchaseSheets(purchaseSheets).then(() => {
      RightSideModal.render({
        children: <TaskList tabKey={1} />,
        onHide: () => {
          RightSideModal.hide()
          store.setSelectAllType(false)
          store.getList().then(this.pagination.current.apiDoCurrentRequest)
        },
        style: {
          width: '300px',
        },
      })
    })
  }

  // 分享采购单据
  handleShareQrcode(supplier_name, id) {
    // 根据采购单id获取token
    store.getShareToken(id).then((json) => {
      const query = {
        group_id: globalStore.groupId,
        sheet_no: id,
        station_id: globalStore.stationId,
        token: json.data.token,
      }

      Dialog.dialog({
        title: i18next.t('采购单据分享'),
        children: (
          <ShareQrcode
            shareType='order'
            shareName={supplier_name}
            shareUrlParam={query}
          />
        ),
        OKBtn: false,
        size: 'md',
      })
    })
  }

  handleDel = (sheet_no) => {
    store.delete(sheet_no).then(() => {
      Tip.success(
        i18next.t('KEY234', { VAR1: sheet_no }),
        /* src:`${sheet_no}删除成功` => tpl:${VAR1}删除成功 */
      )
      // 删除采购单后刷新列表
      store.getList().then(this.pagination.current.apiDoFirstRequest)
    })
  }

  handleSearch = () => {
    this.pagination.current.apiDoFirstRequest()
  }

  render() {
    const { list, selectAllType, selected } = store
    const p_export = globalStore.hasPermission('get_purchase_sheet_export')
    const p_share = globalStore.hasPermission('get_purchase_sheet_share')
    const p_create = globalStore.hasPermission('add_create_purchase_sheet')

    return (
      <>
        <Filter store={store} search={this.handleSearch} />
        <BoxTable
          action={
            <div>
              {p_create && (
                <Button type='primary' onClick={this.handleNewCreateBill}>
                  {i18next.t('新建采购单据')}
                </Button>
              )}
              {p_export && (
                <Button
                  onClick={this.handleExport}
                  className='gm-margin-left-10'
                >
                  {i18next.t('导出采购价')}
                </Button>
              )}
            </div>
          }
        >
          <ManagePaginationV2
            id='pagination_in_purchase_sheet_list'
            onRequest={this.handlePageChange}
            ref={this.pagination}
          >
            <SelectTable
              data={list.slice()}
              keyField='id'
              selected={selected.slice()}
              id='purcharse_bill_list_v1.0'
              onSelect={this.handleSelect}
              diyGroupSorting={[i18next.t('基础字段')]}
              batchActionBar={
                selected.length ? (
                  <TableXUtil.BatchActionBar
                    isSelectAll={selectAllType}
                    onClose={() => {
                      this.handleSelect([])
                    }}
                    toggleSelectAll={(bool) => {
                      this.handleSelect(list.map((item) => item.id))
                      this.handleChangeSelectAllType(bool)
                    }}
                    count={selectAllType ? null : selected.length}
                    batchActions={[
                      {
                        name: i18next.t('发送要货申请'),
                        onClick: this.handleSendRequiredGoodsApply,
                        type: 'business',
                      },
                      {
                        name: i18next.t('批量提交采购单'),
                        onClick: this.handleBatchSubmitPurchaseSheets.bind(
                          this,
                        ),
                        type: 'edit',
                      },
                    ]}
                  />
                ) : null
              }
              columns={[
                {
                  Header: i18next.t('建单日期'),
                  id: 'create_time',
                  minWidth: 100,
                  diyGroupName: i18next.t('基础字段'),
                  accessor: ({ create_time }) =>
                    moment(create_time).format('YYYY-MM-DD HH:mm:ss'),
                },
                {
                  Header: i18next.t('采购单据号'),
                  id: 'id',
                  minWidth: 210,
                  diyEnable: false,
                  diyGroupName: i18next.t('基础字段'),
                  accessor: ({ id, plan_change_sheet, status }) => (
                    <div>
                      <Link
                        to={`/supply_chain/purchase/bills/detail?id=${id}`}
                        target='_blank'
                      >
                        {id}
                      </Link>
                      {plan_change_sheet &&
                        getPurchaseSheetStatus(status) !== '已提交' && (
                          <span
                            style={{
                              padding: '2px',
                              backgroundColor: '#F5222D',
                              color: 'white',
                            }}
                          >
                            差异
                          </span>
                        )}
                    </div>
                  ),
                },
                {
                  Header: i18next.t('单据来源'),
                  id: 'source',
                  minWidth: 100,
                  diyGroupName: i18next.t('基础字段'),
                  accessor: ({ source }) => getPurchaseSheetSource(+source),
                },
                {
                  Header: i18next.t('采购任务数'),
                  accessor: 'purchase_sku_num',
                  minWidth: 80,
                  diyGroupName: i18next.t('基础字段'),
                },
                {
                  Header: i18next.t('预采购金额'),
                  minWidth: 100,
                  id: 'purchase_plan_money',
                  diyGroupName: i18next.t('基础字段'),
                  accessor: ({ purchase_plan_money }) =>
                    Big(purchase_plan_money || 0).toFixed(2) + Price.getUnit(),
                },
                {
                  Header: i18next.t('采购金额'),
                  minWidth: 100,
                  id: 'purchase_sku_money',
                  diyGroupName: i18next.t('基础字段'),
                  accessor: ({ purchase_sku_money }) =>
                    Big(purchase_sku_money || 0)
                      .div(100)
                      .toFixed(2) + Price.getUnit(),
                },
                {
                  Header: (
                    <HeaderTip
                      title={i18next.t('供应商')}
                      tip={i18next.t(
                        '提示：供应商删除后，单据无法提交，并且无法发送至供应商。请更换其他供应商！',
                      )}
                    />
                  ),
                  minWidth: 150,
                  accessor: 'settle_supplier_name',
                  diyItemText: i18next.t('供应商'),
                  diyGroupName: i18next.t('基础字段'),
                  Cell: (cellProps) => {
                    const {
                      settle_supplier_name,
                      supplier_status,
                    } = cellProps.row.original
                    const isDeleted = supplier_status === 0
                    return (
                      <Flex>
                        {isDeleted && <SupplierDel />}
                        {settle_supplier_name}
                      </Flex>
                    )
                  },
                },
                {
                  Header: i18next.t('采购员'),
                  accessor: 'purchaser',
                  minWidth: 120,
                  diyGroupName: i18next.t('基础字段'),
                },
                {
                  Header: i18next.t('创建人'),
                  accessor: 'operator',
                  minWidth: 120,
                  diyGroupName: i18next.t('基础字段'),
                },
                {
                  Header: i18next.t('要货申请状态'),
                  id: 'require_goods_sheet_status',
                  minWidth: 150,
                  diyGroupName: i18next.t('基础字段'),
                  accessor: ({ require_goods_sheet_status }) =>
                    getRequireGoodsStatus(require_goods_sheet_status),
                },
                {
                  Header: i18next.t('单据状态'),
                  id: 'status',
                  minWidth: 100,
                  diyGroupName: i18next.t('基础字段'),
                  accessor: ({ status }) => getPurchaseSheetStatus(status),
                },
                {
                  Header: TableXUtil.OperationHeader,
                  diyGroupName: i18next.t('基础字段'),
                  diyItemText: i18next.t('操作'),
                  width: 80,
                  fixed: 'right',
                  id: 'action',
                  Cell: ({ row: { original } }) => {
                    const { status, id, settle_supplier_name } = original
                    return (
                      <TableXUtil.OperationCell>
                        {p_share && (
                          <TableXUtil.OperationIconTip tip={i18next.t('分享')}>
                            <span
                              className='gm-margin-left-5'
                              onClick={this.handleShareQrcode.bind(
                                this,
                                settle_supplier_name,
                                id,
                              )}
                            >
                              <i className='xfont xfont-share-bold gm-text-16 gm-text-hover-primary gm-cursor' />
                            </span>
                          </TableXUtil.OperationIconTip>
                        )}
                        {status !== 2 && (
                          <TableXUtil.OperationDelete
                            title='警告'
                            onClick={this.handleDel.bind(this, id)}
                          >
                            {
                              i18next.t('KEY233', {
                                VAR1: id,
                              }) /* src:`确认删除${id}？` => tpl:确认删除${VAR1}？ */
                            }
                          </TableXUtil.OperationDelete>
                        )}
                      </TableXUtil.OperationCell>
                    )
                  },
                },
              ].filter((_) => _)}
            />
          </ManagePaginationV2>
        </BoxTable>
      </>
    )
  }
}

export default PurchaseBills
