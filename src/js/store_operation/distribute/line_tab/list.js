import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import React from 'react'
import { RightSideModal, Price } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { selectTableXHOC, TableX, TableXUtil } from '@gmfe/table-x'
import _ from 'lodash'
import Big from 'big.js'

import LineTaskStore from './store'
// 引用司机任务列表的OrderSheetModal组件
import OrderSheetModal from '../driver_tab/order_sheet_modal'
import { FEE_LIST } from 'common/enum'
import globalStore from 'stores/global'

import PopupExportModal from '../popup_export_modal'
import {
  CommonPrePrintBtn,
  printerOptionsStore,
} from 'common/components/common_printer_options'
import LinePrintModal from './line_print_modal'
import SVGPrint from 'svg/print.svg'

const SelectTable = selectTableXHOC(TableX)

@observer
class Linelist extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selected: [],
      selectAll: false,
    }
  }

  componentDidMount() {
    LineTaskStore.fetchServiceTime()
    LineTaskStore.setDoFirstRequest(this.pagination.apiDoFirstRequest)
    this.pagination.apiDoFirstRequest()
  }

  handleSelect = (selected) => {
    LineTaskStore.linSelect(selected)
  }

  handlePopupOrderList = (order_ids) => {
    RightSideModal.render({
      title: i18next.t('线路订单列表'),
      onHide: RightSideModal.hide,
      children: <OrderSheetModal orderIds={order_ids.slice()} />,
      style: {
        width: '650px',
      },
    })
  }

  handleSelectAllPage = (bool) => {
    LineTaskStore.handleToggleSelectAllPage(bool)

    // 接口不支持选择 所有页

    const { lineTaskList } = LineTaskStore
    const selected = _.map(lineTaskList, (item) => item.id)
    LineTaskStore.linSelect(selected)
  }

  handleExport = () => {
    const { lineTaskList, selectedLineTaskList } = LineTaskStore
    // 获取已选线路
    const select_lines = _.filter(
      lineTaskList.slice(),
      (_line) =>
        _.findIndex(selectedLineTaskList.slice(), (v) => v === _line.id) !== -1,
    )

    const order_ids = _.reduce(
      select_lines,
      (result, line) => result.concat(line.order_ids.slice()),
      [],
    )

    const query = {
      ids: JSON.stringify(order_ids),
    }

    return RightSideModal.render({
      onHide: RightSideModal.hide,
      style: { width: '300px' },
      children: (
        <PopupExportModal query={query} closeModal={RightSideModal.hide} />
      ),
    })
  }

  render() {
    const { lineTaskList, selectedLineTaskList } = LineTaskStore
    const canExport = globalStore.hasPermission('export_batch_delivery_sheet')

    const selectedLines = lineTaskList.filter((line) =>
      selectedLineTaskList.includes(line.id),
    )

    const batchMustConfirm = selectedLines.some((line) => line.has_unweighted)

    const orderIdList = selectedLines.reduce(
      (result, line) => [...result, ...line.order_ids],
      [],
    )

    const batchGoToPrint = () =>
      printerOptionsStore.lineGotoPrint({ orderIdList })

    return (
      <ManagePaginationV2
        id='pagination_in_distribute_line_list'
        onRequest={LineTaskStore.getLineTaskList}
        ref={(ref) => {
          this.pagination = ref
        }}
      >
        <SelectTable
          data={lineTaskList.slice()}
          keyField='id'
          selected={selectedLineTaskList.slice()}
          onSelect={this.handleSelect}
          batchActionBar={
            selectedLineTaskList.length !== 0 ? (
              <TableXUtil.BatchActionBar
                pure
                onClose={() => this.handleSelect([])}
                batchActions={[
                  {
                    name: (
                      <CommonPrePrintBtn
                        mustConfirm={batchMustConfirm}
                        goToPrint={batchGoToPrint}
                        PrinterOptionsModal={
                          <LinePrintModal goToPrint={batchGoToPrint} />
                        }
                      >
                        {i18next.t('批量打印')}
                      </CommonPrePrintBtn>
                    ),
                    onClick: () => {},
                    type: 'business',
                  },
                  {
                    name: '批量导出',
                    onClick: () => this.handleExport(),
                    show: canExport,
                    type: 'business',
                  },
                ]}
                count={selectedLineTaskList.length}
              />
            ) : null
          }
          columns={[
            {
              Header: i18next.t('线路名'),
              accessor: 'route_name',
            },
            {
              Header: i18next.t('订单数'),
              id: 'order_amount',
              accessor: (original) => {
                return (
                  <div
                    onClick={() =>
                      this.handlePopupOrderList(original.order_ids)
                    }
                    className='gm-cursor gm-text-primary'
                  >
                    {original.order_amount}
                  </div>
                )
              },
            },
            {
              Header: i18next.t('销售额（不含运费）'),
              id: 'sale_money_dict',
              accessor: (original) => {
                const length = _.keys(original.sale_money_dict).length
                return (
                  <div>
                    {_.map(original.sale_money_dict, (val, k) => {
                      const fee = _.find(FEE_LIST, (v) => v.value === k) || {
                        name: i18next.t('未知'),
                      }
                      return (
                        <div key={k}>
                          {length > 1 ? `${fee.name}: ` : ''}
                          {parseFloat(Big(val).div(100).toFixed(2)) +
                            Price.getUnit(k)}
                        </div>
                      )
                    })}
                  </div>
                )
              },
            },
            {
              Header: i18next.t('单据打印'),
              id: 'print_action',
              width: 80,
              accessor: (line) => {
                const mustConfirm = line.has_unweighted
                const goToPrint = () =>
                  printerOptionsStore.lineGotoPrint({
                    orderIdList: line.order_ids.slice(),
                  })

                return (
                  <TableXUtil.OperationCell>
                    <CommonPrePrintBtn
                      mustConfirm={mustConfirm}
                      goToPrint={goToPrint}
                      PrinterOptionsModal={
                        <LinePrintModal goToPrint={goToPrint} />
                      }
                    >
                      <span className='gm-text-14 gm-text-hover-primary'>
                        <SVGPrint />
                      </span>
                    </CommonPrePrintBtn>
                  </TableXUtil.OperationCell>
                )
              },
            },
          ]}
        />
      </ManagePaginationV2>
    )
  }
}

export default Linelist
