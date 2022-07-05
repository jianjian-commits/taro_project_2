import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, Price } from '@gmfe/react'
import _ from 'lodash'
import { adjustSheetStatus } from '../common/filter'
import Big from 'big.js'

const headerLeft = (data) => {
  return (
    <Flex alignCenter>
      <div className='gm-text-desc gm-text-12 gm-margin-right-5'>
        {data.field}:
      </div>
      <div className='gm-text-14'>{data.value || '-'}</div>
    </Flex>
  )
}

const headerRight = (data) => {
  return (
    <Flex column className='gm-padding-tb-10'>
      <Flex className='gm-padding-tb-5'>
        <Flex flex={1} alignCenter>
          <div className='gm-text-desc gm-text-12 gm-margin-right-5'>
            {data[0].field}:
          </div>
          <div className='gm-text-14'>{data[0].value || '-'}</div>
        </Flex>
        <Flex flex={1} alignCenter>
          <div className='gm-text-desc gm-text-12 gm-margin-right-5'>
            {data[1].field}:
          </div>
          <div className='gm-text-14'>{data[1].value || '-'}</div>
        </Flex>
      </Flex>
      <Flex alignCenter>
        <div className='gm-text-desc gm-text-12 gm-margin-right-5'>
          {data[2].field}:
        </div>
        <div className='gm-text-14'>{data[2].value || '-'}</div>
      </Flex>
    </Flex>
  )
}

// 入库调整单明细导出数据
const getInStockAdjustExportData = (data) => {
  const { submit_time, sheet_no, creator, status, details } = data
  return _.map(details, (item) => {
    const statusStr = adjustSheetStatus(status)
    return {
      [i18next.t('建单时间')]: submit_time,
      [i18next.t('入库调整单号')]: sheet_no,
      [i18next.t('建单人')]: creator,
      [i18next.t('单据状态')]: statusStr,
      [i18next.t('入库商品ID')]: item.spec_id,
      [i18next.t('采购规格ID')]: item.spec_id,
      [i18next.t('商品名称')]: item.name,
      [i18next.t('商品分类')]: item.category_1_name || item.category_2_name,
      [i18next.t('批次号')]: item.batch_number,
      [i18next.t('关联入库单号')]: item.in_stock_number,
      [i18next.t('入库数（基本单位）')]: item.quantity + item.unit_name,
      [i18next.t('调整前单价')]:
        item.old_price + Price.getUnit() + '/' + item.unit_name,
      [i18next.t('调整后单价')]:
        item.new_price + Price.getUnit() + '/' + item.unit_name,
      [i18next.t('调整差异')]:
        parseFloat(
          Big(item.new_price || 0)
            .minus(item.old_price || 0)
            .toFixed(2),
        ) +
        Price.getUnit() +
        '/' +
        item.unit_name,
    }
  })
}

// 出库调整单明细导出数据
const getOutStockAdjustExportData = (data, stockMethod) => {
  const { submit_time, adjust_sheet_no, creator, sheet_no, details } = data
  return _.map(details, (item) => {
    const result = {
      [i18next.t('建单时间')]: submit_time,
      [i18next.t('出库调整单号')]: sheet_no,
      [i18next.t('关联入库调整单号')]: adjust_sheet_no,
      [i18next.t('建单人')]: creator,
      [i18next.t('出库商品ID')]: item.spu_id,
      [i18next.t('销售规格ID')]: item.sku_id,
      [i18next.t('商品名称')]: item.name,
      [i18next.t('规格')]: item.ratio + item.std_unit + '/' + item.sale_unit,
      [i18next.t('商品分类')]: item?.category_1_name || item?.category_2_name,
      [i18next.t('出库数（销售单位）')]: item.sale_quantity + item.sale_unit,
      [i18next.t('出库批次号')]: item.batch_number,
      [i18next.t('关联出库单号')]: item.order_id,
      [i18next.t('出库数（基本单位）')]: item.unit_quantity + item.std_unit,
      [i18next.t('调整前单价')]:
        item.old_price + Price.getUnit() + '/' + item.std_unit,
      [i18next.t('调整后单价')]:
        item.new_price + Price.getUnit() + '/' + item.std_unit,
      [i18next.t('调整差异')]:
        parseFloat(
          Big(item.new_price || 0)
            .minus(item.old_price || 0)
            .toFixed(2),
        ) +
        Price.getUnit() +
        '/' +
        item.std_unit,
    }
    if (+stockMethod === 1) {
      delete result[i18next.t('出库批次号')]
    }

    return result
  })
}

export {
  headerLeft,
  headerRight,
  getInStockAdjustExportData,
  getOutStockAdjustExportData,
}
