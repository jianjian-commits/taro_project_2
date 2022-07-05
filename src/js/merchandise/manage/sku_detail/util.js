import { t } from 'gm-i18n'
import _ from 'lodash'
import Big from 'big.js'
import { Price } from '@gmfe/react'
import { changeDomainName, System } from 'common/service'
import { keyToNameModel } from './component/key_change_name'

const formatPurchaseSpecList = (list, supplierSelected) => {
  return _.map(list, (v) => {
    const {
      id,
      name,
      purchase_unit_name,
      ratio,
      std_price,
      ref_price,
      std_unit_name,
    } = v
    const price = _.isNumber(ref_price)
      ? Big(ref_price).div(100).toFixed(2)
      : '-'
    if (supplierSelected && +supplierSelected.upstream === 1) {
      return {
        text:
          name +
          '|' +
          ratio +
          std_unit_name +
          '/' +
          purchase_unit_name +
          '|' +
          Big(std_price || 0)
            .div(100)
            .toFixed(2) +
          Price.getUnit() +
          '/' +
          std_unit_name,
        value: id,
        price,
        unit_name: std_unit_name,
      }
    }
    return { text: name, value: id, price, unit_name: std_unit_name }
  })
}

const formatIngredientSkuList = (ingredients, ingredientList, sku_id) => {
  const ingredientListFilter = []
  let ingredientSelected = {}
  // 获取列表中存在的物料id，后面用来过滤
  const ingredientIds = _.map(ingredients, (v) => v.id)
  _.each(ingredientList, (d) => {
    const filterIngredient = _.filter(d.children, (ingredient) => {
      if (sku_id === ingredient.id) {
        ingredientSelected = ingredient
      }
      return !_.includes(ingredientIds, ingredient.id)
    })
    filterIngredient.length > 0 &&
      ingredientListFilter.push({
        label: d.label,
        children: filterIngredient,
      })
  })

  return { ingredientListFilter, ingredientSelected }
}

const imgUrlToId = (images) => {
  return _.map(images, (img) => {
    const arr = img.split('/')
    return arr[arr.length - 1]
  })
}

const getImgId = (images) => {
  return _.map(images, (img) => {
    return img.id
  })
}

const boolToNum = (state) => {
  return state ? 1 : 0
}
const yuanToFen = (value) => {
  return Big(value).times(100).toString()
}

const getSalemenuSelected = (salemenuList, salemenu_id) => {
  const salemenuSelectedArr = []
  if (!salemenuList[0]) {
    return salemenuSelectedArr
  }
  // salemenuList没有读取到时返回[]
  else if (typeof salemenu_id === 'string') {
    salemenuSelectedArr.push(
      _.find(salemenuList, (v) => v.value === salemenu_id),
    )
  } else
    _.forEach(salemenu_id, (element) => {
      let arr
      if (element?.value) {
        arr = _.find(salemenuList, (v) => v.value === element.value)
      } else arr = _.find(salemenuList, (v) => v.value === element)
      arr && salemenuSelectedArr.push(arr)
    })
  return salemenuSelectedArr
}

const getSupplierSelected = (spuSupplierList, supplier_id) => {
  const allSupplier = [].concat.apply(
    [],
    spuSupplierList.map((item) => item.children),
  )

  return allSupplier.find((item) => item.value === supplier_id)
}

const getPsList = (purchaseSpecList, supplierSelected) => {
  const list = formatPurchaseSpecList(purchaseSpecList, supplierSelected)
  // 去掉供应商限制
  if (
    (supplierSelected && +supplierSelected.upstream === 0) ||
    !supplierSelected
  ) {
    list.push({ text: t('新建采购规格+'), value: -1 })
  }

  return list
}
const getPsSelected = (psList, purchase_spec_id) => {
  return _.find(psList, (v) => v.value === purchase_spec_id)
}

const createProductDetailUrl = (id, key, shopName) => {
  let name = 'station'
  if (System.isC()) {
    name = ''
  }
  return key
    ? `${changeDomainName(name, shopName)}?cms_key=${key}#/product/detail/${id}`
    : `${changeDomainName(name, shopName)}#/product/detail/${id}`
}

const refRatioTypes = {
  1: t('近7天出成率'),
  2: t('近15天出成率'),
  3: t('近30天出成率'),
}

