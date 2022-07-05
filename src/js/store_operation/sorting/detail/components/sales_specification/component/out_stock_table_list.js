/* eslint-disable no-void */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react'
import {
  BoxTable,
  Flex,
  Modal,
  RightSideModal,
  Button,
  FormItem,
  FormBlock,
  BoxForm,
  MoreSelect,
  Tip,
  DatePicker,
} from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import Big from 'big.js'
import { Table, TableUtil, selectTableV2HOC } from '@gmfe/table'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import Modify from 'common/components/modify/modify'
import store from '../store/list_store'
import globalStore from 'stores/global'

import TaskList from '../../../../../../task/task_list'
import moment from 'moment'
import { convertNumber2Sid, orderState } from 'common/filter'
import { renderOrderTypeName } from 'common/deal_order_process'
import TableTotalText from 'common/components/table_total_text'
import { getOrderTypeId } from 'common/deal_order_process'
import { Request } from '@gm-common/request'
import { openNewTab } from 'common/util'
import _ from 'lodash'

const TableRightAction = ({ handleExport }) => {
  return (
    <div>
      <Button
        type='primary'
        onClick={() => void handleExport(1)}
        className='gm-margin-right-10'
      >
        {i18next.t('明细导出')}
      </Button>
      <Button type='primary' plain onClick={() => void handleExport(2)}>
        {i18next.t('拣货导出')}
      </Button>
    </div>
  )
}

const Mes = observer(({ data_ids, count, sorterList }) => {
  const [autoPrint, setAutoPrint] = useState(false)
  const [sorter_selected, setSorter] = useState(null)

  return (
    <BoxForm horizontal disabledCol btnPosition='right' labelWidth='115px'>
      <FormBlock>
        <FormItem>
          <div
            style={{
              width: 230,
              color: 'red',
              paddingLeft: '50%',
            }}
          >
            {`已选中${count}条分拣任务`}
          </div>
        </FormItem>
      </FormBlock>
      <FormBlock
        style={{
          marginTop: 10,
        }}
      >
        <FormItem label={i18next.t('*分拣员')}>
          <div
            style={{
              width: 130,
            }}
          >
            <MoreSelect
              renderListFilterType='pinyin'
              name='username'
              data={sorterList
                .map((it) => ({
                  text: it.username,
                  value: it,
                }))
                .slice()}
              selected={sorter_selected}
              onSelect={(v) => {
                setSorter(v)
              }}
            />
          </div>
        </FormItem>
      </FormBlock>

      <FormBlock
        style={{
          marginTop: 10,
          marginLeft: 20,
          textAlign: 'center',
          color: 'red',
          width: '80%',
        }}
      >
        点击[确认分拣],将同步未分拣商品下单数到出库数 已分拣商品数量不受影响
        {/* <FormItem labelWidth={150} label={i18next.t('分拣完成后打印标签')}>
          <div
            style={{
              width: 130,
            }}
          >
            <Switch
              type='primary'
              checked={autoPrint}
              on={i18next.t('启用')}
              off={i18next.t('不启用')}
              onChange={() => {
                setAutoPrint((s) => !s)
              }}
            />
          </div>
        </FormItem> */}
      </FormBlock>
      <FormBlock
        style={{
          marginLeft: 212,
          marginTop: 20,
        }}
      >
        <Button
          className='gm-margin-right-5'
          onClick={() => {
            Modal.hide()
          }}
        >
          {i18next.t('取消')}
        </Button>
        <Button
          type='primary'
          disabled={!sorter_selected}
          onClick={() => {
            store.oneClickSort({
              sorter_selected,
              autoPrint,
              hide: () => void Modal.hide(),
            })
          }}
        >
          {i18next.t('确认')}
        </Button>
      </FormBlock>
    </BoxForm>
  )
})

