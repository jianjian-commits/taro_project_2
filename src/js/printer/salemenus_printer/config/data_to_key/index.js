import { t } from 'gm-i18n'
import _ from 'lodash'
import { MULTI_SUFFIX } from 'gm-printer'
import moment from 'moment'
import Big from 'big.js'
import { renderSkuSpec } from 'common/filter'
import { changeDomainName } from 'common/service'
import { Price } from '@gmfe/react'

const unit = Price.getUnit()
const getDate = (date) => moment(date).format('YYYY-MM-DD')
/**
 * 生成多栏数据
 * @param skuList 商品列表
 * @param n 一行多少栏
 * @returns {[]}
 */
function generateMultiData(skuList, n) {
  const multiList = []
  const len = skuList.length

  let index = 0

  while (index < len) {
    let row = {}
    for (let i = 1; i <= n; i++) {
      const skuIndex = i + index - 1
      if (i === 1) {
        row = { ...row, ...skuList[skuIndex] }
      } else if (i === 2) {
        _.each(skuList[skuIndex], (val, key) => {
          row[key + MULTI_SUFFIX] = val
        })
      } else {
        _.each(skuList[skuIndex], (val, key) => {
          row[key + MULTI_SUFFIX + i] = val
        })
      }
    }
    multiList.push(row)

    index += n
  }

  return multiList
}
/**
 * 多栏数据纵向排列
 * @param {[]} skuList  一节分类的数据
 * @param {n} n 一行多少栏
 * @returns {[]}
 */
function generateMultiDataVer(skuList, n) {
  const multiList = []
  const len = skuList.length
  let index = 0
  // 总行数 向上取整
  const rowLen = Math.ceil(len / n)

  while (index < rowLen) {
    let row = {}
    for (let i = 0; i < n; i++) {
      const skuIndex = index + rowLen * i
      if (i === 0) {
        row = { ...row, ...skuList[skuIndex] }
      } else if (i === 1) {
        _.each(skuList[skuIndex], (val, key) => {
          row[key + MULTI_SUFFIX] = val
        })
      } else {
        _.each(skuList[skuIndex], (val, key) => {
          row[key + MULTI_SUFFIX + (i + 1)] = val
        })
      }
    }
    multiList.push(row)
    index++
  }

  return multiList
}

// 非表格数据
function generateCommon(data) {
  const skuCount = _.reduce(
    data.sku_data,
    (count, list) => count + list.length,
    0,
  )

  return {
    当前时间: moment().format('YYYY-MM-DD HH:mm:ss'),
    当前时间_日期: moment().format('YYYY-MM-DD'),
    当前时间_时间: moment().format('HH:mm:ss'),
    商品数: skuCount,
    定价周期: data.price_start_time
      ? `${getDate(data.price_start_time)}~${getDate(data.price_end_time)}`
      : '-',
    订货电话: data.phone,
    规则生效时间: data?.effective_time
      ? moment(data.effective_time).format('YYYY-MM-DD HH:mm')
      : '-',
    logo: data.logo,
    商户名: data.sms_signature,
    qrcode: `${changeDomainName('station', 'bshop')}?cms_key=${
      data.address_url
    }`,
  }
}

const generateMultiTable = (tableData, colNumber) => {
  return tableData.reduce(
    (res, skuList) => [
      ...res,
      { _special: { text: skuList[0]['一级分类'] } },
      ...generateMultiData(skuList, colNumber),
    ],
    [],
  )
}

const generateMultiTableVer = (tableData, colNumber, sortType = 'lateral') => {
  return tableData.reduce(
    (res, skuList) => [
      ...res,
      { _special: { text: skuList[0]['一级分类'] } },
      ...generateMultiDataVer(skuList, colNumber, sortType),
    ],
    [],
  )
}

const tableDataToKey = (data) => {
  return _.map(data.sku_data, (list) => {
    return list.map((sku, index) => {
      return {
        序号: ++index,
        商品名称: sku.sku_name,
        规格: renderSkuSpec(sku),
        一级分类: sku.category_name_1,
        二级分类: sku.category_name_2,
        品类: sku.pinlei_name,
        销售价_基本单位: sku.is_price_timing
          ? t('时价')
          : Big(sku.sale_price).div(100).div(sku.sale_ratio).toFixed(2) +
            `${Price.getUnit(sku.fee_type)}/${sku.std_unit_name_forsale}`,
        销售价_销售单位: sku.is_price_timing
          ? t('时价')
          : Big(sku.sale_price).div(100).toFixed(2) +
            `${Price.getUnit(sku.fee_type)}/${sku.sale_unit_name}`,
        基本单位: sku.std_unit_name_forsale,
        销售单位: sku.sale_unit_name,
        描述: sku.desc,
        库存: parseFloat(Big(sku.stocks || 0).toFixed(2)),
        品牌: sku.brand || '-',
        区域: sku.origin_area || '-',
        产地: sku.origin_place || '',
        商品规格: sku.specification_desc || '-',
        商品特征: sku.feature_desc || '-',
        售后标准: sku.after_sale_desc || '-',
      }
    })
  })
}

const formatData = (data) => {
  const tableData = tableDataToKey(data)
  const result = {
    common: {
      ...generateCommon(data),
    },
    _table: {
      orders: generateMultiTable(tableData, 1),
      orders_multi: generateMultiTable(tableData, 2),
      orders_multi3: generateMultiTable(tableData, 3),
      orders_multi4: generateMultiTable(tableData, 4),
      orders_multi5: generateMultiTable(tableData, 5),
      orders_multi_vertical: generateMultiTableVer(tableData, 2),
      orders_multi3_vertical: generateMultiTableVer(tableData, 3),
      orders_multi4_vertical: generateMultiTableVer(tableData, 4),
      orders_multi5_vertical: generateMultiTableVer(tableData, 5),
    },
    _origin: data,
  }
  return result
}

export default formatData