const skuContrastList = (
  before,
  afterList,
  before_bind_turnover,
  after_bind_turnover,
) => {
  const arrylist = []
  if (afterList.tid && !before?.tid) {
    before = Object.assign(before, { tid: '' })
  }
  if (afterList.turnover_ratio && !before?.turnover_ratio) {
    before = Object.assign(before, { turnover_ratio: '' })
  }
  // 周转物
  if (before.sku_id && before.sku_id === afterList.sku_id) {
    _.forIn(before, (value, key) => {
      if (JSON.stringify(value) !== JSON.stringify(afterList[key])) {
        const keyToName = keyToNameModel(key, value, afterList[key], [
          'std_sale_price',
          'ingredients',
          'clean_food_info',
          'clean_food',
          'rounding',
          'is_already_clean_food',
          'remark_type',
          'bind_turnover',
          'partframe',
          'slitting',
        ])
        const { fieldName, before, after, allLists } = keyToName
        if (!fieldName) {
          return
        }
        if (fieldName === '净菜相关') {
          arrylist.push({
            fieldName,
            allLists,
          })
        } else if (key === 'step_price_table') {
          const beforeTable = (value || []).map((e) => {
            return {
              ...e,
              step_sale_price: Big(e.step_sale_price || 0)
                .div(100)
                .toFixed(2),
              step_std_price: Big(e.step_std_price || 0)
                .div(100)
                .toFixed(2),
            }
          })
          const afterTable = (afterList[key] || []).map((e) => {
            return {
              ...e,
              step_sale_price: Big(e.step_sale_price || 0).toFixed(2),
              step_std_price: Big(e.step_std_price || 0).toFixed(2),
            }
          })
          const len = Math.max(beforeTable.length, afterTable.length)
          const emptyData = {
            index: '',
            min: '',
            max: '',
            step_sale_price: '-',
            step_std_price: '-',
          }
          for (let i = 0; i < len; i++) {
            if (!beforeTable[i]) beforeTable.push(emptyData)
            else if (!afterTable[i]) afterTable.push(emptyData)
            const beforeData = beforeTable[i]
            const afterData = afterTable[i]
            if (beforeData.step_sale_price !== afterData.step_sale_price) {
              arrylist.push({
                fieldName: `单价（销售单位）${i + 1}`,
                before: beforeData.step_sale_price,
                after: afterData.step_sale_price,
              })
            }
            if (beforeData.step_std_price !== afterData.step_std_price) {
              arrylist.push({
                fieldName: `单价（基本单位）${i + 1}`,
                before: beforeData.step_std_price,
                after: afterData.step_std_price,
              })
            }
            const beforeInterval = `${beforeData.min}~${beforeData.max}`
            const afterInterval = `${afterData.min}~${afterData.max}`
            if (beforeInterval !== afterInterval) {
              arrylist.push({
                fieldName: `下单区间${i + 1}`,
                before: beforeInterval,
                after: afterInterval,
              })
            }
          }
        } else {
          arrylist.push({
            fieldName,
            before,
            after,
          })
        }
        // 图片
      } else if (key === 'image_list') {
        const keyToName = keyToNameModel(key, value, afterList[key])
        const { fieldName, before, after, imgChange } = keyToName
        if (imgChange) {
          arrylist.push({
            fieldName,
            before,
            after,
          })
        }
      }
      if (
        key === 'turnover_bind_type' &&
        before_bind_turnover !== after_bind_turnover
      ) {
        arrylist.unshift({
          fieldName: '周转物关联',
          before: !before_bind_turnover ? '关闭' : '开启',
          after: !after_bind_turnover ? '关闭' : '开启',
        })
      }
    })
  }
  // 防止新增的时候数据拿错

  const findClean = _.find(arrylist, { fieldName: '净菜相关' })
  _.forEach(findClean?.allLists, (v) => {
    const { fieldName, before, after } = v
    if (before !== after)
      arrylist.push({
        fieldName,
        before,
        after,
      })
  })
  _.remove(arrylist, { fieldName: '净菜相关' })
  // 将净菜提前出来
  return arrylist
}

/**
 * 获取第一个供应商，规则为，若有推荐供应商，则取第一个，若有其他供应商则取第一个，若都无，则null
 * @param {array} spuSupplierList 供应商列表
 */
const getFirstSupplier = (spuSupplierList) => {
  let supplierId = ''

  const recommend_supplier =
    spuSupplierList &&
    spuSupplierList[0] &&
    !_.isEmpty(spuSupplierList[0].children)
      ? spuSupplierList[0].children[0].value
      : null

  const other_supplier =
    spuSupplierList &&
    spuSupplierList[1] &&
    !_.isEmpty(spuSupplierList[1].children)
      ? spuSupplierList[1].children[0].value
      : null

  supplierId = recommend_supplier || other_supplier || null

  return supplierId
}

export {
  formatPurchaseSpecList,
  formatIngredientSkuList,
  imgUrlToId,
  getImgId,
  boolToNum,
  yuanToFen,
  getSalemenuSelected,
  getPsList,
  getSupplierSelected,
  getPsSelected,
  createProductDetailUrl,
  refRatioTypes,
  getFirstSupplier,
  skuContrastList,
}
