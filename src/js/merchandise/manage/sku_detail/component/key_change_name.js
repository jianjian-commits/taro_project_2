import _ from 'lodash'
import Big from 'big.js'
import skuStore from '../sku_store'
import spuStore from '../spu_store'
import merchandiseStore from '../../store'

const toNameModel = [
  {
    value: 'sku_name',
    text: '规格名称',
    type: 0,
  },
  {
    value: 'sale_unit_name',
    text: '销售单位',
    type: 0,
  },
  {
    value: 'std_unit_name_forsale',
    text: '销售计量单位',
    type: 0,
  },
  {
    value: 'std_sale_price_forsale',
    text: '单价(销售单位)',
    type: 0,
  },
  {
    value: 'sale_price',
    text: '单价(基本单位)',
    type: 0,
  },
  {
    value: 'sale_num_least',
    text: '最小下单数',
    type: 0,
  },
  {
    value: 'is_weigh',
    text: '是否称重',
    type: 1,
  },
  {
    value: 'state',
    text: '是否上架',
    type: 1,
  },
  {
    value: 'is_price_timing',
    text: '是否时价',
    type: 1,
  },
  {
    value: 'desc',
    text: '描述',
    type: 0,
  },
  {
    value: 'outer_id',
    text: '自定义编码',
    type: 0,
  },
  {
    value: 'supplier_id',
    text: '默认供应商',
    type: 7,
  },
  {
    value: 'purchase_spec_id',
    text: '采购规格',
    type: 9,
  },
  {
    value: 'attrition_rate',
    text: '损耗比例',
    type: 0,
  },
  {
    value: 'stock_type',
    text: '库存设置',
    type: 2,
  },
  {
    value: 'roundType',
    text: '选择取整方式',
    type: 3,
  },
  {
    value: 'isRound',
    text: '下单取整',
    type: 1,
  },
  {
    value: 'sale_ratio',
    text: '销售规格',
    type: 6,
  },
  {
    value: 'box_type',
    text: '装箱类型',
    type: 4,
  },
  {
    value: 'stocks',
    text: '库存数量',
    type: 5,
  },
  {
    value: 'turnover_bind_type',
    text: '换算方式',
    type: 8,
  },
  {
    value: 'image_list',
    text: '商品图片',
    type: 10,
  },
  // 周转物
  {
    value: 'turnover_ratio',
    text: '周转物数量',
    type: 0,
  },
  {
    value: 'tid',
    text: '周转物',
    type: 100,
  },
  {
    value: 'clean_food',
    text: '开启加工',
    type: 1,
  },
  {
    value: 'clean_food_info',
    text: '净菜相关',
    type: 200,
  },
  {
    value: 'is_step_price',
    text: '定价规则',
    type: 15,
  },
]

