import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import Big from 'big.js'
import {
  Table,
  selectTableV2HOC,
  expandTableHOC,
  subTableHOC,
  TableUtil,
} from '@gmfe/table'
import { getFiledData } from 'common/components/customize'

import orderStore from './order_store'
import { orderState } from '../../../common/filter'
import _ from 'lodash'
import Modify from '../../../common/components/modify/modify'
import { Progress, Dialog, RightSideModal, Flex } from '@gmfe/react'
import qs from 'query-string'
import globalStore from '../../../stores/global'
import getTableChild from 'common/table_child'
import PopupPrintModal from '../../distribute/order_tab/popup_print_modal'
import { openNewTab } from '../../../common/util'
import { renderOrderTypeName } from '../../../common/deal_order_process'

const SelectExpandTable = selectTableV2HOC(expandTableHOC(Table))
const SelectSubTable = selectTableV2HOC(subTableHOC(Table))
const TableChild = getTableChild(SelectExpandTable, SelectSubTable)

const BatchActionBar = observer((props) => {
  const { selectedTree, selectedAllType } = orderStore

  const handleBatchOutStock = () => {
    orderStore.batchOutStock()
  }

  let length = 0
  _.forEach(selectedTree, (item) => {
    length += item.length
  })

  return (
    <TableUtil.BatchActionBar
      onClose={() => props.onSelectAll(false)}
      toggleSelectAll={(bool) => {
        props.onSelectAll(true)
        orderStore.toggleSelectedAllPage(bool)
      }}
      batchActions={[
        {
          name: i18next.t('批量修改缺货'),
          onClick: handleBatchOutStock,
          type: 'edit',
        },
      ]}
      count={selectedAllType ? null : length}
      isSelectAll={selectedAllType}
    />
  )
})

@observer
class SortingOrderExpandTable extends React.Component {
  componentWillUnmount() {
    orderStore.init()
  }

  handleUpdateSku = (orderIndex, skuIndex, key, value) => {
    orderStore.updateSku(orderIndex, skuIndex, key, value)
  }

  handleChangeQuantity = async (orderIndex, skuIndex, value, type) => {
    const quantity = Number(value) // 组件中传出来的是字符串

    const order = orderStore.orderData.orders.slice()[orderIndex]
    if (quantity === 0) {
      // 出库数如果为0，则进行缺货操作
      await orderStore.batchOutStock([
        {
          order_id: order.id,
          sku_id: order.children[skuIndex].sku_id,
          detail_id: order.children[skuIndex].detail_id,
          source_order_id: order.children[skuIndex].source_order_id,
          source_detail_id: order.children[skuIndex].source_detail_id,
        },
      ])
    } else {
      let std_quantity

      if (type === 'std_real_quantity') {
        std_quantity = quantity
      } else if (type === 'real_quantity') {
        std_quantity = +Big(quantity).times(order.children[skuIndex].sale_ratio)
      }

      await orderStore.updateQuantity(orderIndex, skuIndex, std_quantity)
    }
    this.handleUpdateSku(orderIndex, skuIndex, 'is_edit', false)
  }

  handleSelect = (selected, selectedTree) => {
    orderStore.setSelected(selected, selectedTree)
  }

  async handlePopupPrintModal(order = {}) {
    const {
      orderData: { orders },
      selectedAllType,
      selectedList,
    } = orderStore

    // 单个打印传order  批量不传
    let hasUnweightedSku = !_.isEmpty(order) ? order.has_unweighted : false // 称重商品是否称重
    let hasOutOfStock = !_.isEmpty(order) ? order.has_out_of_stock : false // 是否缺货
    let confirm = false

    // 批量打印, 判断是否有未称重商品
    if (!hasUnweightedSku) {
      hasUnweightedSku = _.find(
        orders,
        (order) =>
          _.includes(selectedList.slice(), order.id) && order.has_unweighted,
      )
    }

    // 批量打印, 判断是否有缺货商品
    if (!hasOutOfStock) {
      hasOutOfStock = _.find(
        orders,
        (order) =>
          _.includes(selectedList.slice(), order.id) && order.has_out_of_stock,
      )
    }

    if (hasUnweightedSku || hasOutOfStock) {
      confirm = await Dialog.confirm({
        children: i18next.t('存在称重商品未称重或已缺货，确定要打印吗？'),
      })
        .then(() => {
          return true
        })
        .catch(() => {
          return false
        })
    }

    // 处理搜索条件 后端说 只有商品有验货状态 订单没有 全选打印时不用传
    const {
      inspect_status, // 验货状态
      need_details,
      end_date,
      start_date,
      status,
      search,
      ...rest
    } = orderStore.computedFilterParam

    const filter = {
      ...rest,
      cycle_start_time: start_date,
      cycle_end_time: end_date,
      search_text: search,
      order_status: status,
      // !!订单流配置模块索引，不可改，批量打印全选时需要
      order_process_index: 2,
    }

    if ((!hasUnweightedSku && !hasOutOfStock) || confirm) {
      const selectedOrderList = _.filter(orders, (order) =>
        _.includes(selectedList.slice(), order.id),
      )

      const orderIdList = _.map(selectedOrderList, (order) => order.id)
      const order_ids = order.id || orderIdList

      if (globalStore.isMalaysia()) {
        const URL = '#/system/setting/distribute_templete/malay_print'
        const query = selectedAllType
          ? qs.stringify({
              filter: JSON.stringify(filter),
            })
          : qs.stringify({ order_ids })

        openNewTab(`${URL}?${query}`)
      } else {
        RightSideModal.render({
          onHide: RightSideModal.hide,
          style: { width: '300px' },
          children: (
            <PopupPrintModal
              curOrderId={order.id}
              orderIdList={orderIdList}
              closeModal={RightSideModal.hide}
              selectAllType={selectedAllType ? 2 : 1}
              isSelectAll={selectedAllType}
              filter={filter}
            />
          ),
        })
      }
    }
  }

