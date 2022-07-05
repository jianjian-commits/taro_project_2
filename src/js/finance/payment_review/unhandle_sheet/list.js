import React, { useEffect, useRef } from 'react'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import { ManagePaginationV2 } from '@gmfe/business'
import { selectTableXHOC, TableX, TableXUtil } from '@gmfe/table-x'
import { BoxTable, Tip, Dialog, RightSideModal, Modal } from '@gmfe/react'
import TableTotalText from 'common/components/table_total_text'
import Big from 'big.js'
import moment from 'moment'
import { getTypeStr } from './../util'
import store from './store'
import _ from 'lodash'
import SVGPrint from 'svg/print.svg'
import PopupPrintModal from '../../../sales_invoicing/stock_in/product/component/popup_print_modal'
import PaymentModal from './components/payment_modal'

const { BatchActionBar } = TableXUtil
const SelectTableX = selectTableXHOC(TableX)

const List = () => {
  const paginationRef = useRef(null)

  const { selectedList, dataList, isSelectAll, loading, pagination } = store

  useEffect(() => {
    store.setDoFirstRequest(paginationRef.current.apiDoFirstRequest)
    paginationRef.current.apiDoFirstRequest()
  }, [])

  const fetchList = (pagination) => {
    return store.fetchList(pagination)
  }

  // 新建结款单
  const handleAddCount = (countList) => {
    store
      .handleSettleCount({
        op: 'add',
        settle_supplier_id: countList[0].settle_supplier_id,
        sheet_nos: JSON.stringify(Array.from(selectedList)),
      })
      .then((json) => {
        Tip.success(
          i18next.t('KEY19', {
            VAR1: json.data.sheet_no,
          }) /* src:'加入结款单' + json.data.sheet_no + '成功' => tpl:加入结款单${VAR1}成功 */,
        )
        store.doFirstRequest()
      })
  }

  // 批量结款
  const handleSettleCount = () => {
    const { selectedList, dataList } = store
    const countList = []

    Array.from(selectedList).forEach((selectedId) => {
      countList.push(dataList.find((f) => f.id === selectedId))
    })

    const group = _.groupBy(countList, (value) => {
      return value.settle_supplier_id
    })

    if (_.keys(group).length > 1) {
      Tip.warning(i18next.t('只有相同的供应商单据才能加入结款单'))
      return false
    }

    // 拉取当前供应商的结款单
    store.queryExistPaymentList(countList[0].settle_supplier_id).then((res) => {
      const { paymentSlipList } = store

      if (paymentSlipList.length > 0) {
        Modal.render({
          title: i18next.t('加入结款单'),
          onHide: Modal.hide,
          size: 'sm',
          children: <PaymentModal countList={countList} />,
        })
      } else {
        Dialog.confirm({
          title: i18next.t('加入结款单'),
          children: i18next.t('是否将所选单据加入结款单?'),
          onOK: () => handleAddCount(countList),
        })
      }
    })
  }

  const handlePrint = (id) => {
    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: { width: '300px' },
      children: (
        <PopupPrintModal closeModal={RightSideModal.hide} data_ids={[id]} />
      ),
    })
  }

  const handleDetail = (value) => {
    const url =
      value.type === 1
        ? `#/sales_invoicing/stock_in/product/detail?id=${value.id}`
        : `#/sales_invoicing/stock_out/refund/detail/${value.id}`

    window.open(url)
  }

  return (
    <BoxTable
      info={
        <BoxTable.Info>
          <TableTotalText
            data={[
              {
                label: i18next.t('单据总数'),
                content: pagination.count || 0,
              },
            ]}
          />
        </BoxTable.Info>
      }
    >
      <ManagePaginationV2
        id='pagination_unhandle_sheet_list'
        ref={paginationRef}
        onRequest={fetchList}
      >
        <SelectTableX
          data={dataList.slice()}
          keyField='id'
          loading={loading}
          onSelect={(selected) => store.handleSelected(selected)}
          selected={selectedList.slice()}
          columns={[
            {
              Header: i18next.t('建单时间'),
              accessor: 'submit_time',
              Cell: ({ row: { original } }) =>
                moment(original.submit_time).format('YYYY-MM-DD'),
            },
            {
              Header: i18next.t('单据编号'),
              accessor: (d) => <a onClick={() => handleDetail(d)}>{d.id}</a>,
              width: '250',
            },
            {
              Header: i18next.t('单据类型'),
              accessor: 'type',
              Cell: ({ row: { original } }) => getTypeStr(original.type),
            },
            {
              Header: i18next.t('供应商'),
              accessor: 'supplier_name',
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
              Header: i18next.t('入库/出库时间'),
              accessor: 'date_time',
              Cell: ({ row: { original } }) =>
                moment(original.date_time).format('YYYY-MM-DD'),
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
                    name: i18next.t('批量加入结款单'),
                    onClick: handleSettleCount,
                    type: 'business',
                  },
                ]}
                extra={
                  <span
                    style={{
                      fontWeight: 'bold',
                    }}
                  >
                    （{i18next.t('总金额 ')}
                    <span style={{ color: '#56a3f2' }}>
                      {Big(store.totalMoney).div(100).toFixed(2)}
                    </span>
                    {i18next.t(' 元')}）
                  </span>
                }
                isSelectAll={isSelectAll}
                count={isSelectAll ? pagination.count : selectedList.length}
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
