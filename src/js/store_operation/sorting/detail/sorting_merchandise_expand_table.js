import { i18next } from 'gm-i18n'
import React from 'react'
import Big from 'big.js'
import { observer } from 'mobx-react'
import { ProgressCircle } from '@gmfe/react'
import { getFiledData } from 'common/components/customize'
import {
  Table,
  selectTableV2HOC,
  expandTableHOC,
  subTableHOC,
  TableUtil,
} from '@gmfe/table'
import _ from 'lodash'

import merchandiseStore from './merchandise_store'
import Modify from '../../../common/components/modify/modify'
import getTableChild from 'common/table_child'
import { orderState } from '../../../common/filter'
import { renderOrderTypeName } from '../../../common/deal_order_process'
import globalStore from '../../../stores/global'
import { convertNumber2Sid } from 'common/filter'

const SelectExpandTable = selectTableV2HOC(expandTableHOC(Table))
const SelectSubTable = selectTableV2HOC(subTableHOC(Table))
const TableChild = getTableChild(SelectExpandTable, SelectSubTable)

const BatchActionBar = observer((props) => {
  const { selectedTree, selectedAllType } = merchandiseStore

  const handleBatchOutStock = () => {
    merchandiseStore.batchOutStock()
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
        merchandiseStore.toggleSelectedAllPage(bool)
      }}
      batchActions={[
        {
          name: i18next.t('批量修改缺货'),
          type: 'edit',
          onClick: handleBatchOutStock,
        },
      ]}
      count={selectedAllType ? null : length}
      isSelectAll={selectedAllType}
    />
  )
})

@observer
class SortingMerchandiseExpandTable extends React.Component {
  componentWillUnmount() {
    merchandiseStore.init()
  }

  handleUpdateOrder = (skuIndex, orderIndex, key, value) => {
    merchandiseStore.updateOrder(skuIndex, orderIndex, key, value)
  }

  handleChangeQuantity = async (skuIndex, orderIndex, value, type) => {
    const quantity = Number(value) // 组件中传出来的是字符串

    const sku = merchandiseStore.merchandiseData.skus.slice()[skuIndex]
    if (quantity === 0) {
      // 出库数如果为0，则进行缺货操作
      await merchandiseStore.batchOutStock([
        {
          order_id: sku.children[orderIndex].order_id,
          sku_id: sku.sku_id,
          detail_id: sku.children[orderIndex].detail_id,
          source_order_id: sku.children[orderIndex].source_order_id,
          source_detail_id: sku.children[orderIndex].source_detail_id,
        },
      ])
    } else {
      let std_quantity

      if (type === 'std_real_quantity') {
        std_quantity = quantity
      } else if (type === 'real_quantity') {
        std_quantity = +Big(quantity).times(sku.children[orderIndex].sale_ratio)
      }

      await merchandiseStore.updateQuantity(skuIndex, orderIndex, std_quantity)
    }
    this.handleUpdateOrder(skuIndex, orderIndex, 'is_edit', false)
  }

  handleSelect = (selected, selectedTree) => {
    merchandiseStore.setSelected(selected, selectedTree)
  }

  handleBatchOutStock = () => {
    merchandiseStore.batchOutStock()
  }

