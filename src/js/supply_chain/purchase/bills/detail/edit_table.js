import { i18next, t } from 'gm-i18n'
import React, { useCallback, useEffect } from 'react'
import { observer } from 'mobx-react'
import { BoxPanel, Price } from '@gmfe/react'
import {
  diyTableXHOC,
  editTableXHOC,
  fixedColumnsTableXHOC,
  TableXUtil,
  TableXVirtualized,
} from '@gmfe/table-x'
import { keyboardTableXHOC } from '@gmfe/keyboard'
import store from './store'
import moment from 'moment'
import Big from 'big.js'
import { RefPriceToolTip } from '../../../../common/components/ref_price_type_hoc'
import _ from 'lodash'
import { saleReferencePrice } from '../../../../common/enum'
import PurchaseQuantityHeader from './components/purchase_quantity_header'
import HeaderTip from '../../../../common/components/header_tip'
import CellOperation from './components/cell_operation'
import CellName from './components/cell_name'
import CellAmount from './components/cell_purchase_amount'
import CellSaleAmount from './components/cell_purchase_sale_amount'
import CellMoney from './components/cell_purchase_money'
import CellPrice from './components/cell_purchase_price'
import CellRemark from './components/cell_specs_remark'
import CellCategory from './components/cell_category'
import CellRefPrice from './components/cell_ref_price'
import CellPlanMoney from './components/cell_plan_momey'
import PurchaserProgressHeader from '../../components/purchase_progress/header'
import PurchaserProgressContent from '../../components/purchase_progress/content'
import TaxRateCell from './components/tax_rate_cell'
import TaxMoneyCell from './components/tax_money_cell'
import PurchaseMoneyNoTaxCell from './components/purchase_money_no_tax_cell'

const KeyboardVirtualTable = diyTableXHOC(
  keyboardTableXHOC(fixedColumnsTableXHOC(editTableXHOC(TableXVirtualized))),
)
const { OperationHeader, TABLE_X } = TableXUtil

