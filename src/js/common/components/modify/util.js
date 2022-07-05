import { i18next } from 'gm-i18n'
import React from 'react'
import classNames from 'classnames'

// isWeigh     是否为称重任务
// isWeighted  是否称重
// isSellout   是否缺货
// isPrinted   是否打印

// 文案
const returnTip = (isWeigh, isPrinted, isWeighted = 0, isSellout = false) => {
  if (isWeigh) {
    if (isSellout) {
      return i18next.t('当前为计重任务，当前为缺货状态')
    } else if (!isWeighted && !isPrinted) {
      return i18next.t('当前为计重任务，当前未称重')
    } else if (isPrinted && !isWeighted) {
      return i18next.t('当前为计重任务，当前已打印')
    } else {
      return i18next.t('当前为计重任务，当前已称重')
    }
  } else {
    if (isSellout) {
      return i18next.t('当前为不计重任务，当前为缺货状态')
    } else if (!isWeighted && !isPrinted) {
      return i18next.t('当前为不计重任务，当前未称重')
    } else if (isPrinted && !isWeighted) {
      return i18next.t('当前为不计重任务，当前已打印')
    } else {
      return i18next.t('当前为不计重任务，当前已称重')
    }
  }
}
// 图标
const returnIcon = (isWeigh, isPrinted, isWeighted = 0, isSellout = false) => {
  if (isSellout) {
    return (
      <i
        className={classNames('ifont b-icon-red b-order-icon', {
          'ifont-box1': !isWeigh,
          'ifont-chengzhong': isWeigh,
        })}
      />
    )
  }
  if (isWeigh) {
    return (
      <i
        className={classNames('ifont ifont-chengzhong b-order-icon', {
          'b-icon-primary': isWeighted,
        })}
      />
    )
  } else {
    return (
      <i
        className={classNames('ifont ifont-box1 b-order-icon', {
          'b-icon-primary': isWeighted || isPrinted,
        })}
      />
    )
  }
}

export { returnTip, returnIcon }
