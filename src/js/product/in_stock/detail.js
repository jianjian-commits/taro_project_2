import { i18next } from 'gm-i18n'
import React from 'react'
import { connect } from 'react-redux'
import {
  Flex,
  Dialog,
  Popover,
  RightSideModal,
  Price,
  Button,
} from '@gmfe/react'
import { QuickPanel } from '@gmfe/react-deprecated'
import moment from 'moment'
import Big from 'big.js'
import { t } from 'gm-i18n'
import { Table, diyTableHOC } from '@gmfe/table'
import '../actions'
import '../reducer'
import actions from '../../actions'
import { history } from '../../common/service'
import { is } from '@gm-common/tool'
import {
  PRODUCT_REASON_TYPE,
  PRODUCT_ACTION_TYPE,
  PRODUCT_STATUS,
} from '../../common/enum'
import DiscountPanel from '../../common/components/discount_panel'

import {
  SharePanle,
  GoodDetail,
  InStockWarning,
  InStockDetailHeader,
  InStockDetailWarning,
} from './components'

import styles from '../product.module.less'
import { SvgXinxi } from 'gm-svg'
import globalStore from '../../stores/global'

const DiyTable = diyTableHOC(Table)

class InStockDetail extends React.Component {
  componentDidMount() {
    actions.product_in_stock_detail(this.props.params.id)
  }

  componentWillMount() {
    actions.product_in_stock_detail_init()
  }

  handlePrint = () => {
    window.open(`#/sales_invoicing/stock_in/print/${this.props.params.id}`)
  }

  handleExport = () => {
    window.open(
      '/stock/in_stock_sheet/material/new_detail?id=' +
        this.props.params.id +
        '&export=1',
    )
  }

  handleRefuse = () => {
    const id = this.props.params.id
    actions
      .product_in_stock_check_pass({
        id: id,
        allow_negative: 0,
      })
      .then((json) => {
        if (json.code === 5) {
          Dialog.confirm({
            children: t(json.msg || '该操作会导致负库存，是否确认继续?'),
            title: t('提示'),
          }).then(() => {
            actions
              .product_in_stock_check_pass({
                id: id,
                allow_negative: 1,
              })
              .then(() => {
                history.push(`/sales_invoicing/stock_in/product/add/${id}`)
              })
          })
        } else {
          history.push(`/sales_invoicing/stock_in/product/add/${id}`)
        }
      })
      .catch(() => {})
  }

  handleCancel = () => {
    const id = this.props.params.id

    Dialog.confirm({
      children: i18next.t('是否删除此单据?'),
      title: i18next.t('确认删除'),
    }).then(
      () => {
        actions.product_in_stock_cancel(id).then(() => {
          actions.product_in_stock_detail(id)
        })
      },
      () => {},
    )
  }

  hoverTips(tips) {
    return (
      <div
        className='gm-padding-10 gm-bg'
        style={{ minWidth: '160px', color: '#333' }}
      >
        {tips}
      </div>
    )
  }