const eunum = [
  {
    text: '保质期',
    value: 'shelf_life',
  },
  {
    text: '建议使用方法',
    value: 'recommended_method',
  },
  {
    text: '切配规格',
    value: 'cut_specification',
  },
  {
    text: '产品执行标准',
    value: 'product_performance_standards',
  },
  {
    text: '产地',
    value: 'origin_place',
  },
  {
    text: '原料说明',
    value: 'material_description',
  },
  {
    text: '贮存条件',
    value: 'storage_condition',
  },
  {
    text: '许可证',
    value: 'license',
  },
  {
    text: '营养成分表',
    value: 'nutrition_status',
  },
]
// 供应商
const findSup = (spuSupplierList, beforeValue, afterValue, findModel) => {
  _.forEach(spuSupplierList, (value, key) => {
    const findBefore = _.find(value.children, { value: beforeValue })
    const findAfter = _.find(value.children, { value: afterValue })
    if (findBefore?.text) {
      findModel.before = findBefore.text
    }
    if (findAfter?.text) {
      findModel.after = findAfter.text
    }
  })
  return findModel
}
// 规格
const findSpec = (spuSupplierList, beforeValue, afterValue, findModel) => {
  const findBefore = _.find(spuSupplierList, { id: beforeValue })
  let findAfter
  if (afterValue === -1) {
    const {
      purchaseSpecInfo: { purchaseSpec, ratio, std_unit_name, unit_name },
    } = skuStore
    const {
      spuDetail: { name },
    } = spuStore
    const newRatio = +purchaseSpec === 1 ? 1 : ratio
    const new_unit_name = +purchaseSpec === 1 ? std_unit_name : unit_name
    findAfter = name + '|' + newRatio + std_unit_name + '/' + new_unit_name
  } else {
    findAfter = _.find(spuSupplierList, { id: afterValue })?.name
  }

  findModel.before = findBefore?.name
  findModel.after = findAfter
  return findModel
}
// 库存
const findStock = (
  beforeValue,
  afterValue,
  beforeDetail,
  skuDetail,
  findModel,
) => {
  if (beforeValue === 1) {
    findModel.before = '不设置库存'
  } else if (beforeValue === 2) {
    findModel.before = `设置库存${beforeDetail.stocks}`
  } else {
    findModel.before = '限制库存'
  }

  if (afterValue === 1) {
    findModel.after = '不设置库存'
  } else if (afterValue === 2) {
    findModel.after = `设置库存${skuDetail.stocks}`
  } else {
    findModel.after = '限制库存'
  }

  return findModel
}
// 净菜
const cleanFood = (beforeValue, afterValue, findModel) => {
  const allLists = []
  const passCraft = [
    'unit_process_cost',
    'process_label_id',
    'process_label_id',
  ]
  _.forIn(beforeValue, (value, keyBefore) => {
    const ifPass = _.find(passCraft, (o) => o === keyBefore)
    if (ifPass) {
      return false
    }
    if (value !== afterValue[keyBefore] && keyBefore !== 'nutrition_info') {
      const keyNfieldNameame = _.find(eunum, { value: keyBefore })?.text
      const modal = {
        fieldName: keyNfieldNameame,
        before: '',
        after: '',
      }
      if (keyBefore === 'nutrition_status') {
        modal.before = value ? '开启' : '关闭'
        modal.after = afterValue[keyBefore] ? '开启' : '关闭'
      } else {
        modal.before = value
        modal.after = value = afterValue[keyBefore]
      }
      allLists.push(modal)
    }
    // 营养成分表
    if (keyBefore === 'nutrition_info') {
      if (afterValue.nutrition_status) {
        _.forEach(afterValue.nutrition_info, (v) => {
          const modal = {
            fieldName: v.name,
            before: '',
            after: '',
          }
          const beforeNut = _.find(value, { name: v.name })
          if (!beforeNut) {
            modal.before = '-'
            modal.after = `每100g ${v.per_100g || ''}${v.unit}，营养百分比是${
              v.NRV || ''
            }`
            allLists.push(modal)
          }
          // 新增
        })
        _.forEach(value, (v) => {
          const modal = {
            fieldName: v.name,
            before: '',
            after: '',
          }
          const afterNut = _.find(afterValue.nutrition_info, { name: v.name })

          if (!afterNut) {
            modal.before = `每100g ${v.per_100g || ''}${v.unit}，营养百分比是${
              v.NRV || ''
            }`
            modal.after = '-'
            allLists.push(modal)
          }
          // 删除
          else if (
            afterNut &&
            (afterNut.NRV !== v.NRV || afterNut.per_100g !== v.NRV)
          ) {
            modal.before = `每100g ${v.per_100g || ''}${v.unit}，营养百分比是${
              v.NRV || ''
            }`
            modal.after = `每100g ${afterNut.per_100g || ''}${
              afterNut.unit
            }，营养百分比是${afterNut.NRV || ''}`
            allLists.push(modal)
          }
        })
      }
      // 关闭不显示
    }
  })

  return {
    allLists: allLists,
    fieldName: findModel.fieldName,
  }
}
// 周转物
const findTurn = (turnOverList, beforeValue, afterValue, findModel) => {
  const findBefore = _.find(turnOverList, (m) => m.value === beforeValue)
  const findAfter = _.find(turnOverList, (m) => m.value === afterValue)
  return {
    before: findBefore?.text || '',
    after: findAfter.text,
    fieldName: findModel.fieldName,
  }
}

