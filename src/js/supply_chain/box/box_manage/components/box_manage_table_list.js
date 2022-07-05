import { i18next } from 'gm-i18n'
import React from 'react'
import { Tip, Dialog, BoxTable, Button, RightSideModal } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import qs from 'query-string'
import { inject, observer } from 'mobx-react'
import { openNewTab } from '../../../../common/util'
import { exportExcel } from '../../../../material_manage/util'
import moment from 'moment'
import _ from 'lodash'
import {
  Table,
  expandTableHOC,
  selectTableV2HOC,
  TableUtil,
  subTableHOC,
} from '@gmfe/table'
import {
  orderState,
  orderPackageStatus,
  skuBoxStatus,
  boxTypes,
} from '../../../../common/filter'
import PropTypes from 'prop-types'
import { showTaskPanel } from '../../../../task/task_list'
import getTableChild from '../../../../common/table_child'
import boxManageStore from '../box_manage_store'
import globalStore from '../../../../stores/global'
import BatchActionBar from './batch_action_bar'
import SidePrintModal from '../components/side_print_modal'
import { TplPrintBtn } from 'common/components/tpl'
import { excelOrderHeader, excelSkuHeader } from './export_header'
import SVGPrint from 'svg/print.svg'
const SelectExpandTable = selectTableV2HOC(expandTableHOC(Table))
const SelectSubTable = selectTableV2HOC(subTableHOC(Table))

const TableChild = getTableChild(SelectExpandTable, SelectSubTable)

// 导出两个工作簿，字段相同，数据不同
const exportOptions = [excelOrderHeader, excelSkuHeader, excelSkuHeader]

@inject('tplStore')
@observer
class BoxManageTableList extends React.Component {
  componentDidMount() {
    boxManageStore.setDoFirstRequest(this.pagination.doFirstRequest)
    boxManageStore.fetchServiceTime().then((json) => {
      if (json.data && json.data.length > 0) {
        boxManageStore.doFirstRequest()
      }
    })
  }

  handleSearchRequest = (pagination) => {
    return boxManageStore
      .getBoxOrderList(boxManageStore.searchData, pagination)
      .then((json) => {
        return json
      })
  }

  handlePrintLabel = ({
    hideModal,
    orders,
    box_codes,
    order_ids,
    ...other
  }) => {
    if (box_codes && box_codes.length === 0) {
      Tip.warning(i18next.t('找不到已装箱商品'))
      return
    }
    let tip = i18next.t('确定要打印箱签吗？')
    const unBoxOrder = _.find(orders, (order) => !order.order_box_status)
    if (unBoxOrder) {
      tip = i18next.t('存在未集包订单，确定要打印吗？')
    }
    Dialog.confirm({
      children: tip,
      title: '提示',
    }).then(async () => {
      const { tplStore } = this.props
      console.log(hideModal)
      if (hideModal) {
        this.handlePrint({
          ...other,
          box_codes: JSON.stringify(box_codes),
          order_ids: JSON.stringify(order_ids),
          box_type: boxManageStore.filter.box_type,
          force_print: 1,
          tpl_id: tplStore.tpl_id,
        })
      } else {
        const templates = await boxManageStore.getBoxPrintTemp()
        tplStore.checkTplId(templates)

        RightSideModal.render({
          children: (
            <SidePrintModal
              tplStore={tplStore}
              templates={templates}
              onPrint={(tpl_id) =>
                this.handlePrint({
                  ...other,
                  box_codes: JSON.stringify(box_codes),
                  order_ids: JSON.stringify(order_ids),
                  box_type: boxManageStore.filter.box_type,
                  force_print: 1,
                  tpl_id,
                })
              }
            />
          ),
          style: { width: '300px' },
          onHide: RightSideModal.hide,
        })
      }
    })
  }

  handlePrint = (query) => {
    openNewTab(
      '#/system/setting/distribute_templete/box_label_printer?' +
        qs.stringify(query),
    )
  }

  handleExport = () => {
    boxManageStore
      .getBoxOrderList(boxManageStore.searchData, null, 1)
      .then((json) => {
        const { filename, async, box_skus, unbox_skus, orders } = json.data
        if (async === 0 && !box_skus.length && !unbox_skus.length) {
          Tip.warning(i18next.t('没有数据'))
          return
        }
        if (async === 0) {
          // 不同箱子分开多行展示，需要处理返回的列表数据
          const _box_skus = []
          _.forEach(box_skus, (sku) => {
            _.forEach(sku.box_list, (box) => {
              _box_skus.push({
                ...sku,
                box,
              })
            })
          })

          exportExcel(
            {
              options: exportOptions,
              sheetNames: [
                i18next.t('订单明细'),
                i18next.t('已装箱任务'),
                i18next.t('未装箱任务'),
              ],
              fileName: filename,
            },
            [orders, _box_skus, unbox_skus],
          )
        } else {
          showTaskPanel(null, { tabKey: 0 })
        }
      })
  }

