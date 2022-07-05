import React from 'react'
import _ from 'lodash'
import classNames from 'classnames'
import { getQueryFilterForList } from '../util'
import Big from 'big.js'
import { i18next } from 'gm-i18n'
import { System } from '../../../common/service'

/**
 * @param {bool} isSelectAllPage 是否全部页
 * @param {array} selectedList 勾选项
 * @param {array} list 列表数据
 * @param {object} filter 筛选条件
 * @param {bool} isGetFullData 是否返回完整数据,默认不返回
 */
const getBatchSkuFilter = (
  isSelectAllPage,
  selectedList,
  list,
  filter,
  isGetFullData = false
) => {
  const { formula, salemenu_is_active } = filter
  let data = {
    all: isSelectAllPage ? 1 : 0,
  }

  if (isSelectAllPage) {
    data = Object.assign({}, data, getQueryFilterForList(filter))
  } else {
    let selectSkuList = []
    _.forEach(list, (l) => {
      if (l.skus.length) {
        selectSkuList = _.concat(
          selectSkuList,
          _.filter(l.skus, (v) => _.find(selectedList, (s) => s === v.sku_id))
        )
        if (!salemenu_is_active)
          selectSkuList = _.filter(selectSkuList, (v) => v.salemenu_is_active)
        if (formula === 1)
          selectSkuList = _.filter(selectSkuList, (v) => v.formula_status === 1)
        if (formula === 0)
          selectSkuList = _.filter(selectSkuList, (v) => v.formula_status === 0)
      }
    })

    data = Object.assign({}, data, {
      sku_list: isGetFullData
        ? selectSkuList
        : JSON.stringify(_.map(selectSkuList, (v) => v.sku_id)),
    })
  }
  if (System.isC()) data.is_retail_interface = 1

  return data
}

const getBatchSpuFilter = (isSelectAllPage, list, filter, selectedList) => {
  let data = {
    all: isSelectAllPage ? 1 : 0,
  }

  if (isSelectAllPage) {
    data = _.omit(Object.assign({}, data, getQueryFilterForList(filter)), [
      'formula',
      'salemenu_is_active',
    ])
  } else {
    data = Object.assign({}, data, {
      spu_list: JSON.stringify(selectedList.slice()),
    })
  }
  if (System.isC()) data.is_retail_interface = 1
  return data
}

const getActiveSkus = (skus) => {
  return _.filter(skus, (v) => v.salemenu_is_active)
}

const salemenuPop = (skus) => {
  return (
    <div className='gm-padding-5'>
      {_.map(
        _.uniqBy(skus, (v) => v.salemenu_id),
        (v, i) => (
          <div
            key={i}
            className={classNames({
              'gm-text-desc': !v.salemenu_is_active,
            })}
          >
            {i + 1}. {v.salemenu_name}
          </div>
        )
      )}
    </div>
  )
}

const getSkuPriceRange = (skus) => {
  const arr = _.groupBy(skus, 'fee_type')
  return _.map(arr, (val, k) => {
    let min = 0
    let max = 0
    if (val.length !== 0) {
      const price_list = _.map(val, (v) => _.toNumber(v.std_sale_price_forsale))
      min = Big(_.min(price_list)).toFixed(2)
      max = Big(_.max(price_list)).toFixed(2)
    }
    return {
      min,
      max,
      fee_type: k,
    }
  })
}

const spuImportHeader = {
  0: i18next.t('一级分类名称'),
  1: i18next.t('二级分类名称'),
  2: i18next.t('SPU名称'),
  3: i18next.t('单位'),
  4: i18next.t('描述'),
  5: i18next.t('自定义编码'),
  6: i18next.t('图片'),
}

const spuCleanFoodImportHeader = {
  0: i18next.t('一级分类名称'),
  1: i18next.t('二级分类名称'),
  2: i18next.t('SPU名称'),
  3: i18next.t('单位'),
  4: i18next.t('描述'),
  5: i18next.t('自定义编码'),
  6: i18next.t('图片'),
  7: i18next.t('商品名'),
  8: i18next.t('商品描述'),
  9: i18next.t('物料名称'),
  10: i18next.t('单位数量（基本单位）（填写数字）'),
  11: i18next.t('报价单ID'),
}

export {
  getActiveSkus,
  getBatchSkuFilter,
  salemenuPop,
  getBatchSpuFilter,
  getSkuPriceRange,
  spuImportHeader,
  spuCleanFoodImportHeader,
}
