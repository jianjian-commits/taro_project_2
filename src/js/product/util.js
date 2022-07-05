import React from 'react'
import _ from 'lodash'
import { Dialog, Flex } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import Big from 'big.js'

function checkFilter(level1, level2, search_text, supplier_id) {
  const filter = {}
  if (level1?.length) {
    filter.category_id_1 = JSON.stringify(level1.map((i) => i.value))
  }

  if (level2?.length) {
    filter.category_id_2 = JSON.stringify(level2.map((i) => i.value))
  }

  if (search_text !== '') {
    filter.text = _.trim(search_text)
  }

  if (supplier_id) {
    filter.settle_supplier_id = supplier_id
  }

  return filter
}

// 校验：入/退库数、入/退库单价、入/退库金额
function isValid(value) {
  return _.toNumber(value)
    ? _.isNumber(_.toNumber(value))
      ? !!value
      : false
    : false
}

// 校验商品id
function isNumOrLetter(val) {
  const reg = /^[A-Za-z0-9]+$/g
  return reg.test(val)
}

// 前端导出： 英文key匹配为对应的中文
const matchKey = (list, fields) => {
  const res = _.map(list, (data) => {
    const obj = {}
    _.forEach(fields, (item) => {
      const key = item.id
      const name = item.name
      const value = data[key]
      obj[name] = value
    })
    return obj
  })
  return res
}

// 补起批次号5位0
function fillBatchNum(num) {
  return (new Array(5).join(0) + num).slice(-5)
}

const getOutStockConfirmData = (details, stock_method) => {
  const params = []
  _.forEach(details, (item) => {
    const param = {
      sku_id: item.id,
      spu_id: item.spu_id,
      quantity: item.quantity * item.sale_ratio,
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

// 获得 单价 补差 金额 信息，
// data {quantity, unit_price, different_price, money}
// change 改变的字段 'quantity'
function getSomeByChange(data, change) {
  let { quantity, unit_price, different_price, money } = data
  if (change === 'quantity') {
    different_price = 0

    if (quantity !== null && unit_price) {
      money = parseFloat(Big(unit_price).times(quantity).toFixed(2))
    }
  } else if (change === 'unit_price') {
    different_price = 0

    if (unit_price !== null && quantity) {
      money = parseFloat(Big(unit_price).times(quantity).toFixed(2))
    }
  } else if (change === 'money') {
    if (money !== null && quantity) {
      unit_price = parseFloat(Big(money).div(quantity).toFixed(2))

      different_price = parseFloat(
        Big(money).minus(Big(unit_price).times(quantity)),
      )
    }
  }

  return {
    quantity,
    unit_price,
    different_price,
    money,
  }
}

const PRODUCT_STATUS_TAGS = (status) => {
  switch (status + '') {
    case '1':
    case '2':
    case '3':
      return 'processing'
    case '4':
    case '-1':
      return 'finish'
    case '0':
      return 'error'
  }
}

export {
  checkFilter,
  isValid,
  isNumOrLetter,
  matchKey,
  fillBatchNum,
  getOutStockConfirmData,
  closeWindowDialog,
  getSomeByChange,
  PRODUCT_STATUS_TAGS,
}