const keyToNameModel = (key, beforeValue, afterValue, passArry) => {
  const findPass = _.find(passArry, (o) => o === key)
  if (findPass) {
    return false
  }
  const { spuSupplierList } = merchandiseStore
  const {
    purchaseSpecList,
    beforeSkuList,
    activeIndex,
    skuDetail,
    turnOverList,
  } = skuStore
  let findModel = {
    fieldName: '',
    before: '',
    after: '',
    allLists: [],
  }
  const {
    std_unit_name_forsale: now_std_unit_name_forsale,
    sale_unit_name: now_sale_unit_name,
  } = beforeSkuList[activeIndex]
  const {
    std_unit_name_forsale: sku_std_unit_name_forsale,
    sale_unit_name: sku_sale_unit_name,
  } = skuDetail

  _.forIn(toNameModel, (v) => {
    if (v.value === key) {
      findModel.fieldName = v.text
      switch (v.type) {
        case 0:
          if (key === 'std_sale_price_forsale' || key === 'sale_price') {
            beforeValue = Big(beforeValue).toFixed(2)
            afterValue = Big(afterValue).toFixed(2)
          }
          findModel.before = beforeValue
          findModel.after = afterValue
          break
        case 1:
          findModel.before = beforeValue ? '开启' : '关闭'
          findModel.after = afterValue ? '开启' : '关闭'
          break
        case 2:
          findStock(
            beforeValue,
            afterValue,
            beforeSkuList[activeIndex],
            skuDetail,
            findModel,
          )
          break
        case 3:
          findModel.before = beforeValue === 2 ? '向下取整' : '向上取整'
          findModel.after = afterValue === 2 ? '向下取整' : '向上取整'
          break
        case 4:
          findModel.before = beforeValue ? '整装' : '散装'
          findModel.after = afterValue ? '整装' : '散装'
          break
        case 5:
          findModel.before = beforeValue === -99999 ? '' : beforeValue
          findModel.after = afterValue === -99999 ? '' : afterValue
          break
        case 6:
          findModel.before =
            beforeValue === 1
              ? `按${now_std_unit_name_forsale}`
              : `${
                  beforeValue +
                  now_std_unit_name_forsale +
                  '/' +
                  now_sale_unit_name
                }`

          findModel.after =
            afterValue === 1
              ? `按${sku_std_unit_name_forsale}`
              : `${
                  afterValue +
                  sku_std_unit_name_forsale +
                  '/' +
                  sku_sale_unit_name
                }`
          break
        case 7:
          findSup(spuSupplierList, beforeValue, afterValue, findModel)
          break
        case 8:
          findModel.before = beforeValue === 1 ? '取固定值' : '按下单设置'
          findModel.after = afterValue === 1 ? '取固定值' : '按下单设置'
          break
        // 采购规格
        case 9:
          findSpec(purchaseSpecList, beforeValue, afterValue, findModel)
          break
        // 图片逻辑
        case 10:
          _.forEach(afterValue, (value, index) => {
            const imgFind = _.find(beforeValue, { id: value.id })
            if (!imgFind) {
              findModel.before = beforeValue
              findModel.after = afterValue
              findModel.imgChange = true
            } else {
              findModel.imgChange = false
            }
          })
          break
        case 15:
          findModel.before = beforeValue ? '阶梯定价' : '常规定价'
          findModel.after = afterValue ? '阶梯定价' : '常规定价'
          break
        case 100:
          findModel = findTurn(turnOverList, beforeValue, afterValue, findModel)
          break
        case 200:
          findModel = cleanFood(beforeValue, afterValue, findModel)
          break
      }
      return false
    }
    // 防止没初始化的字段加入
    else {
      findModel.fieldName = key
      findModel.before = beforeValue
      findModel.after = afterValue
    }
  })

  return findModel
}

export { keyToNameModel }
