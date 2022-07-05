import React, { useEffect, useRef } from 'react'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import { ManagePaginationV2 } from '@gmfe/business'
import { selectTableXHOC, TableX, TableXUtil } from '@gmfe/table-x'
import { BoxTable, Modal, RightSideModal } from '@gmfe/react'
import TableTotalText from 'common/components/table_total_text'
import Big from 'big.js'
import { getStatusStr } from './../util'
import store from './store'
import { PAY_METHOD_ENUM } from '../../../common/enum'
import BatchPayModal from './batch_pay_modal'
import SVGPrint from 'svg/print.svg'
import PopupPrintModal from '../components/popup_print_modal'

const { BatchActionBar } = TableXUtil
const SelectTableX = selectTableXHOC(TableX)

const List = () => {
  const paginationRef = useRef()

  useEffect(() => {
    store.setDoFirstRequest(paginationRef.current.apiDoFirstRequest)
    paginationRef.current.apiDoFirstRequest()
  }, [])

  const handleRequest = (pagination) => {
    return store.fetchList(pagination)
  }

  // 批量结款
  const handleSettleCount = () => {
    Modal.render({
      title: i18next.t('批量结款'),
      children: <BatchPayModal />,
      onHide: Modal.hide,
    })
  }

  const handlePrint = (id) => {
    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: { width: '300px' },
      children: <PopupPrintModal id={id} closeModal={RightSideModal.hide} />,
    })
  }

  const { selectedList, dataList, isSelectAll, loading, pagination } = store

  return (
    <BoxTable
      info={
        <BoxTable.Info>
          <TableTotalText
            data={[
              {
                label: i18next.t('商品总数'),
                content: pagination.count || 0,
              },
            ]}
          />
        </BoxTable.Info>
      }
    >
      <ManagePaginationV2
        id='settle_sheet_list'
        ref={paginationRef}
        onRequest={handleRequest}
      >
        <SelectTableX
          data={dataList.slice()}
          keyField='id'
          loading={loading}
          onSelect={(selected) => store.handleSelected(selected)}
          selected={selectedList.slice()}
          isSelectorDisable={(item) => item.status !== 2 && item.status !== 3}
          columns={[
            {
              Header: i18next.t('建单时间'),
              accessor: 'date_time',
            },
            {
              Header: i18next.t('结款单号'),
              width: '250',
              accessor: (d) => (
                <a
                  onClick={() =>
                    window.open(
                      `#/sales_invoicing/finance/payment_review/${d.id}`,
                    )
                  }
                >
                  {d.id}
                </a>
              ),
            },
            {
              Header: i18next.t('供应商'),
              accessor: 'settle_supplier_name',
            },
            {
              Header: i18next.t('单据总金额'),
              accessor: 'total_price',
              Cell: ({ row: { original } }) =>
                Big(original.total_price || 0)
                  .plus(original.delta_money || 0)
                  .div(100)
                  .toFixed(2) + i18next.t('元'),
            },
            {
              Header: i18next.t('结算周期'),
              accessor: 'pay_method',
              Cell: ({ row: { original } }) =>
                PAY_METHOD_ENUM[original.pay_method] || '-',
            },
            {
              Header: i18next.t('结款单状态'),
              accessor: 'status',
              Cell: ({ row: { original } }) => getStatusStr(original.status),
            },
            {
              Header: i18next.t('单据打印'),
              id: 'print_action',
              width: 80,
              accessor: (d) => {
                return (
                  <TableXUtil.OperationCell>
                    <TableXUtil.OperationIconTip tip={i18next.t('打印')}>
                      <span
                        className='gm-cursor gm-text-14 gm-text-hover-primary'
                        onClick={() => handlePrint(d.id)}
                      >
                        <SVGPrint />
                      </span>
                    </TableXUtil.OperationIconTip>
                  </TableXUtil.OperationCell>
                )
              },
            },
          ]}
          batchActionBar={
            selectedList.length > 0 && (
              <BatchActionBar
                batchActions={[
                  {
                    name: i18next.t('批量结款'),
                    onClick: handleSettleCount,
                    type: 'business',
                  },
                ]}
                isSelectAll={isSelectAll}
                count={isSelectAll ? null : selectedList.length}
                toggleSelectAll={(bool) => store.handleSelectAll(bool)}
                onClose={() => store.handleSelected([])}
              />
            )
          }
        />
      </ManagePaginationV2>
    </BoxTable>
  )
}

export default observer(List)
