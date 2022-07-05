import { i18next } from 'gm-i18n'
import _ from 'lodash'

const nullSku = {
  sku_name: '',
  sale_ratio: 0,
  sku_price_unit: '',
  sku_sale_unit: '',
  type: 'skus',
}

const formatUnit = (sale_ratio, std_unit_name, sale_unit_name) => {
  if (sale_ratio === 0) {
    return ''
  }
  let unit = null
  if (std_unit_name === sale_unit_name && sale_ratio === 1) {
    unit = i18next.t('KEY6', { VAR1: std_unit_name })
  }
  const ratio = sale_ratio === 1 ? '' : sale_ratio
  unit = ratio + std_unit_name + '/' + sale_unit_name
  return unit
}

// 处理成一行三个数据
const handleGoods = (goods) => {
  let goodObj = {}
  const data = []
  let flag = 1
  _.each(goods, (good, index) => {
    const name = `good${flag}`
    goodObj[name] = good
    flag++
    if (flag === 4) {
      data.push(goodObj)
      goodObj = {}
      flag = 1
    }
  })
  goodObj.good1 && data.push(goodObj)
  return data
}

const getNullSkuTable = () => {
  // 打一页空白, 大概27行
  let num = 27
  const skus = []
  while (num > 0) {
    skus.push({
      商品名1: '',
      规格1: '',
      下单数1: '',
      商品名2: '',
      规格2: '',
      下单数2: '',
      商品名3: '',
      规格3: '',
      下单数3: '',
    })
    num--
  }
  return skus
}

const getTableData = (data) => {
  if (!data.skus.length && !data.combine_goods.length) {
    // 没有添加商品, 打印空白table
    const result = getNullSkuTable()
    return result
  }

  // type 区分普通sku和组合商品
  const skus =
    _.map(data.skus, (sku) => {
      sku.type = 'skus'
      return sku
    }) || []
  const combineGoods =
    _.map(data.combine_goods, (combine) => {
      combine.type = 'combines'
      return combine
    }) || []

  // 普通商品、组合商品可混合打印
  const printGoodsList = handleGoods(skus.concat(combineGoods))

  const result = _.map(printGoodsList, (sku) => {
    // 空白数据，不论是组合或普通商品，统一按普通商品数据格式
    const sku1 = sku.good1 || nullSku
    const sku2 = sku.good2 || nullSku
    const sku3 = sku.good3 || nullSku
    return {
      商品名1: sku1.type === 'skus' ? sku1.sku_name : sku1.name,
      规格1:
        sku1.type === 'skus'
          ? formatUnit(sku1.sale_ratio, sku1.sku_price_unit, sku1.sku_sale_unit)
          : sku1.sale_unit_name,
      下单数1: sku1.type === 'skus' ? sku1.sku_sale_unit : sku1.sale_unit_name,
      商品名2: sku2.type === 'skus' ? sku2.sku_name : sku2.name,
      规格2:
        sku2.type === 'skus'
          ? formatUnit(sku2.sale_ratio, sku2.sku_price_unit, sku2.sku_sale_unit)
          : sku2.sale_unit_name,
      下单数2: sku2.type === 'skus' ? sku2.sku_sale_unit : sku2.sale_unit_name,
      商品名3: sku3.type === 'skus' ? sku3.sku_name : sku3.name,
      规格3:
        sku3.type === 'skus'
          ? formatUnit(sku3.sale_ratio, sku3.sku_price_unit, sku3.sku_sale_unit)
          : sku3.sale_unit_name,
      下单数3: sku3.type === 'skus' ? sku3.sku_sale_unit : sku3.sale_unit_name,
    }
  })
  return result
}

const formatData = (data) => {
  return {
    common: {
      智能菜单名称: data.name,
      店铺名称: '',
      客服电话: '',
      商户: '',
      联系方式: '',
      备注信息: '',
    },
    _table: {
      menu: getTableData(data, 'menu'),
    },
    _origin: data,
  }
}

export default formatData