  handlePopupGoodDetail(original) {
    const {
      inStockDetail: { supplier_name, status, settle_supplier_id },
    } = this.props.product
    const props = {
      header: {
        origin: { ...original, status },
        settle_supplier_name: supplier_name,
        statusMap: PRODUCT_STATUS,
      },
      detail: {
        id: original.id,
        supplier_id: settle_supplier_id,
        std_unit_name: original.std_unit,
        purchase_type: 3,
      },
    }
    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: is.phone()
        ? { width: '100vw', overflow: 'auto' }
        : { width: '900px', overflowY: 'scroll' },
      children: <GoodDetail {...props} />,
    })
  }

  render() {
    const { stock_method } = globalStore.user
    const { inStockDetail } = this.props.product
    const {
      discount,
      details,
      purchase_sheet_id,
      remark,
      status,
    } = inStockDetail

    return (
      <div>
        <InStockDetailHeader
          type='detail'
          statusMap={PRODUCT_STATUS}
          inStockDetail={inStockDetail}
          handlePrint={this.handlePrint}
          handleExport={this.handleExport}
          handleRefuse={this.handleRefuse}
          handleCancel={this.handleCancel}
        />
        <InStockDetailWarning
          purchase_sheet_id={purchase_sheet_id}
          details={details}
          status={status}
        />

        <QuickPanel
          icon='bill'
          title={i18next.t('商品明细')}
          collapse
          className={styles.tableBottom}
          right={
            <Button
              type='primary'
              plain
              onClick={() => this.in_stock_table.apiToggleDiySelector()}
            >
              列表自定义
            </Button>
          }
        >
          <DiyTable
            style={{ maxWidth: '100%', maxHeight: '800px' }}
            id='in_stock_table_detail2'
            data={details}
            getTrProps={(state, rowInfo) => {
              if (rowInfo) {
                return {
                  className:
                    state.data[rowInfo.index].hasOwnProperty('spu_status') &&
                    state.data[rowInfo.index].spu_status === 0 &&
                    'b-sheet-item-disable',
                }
              }
              return {}
            }}
            ref={(ref) => (this.in_stock_table = ref)}
            columns={[
              {
                Header: i18next.t('批次号'),
                accessor: 'num',
                diyEnable: false,
                minWidth: 60,
                Cell: ({ index, original }) => (
                  <Popover
                    showArrow
                    type='hover'
                    popup={this.hoverTips(original.batch_number)}
                  >
                    <span style={{ padding: '5px 0 5px 10px' }}>{++index}</span>
                  </Popover>
                ),
              },
              {
                show: false,
                minWidth: 80,
                Header: '商品ID',
                accessor: 'spu_id',
              },
              {
                show: false,
                minWidth: 80,
                Header: '规格ID',
                accessor: 'id',
              },
              {
                Header: i18next.t('商品名称'),
                minWidth: 160,
                diyEnable: false,
                id: 'name',
                accessor: (d) => {
                  const spuName = d.spu_id
                    ? `${d.name}(${d.ratio}${d.std_unit}/${d.purchase_unit})`
                    : '-'

                  return (
                    <>
                      {globalStore.hasPermission(
                        'get_stock_spec_price_info',
                      ) ? (
                        <a onClick={() => this.handlePopupGoodDetail(d)}>
                          {spuName}
                        </a>
                      ) : (
                        spuName
                      )}

                      {d.spu_status === 0 && (
                        <Popover
                          showArrow
                          component={<div />}
                          type='hover'
                          popup={
                            <div
                              className='gm-border gm-padding-5 gm-bg gm-text-12'
                              style={{ width: '100px' }}
                            >
                              {i18next.t('该商品已被删除')}
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
                    </>
                  )
                },
              },
              {
                Header: i18next.t('商品分类'),
                minWidth: 120,
                accessor: 'category',
              },
              {
                Header: i18next.t('入库数（基本单位）'),
                id: 'quantity',
                diyEnable: false,
                minWidth: 130,
                accessor: (d) => (d.spu_id ? d.quantity + d.std_unit : '-'),
              },
              {
                Header: '最高入库单价',
                id: 'max_stock_unit_price',
                minWidth: 90,
                accessor: (d) =>
                  d.max_stock_unit_price === null ||
                  d.max_stock_unit_price === undefined
                    ? '-'
                    : Big(d.max_stock_unit_price).toFixed(2) +
                      Price.getUnit() +
                      '/' +
                      d.purchase_unit,
                show: false,
              },
              {
                Header: i18next.t('入库单价（基本单位）'),
                id: 'std_unit_price',
                diyEnable: false,
                minWidth: 140,
                accessor: (d) => (
                  <div>
                    {d.unit_price
                      ? d.unit_price + Price.getUnit() + '/' + d.std_unit
                      : '-'}
                    {d.supplier_stock_avg_price &&
                      d.supplier_stock_avg_price < parseFloat(d.unit_price) && (
                        <InStockWarning original={d} />
                      )}
                  </div>
                ),
              },
              {
                Header: i18next.t('补差'),
                id: 'different_price',
                minWidth: 100,
                accessor: (d) =>
                  d.spu_id
                    ? Big(d.different_price || 0).toFixed(2) + Price.getUnit()
                    : '-',
              },
              {
                show: false,
                Header: i18next.t('入库数（包装单位）'),
                id: 'purchase_unit_quantity',
                minWidth: 130,
                accessor: (d) => {
                  const { purchase_unit_quantity, purchase_unit } = d
                  return d.spu_id
                    ? `${purchase_unit_quantity}${purchase_unit}`
                    : '-'
                },
              },
              {
                show: false,
                minWidth: 150,
                Header: i18next.t('入库单价（包装单位）'),
                id: 'purchase_unit_price',
                accessor: (d) => {
                  const { purchase_unit_price, purchase_unit } = d
                  return d.spu_id
                    ? `${purchase_unit_price}${Price.getUnit()}/${purchase_unit}`
                    : '-'
                },
              },
              {
                Header: i18next.t('入库金额'),
                id: 'money',
                diyEnable: false,
                minWidth: 100,
                accessor: (d) =>
                  d.spu_id
                    ? Big(d.money || 0).toFixed(2) + Price.getUnit()
                    : '-',
              },
              {
                Header: i18next.t('生产日期'),
                minWidth: 100,
                id: 'production_time',
                show: stock_method === 2,
                diyEnable: stock_method === 2,
                accessor: (d) =>
                  d.production_time
                    ? moment(d.production_time).format('YYYY-MM-DD')
                    : '-',
              },
              {
                Header: i18next.t('保质期'),
                minWidth: 100,
                id: 'life_time',
                show: stock_method === 2,
                diyEnable: stock_method === 2,
                accessor: (d) =>
                  d.life_time ? moment(d.life_time).format('YYYY-MM-DD') : '-',
              },
              {
                Header: i18next.t('存放货位'),
                minWidth: 100,
                id: 'shelf_name',
                diyEnable: globalStore.hasPermission('get_shelf'),
                show: globalStore.hasPermission('get_shelf'),
                accessor: ({ shelf_name }) => {
                  const len = shelf_name ? shelf_name.length : 0
                  if (Big(len).gt(7)) {
                    return (
                      <Popover
                        showArrow
                        component={<div />}
                        type='hover'
                        popup={this.hoverTips(shelf_name)}
                      >
                        <p className={styles.shelf}>{shelf_name}</p>
                      </Popover>
                    )
                  }
                  return shelf_name || '-'
                },
              },
              {
                Header: i18next.t('操作人'),
                minWidth: 80,
                accessor: 'operator',
              },
              {
                show: true,
                Header: i18next.t('到货状态'),
                minWidth: 80,
                id: 'is_arrival',
                accessor: ({ is_arrival }) => {
                  // 1 已标记到货， 0 未到货
                  return (
                    <div>{is_arrival ? i18next.t('已到货') : '-'}</div> // 在此 status 肯定不为 1，1 的时候显示的是标记到货按钮
                  )
                },
              },
              {
                show: false,
                minWidth: 100,
                Header: i18next.t('商品备注'),
                accessor: 'remark',
              },
            ]}
          />
          <Flex
            alignContentStretch
            className='gm-padding-10 gm-border gm-border-top-0'
          >
            <Flex alignCenter className='gm-margin-right-10'>
              备注:
            </Flex>
            <Flex flex={1} alignCenter>
              {remark}
            </Flex>
          </Flex>
        </QuickPanel>

        <SharePanle {...this.props} />
        <DiscountPanel
          list={discount}
          reasonMap={PRODUCT_REASON_TYPE}
          actionMap={PRODUCT_ACTION_TYPE}
        />
      </div>
    )
  }
}

export default connect((state) => ({
  product: state.product,
}))(InStockDetail)
