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

  // ??????????????????
  handleSendRequiredGoodsApply = () => {
    const { selected, selectAllType } = store
    if (!selected.length) {
      Tip.info(i18next.t('?????????????????????'))
      return
    }
    Dialog.confirm({
      children: i18next.t('????????????????????????????????????????????????????????????????????????'),
    }).then(() => {
      const params = selectAllType ? null : selected
      store.apply(params).then(() => {
        this.pagination.current.apiDoFirstRequest()
        selectAllType
          ? Tip.success(i18next.t('????????????????????????'))
          : Tip.success(i18next.t('????????????????????????'))
      })
    })
  }

  /**
   * ?????????????????????
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

  // ??????????????????
  handleShareQrcode(supplier_name, id) {
    // ???????????????id??????token
    store.getShareToken(id).then((json) => {
      const query = {
        group_id: globalStore.groupId,
        sheet_no: id,
        station_id: globalStore.stationId,
        token: json.data.token,
      }

      Dialog.dialog({
        title: i18next.t('??????????????????'),
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
        /* src:`${sheet_no}????????????` => tpl:${VAR1}???????????? */
      )
      // ??????????????????????????????
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
                  {i18next.t('??????????????????')}
                </Button>
              )}
              {p_export && (
                <Button
                  onClick={this.handleExport}
                  className='gm-margin-left-10'
                >
                  {i18next.t('???????????????')}
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
              diyGroupSorting={[i18next.t('????????????')]}
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
                        name: i18next.t('??????????????????'),
                        onClick: this.handleSendRequiredGoodsApply,
                        type: 'business',
                      },
                      {
                        name: i18next.t('?????????????????????'),
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
                  Header: i18next.t('????????????'),
                  id: 'create_time',
                  minWidth: 100,
                  diyGroupName: i18next.t('????????????'),
                  accessor: ({ create_time }) =>
                    moment(create_time).format('YYYY-MM-DD HH:mm:ss'),
                },
                {
                  Header: i18next.t('???????????????'),
                  id: 'id',
                  minWidth: 210,
                  diyEnable: false,
                  diyGroupName: i18next.t('????????????'),
                  accessor: ({ id, plan_change_sheet, status }) => (
                    <div>
                      <Link
                        to={`/supply_chain/purchase/bills/detail?id=${id}`}
                        target='_blank'
                      >
                        {id}
                      </Link>
                      {plan_change_sheet &&
                        getPurchaseSheetStatus(status) !== '?????????' && (
                          <span
                            style={{
                              padding: '2px',
                              backgroundColor: '#F5222D',
                              color: 'white',
                            }}
                          >
                            ??????
                          </span>
                        )}
                    </div>
                  ),
                },
                {
                  Header: i18next.t('????????????'),
                  id: 'source',
                  minWidth: 100,
                  diyGroupName: i18next.t('????????????'),
                  accessor: ({ source }) => getPurchaseSheetSource(+source),
                },
                {
                  Header: i18next.t('???????????????'),
                  accessor: 'purchase_sku_num',
                  minWidth: 80,
                  diyGroupName: i18next.t('????????????'),
                },
                {
                  Header: i18next.t('???????????????'),
                  minWidth: 100,
                  id: 'purchase_plan_money',
                  diyGroupName: i18next.t('????????????'),
                  accessor: ({ purchase_plan_money }) =>
                    Big(purchase_plan_money || 0).toFixed(2) + Price.getUnit(),
                },
                {
                  Header: i18next.t('????????????'),
                  minWidth: 100,
                  id: 'purchase_sku_money',
                  diyGroupName: i18next.t('????????????'),
                  accessor: ({ purchase_sku_money }) =>
                    Big(purchase_sku_money || 0)
                      .div(100)
                      .toFixed(2) + Price.getUnit(),
                },
                {
                  Header: (
                    <HeaderTip
                      title={i18next.t('?????????')}
                      tip={i18next.t(
                        '???????????????????????????????????????????????????????????????????????????????????????????????????????????????',
                      )}
                    />
                  ),
                  minWidth: 150,
                  accessor: 'settle_supplier_name',
                  diyItemText: i18next.t('?????????'),
                  diyGroupName: i18next.t('????????????'),
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
                  Header: i18next.t('?????????'),
                  accessor: 'purchaser',
                  minWidth: 120,
                  diyGroupName: i18next.t('????????????'),
                },
                {
                  Header: i18next.t('?????????'),
                  accessor: 'operator',
                  minWidth: 120,
                  diyGroupName: i18next.t('????????????'),
                },
                {
                  Header: i18next.t('??????????????????'),
                  id: 'require_goods_sheet_status',
                  minWidth: 150,
                  diyGroupName: i18next.t('????????????'),
                  accessor: ({ require_goods_sheet_status }) =>
                    getRequireGoodsStatus(require_goods_sheet_status),
                },
                {
                  Header: i18next.t('????????????'),
                  id: 'status',
                  minWidth: 100,
                  diyGroupName: i18next.t('????????????'),
                  accessor: ({ status }) => getPurchaseSheetStatus(status),
                },
                {
                  Header: TableXUtil.OperationHeader,
                  diyGroupName: i18next.t('????????????'),
                  diyItemText: i18next.t('??????'),
                  width: 80,
                  fixed: 'right',
                  id: 'action',
                  Cell: ({ row: { original } }) => {
                    const { status, id, settle_supplier_name } = original
                    return (
                      <TableXUtil.OperationCell>
                        {p_share && (
                          <TableXUtil.OperationIconTip tip={i18next.t('??????')}>
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
                            title='??????'
                            onClick={this.handleDel.bind(this, id)}
                          >
                            {
                              i18next.t('KEY233', {
                                VAR1: id,
                              }) /* src:`????????????${id}???` => tpl:????????????${VAR1}??? */
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
