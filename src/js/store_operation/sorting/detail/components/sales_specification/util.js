import { i18next } from 'gm-i18n'
import _ from 'lodash'
import { Dialog, Flex } from '@gmfe/react'
import React from 'react'
import Big from 'big.js'

const outStockStatusMap = {
  1: i18next.t('待出库'),
  2: i18next.t('已出库'),
  3: i18next.t('已删除'),
}

const receiptTypeTag = (status) => {
  switch (status + '') {
    case '1':
      return 'processing'
    case '2':
      return 'finish'
    case '3':
    case '0':
      return 'error'
  }
}

// 绩效方式Option
export const performanceWayOptions = [
  { label: i18next.t('全部'), value: 0 },
  { label: i18next.t('计重'), value: 1 },
  { label: i18next.t('计件'), value: 2 },
]

const salesSpecificationsTimeTypeMap = {
  1: i18next.t('按收货时间'),
  2: i18next.t('按运营周期'),
}

const remarkType = [
  { text: '全部备注', value: '' },
  { text: '有备注', value: '1' },
  { text: '无备注', value: '0' },
]

function timeTypeAdapter(timeTypeMap) {
  return _.map(Object.entries(timeTypeMap), ([k, v]) => {
    return {
      type: +k,
      name: v,
      expand: +k === 2,
    }
  })
}

// 自动关闭当前页面的弹框
function closeWindowDialog(type) {
  Dialog.alert({
    children: (
      <Flex alignCenter justifyCenter className='b-psmd-finish-dialog-tip'>
        <i className='ifont ifont-success' /> {type}
      </Flex>
    ),
    title: i18next.t('确认任务状态'),
    OKBtn: i18next.t('完成'),
    onOK: () => {
      window.closeWindow()
    },
  })
}

const isValid = (val) => val !== undefined && val !== null && _.trim(val) !== ''

const getStockOutListAdapter = (data) => {
  return _.map(data, (item, index) => {
    const batchSelected = []
    const batchSelectedOutStockNum = new Map()

    _.each(item.batch_details, (v) => {
      batchSelected.push(v.batch_number)
      batchSelectedOutStockNum.set(v.batch_number, v.out_stock_base)
    })

    return {
      ...item,
      real_std_count: +Big(item.real_std_count || 0).toFixed(2),
      batchSelected,
      batchSelectedOutStockNum,
      detail_id: createDetailId(item.id, index),
    }
  })
}

const getOutStockConfirmData = (details, stock_method) => {
  const params = []
  _.forEach(details, (item) => {
    const param = {
      sku_id: item.id,
      spu_id: item.spu_id,
      quantity: item.real_std_count || item.quantity * item.sale_ratio,
    }
    if (stock_method === 2) {
      const batch = []
      _.forEach(item.batch_details, (item) => {
        batch.push({
          batch_number: item.batch_number,
          out_stock_base: item.out_stock_base,
        })
      })
      params.push({
        ...param,
        FIFO: batch,
      })
    } else {
      params.push(param)
    }
  })

  return params
}

const createDetailId = (id, index) => {
  return `${id}_${index}`
}

export {
  outStockStatusMap,
  salesSpecificationsTimeTypeMap,
  timeTypeAdapter,
  isValid,
  closeWindowDialog,
  getStockOutListAdapter,
  getOutStockConfirmData,
  receiptTypeTag,
  remarkType,
  createDetailId,
}