const EditTable = observer(({ id }) => {
  const {
    tasks,
    psmCreateSheetItems,
    reference_price_type,
    progressUnit,
    billDetail: { status, require_goods_sheet_status },
    sortItem: { sort_by, sort_direction },
  } = store
  useEffect(() => {
    store.getReferencePriceType(2)
  }, [])
  const limit = 12
  const tableHeight =
    TABLE_X.HEIGHT_HEAD_TR + Math.min(limit, tasks.length) * TABLE_X.HEIGHT_TR

  // ???????????????????????????
  const isEdit = !!id && status === 3

  let referencePriceName = ''
  let referencePriceFlag = ''
  _.find(saleReferencePrice, (item) => {
    if (item.type === reference_price_type) {
      referencePriceName = item.name
      referencePriceFlag = item.flag
      return true
    }
  })

  const handleDetailAdd = useCallback(() => {
    store.addListItem()
  }, [])

  const handleChangeProgressUnit = useCallback((type) => {
    store.changeProgressUnit(type)
  }, [])

  const handleSort = useCallback((name, direction) => {
    store.sort(name, direction)
  }, [])

  // ??????????????????????????????????????????????????????????????????????????????
  const columns = React.useMemo(() => {
    return [
      {
        Header: i18next.t('??????'),
        fixed: 'left',
        diyEnable: false,
        diyGroupName: i18next.t('????????????'),
        width: TABLE_X.WIDTH_NO,
        Cell: (cellProps) => {
          const index = cellProps.row.index

          return index + 1
        },
      },
      {
        Header: OperationHeader,
        accessor: 'action',
        diyEnable: false,
        diyGroupName: t('????????????'),
        diyItemText: t('??????'),
        fixed: 'left',
        width: TABLE_X.WIDTH_OPERATION,
        Cell: (cellProps) => {
          return (
            <CellOperation
              index={cellProps.row.index}
              onAddRow={handleDetailAdd}
            />
          )
        },
      },
      isEdit && {
        Header: i18next.t('????????????'),
        minWidth: 150,
        accessor: 'release_time',
        diyGroupName: i18next.t('????????????'),
        show: isEdit,
        Cell: (cellProps) =>
          cellProps.row.original.release_time
            ? moment(cellProps.row.original.release_time).format(
                'YYYY-MM-DD HH:mm:ss',
              )
            : '-',
      },
      {
        Header: (
          <span>
            {t('????????????')}
            <TableXUtil.SortHeader
              onChange={(direction) => handleSort('name', direction)}
              type={sort_by === 'name' ? sort_direction : null}
            />
          </span>
        ),
        diyItemText: i18next.t('????????????'),
        id: 'name',
        minWidth: 200,
        diyEnable: false,
        diyGroupName: i18next.t('????????????'),
        isKeyboard: true,
        Cell: (cellProps) => (
          <CellName id={id} isEdit={isEdit} index={cellProps.row.index} />
        ),
      },
      {
        Header: (
          <span>
            {t('????????????')}
            <TableXUtil.SortHeader
              onChange={(direction) => handleSort('category', direction)}
              type={sort_by === 'category' ? sort_direction : null}
            />
          </span>
        ),
        accessor: 'category',
        diyItemText: i18next.t('????????????'),
        diyGroupName: i18next.t('????????????'),
        minWidth: 100,
        Cell: (cellProps) => <CellCategory index={cellProps.row.index} />,
      },
      isEdit && {
        Header: i18next.t('???????????????(????????????)'),
        accessor: 'supply_amount_purchase_unit_name',
        minWidth: 150,
        diyGroupName: i18next.t('????????????'),
        Cell: (cellProps) => {
          const {
            supply_amount,
            ratio,
            purchase_unit_name,
          } = cellProps.row.original

          if (require_goods_sheet_status !== 1 && supply_amount >= 0) {
            return (
              Big(supply_amount || 0)
                .div(ratio)
                .toFixed(2) + purchase_unit_name
            )
          } else {
            return '-'
          }
        },
      },
      {
        Header: i18next.t('????????????(????????????)'),
        id: 'purchase_sale_amount',
        minWidth: 120,
        diyGroupName: i18next.t('????????????'),
        diyEnable: false,
        isKeyboard: true,
        Cell: (cellProps) => {
          return <CellSaleAmount index={cellProps.row.index} />
        },
      },
      isEdit && {
        Header: i18next.t('???????????????(????????????)'),
        accessor: 'supply_amount',
        minWidth: 150,
        diyGroupName: i18next.t('????????????'),
        Cell: (cellProps) => {
          const { supply_amount, purchase_unit_name } = cellProps.row.original

          if (require_goods_sheet_status !== 1 && supply_amount >= 0) {
            return supply_amount + purchase_unit_name
          } else {
            return '-'
          }
        },
      },
      {
        Header: i18next.t('????????????(????????????)'),
        id: 'purchase_amount',
        diyGroupName: i18next.t('????????????'),
        diyEnable: false,
        minWidth: 120,
        isKeyboard: true,
        Cell: (cellProps) => {
          return <CellAmount index={cellProps.row.index} />
        },
      },
      {
        Header: <RefPriceToolTip name={referencePriceName} />,
        accessor: 'ref_price',
        show: psmCreateSheetItems.includes('ref_price'),
        diyItemText: i18next.t('????????????'),
        diyGroupName: i18next.t('????????????'),
        minWidth: 80,
        Cell: (cellProps) => {
          return (
            <CellRefPrice
              index={cellProps.row.index}
              referencePriceFlag={referencePriceFlag}
            />
          )
        },
      },
      {
        Header: <PurchaseQuantityHeader />,
        accessor: 'purchase_price',
        diyGroupName: i18next.t('????????????'),
        diyItemText: i18next.t('????????????'),
        diyEnable: false,
        minWidth: 140,
        isKeyboard: true,
        Cell: (cellProps) => {
          return <CellPrice index={cellProps.row.index} />
        },
      },
      isEdit && {
        Header: i18next.t('???????????????'),
        accessor: 'supply_price',
        minWidth: 100,
        diyGroupName: i18next.t('????????????'),
        Cell: (cellProps) => {
          const { supply_price, std_unit_name } = cellProps.row.original
          if (require_goods_sheet_status !== 1 && supply_price >= 0) {
            return (
              Big(supply_price || 0)
                .div(100)
                .toFixed(2) +
              Price.getUnit() +
              '/' +
              std_unit_name
            )
          } else {
            return '-'
          }
        },
      },
      {
        Header: i18next.t('???????????????'),
        accessor: 'purchase_plan_money',
        diyGroupName: i18next.t('????????????'),
        minWidth: 100,
        Cell: (cellProps) => {
          return (
            <CellPlanMoney
              index={cellProps.row.index}
              referencePriceFlag={referencePriceFlag}
            />
          )
        },
      },
      {
        Header: i18next.t('????????????'),
        id: 'purchase_money',
        diyGroupName: i18next.t('????????????'),
        minWidth: 120,
        isKeyboard: true,
        Cell: (cellProps) => {
          return <CellMoney index={cellProps.row.index} />
        },
      },
      {
        Header: i18next.t('???????????????????????????'),
        id: 'purchase_money_no_tax',
        minWidth: 140,
        diyGroupName: t('????????????'),
        Cell: (cellProps) => (
          <PurchaseMoneyNoTaxCell index={cellProps.row.index} />
        ),
      },
      {
        Header: i18next.t('????????????'),
        id: 'tax_rate',
        minWidth: 120,
        diyGroupName: i18next.t('????????????'),
        Cell: (cellProps) => <TaxRateCell index={cellProps.row.index} />,
      },
      {
        Header: i18next.t('????????????'),
        id: 'tax_money',
        diyGroupName: t('????????????'),
        minWidth: 120,
        Cell: (cellProps) => <TaxMoneyCell index={cellProps.row.index} />,
      },
      {
        Header: (
          <HeaderTip
            title={i18next.t('????????????')}
            tip={i18next.t('???????????????????????????????????????????????????')}
          />
        ),
        accessor: 'suggest_purchase_num',
        diyGroupName: i18next.t('????????????'),
        diyItemText: i18next.t('????????????'),
        minWidth: 120,
        Cell: (cellProps) => {
          const {
            std_unit_name,
            plan_amount,
            stock,
            customized_suggest_purchase_amount,
          } = cellProps.row.original
          if (!id) {
            return <div>-</div>
          } else {
            if (customized_suggest_purchase_amount) {
              return `${Big(customized_suggest_purchase_amount).toFixed(
                2,
              )}${std_unit_name}`
            }
            if (Number(stock) < 0) {
              return `${Big(plan_amount).toFixed(2)}${std_unit_name}`
            }
            const suggestPurchasing = Big(plan_amount).minus(stock).toFixed(2)
            return Number(stock) >= 0 && suggestPurchasing < 0
              ? i18next.t('????????????')
              : `${suggestPurchasing}${std_unit_name}`
          }
        },
      },
      isEdit && {
        Header: i18next.t('????????????'),
        accessor: 'plan_purchase_amount',
        minWidth: 110,
        diyGroupName: i18next.t('????????????'),
        Cell: (cellProps) => {
          const {
            plan_amount,
            ratio,
            purchase_unit_name,
            std_unit_name,
            plan_change_sheet,
            plan_amount_sheet,
          } = cellProps.row.original
          if (ratio && plan_amount) {
            return plan_change_sheet ? (
              <div>
                <div
                  style={{
                    backgroundColor: '#F5222D',
                    color: 'white',
                  }}
                >
                  {Big(plan_amount).div(ratio).toFixed(2) +
                    purchase_unit_name +
                    '(' +
                    Big(plan_amount).toFixed(2) +
                    std_unit_name +
                    ')'}
                </div>
                <div>
                  ????????????
                  {/* {Big(plan_amount_sheet).div(ratio).toFixed(2) +
                    purchase_unit_name} */}
                  {Big(plan_amount_sheet).toFixed(2) + std_unit_name}
                </div>
              </div>
            ) : (
              Big(plan_amount).div(ratio).toFixed(2) +
                purchase_unit_name +
                '(' +
                Big(plan_amount).toFixed(2) +
                std_unit_name +
                ')'
            )
          } else {
            return '-'
          }
        },
      },
      isEdit && {
        Header: i18next.t('?????????'),
        accessor: 'already_purchased_amount',
        minWidth: 100,
        diyGroupName: i18next.t('????????????'),
        Cell: (cellProps) => {
          const {
            already_purchased_amount,
            ratio,
            purchase_unit_name,
            std_unit_name,
          } = cellProps.row.original

          if (!already_purchased_amount) return '-'
          return (
            Big(already_purchased_amount)
              .div(ratio || 1)
              .toFixed(2) +
            purchase_unit_name +
            '(' +
            Big(already_purchased_amount).toFixed(2) +
            std_unit_name +
            ')'
          )
        },
      },
      isEdit && {
        Header: (
          <PurchaserProgressHeader
            unit={progressUnit}
            onChange={handleChangeProgressUnit}
          />
        ),
        accessor: 'plan_amount',
        diyItemText: i18next.t('????????????'),
        minWidth: 200,
        diyGroupName: i18next.t('????????????'),
        Cell: (cellProps) => {
          const {
            id, // ????????????????????????id???????????????????????????
            already_purchased_amount,
            std_unit_name,
            ratio,
            purchase_unit_name,
            plan_amount,
          } = cellProps.row.original
          if (!id) return '-'
          const alreadyPurchase =
            progressUnit === 0
              ? `${already_purchased_amount}${std_unit_name}`
              : `${Big(already_purchased_amount)
                  .div(ratio)
                  .toFixed(2)}${purchase_unit_name}`
          const planPurchase =
            progressUnit === 0
              ? `${plan_amount}${std_unit_name}`
              : `${Big(already_purchased_amount)
                  .div(ratio)
                  .toFixed(2)}${purchase_unit_name}`
          let percentage = plan_amount
            ? Number(
                Big(already_purchased_amount)
                  .div(plan_amount)
                  .times(100)
                  .toFixed(2),
              )
            : 0 // ???????????? ?????????????????????

          // ???????????????????????????????????? ????????????????????????100 ?????????100
          percentage = percentage <= 100 ? percentage : 100
          return (
            <PurchaserProgressContent
              percentage={percentage}
              already={alreadyPurchase}
              plan={planPurchase}
              showText={!!plan_amount}
            />
          )
        },
      },
      {
        Header: i18next.t('????????????'),
        accessor: 'specs_remark',
        minWidth: 120,
        diyGroupName: i18next.t('????????????'),
        isKeyboard: true,
        Cell: (cellProps) => {
          return <CellRemark index={cellProps.row.index} />
        },
      },
      {
        Header: i18next.t('????????????'),
        id: 'description',
        diyGroupName: i18next.t('????????????'),
        minWidth: 120,
        Cell: (cellProps) => {
          const { description } = cellProps.row.original
          return <div>{description || '-'}</div>
        },
      },
    ].filter((item) => item)
  }, [
    handleDetailAdd,
    handleChangeProgressUnit,
    handleSort,
    sort_by,
    sort_direction,
    reference_price_type,
  ])

  return (
    <BoxPanel
      summary={[{ text: i18next.t('?????????'), value: tasks.length }]}
      title={i18next.t('????????????')}
      collapse
    >
      <KeyboardVirtualTable
        onAddRow={handleDetailAdd}
        data={tasks.slice()}
        virtualizedItemSize={TABLE_X.HEIGHT_TR}
        virtualizedHeight={tableHeight}
        id='purchase_bills_table'
        diyGroupSorting={[t('????????????')]}
        columns={columns}
      />
    </BoxPanel>
  )
})

export default EditTable