  render() {
    const { list, selectedList } = boxManageStore
    const { tplStore } = this.props
    const printPermission = globalStore.hasPermission('get_boxtag_print')
    const exportPermission = globalStore.hasPermission(
      'get_boxperformance_export',
    )

    const columns = [
      {
        Header: i18next.t('运营周期'),
        width: 160,
        accessor: 'service_time_period',
      },
      {
        Header: i18next.t('订单号'),
        accessor: 'order_id',
      },
      {
        Header: i18next.t('商户名'),
        accessor: 'address_name',
      },
      {
        Header: i18next.t('订单状态'),
        accessor: 'order_status',
        Cell: ({ value: v }) => {
          return <span>{orderState(v)}</span>
        },
      },
      {
        Header: i18next.t('线路'),
        accessor: 'route_name',
      },
      {
        Header: i18next.t('司机'),
        width: 90,
        accessor: 'driver_name',
      },
      {
        Header: i18next.t('集包状态'),
        accessor: 'order_box_status',
        Cell: ({ value: v }) => {
          return <span>{orderPackageStatus(v)}</span>
        },
      },
      {
        Header: i18next.t('箱数'),
        width: 90,
        accessor: 'order_box_num',
      },
      {
        Header: TableUtil.OperationHeader,
        width: 70,
        id: 'action',
        show: printPermission,
        Cell: ({ original }) => (
          <TableUtil.OperationCell>
            <TplPrintBtn
              tplStore={tplStore}
              goToPrint={(obj) => {
                const boxSkus = _.filter(
                  original.children,
                  (child) => child.box,
                )
                const box_codes = _.map(boxSkus, (sku) => sku.box.box_code)
                this.handlePrintLabel({
                  orders: [original],
                  box_codes,
                  ...obj,
                })
              }}
            >
              <span className='gm-text-14 gm-text-hover-primary'>
                <SVGPrint />
              </span>
            </TplPrintBtn>
          </TableUtil.OperationCell>
        ),
      },
    ]

    const subColumns = [
      {
        Header: i18next.t('箱ID'),
        accessor: 'box_code',
        Cell: ({ original: { box } }) => (box ? box.box_code : '-'),
      },
      {
        Header: i18next.t('箱号'),
        accessor: 'box_no',
        Cell: ({ original: { box } }) => (box ? `${box.box_no}号箱` : '-'),
      },
      {
        Header: i18next.t('商品名'),
        accessor: 'sku_name',
      },
      {
        Header: i18next.t('商品规格'),
        accessor: 'sku_id',
      },
      {
        Header: i18next.t('装箱类型'),
        accessor: 'box_type',
        Cell: ({ value: v }) => {
          return <span>{boxTypes(v) || '-'}</span>
        },
      },
      {
        Header: i18next.t('下单数（销售单位）'),
        accessor: 'quantity',
        Cell: ({ original, index }) => (
          <div>{`${original.quantity}${original.sale_unit_name}`}</div>
        ),
      },
      {
        Header: i18next.t('下单数（基本单位）'),
        accessor: 'std_unit_quantity',
        Cell: ({ original, index }) => (
          <div>{`${original.std_unit_quantity}${original.std_unit_name}`}</div>
        ),
      },
      {
        Header: i18next.t('出库数（基本单位）'),
        accessor: 'outstock_quantity',
        Cell: ({ original, index }) => (
          <div>{`${original.outstock_quantity}${original.std_unit_name}`}</div>
        ),
      },
      {
        Header: i18next.t('装箱状态'),
        accessor: 'sku_box_status',
        Cell: ({ value: v }) => {
          return <span>{skuBoxStatus(v)}</span>
        },
      },
      {
        Header: i18next.t('装箱时间'),
        id: 'box_time',
        Cell: ({ original: { box } }) =>
          box ? moment(box.box_time).format('YYYY-MM-DD HH:mm:ss') : '-',
      },
      {
        Header: i18next.t('装箱人'),
        accessor: 'sku_box_operator',
        Cell: ({ original: { box } }) => (box ? box.box_operator : '-'),
      },
      {
        Header: i18next.t('打印状态'),
        accessor: 'printed',
        Cell: ({ original: { box } }) => {
          if (!box) {
            return '-'
          }
          const { print_times } = box
          const status =
            print_times > 0
              ? `${i18next.t('已打印')}(${print_times})`
              : i18next.t('未打印')
          return status
        },
      },
      {
        Header: TableUtil.OperationHeader,
        id: 'action',
        show: printPermission,
        Cell: ({ original: { box } }) => {
          return (
            <TableUtil.OperationCell>
              {box ? (
                <TplPrintBtn
                  tplStore={tplStore}
                  goToPrint={(obj) => {
                    this.handlePrintLabel({
                      box_codes: [box.box_code],
                      ...obj,
                    })
                  }}
                >
                  <span className='gm-text-14 gm-text-hover-primary'>
                    <SVGPrint />
                  </span>
                </TplPrintBtn>
              ) : null}
            </TableUtil.OperationCell>
          )
        },
      },
    ]

    return (
      <BoxTable
        action={
          exportPermission ? (
            <Button type='primary' onClick={this.handleExport}>
              {i18next.t('绩效导出')}
            </Button>
          ) : null
        }
      >
        <ManagePaginationV2
          id='pagination_in_box_manage_list'
          onRequest={this.handleSearchRequest}
          ref={(ref) => {
            this.pagination = ref
          }}
          disablePage
        >
          <TableChild
            data={list.slice()}
            columns={columns}
            keyField='order_id'
            subProps={{
              keyField: '_key',
              columns: subColumns,
              isSelectorDisable: (row) => {
                return !row.box
              },
            }}
            selected={selectedList.slice()}
            onSelect={(selected, selectedTree) => {
              boxManageStore.setSelected(selected, selectedTree)
            }}
            batchActionBar={
              selectedList.length ? (
                <BatchActionBar
                  onPrintLabel={this.handlePrintLabel}
                  tplStore={tplStore}
                />
              ) : null
            }
          />
        </ManagePaginationV2>
      </BoxTable>
    )
  }
}

BoxManageTableList.propTypes = {
  tplStore: PropTypes.object,
}
export default BoxManageTableList
