import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { BoxPanel, Flex, Popover, Price, RightSideModal } from '@gmfe/react'
import PropTypes from 'prop-types'
import {
  diyTableXHOC,
  fixedColumnsTableXHOC,
  TableX,
  TableXUtil,
} from '@gmfe/table-x'
import store from './store'
import moment from 'moment'
import globalStore from 'stores/global'
import { SvgSupplier, SvgXinxi } from 'gm-svg'
import Big from 'big.js'
import { RefPriceToolTip } from '../../../../common/components/ref_price_type_hoc'
import _ from 'lodash'
import { saleReferencePrice } from '../../../../common/enum'
import PurchaseQuantityHeader from './components/purchase_quantity_header'
import HeaderTip from '../../../../common/components/header_tip'
import PurchaserProgressHeader from '../../components/purchase_progress/header'
import PurchaserProgressContent from '../../components/purchase_progress/content'
import { is } from '@gm-common/tool'
import GoodHeader from './components/good_detail_header'
import PurchaseQuotations from '../../../../common/components/purchase_quotations'
import PriceWarning from './components/price_warning'
import { getPurchaseSheetStatus } from '../../../../common/filter'

const DiyTable = diyTableXHOC(fixedColumnsTableXHOC(TableX))

@observer
class ViewTable extends React.Component {
  handlePopupGoodDetail = (task) => {
    const {
      billDetail: { supplier_name, operator, settle_supplier_id },
      progressUnit,
    } = store
    const { id } = this.props
    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: is.phone()
        ? { width: '100vw', overflow: 'auto' }
        : { width: '900px', overflowY: 'scroll' },
      children: (
        <Flex column>
          <Flex column className='gm-padding-tb-10 gm-padding-lr-20 gm-back-bg'>
            <GoodHeader
              id={id}
              task={task}
              settle_supplier_name={supplier_name}
              operator={operator}
              progressUnit={progressUnit}
            />
          </Flex>
          <PurchaseQuotations
            id={task.spec_id}
            supplier_id={settle_supplier_id}
            std_unit_name={task.std_unit_name}
          />
        </Flex>
      ),
    })
  }

  handleSort = (name, direction) => {
    store.sort(name, direction)
  }

  handleChangeProgressUnit = (type) => {
    store.changeProgressUnit(type)
  }

  render() {
    const {
      tasks,
      progressUnit,
      billDetail: { require_goods_sheet_status, ref_price_type, status },
      reference_price_type,
      sortItem: { sort_by, sort_direction },
    } = store

    // reference_price_type ?????????????????????????????????????????????????????????purchase_task.reference_price_type ?????????????????? type?????????????????????
    const ref_type = ref_price_type || reference_price_type
    let referencePriceName = ''
    let referencePriceFlag = ''
    _.find(saleReferencePrice, (item) => {
      if (item.type === ref_type) {
        referencePriceName = item.name
        referencePriceFlag = item.flag
        return true
      }
    })

    const p_get_purchase_spec_price_info = globalStore.hasPermission(
      'get_purchase_spec_price_info',
    )

    return (
      <BoxPanel
        summary={[{ text: i18next.t('?????????'), value: tasks.length }]}
        title={i18next.t('????????????')}
        collapse
      >
        <DiyTable
          data={tasks.slice()}
          id='purchase_task_detail_v1.0'
          diyGroupSorting={[i18next.t('????????????')]}
          columns={[
            {
              Header: i18next.t('????????????'),
              minWidth: 150,
              accessor: 'release_time',
              diyGroupName: i18next.t('????????????'),
              Cell: (cellProps) => {
                const { release_time } = cellProps.row.original
                return release_time
                  ? moment(release_time).format('YYYY-MM-DD HH:mm:ss')
                  : '-'
              },
            },
            {
              Header: () => (
                <span>
                  {i18next.t('????????????')}
                  <TableXUtil.SortHeader
                    onChange={this.handleSort.bind(this, 'name')}
                    type={sort_by === 'name' ? sort_direction : null}
                  />
                </span>
              ),
              accessor: 'spec_name',
              diyItemText: i18next.t('????????????'),
              minWidth: 150,
              diyEnable: false,
              diyGroupName: i18next.t('????????????'),
              Cell: (cellProps) => {
                const task = cellProps.row.original
                const specName = task.spec_name || task.text
                if (p_get_purchase_spec_price_info) {
                  return (
                    <div>
                      <a onClick={() => this.handlePopupGoodDetail(task)}>
                        {specName}
                      </a>
                      {task.spu_status === 0 && (
                        <Popover
                          showArrow
                          component={<div />}
                          type='hover'
                          popup={
                            <div
                              className='gm-border gm-padding-5 gm-bg gm-text-12'
                              style={{ width: '100px' }}
                            >
                              {i18next.t('?????????????????????')}
                            </div>
                          }
                        >
                          <span>
                            <SvgXinxi
                              style={{ color: 'red', marginLeft: '5px' }}
                            />
                          </span>
                        </Popover>
                      )}
                    </div>
                  )
                } else {
                  return specName + ''
                }
              },
            },
            {
              Header: () => (
                <span>
                  {i18next.t('????????????')}
                  <TableXUtil.SortHeader
                    onChange={this.handleSort.bind(this, 'category')}
                    type={sort_by === 'category' ? sort_direction : null}
                  />
                </span>
              ),
              accessor: 'category_name_1',
              minWidth: 100,
              diyGroupName: i18next.t('????????????'),
              diyItemText: i18next.t('????????????'),
              Cell: (cellProps) => {
                const {
                  category_name_1,
                  category_name_2,
                } = cellProps.row.original
                return (
                  category_name_1 && category_name_1 + '/' + category_name_2
                )
              },
            },
            {
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
                return require_goods_sheet_status !== 1
                  ? supply_amount >= 0
                    ? Big(supply_amount || 0)
                        .div(ratio)
                        .toFixed(2) + purchase_unit_name
                    : '-'
                  : '-'
              },
            },
            {
              Header: i18next.t('??????????????????????????????'),
              accessor: 'purchase_sale_amount',
              minWidth: 150,
              diyEnable: false,
              diyGroupName: i18next.t('????????????'),
              Cell: (cellProps) => {
                const {
                  purchase_sale_amount,
                  purchase_unit_name,
                } = cellProps.row.original
                return (
                  <span>
                    {purchase_sale_amount &&
                      `${purchase_sale_amount}${purchase_unit_name}`}
                  </span>
                )
              },
            },
            {
              Header: i18next.t('???????????????(????????????)'),
              accessor: 'supply_amount',
              minWidth: 150,
              diyGroupName: i18next.t('????????????'),
              Cell: (cellProps) => {
                const { supply_amount, std_unit_name } = cellProps.row.original
                return require_goods_sheet_status !== 1
                  ? supply_amount >= 0
                    ? supply_amount + std_unit_name
                    : '-'
                  : '-'
              },
            },
            {
              Header: i18next.t('??????????????????????????????'),
              accessor: 'purchase_amount',
              diyGroupName: i18next.t('????????????'),
              minWidth: 150,
              diyEnable: false,
              Cell: (cellProps) => {
                const {
                  purchase_amount,
                  std_unit_name,
                } = cellProps.row.original
                return purchase_amount + std_unit_name
              },
            },
            {
              Header: <RefPriceToolTip name={referencePriceName} />,
              accessor: 'ref_price',
              diyGroupName: i18next.t('????????????'),
              minWidth: 100,
              diyItemText: i18next.t('????????????'),
              Cell: (cellProps) => {
                const {
                  ref_price,
                  latest_quote_from_supplier,
                  quoted_from_supplier,
                  std_unit_name,
                } = cellProps.row.original
                let isSupplierPrice = false // ????????????????????????
                if (
                  referencePriceFlag === 'latest_quote_price' &&
                  latest_quote_from_supplier
                ) {
                  isSupplierPrice = true
                } else if (
                  referencePriceFlag === 'last_quote_price' &&
                  quoted_from_supplier
                ) {
                  isSupplierPrice = true
                }
                return (
                  <Flex alignCenter>
                    <span>
                      {!_.isNil(ref_price)
                        ? Big(ref_price || 0)
                            .div(100)
                            .toFixed(2) +
                          Price.getUnit() +
                          '/' +
                          std_unit_name
                        : '-'}
                    </span>
                    {!_.isNil(ref_price) &&
                      (ref_type === 1 || ref_type === 5) &&
                      isSupplierPrice && (
                        <Popover
                          top
                          showArrow
                          type='hover'
                          popup={<div>{i18next.t('???????????????')}</div>}
                        >
                          <SvgSupplier
                            className='gm-text-14'
                            style={{
                              color: 'green',
                              marginLeft: '2px',
                            }}
                          />
                        </Popover>
                      )}
                  </Flex>
                )
              },
            },
            {
              Header: <PurchaseQuantityHeader />,
              accessor: 'purchase_price',
              diyGroupName: i18next.t('????????????'),
              diyItemText: i18next.t('????????????'),
              minWidth: 100,
              diyEnable: false,
              Cell: (cellProps) => {
                const {
                  purchase_price,
                  supplier_purchase_avg_price,
                  std_unit_name,
                } = cellProps.row.original
                return (
                  <Flex alignCenter>
                    {Big(purchase_price || 0).toFixed(2) +
                      Price.getUnit() +
                      '/' +
                      std_unit_name}

                    <PriceWarning
                      std_unit_name={std_unit_name}
                      purchase_price={purchase_price}
                      supplier_purchase_avg_price={supplier_purchase_avg_price}
                    />
                  </Flex>
                )
              },
            },
            {
              Header: i18next.t('???????????????'),
              accessor: 'supply_price',
              minWidth: 100,
              diyGroupName: i18next.t('????????????'),
              Cell: (cellProps) => {
                const { supply_price, std_unit_name } = cellProps.row.original
                return require_goods_sheet_status !== 1
                  ? supply_price >= 0
                    ? Big(supply_price || 0)
                        .div(100)
                        .toFixed(2) +
                      Price.getUnit() +
                      '/' +
                      std_unit_name
                    : '-'
                  : '-'
              },
            },
            {
              Header: i18next.t('???????????????'),
              accessor: 'purchase_plan_money',
              minWidth: 100,
              diyGroupName: i18next.t('????????????'),
              Cell: (cellProps) => {
                const { plan_amount, ref_price } = cellProps.row.original
                return (
                  Big(
                    plan_amount
                      ? Big(plan_amount).times(Big(ref_price || 0).div(100))
                      : 0,
                  ).toFixed(2) + Price.getUnit()
                )
              },
            },
            {
              Header: i18next.t('????????????'),
              accessor: 'purchase_money',
              minWidth: 100,
              diyGroupName: i18next.t('????????????'),
              Cell: (cellProps) => {
                const { purchase_money } = cellProps.row.original
                return (
                  <Flex alignCenter>
                    {Big(purchase_money || 0).toFixed(2)}
                    {Price.getUnit()}
                  </Flex>
                )
              },
            },
            {
              Header: i18next.t('???????????????????????????'),
              id: 'purchase_money_no_tax',
              minWidth: 140,
              diyGroupName: i18next.t('????????????'),
              Cell: (cellProps) => {
                const { purchase_money_no_tax } = cellProps.row.original
                if (_.isNil(purchase_money_no_tax)) {
                  return '-'
                }
                return `${purchase_money_no_tax}${Price.getUnit()}`
              },
            },
            {
              Header: i18next.t('????????????'),
              diyGroupName: i18next.t('????????????'),
              id: 'tax_rate',
              minWidth: 100,
              Cell: (cellProps) => {
                const { tax_rate } = cellProps.row.original
                if (_.isNil(tax_rate)) {
                  return '-'
                }
                return `${Big(tax_rate).div(100).toFixed(2)}%`
              },
            },
            {
              Header: i18next.t('????????????'),
              id: 'tax_money',
              diyGroupName: i18next.t('????????????'),
              minWidth: 100,
              Cell: (cellProps) => {
                const { tax_money } = cellProps.row.original
                if (_.isNil(tax_money)) {
                  return '-'
                }
                return `${tax_money}${Price.getUnit()}`
              },
            },
            {
              Header: (
                <HeaderTip
                  title={i18next.t('????????????')}
                  tip={i18next.t('??????????????????????????????????????????')}
                />
              ),
              accessor: 'suggest_purchase_num',
              diyGroupName: i18next.t('????????????'),
              diyItemText: i18next.t('????????????'),
              minWidth: 100,
              Cell: (cellProps) => {
                const {
                  stock,
                  plan_amount,
                  std_unit_name,
                  customized_suggest_purchase_amount,
                } = cellProps.row.original

                if (customized_suggest_purchase_amount) {
                  return `${Big(customized_suggest_purchase_amount).toFixed(
                    2,
                  )}${std_unit_name}`
                }
                if (Number(stock) < 0) {
                  return `${Big(plan_amount).toFixed(2)}${std_unit_name}`
                }
                const suggestPurchasing = Big(plan_amount)
                  .minus(stock)
                  .toFixed(2)
                return Number(stock) >= 0 && suggestPurchasing < 0
                  ? i18next.t('????????????')
                  : `${suggestPurchasing}${std_unit_name}`
              },
            },
            {
              Header: i18next.t('????????????'),
              accessor: 'plan_purchase_amount',
              minWidth: 100,
              diyGroupName: i18next.t('????????????'),
              Cell: (cellProps) => {
                const {
                  plan_amount,
                  ratio,
                  purchase_unit_name = '-',
                  std_unit_name = '-',
                  plan_change_sheet,
                  plan_amount_sheet,
                } = cellProps.row.original
                // return ratio && plan_amount
                //   ? `${Big(plan_amount)
                //       .div(ratio)
                //       .toFixed(2)}${purchase_unit_name}(${Big(
                //       plan_amount,
                //     ).toFixed(2)}${std_unit_name})`
                //   : '-'
                if (ratio && plan_amount) {
                  return plan_change_sheet &&
                    getPurchaseSheetStatus(status) !== '?????????' ? (
                    <div>
                      <div
                        style={{
                          backgroundColor: '#F5222D',
                          color: 'white',
                        }}
                      >
                        {`${Big(plan_amount)
                          .div(ratio)
                          .toFixed(2)}${purchase_unit_name}(${Big(
                          plan_amount,
                        ).toFixed(2)}${std_unit_name})`}
                      </div>
                      <div>
                        ????????????
                        {/* {`${Big(plan_amount_sheet)
                          .div(ratio)
                          .toFixed(2)}${purchase_unit_name}`} */}
                        {`${Big(plan_amount_sheet).toFixed(2)}${std_unit_name}`}
                      </div>
                    </div>
                  ) : (
                    `${Big(plan_amount)
                      .div(ratio)
                      .toFixed(2)}${purchase_unit_name}(${Big(
                      plan_amount,
                    ).toFixed(2)}${std_unit_name})`
                  )
                } else {
                  return '-'
                }
              },
            },
            {
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
                return already_purchased_amount
                  ? `${Big(already_purchased_amount || 0)
                      .div(ratio || 1)
                      .toFixed(2)}${purchase_unit_name}(${Big(
                      already_purchased_amount,
                    ).toFixed(2)}${std_unit_name})`
                  : '-'
              },
            },
            {
              Header: (
                <PurchaserProgressHeader
                  unit={progressUnit}
                  onChange={this.handleChangeProgressUnit}
                />
              ),
              accessor: 'plan_amount',
              diyItemText: i18next.t('????????????'),
              minWidth: 200,
              diyGroupName: i18next.t('????????????'),
              Cell: (cellProps) => {
                const {
                  already_purchased_amount,
                  std_unit_name,
                  ratio,
                  purchase_unit_name,
                  plan_amount,
                } = cellProps.row.original
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
              accessor: 'goods_remark',
              minWidth: 100,
              diyGroupName: i18next.t('????????????'),
              Cell: (cellProps) => (
                <span>{cellProps.row.original.goods_remark}</span>
              ),
            },
            {
              Header: i18next.t('????????????'),
              accessor: 'description',
              minWidth: 100,
              diyGroupName: i18next.t('????????????'),
              Cell: (cellProps) => (
                <span style={{ wordBreak: 'break-all' }}>
                  {cellProps.row.original.description}
                </span>
              ),
            },
          ]}
        />
      </BoxPanel>
    )
  }
}
ViewTable.propTypes = {
  id: PropTypes.string,
}
export default ViewTable