  render() {
    const { orderData, selectedList } = orderStore
    const isQuantityEditable = globalStore.hasPermission('edit_real_quantity')
    const canPrintDistribute = globalStore.hasPermission('get_distribute_print')
    const { isCStation } = globalStore.otherInfo
    const infoConfigs = globalStore.customizedInfoConfigs.filter(
      (v) => v.permission.read_station_sorting,
    )

    const detailConfigs = globalStore.customizedDetailConfigs.filter(
      (v) => v.permission.read_station_sorting,
    )
    return (
      <TableChild
        data={orderData.orders.slice()}
        keyField='id'
        selected={selectedList.slice()}
        onSelect={this.handleSelect}
        columns={[
          {
            Header: i18next.t('运营周期'),
            accessor: 'service_time_period',
          },
          {
            Header: i18next.t('订单号'),
            accessor: 'id',
          },
          {
            Header: isCStation ? i18next.t('客户名') : i18next.t('商户名'),
            accessor: 'address_name',
          },
          {
            Header: i18next.t('线路'),
            show: !isCStation,
            accessor: 'route',
          },
          {
            Header: i18next.t('分拣序号'),
            accessor: 'sort_id',
          },
          {
            Header: i18next.t('订单状态'),
            accessor: 'order_status',
            Cell: ({ value: order_status }) => orderState(order_status),
          },
          {
            Header: i18next.t('订单类型'),
            accessor: 'order_process_name',
            show: !isCStation,
            Cell: ({ value: order_process_name }) => (
              <div>{renderOrderTypeName(order_process_name)}</div>
            ),
          },
          {
            Header: i18next.t('司机'),
            accessor: 'driver_name',
          },
          {
            Header: i18next.t('分拣进度'),
            accessor: 'finished',
            Cell: ({ value: finished, original }) => {
              const total = original.total
              return (
                <Progress
                  style={{ minWidth: '120px' }}
                  percentage={
                    total &&
                    parseFloat(Big(finished).div(total).times(100).toFixed(2))
                  }
                  text={`${finished}/${total}`}
                  textInsideFix='center'
                  textInside
                  strokeWidth={14}
                />
              )
            },
          },
          {
            Header: i18next.t('打印状态'),
            accessor: 'print_times',
            Cell: ({ value: print_times }) => {
              return print_times ? (
                <span>{i18next.t('已打印') + '(' + print_times + ')'}</span>
              ) : (
                <span>{i18next.t('未打印')}</span>
              )
            },
          },
          ..._.map(infoConfigs, (v) => ({
            Header: v.field_name,
            accessor: `customized_field.${v.id}`,
            Cell: ({ original }) => (
              <div>{getFiledData(v, original.customized_field)}</div>
            ),
          })),
          canPrintDistribute && {
            Header: i18next.t('单据打印'),
            accessor: 'driver_name',
            Cell: ({ original }) => {
              // 如果有选中的，显示 批量打印
              if (_.includes(selectedList, original.id)) {
                return (
                  <Flex
                    flex
                    alignCenter
                    justifyCenter
                    className='b-sorting-action'
                  >
                    <i
                      className='ifont ifont-batch-print-o b-sorting-order-print text-primary'
                      onClick={() => this.handlePopupPrintModal()}
                    />
                  </Flex>
                )
                // 如果全部没有选中，显示 单个打印
              } else if (selectedList.length === 0) {
                return (
                  <Flex
                    flex
                    alignCenter
                    justifyCenter
                    className='b-sorting-action'
                  >
                    <i
                      className='ifont ifont-print-o b-sorting-order-print text-primary'
                      onClick={() => this.handlePopupPrintModal(original)}
                    />
                  </Flex>
                )
              }
            },
          },
        ].filter((_) => _)}
        subProps={{
          keyField: '_sku_id',
          columns: [
            {
              Header: i18next.t('商品名'),
              accessor: 'name',
            },
            {
              Header: i18next.t('分类'),
              accessor: 'category1_name',
              Cell: ({ value: category1_name, original }) =>
                `${category1_name}/${original.category2_name}/${original.pinlei_name}`,
            },
            {
              Header: i18next.t('报价单'),
              accessor: 'salemenu_name',
            },
            {
              Header: (
                <div>
                  {i18next.t('下单数')}
                  <br />
                  {`（${i18next.t('销售单位')}）`}
                </div>
              ),
              accessor: 'quantity',
              Cell: ({ value: quantity, original }) =>
                `${quantity}${original.sale_unit_name}`,
            },
            {
              Header: (
                <div>
                  {i18next.t('下单数')}
                  <br />
                  {`（${i18next.t('基本单位')}）`}
                </div>
              ),
              accessor: 'std_quantity',
              Cell: ({ value: std_quantity, original }) =>
                `${std_quantity}${original.std_unit_name_forsale}`,
            },
            {
              Header: i18next.t('验货状态'),
              accessor: 'inspect_status',
              Cell: ({ value: inspect_status }) => (
                <div>
                  {inspect_status === 2
                    ? i18next.t('已验货')
                    : i18next.t('未验货')}
                </div>
              ),
            },
            {
              Header: i18next.t('出库数（基本单位）'),
              accessor: 'std_real_quantity',
              Cell: (
                { value: std_real_quantity, index, original },
                { index: orderIndex },
              ) => {
                const {
                  real_is_weight,
                  out_of_stock,
                  is_weight,
                  is_print,
                  std_unit_name_forsale,
                  is_exc,
                  id,
                  is_edit,
                  temp_std_real_quantity,
                  clean_food,
                } = original
                return (
                  <Modify
                    key={id}
                    disabled={!isQuantityEditable || !!is_exc || clean_food} // 净菜不能修改基本单位
                    value={std_real_quantity}
                    unitName={std_unit_name_forsale}
                    realIsWeight={real_is_weight}
                    isWeight={is_weight}
                    printed={is_print}
                    isExc={is_exc}
                    outOfStock={out_of_stock}
                    isEdit={is_edit}
                    inputValue={temp_std_real_quantity}
                    onChange={this.handleUpdateSku.bind(
                      this,
                      orderIndex,
                      index,
                      'temp_std_real_quantity',
                    )}
                  />
                )
              },
            },
            {
              Header: i18next.t('出库数（销售单位）'),
              accessor: 'real_quantity',
              Cell: (
                { value: real_quantity, index, original },
                { index: orderIndex },
              ) => {
                const {
                  real_is_weight,
                  out_of_stock,
                  is_weight,
                  is_print,
                  sale_unit_name,
                  is_exc,
                  id,
                  is_edit,
                  temp_real_quantity,
                  clean_food,
                } = original
                return (
                  <Modify
                    key={id}
                    disabled={!isQuantityEditable || !!is_exc || !clean_food} // 净菜修改销售单位
                    value={real_quantity}
                    unitName={sale_unit_name}
                    realIsWeight={real_is_weight}
                    isWeight={is_weight}
                    printed={is_print}
                    isExc={is_exc}
                    outOfStock={out_of_stock}
                    isEdit={is_edit}
                    inputValue={temp_real_quantity}
                    onChange={this.handleUpdateSku.bind(
                      this,
                      orderIndex,
                      index,
                      'temp_real_quantity',
                    )}
                  />
                )
              },
            },
            {
              Header: i18next.t('分拣备注'),
              accessor: 'sort_remark',
            },
            ..._.map(detailConfigs, (v) => ({
              Header: v.field_name,
              accessor: `detail_customized_field.${v.id}`,
              Cell: ({ original }) => (
                <div>{getFiledData(v, original.detail_customized_field)}</div>
              ),
            })),
            {
              Header: TableUtil.OperationHeader,
              id: 'action',
              Cell: ({ original, index }, { index: orderIndex }) => {
                const { is_exc, is_edit, client } = original
                // 零售订单不能修改
                const disabled =
                  client === 10 || !isQuantityEditable || !!is_exc
                return !disabled ? (
                  <TableUtil.OperationRowEdit
                    isEditing={!!is_edit}
                    onClick={() => {
                      this.handleUpdateSku(orderIndex, index, 'is_edit', true)
                    }}
                    onCancel={() => {
                      this.handleUpdateSku(orderIndex, index, 'is_edit', false)
                    }}
                    onSave={() => {
                      this.handleChangeQuantity(
                        orderIndex,
                        index,
                        original.clean_food
                          ? original.temp_real_quantity
                          : original.temp_std_real_quantity,
                        original.clean_food
                          ? 'real_quantity'
                          : 'std_real_quantity',
                      )
                    }}
                  />
                ) : (
                  <div className='text-center'>-</div>
                )
              },
            },
          ],
        }}
        batchActionBar={selectedList.length ? <BatchActionBar /> : null}
      />
    )
  }
}

export default SortingOrderExpandTable
