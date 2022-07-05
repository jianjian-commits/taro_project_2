import _ from 'lodash'
import React from 'react'
import Big from 'big.js'
import { getShelfSelected } from '../../common/util'
import { Dialog, Flex } from '@gmfe/react'
import { t } from 'gm-i18n'
import moment from 'moment'

// 补起批次号5位0
function fillBatchNum(num) {
  return (new Array(5).join(0) + num).slice(-5)
}

/**
 * 判断商品是不是在分摊列表内
 * @param {array} share 分摊字段
 * @param {string} id 商品id
 * @return {boolean}
 */
const isInShare = (share, id) => {
  if (share.length > 0) {
    if (_.includes(share[0].in_sku_logs, id)) {
      return true
    }
  }
  return false
}

// 值可以为0
const isValid = (val) => val !== undefined && val !== null && _.trim(val) !== ''

// sku列表数据适配
const getSkuAdapter = (sku) => {
  return {
    category_id_1: sku.category_id_1,
    category_name_1: sku.category_id_1_name,
    category_name_2: sku.category_id_2_name,
    category_id_2: sku.category_id_2,
    name: `${sku.sku_name}（${sku.sale_ratio}${sku.std_unit_name}/${sku.sale_unit_name}）`, // 展示的name 也就是displayName
    sku_name: sku.sku_name, // 保存到后台的name
    value: sku.sku_id,
    category: sku.category_id_2_name,
    unit_price: sku.sale_price,
    std_unit: sku.std_unit_name,
    purchase_unit: sku.sale_unit_name,
    ratio: sku.sale_ratio,
    spu_id: sku.spu_id,
    max_stock_unit_price: sku.max_stock_unit_price,
    shelf_id: sku.shelf_id,
    shelf_name: sku.shelf_name,
    default_shelf_id: sku.default_shelf_id,
    default_shelf_name: sku.default_shelf_name,
    tax_rate: sku.tax_rate,
    sku_active_count: sku.sku_active_count,
    sku_p_type: sku.p_type,
  }
}

/**
 * 将后台的sku数据处理成moreselect的显示数据
 * @param {object:{target_supplier: {}, other_supplier: {}}} data 待处理的sku数据
 */
const formatSkuList = (data) => {
  const list = []
  _.times(2, (index) => {
    const currentData = index === 0 ? data.target_supplier : data.other_supplier

    _.each(currentData, (spu) => {
      list.push({
        label: (
          <div>
            {spu.category_name}
            <span
              style={{
                border: '1px solid #798294',
                borderRadius: '2px',
                display: 'inline-block',
                marginLeft: '5px',
                padding: '2px',
              }}
            >
              {index === 0 ? t('当前供应商') : t('其他供应商')}
            </span>
          </div>
        ),
        children: _.map(spu.skus, (sku) => {
          const skuData = getSkuAdapter(sku, spu.in_sales)
          skuData.tax_rate = spu.tax_rate
          // 通过spu标识其中全部sku的在售状态---1：在售，0：暂无在售
          skuData.in_sales = spu.in_sales
          // levelSelect需要text字段
          skuData.text = sku.name
          return skuData
        }),
      })
    })
  })

  return list
}

/**
 * 处理获取的入库数据
 * @param data 入库数据
 * @param spreadOutShelfData 打平的货位数据
 * @return []
 */

const getStockInDetailListAdapter = (data, spreadOutShelfData) => {
  return _.map(data, (item) => {
    const {
      quantity,
      ratio,
      money,
      name,
      std_unit,
      purchase_unit,
      different_price,
      shelf_id,
      production_time,
      life_time,
    } = item
    // 入库(包装单位)    注:包装单位 = 采购单位 = 销售单位
    const purchase_unit_quantity = Big(quantity).div(ratio) // 这个作为一个中间变量
    const displayName = name + `（${ratio}${std_unit}/${purchase_unit}）`

    return {
      ...item,
      shelfSelected: getShelfSelected(spreadOutShelfData, shelf_id),
      displayName,
      different_price: Big(different_price).toFixed(2),
      purchase_unit_quantity: purchase_unit_quantity.toFixed(4),
      purchase_unit_price: !purchase_unit_quantity.eq(0)
        ? Big(money || 0)
            .div(purchase_unit_quantity)
            .toFixed(2)
        : 0,
      // 保质期 = 到期日 - 生产日期
      shelfLife:
        life_time && production_time
          ? moment(life_time).diff(production_time, 'day')
          : null,
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
    title: t('确认任务状态'),
    OKBtn: t('完成'),
    onOK: () => {
      window.closeWindow()
    },
  })
}

const referenceCosts = [
  { text: '最高入库单价', value: 1, key: 'max_stock_unit_price' },
  { text: '供应商最近询价', value: 2, key: 'last_quote_price' },
  { text: '供应商最近采购价', value: 3, key: 'last_purchase_price' },
  { text: '供应商最近入库价', value: 4, key: 'last_in_stock_price' },
  { text: '最近采购价', value: 8, key: 'latest_purchase_price' },
  { text: '最近询价', value: 5, key: 'latest_quote_price' },
  { text: '最近入库价', value: 6, key: 'latest_in_stock_price' },
  { text: '库存均价', value: 7, key: 'stock_avg_price' },
  { text: '供应商周期报价', value: 9, key: 'supplier_cycle_quote' },
]

const stockInDefaultPriceKey = {
  0: '',
  1: 'last_quote_price',
  3: 'last_in_stock_price',
  5: 'latest_quote_price',
  6: 'latest_in_stock_price',
  9: 'supplier_cycle_quote',
}

const STOCK_IN_SEARCH_TYPE = [
  { text: t('入库单搜索'), value: 1 },
  { text: t('建单人搜索'), value: 2 },
]

function inStockTimeTypeAdapter(inStockTimeTypeMap) {
  return _.map(Object.entries(inStockTimeTypeMap), (item) => {
    return {
      type: +item[0],
      name: item[1],
    }
  })
}

export {
  fillBatchNum,
  isInShare,
  isValid,
  getSkuAdapter,
  formatSkuList,
  getStockInDetailListAdapter,
  closeWindowDialog,
  referenceCosts,
  stockInDefaultPriceKey,
  inStockTimeTypeAdapter,
  STOCK_IN_SEARCH_TYPE,
}
