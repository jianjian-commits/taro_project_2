import React from 'react'
import { Dialog } from '@gmfe/react'
import store from './store'
import { doNumberDigitFixed } from 'common/util'

/**
 * 创建Dialog功用方法
 * @param Component {function|class} 组件名
 * @param state {object} 组件state
 * @param props {object} 自定义Dialog props
 */
export function createDialog(Component, state, props) {
  const { selected } = state
  Dialog.confirm({
    children: <Component selected={selected} />,
    size: 'md',
    ...props,
  })
}

/**
 * 初始化批量编辑模态框
 * @param fn {string} 初始化方法名
 * @param status {*} 初始化状态
 * @param props {number[]} 组件的props
 */
export function initBatchEditModal(fn, status, props) {
  if (fn) {
    store[fn](status)
  }
  const { allSelect, filterReceiveSearchData } = store
  let option = {}
  if (allSelect) {
    option = { ...filterReceiveSearchData }
  } else {
    option.ids = JSON.stringify(props)
  }
  store.fetchBatchEditList(option)
}

export const doBatchEditData = (data) => {
  // 过滤库存为0的值
  const noZero = data.filter((item) => {
    return parseFloat(item.total_remain) !== 0
  })

  // 领料数默认为需求数，当需求数大于库存数时，领料数为库存数
  return noZero.map((item) => {
    const { amount, total_remain } = item
    return {
      ...item,
      amount: doNumberDigitFixed(
        amount > total_remain ? total_remain : amount,
        2
      ),
    }
  })
}