  render() {
    const { merchandiseData, selectedList } = merchandiseStore
    const list = merchandiseData.skus.slice() || []
    const isQuantityEditable = globalStore.hasPermission('edit_real_quantity')
    const { isCStation } = globalStore.otherInfo
    const infoConfigs = globalStore.customizedInfoConfigs.filter(
      (v) => v.permission.read_station_sorting,
    )
    const detailConfigs = globalStore.customizedDetailConfigs.filter(
      (v) => v.permission.read_station_sorting,
    )

    return (
      <TableChild
        data={list}
        keyField='sku_id'
        selected={selectedList.slice()}
        onSelect={this.handleSelect}
        columns={[
          {
            Header: i18next.t('商品名'),
            accessor: 'name',
          },
          {
            Header: i18next.t('分类'),
            accessor: 'category1_name',
            Cell: ({ value: category1_name, index, original }) =>
              `${category1_name}/${original.category2_name}/${original.pinlei_name}`,
          },
          {
            Header: i18next.t('报价单'),
            accessor: 'salemenu_name',
            show: !isCStation,
          },
          {
            Header: i18next.t('分拣进度'),
            accessor: 'sort_schedule',
            Cell: ({ value: sort_schedule }) => (
              <ProgressCircle
                percentage={parseFloat(
                  Big(sort_schedule).times(100).toFixed(2),
                )}
                textPosition='right'
                size={20}
              />
            ),
          },
        ]}
        subProps={{
          keyField: '_order_id',
          columns: [
            {
              Header: i18next.t('商户名/SID'),
              accessor: 'resname',
              Cell: ({ value: resname, original }) => (
                <div>
                  {resname}
                  <br />
                  {convertNumber2Sid(original.address_id)}
                </div>
              ),
            },
            {
              Header: i18next.t('线络'),
              accessor: 'route',
            },
            {
              Header: i18next.t('分拣序号'),
              accessor: 'sort_id',
            },
            {
              Header: i18next.t('订单号'),
              accessor: 'order_id',
            },
            {
              Header: i18next.t('订单状态'),
              accessor: 'status',
              Cell: ({ value: status }) => orderState(status),
            },
            {
              Header: i18next.t('订单类型'),
              accessor: 'order_process_name',
              show: !isCStation,
              Cell: ({ value: order_process_name }) => (
                <div>{renderOrderTypeName(order_process_name)}</div>
              ),
            },
            ..._.map(infoConfigs, (v) => ({
              Header: v.field_name,
              accessor: `customized_field.${v.id}`,
              Cell: ({ original }) => (
                <div>{getFiledData(v, original.customized_field)}</div>
              ),
            })),
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
                { index: skuIndex },
              ) => {
                const {
                  real_is_weight,
                  out_of_stock,
                  is_weight,
                  is_print,
                  std_unit_name_forsale,
                  is_exc,
                  is_edit,
                  id,
                  temp_std_real_quantity,
                  clean_food,
                } = original
                return (
                  <Modify
                    key={id}
                    disabled={!isQuantityEditable || !!is_exc || clean_food} // 净菜不可编辑基本单位
                    value={std_real_quantity}
                    unitName={std_unit_name_forsale}
                    realIsWeight={real_is_weight}
                    isWeight={is_weight}
                    printed={is_print}
                    isExc={is_exc}
                    outOfStock={out_of_stock}
                    isEdit={is_edit}
                    inputValue={temp_std_real_quantity}
                    onChange={this.handleUpdateOrder.bind(
                      this,
                      skuIndex,
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
              Cell: ({ index, original }, { index: skuIndex }) => {
                const {
                  real_is_weight,
                  out_of_stock,
                  is_weight,
                  is_print,
                  sale_unit_name,
                  is_exc,
                  is_edit,
                  id,
                  real_quantity,
                  temp_real_quantity,
                  clean_food,
                } = original
                return (
                  <Modify
                    key={id}
                    disabled={!isQuantityEditable || !!is_exc || !clean_food} // 净菜编辑销售单位
                    value={real_quantity}
                    unitName={sale_unit_name}
                    realIsWeight={real_is_weight}
                    isWeight={is_weight}
                    printed={is_print}
                    isExc={is_exc}
                    outOfStock={out_of_stock}
                    isEdit={is_edit}
                    inputValue={temp_real_quantity}
                    onChange={this.handleUpdateOrder.bind(
                      this,
                      skuIndex,
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
              Cell: ({ original, index }, { index: skuIndex }) => {
                // 零售订单不允许修改
                const disabled =
                  original.client === 10 ||
                  !isQuantityEditable ||
                  !!original.is_exc
                return !disabled ? (
                  <TableUtil.OperationRowEdit
                    isEditing={!!original.is_edit}
                    onClick={() => {
                      this.handleUpdateOrder(skuIndex, index, 'is_edit', true)
                    }}
                    onCancel={() => {
                      this.handleUpdateOrder(skuIndex, index, 'is_edit', false)
                    }}
                    onSave={() => {
                      this.handleChangeQuantity(
                        skuIndex,
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

export default SortingMerchandiseExpandTable