const MesForBatchChangeSorter = observer(({ data_ids, count, sorterList }) => {
  const [autoPrint, setAutoPrint] = useState(false)
  const [sorter_selected, setSorter] = useState(null)

  return (
    <BoxForm horizontal disabledCol btnPosition='right' labelWidth='115px'>
      <FormBlock>
        <FormItem>
          <div
            style={{
              width: 230,
              color: 'red',
              paddingLeft: '50%',
            }}
          >
            {`已选中${count}条分拣任务`}
          </div>
        </FormItem>
      </FormBlock>
      <FormBlock
        style={{
          marginTop: 10,
        }}
      >
        <FormItem label={i18next.t('*分拣员')}>
          <div
            style={{
              width: 130,
            }}
          >
            <MoreSelect
              renderListFilterType='pinyin'
              name='username'
              data={sorterList
                .map((it) => ({
                  text: it.username,
                  value: it,
                }))
                .slice()}
              selected={sorter_selected}
              onSelect={(v) => {
                setSorter(v)
              }}
            />
          </div>
        </FormItem>
      </FormBlock>

      <FormBlock
        style={{
          marginTop: 10,
          marginLeft: 20,
          textAlign: 'center',
          color: 'red',
          width: '80%',
        }}
      >
        {/* 点击[确认分拣],将同步未分拣商品下单数到出库数 已分拣商品数量不受影响 */}
      </FormBlock>
      <FormBlock
        style={{
          marginLeft: 212,
          marginTop: 20,
        }}
      >
        <Button
          className='gm-margin-right-5'
          onClick={() => {
            Modal.hide()
          }}
        >
          {i18next.t('取消')}
        </Button>
        <Button
          type='primary'
          disabled={!sorter_selected}
          onClick={() => {
            store.batchChangeSorter({
              sorter_selected,
              autoPrint,
              hide: () => void Modal.hide(),
            })
          }}
        >
          {i18next.t('确认')}
        </Button>
      </FormBlock>
    </BoxForm>
  )
})

const SelectTable = selectTableV2HOC(Table)

