import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import { RightSideModal, Tip } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { TableX, selectTableXHOC, TableXUtil } from '@gmfe/table-x'
import store from '../store'
import { t } from 'gm-i18n'
import moment from 'moment'
import { getEnumValue } from 'common/filter'
import { PROCESS_RECEIPT_STATUS } from '../../utils'
import PrintModal from '../../components/print_modal'
import { openNewTab } from 'common/util'

const { BatchActionBar } = TableXUtil

const SelectTableX = selectTableXHOC(TableX)

const ListTable = observer(() => {
  const paginationRef = React.useRef(null)
  const { loading, listSelected, list, isSelectAllPage } = store

  const columns = [
    {
      Header: t('工艺名称'),
      accessor: 'technic_name',
    },
    {
      Header: t('生成成品'),
      accessor: 'sku_name',
      Cell: ({ row: { original } }) =>
        `${original.sku_name}(${original.sku_id})`,
    },
    {
      Header: (
        <>
          {t('计划生产数')}（{t('销售单位')}）
        </>
      ),
      accessor: 'plan_amount',
      Cell: ({ row: { original } }) =>
        `${original.plan_amount}${original.sale_unit_name}`,
    },
    {
      Header: (
        <>
          {t('已完成数')}（{t('销售单位')}）
        </>
      ),
      accessor: 'finish_amount',
      Cell: ({ row: { original } }) =>
        `${original.finish_amount || 0}${original.sale_unit_name}`,
    },
    {
      Header: t('工艺类型'),
      accessor: 'technic_category_name',
    },
    {
      Header: t('车间'),
      accessor: 'workshop_name',
    },
    {
      Header: t('计划编号'),
      accessor: 'custom_id',
      Cell: (cellProps) => {
        const { custom_id, id } = cellProps.row.original
        return (
          <a
            target='_blank'
            rel='noopener noreferrer'
            href={`#/supply_chain/process/receipt/plan_detail?id=${id}`}
          >
            {custom_id}
          </a>
        )
      },
    },
    {
      Header: t('开工日期'),
      accessor: 'start_time',
      Cell: ({ row: { original } }) =>
        original.start_time
          ? moment(original.start_time).format('YYYY-MM-DD')
          : '-',
    },
    {
      Header: t('计划完成日期'),
      accessor: 'plan_finish_time',
      Cell: ({ row: { original } }) =>
        original.plan_finish_time
          ? moment(original.plan_finish_time).format('YYYY-MM-DD')
          : '-',
    },
    {
      Header: t('状态'),
      accessor: 'status',
      Cell: ({ row: { original } }) => {
        return getEnumValue(PROCESS_RECEIPT_STATUS, original.status)
      },
    },
  ]

  useEffect(() => {
    store.setFirstRequestFunc(paginationRef.current.apiDoFirstRequest)

    store.doFirstRequest()
  }, [])

  const handleChangePage = (pagination) => {
    return store.fetchList(pagination).then((json) => {
      store.clearTableSelected()

      return json
    })
  }

  const handleSelect = (selected) => {
    store.changeListSelected(selected)
  }

  const handlePrintProcess = async () => {
    let { idList, taskIds } = store.getTableSelectedIds()

    if (store.isSelectAllPage) {
      try {
        const json = await store.fetchListAllIds()
        idList = json.data.proc_ids
        taskIds = json.data.task_ids
      } catch (err) {
        Tip.warning(err)
        console.log(err)
      }
    }

    RightSideModal.render({
      children: (
        <PrintModal
          ids={idList.slice()}
          hasProduct={false}
          printType='byTechnic'
          taskIds={taskIds}
          workShopIds={store._filterCache.workshop_ids}
        />
      ),
      noCloseBtn: true,
      onHide: RightSideModal.hide,
      opacityMask: false,
      style: {
        width: '300px',
      },
    })
  }

  const handlePrintMaterial = () => {
    // 全选所有页时用接口获取ids
    if (store.isSelectAllPage) {
      store.fetchListAllIds().then((json) => {
        openNewTab(
          `#/supply_chain/process/receipt/print/material_print?ids=${JSON.stringify(
            json.data,
          )}`,
        )
      })
    } else {
      const { idList } = store.getTableSelectedIds()
      openNewTab(
        `#/supply_chain/process/receipt/print/material_print?ids=${JSON.stringify(
          idList,
        )}`,
      )
    }
  }

  return (
    <ManagePaginationV2
      onRequest={handleChangePage}
      id='process_receipt_technic_list'
      ref={paginationRef}
    >
      <SelectTableX
        loading={loading}
        selected={listSelected.slice()}
        onSelect={handleSelect}
        keyField='_index'
        data={list.slice()}
        columns={columns}
        batchActionBar={
          listSelected.length ? (
            <BatchActionBar
              isSelectAll={isSelectAllPage}
              count={isSelectAllPage ? null : listSelected.length}
              toggleSelectAll={(bool) => store.changeSelectAll(bool)}
              onClose={() => handleSelect([])}
              batchActions={[
                {
                  name: t('打印物料单'),
                  onClick: handlePrintMaterial,
                  type: 'business',
                },
                {
                  name: t('打印加工单'),
                  onClick: handlePrintProcess,
                  type: 'business',
                },
              ]}
            />
          ) : null
        }
      />
    </ManagePaginationV2>
  )
})

export default ListTable