const OutStockTable = observer(() => {
  const {
    outStockList,
    loading,
    tableSelected,
    isAllPageSelect,
    sorterList,
    ref,
  } = store

  useEffect(() => {
    store.init()

    ref?.doFirstRequest && ref.doFirstRequest()
  }, [])

  const { isCStation } = globalStore.otherInfo

  const handlePageChange = (page) => {
    return store.fetchOutStockList(page).then((json) => {
      store.changePagination(page)
      return json
    })
  }

  const handleSelect = (selected) => {
    store.noEdit()
    store.changeSelected(selected)

    // 如果未选择全部，则切换为勾选当前页状态
    if (selected.length < outStockList.length) {
      store.setCurrentPageAllSelect(false)
    }
  }

  const handleSelectTableAll = (isSelect) => {
    store.noEdit()
    store.setTableAllSelect(isSelect)
  }

  const handleSelectAllPage = (isSelectAllPage) => {
    store.noEdit()
    store.setCurrentPageAllSelect(isSelectAllPage)
    // 若选择了全部页，则将全部当前页数据都selected
    if (isSelectAllPage) {
      store.setTableAllSelect(true)
    }
  }

  const OutOfStock = observer(({ data_ids, count, un }) => {
    return (
      <BoxForm horizontal disabledCol btnPosition='right' labelWidth='115px'>
        <FormBlock>
          <FormItem>
            <div
              style={{
                width: '150%',
                color: 'red',
                textAlign: 'center',
              }}
            >
              {`已选中${count}条分拣任务`}
              <p>
                {un
                  ? `点击确认后将取消此分拣任务的缺货状态`
                  : `点击确认后将此分拣任务标记为缺货状态`}
              </p>
            </div>
          </FormItem>
        </FormBlock>
        <FormBlock
          style={{
            marginLeft: 212,
            marginTop: 20,
          }}
        >
          <Button
            className='gm-margin-right-5'
            onClick={() => {
              Modal.hide()
            }}
          >
            {i18next.t('取消')}
          </Button>
          <Button
            type='primary'
            onClick={() => {
              un
                ? store.batchOutStockUn({
                    hide: () => void Modal.hide(),
                    no_confirm: true,
                  })
                : store.batchOutStock({
                    hide: () => void Modal.hide(),
                    no_confirm: true,
                  })
            }}
          >
            {i18next.t('确认')}
          </Button>
        </FormBlock>
      </BoxForm>
    )
  })

  const handleMes = (isBatch, id) => {
    let data_ids
    if (isBatch) {
      data_ids = isAllPageSelect ? [] : tableSelected.slice()
    } else {
      data_ids = [id]
    }

    const count = isAllPageSelect ? store.total : data_ids.length

    Modal.render({
      title: i18next.t('一键分拣'),
      style: { width: '400px' },
      onHide: Modal.hide,
      children: (
        <Mes data_ids={data_ids} count={count} sorterList={sorterList} />
      ),
    })

    // RightSideModal.render({
    //   onHide: RightSideModal.hide,
    //   style: { width: '300px' },
    //   children: <PopupPrint data_ids={data_ids} />,
    // })
  }

  const handleChangeSorter = (isBatch, id) => {
    let data_ids
    if (isBatch) {
      data_ids = isAllPageSelect ? [] : tableSelected.slice()
    } else {
      data_ids = [id]
    }

    const count = isAllPageSelect ? store.total : data_ids.length

    Modal.render({
      title: i18next.t('批量修改分拣员'),
      style: { width: '400px' },
      onHide: Modal.hide,
      children: (
        <MesForBatchChangeSorter
          data_ids={data_ids}
          count={count}
          sorterList={sorterList}
        />
      ),
    })

    // RightSideModal.render({
    //   onHide: RightSideModal.hide,
    //   style: { width: '300px' },
    //   children: <PopupPrint data_ids={data_ids} />,
    // })
  }

  const handleMarkOutOfStock = (isBatch, id) => {
    let data_ids
    if (isBatch) {
      data_ids = isAllPageSelect ? [] : tableSelected.slice()
    } else {
      data_ids = [id]
    }

    const count = isAllPageSelect ? store.total : data_ids.length

    Modal.render({
      title: i18next.t('标记缺货'),
      style: { width: '400px' },
      onHide: Modal.hide,
      children: <OutOfStock data_ids={data_ids} count={count} />,
    })
  }

  const handleMarkOutOfStockUn = (isBatch, id) => {
    let data_ids
    if (isBatch) {
      data_ids = isAllPageSelect ? [] : tableSelected.slice()
    } else {
      data_ids = [id]
    }

    const count = isAllPageSelect ? store.total : data_ids.length

    Modal.render({
      title: i18next.t('取消标记缺货'),
      style: { width: '400px' },
      onHide: Modal.hide,
      children: <OutOfStock data_ids={data_ids} count={count} un />,
    })
  }

  const printLabel = () => {
    const URL = '#/system/setting/label/print'

    if (store.isAllPageSelect) {
      openNewTab(
        `${URL}?isAllPageSelect=1&print=${JSON.stringify(
          store.getReqDataList(),
        )}`,
      )
    } else {
      const tableSelectList = []
      outStockList.forEach((i) => {
        if (_.find(tableSelected, (item) => item === i._order_id)) {
          tableSelectList.push(i)
        }
      })
      const query = _.map(tableSelectList, (item) => {
        return {
          order_id: item.order_id,
          detail_id: item.detail_id,
          sku_id: item.sku_id,
        }
      })
      openNewTab(`${URL}?print=${JSON.stringify(query)}`)
      Modal.hide()
    }
  }

  const handlePrint = (isBatch, id) => {
    let data_ids
    if (isBatch) {
      data_ids = isAllPageSelect ? [] : tableSelected.slice()
    } else {
      data_ids = [id]
    }

    Modal.render({
      title: i18next.t('批量打印标签'),
      style: { width: '300px' },
      onHide: Modal.hide,
      children: (
        <>
          <Flex
            column
            alignCenter
            justifyCenter
            style={{
              color: 'red',
            }}
          >
            <div>{`已选中${
              isAllPageSelect ? store.total : data_ids.length
            }条分拣任务`}</div>
            <div>请检查打印机连接状态及纸张数量</div>
          </Flex>
          <Flex justifyEnd className='gm-margin-top-20'>
            <Button
              className='gm-margin-right-5'
              onClick={() => {
                Modal.hide()
              }}
            >
              {i18next.t('取消')}
            </Button>
            <Button type='primary' onClick={printLabel}>
              {i18next.t('打印')}
            </Button>
          </Flex>
        </>
      ),
    })

    // RightSideModal.render({
    //   onHide: RightSideModal.hide,
    //   style: { width: '300px' },
    //   children: <PopupPrint data_ids={data_ids} />,
    // })
  }

  const isQuantityEditable = globalStore.hasPermission('edit_real_quantity')

  const handleUpdateOrder = (index, key, value) => {
    store.updateOrder(index, key, value)
  }
  const handleChangeQuantity = async (index, value, type) => {
    const quantity = Number(value) // 组件中传出来的是字符串

    const sku = store.outStockList.slice()[index]
    if (quantity === 0) {
      // 出库数如果为0，则进行缺货操作
      await store.batchOutStock({
        skus: [
          {
            order_id: sku.order.order_id,
            sku_id: sku.sku_id,
            detail_id: sku.order.detail_id,
            source_order_id: sku.order.source_order_id,
            source_detail_id: sku.order.source_detail_id,
          },
        ],
        sku,
      })
      // await store.updateQuantity(index)
    } else {
      let std_quantity

      if (type === 'std_real_quantity') {
        std_quantity = quantity
      } else if (type === 'real_quantity') {
        std_quantity = +Big(quantity).times(sku.order.sale_ratio)
      }

      await store.updateQuantity(index, std_quantity)
    }
    handleUpdateOrder(index, 'is_edit', false)
  }

  const handleExport = (value) => {
    const data = store.getReqDataList()

    let params = {
      ...data,
      export: value,
    }

    const order_process_type_id = getOrderTypeId(data.orderType)
    if (order_process_type_id !== null) {
      params = {
        ...params,
        order_process_type_id,
      }
    }

    Request('/weight/sku/list_v2/export')
      .data(params)
      .get()
      .then((json) => {
        Tip.success(i18next.t('正在异步导出报表...'))
        RightSideModal.render({
          children: <TaskList />,
          onHide: RightSideModal.hide,
          style: { width: '300px' },
        })
      })
  }

  return (
    <>
      <BoxTable
        info={
          <BoxTable.Info>
            <TableTotalText
              data={[
                {
                  label: i18next.t('全部任务'),
                  content: store.total,
                },
                {
                  label: i18next.t('已分拣'),
                  content: store.finished,
                },

                {
                  label: i18next.t('待分拣'),
                  content: store.total - store.finished,
                },
              ]}
            />
          </BoxTable.Info>
        }
        action={<TableRightAction handleExport={handleExport} />}
      >
        <SelectTable
          data={outStockList.slice()}
          onSelect={handleSelect}
          selected={tableSelected.slice()}
          onSelectAll={handleSelectTableAll}
          batchActionBar={
            tableSelected.length > 0 ? (
              <TableUtil.BatchActionBar
                onClose={() => handleSelectTableAll(false)}
                toggleSelectAll={handleSelectAllPage}
                batchActions={[
                  {
                    name: (
                      <span>
                        {i18next.t('全部任务: ')}
                        <span className='text-primary gm-text-14 gm-text-bold'>
                          {store.local_total}
                        </span>
                      </span>
                    ),
                    show: true,
                  },
                  {
                    name: (
                      <span>
                        {i18next.t('已分拣: ')}
                        <span className='text-primary gm-text-14 gm-text-bold'>
                          {store.local_finished}
                        </span>
                      </span>
                    ),
                    show: true,
                  },
                  {
                    name: (
                      <span>
                        {i18next.t('待分拣: ')}
                        <span className='text-primary gm-text-14 gm-text-bold'>
                          {store.local_total - store.local_finished}
                        </span>
                      </span>
                    ),
                    show: true,
                  },
                  {
                    name: '|',
                    show: true,
                  },
                  {
                    name: i18next.t('一键分拣'),
                    onClick: () => handleMes(true),
                    show: true,
                    type: 'business',
                  },
                  {
                    name: i18next.t('打印标签'),
                    onClick: () => handlePrint(true),
                    show: true,
                    type: 'business',
                  },
                  {
                    name: i18next.t('标记缺货'),
                    onClick: () => handleMarkOutOfStock(true),
                    show: true,
                    type: 'business',
                  },
                  {
                    name: i18next.t('取消标记缺货'),
                    onClick: () => handleMarkOutOfStockUn(true),
                    show: true,
                    type: 'business',
                  },
                  {
                    name: i18next.t('批量修改分拣员'),
                    onClick: () => handleChangeSorter(true),
                    show: true,
                    type: 'business',
                  },
                ]}
                count={isAllPageSelect ? null : tableSelected.length}
                isSelectAll={isAllPageSelect}
              />
            ) : null
          }
          keyField='_order_id'
          loading={loading}
          enableEmptyTip
          columns={[
            {
              Header: i18next.t('订单号'),
              accessor: 'order_id',
            },
            {
              Header: i18next.t('客户名/SID'),
              accessor: 'resname',
              Cell: ({ original }) => (
                <div>
                  <p>{original?.order?.resname ?? ''}</p>
                  <p className='b-sheet-item-disable'>
                    {convertNumber2Sid(original?.order?.address_id ?? '')}
                  </p>
                </div>
              ),
            },
            {
              Header: i18next.t('分类'),
              accessor: 'category1_name',
              Cell: ({ value: category1_name, index, original }) =>
                `${category1_name}/${original.category2_name}/${original.pinlei_name}`,
            },
            {
              Header: i18next.t('商品名称'),
              accessor: 'spu_name',
              Cell: ({ original }) => {
                return (
                  <div>
                    <p>{original.spu_name ?? ''}</p>
                    <p className='b-sheet-item-disable'>
                      {original.spu_id ?? ''}
                    </p>
                  </div>
                )
              },
            },
            {
              minWidth: 1.2,
              Header: i18next.t('规格名称'),
              accessor: 'order.sale_ratio',
              Cell: ({ original }) => {
                return (
                  <div>
                    <p>{original.name}</p>
                    <p className='b-sheet-item-disable'>
                      {original.sku_id ?? ''}
                    </p>
                  </div>
                )
              },
            },
            {
              Header: i18next.t('销售规格'),
              accessor: 'order.sale_ratio',
              Cell: ({ original }) => {
                const order = original.order
                return order.std_unit_name_forsale === order.sale_unit_name &&
                  order.sale_ratio === 1
                  ? i18next.t('KEY6', {
                      VAR1: order.std_unit_name_forsale,
                    })
                  : order.sale_ratio +
                      order.std_unit_name_forsale +
                      '/' +
                      order.sale_unit_name
              },
            },
            {
              Header: i18next.t('收货时间'),
              accessor: 'order',
              Cell: (cellProps) => {
                const { order } = cellProps.original
                if (
                  !order ||
                  !order?.receive_begin_time ||
                  !order.receive_end_time
                )
                  return '-'

                return (
                  <div>
                    <p>
                      {moment(order.receive_begin_time).format('YYYY-MM-DD')}
                    </p>
                    <p>{moment(order.receive_end_time).format('YYYY-MM-DD')}</p>
                  </div>
                )
              },
            },
            {
              Header: (
                <div>
                  {i18next.t('下单数')}
                  <br />
                  {`（${i18next.t('销售单位')}）`}
                </div>
              ),
              accessor: 'order.quantity',
              Cell: ({ value: quantity, original }) => {
                if (!original.order) return '-'
                return `${quantity}${original.order.sale_unit_name}`
              },
            },
            {
              Header: (
                <div>
                  {i18next.t('下单数')}
                  <br />
                  {`（${i18next.t('基本单位')}）`}
                </div>
              ),
              accessor: 'order.std_quantity',
              Cell: ({ value: std_quantity, original }) => {
                if (!original.order) return '-'
                return `${std_quantity}${original.order.std_unit_name_forsale}`
              },
            },
            {
              Header: i18next.t('出库数（销售单位）'),
              accessor: 'order.real_quantity',
              Cell: ({ index, original }) => {
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
                } = original.order
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
                    onChange={(value) => {
                      handleUpdateOrder(index, 'temp_real_quantity', value)
                    }}
                  />
                )
              },
            },
            {
              Header: i18next.t('出库数（基本单位）'),
              accessor: 'order.std_real_quantity',
              Cell: ({ value: std_real_quantity, index, original }) => {
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
                } = original.order

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
                    onChange={(value) => {
                      handleUpdateOrder(index, 'temp_std_real_quantity', value)
                    }}
                  />
                )
              },
            },
            {
              Header: i18next.t('绩效方式'),
              accessor: 'perf_method',
              Cell: ({ value: perf_method }) => (
                <div>{perf_method === 1 ? '计重' : '计件'}</div>
              ),
            },
            {
              Header: i18next.t('分拣员'),
              accessor: 'sorter.username',
              Cell: (cellProps) => {
                const { order, sorter } = cellProps.original
                if (!sorter) return '-'
                if (!order.is_edit && order?.temp_username)
                  return order?.temp_username

                if (order.is_edit)
                  return (
                    <MoreSelect
                      renderListFilterType='pinyin'
                      name='username'
                      disabledClose
                      data={sorterList
                        .map((it) => ({
                          text: it.username,
                          value: it,
                        }))
                        .slice()}
                      selected={sorterList
                        .map((it) => ({
                          text: it.username,
                          value: it,
                        }))
                        .find((it) => it.text === order.temp_username)}
                      onSelect={(v) => {
                        handleUpdateOrder(
                          cellProps.index,
                          'temp_username',
                          v?.text ?? sorter.username,
                        )
                      }}
                    />
                  )
                return '-'
              },
            },
            {
              Header: i18next.t('线络'),
              accessor: 'order.route',
            },
            {
              Header: i18next.t('订单类型'),
              accessor: 'order.order_process_name',
              show: !isCStation,
              Cell: ({ value: order_process_name }) => (
                <div>{renderOrderTypeName(order_process_name)}</div>
              ),
            },
            {
              Header: i18next.t('订单状态'),
              accessor: 'order.status',
              Cell: ({ value: status }) => orderState(status),
            },
            {
              Header: i18next.t('验货状态'),
              accessor: 'order.inspect_status',
              Cell: ({ value: inspect_status }) => (
                <div>
                  {inspect_status === 2
                    ? i18next.t('已验货')
                    : i18next.t('未验货')}
                </div>
              ),
            },
            {
              Header: i18next.t('分拣序号'),
              accessor: 'order.sort_id',
            },

            {
              Header: i18next.t('分拣备注'),
              accessor: 'order.sort_remark',
            },
            {
              Header: i18next.t('生产日期'),
              minWidth: 2,
              accessor: 'order.temp_sku_production_date',
              Cell: (cellProps) => {
                const { order } = cellProps.original
                if (!order) return '-'
                if (!order.is_edit && order?.temp_sku_production_date)
                  return moment(order.temp_sku_production_date).format(
                    'YYYY-MM-DD',
                  )
                if (order.is_edit)
                  return (
                    <DatePicker
                      placeholder={i18next.t('请选择生产日期')}
                      date={
                        order.temp_sku_production_date
                          ? moment(order.temp_sku_production_date)
                          : null
                      }
                      onChange={(value) => {
                        const sku_production_date = value
                          ? moment(value).format('YYYY-MM-DD')
                          : value

                        handleUpdateOrder(
                          cellProps.index,
                          'temp_sku_production_date',
                          sku_production_date,
                        )
                      }}
                    />
                  )
                return '-'
              },
            },
            {
              Header: i18next.t('打印'),
              accessor: 'order.is_print',
              Cell: ({ value: is_print }) => (
                <div>
                  {is_print ? i18next.t('已打印') : i18next.t('未打印')}
                </div>
              ),
            },
            {
              minWidth: 2,
              Header: TableUtil.OperationHeader,
              id: 'action',
              Cell: ({ original, index }) => {
                // 零售订单不允许修改
                const disabled =
                  original.order.client === 10 ||
                  !isQuantityEditable ||
                  !!original.order.is_exc

                return (
                  <TableUtil.OperationRowEdit
                    isEditing={!!original.order.is_edit}
                    onClick={() => {
                      handleUpdateOrder(index, 'is_edit', true)
                    }}
                    onCancel={() => {
                      handleUpdateOrder(index, 'is_edit', false)
                    }}
                    onSave={() => {
                      !disabled &&
                        handleChangeQuantity(
                          index,
                          original.order.clean_food
                            ? original.order.temp_real_quantity
                            : original.order.temp_std_real_quantity,
                          original.order.clean_food
                            ? 'real_quantity'
                            : 'std_real_quantity',
                        )
                    }}
                  />
                )
              },
            },
          ]}
        />
      </BoxTable>
      <Flex
        justifyEnd
        className='text-center gm-margin-top-20 gm-margin-right-15'
      >
        <ManagePaginationV2
          id='pagination_in_SalesSpecification_list'
          onRequest={handlePageChange}
          ref={(ref) => {
            ref && store.setPagination(ref)
          }}
          disablePage
        />
        {/* <Pagination
          toPage={handlePageChange}
          data={pagination}
          nextDisabled={outStockList && outStockList.length < pagination.limit}
        /> */}
      </Flex>
    </>
  )
})

export default OutStockTable
