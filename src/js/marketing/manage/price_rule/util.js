import { i18next } from 'gm-i18n'
import _ from 'lodash'
import Big from 'big.js'

export const REACT_TABLE_ROW = '__REACT_TABLE_ROW_'
export const EDITING_INPUT = '__EDITING_INPUT_'

// 闪烁 和 滚动到当前行
const tableTrFocus = (index) => {
  let dom
  setTimeout(() => {
    dom = document.getElementById(`${REACT_TABLE_ROW}${index}`)
    if (dom) {
      dom.classList.add('b-table-tr-twinkle')
      dom.scrollIntoViewIfNeeded()
    }
  }, 0)

  setTimeout(() => {
    dom && dom.classList.remove('b-table-tr-twinkle')
  }, 1300)
}

// input获取焦点
const inputFocus = (id) => {
  let dom
  setTimeout(() => {
    dom = document.getElementById(`${EDITING_INPUT}${id}`)
    if (dom) {
      dom.classList.add('b-table-tr-twinkle')
      dom.scrollIntoViewIfNeeded()
      dom.focus()
    }
  }, 0)

  setTimeout(() => {
    dom && dom.classList.remove('b-table-tr-twinkle')
  }, 1300)
}

const rule_type_name_map = {
  fixed_value: i18next.t('固定价格'),
  variation: i18next.t('价格变数'),
  multiple: i18next.t('倍数'),
}

// 检查是否输入多列
const getMutltiColumnName = (sku, column) => {
  const ruleObj = _.pickBy(sku.price_rule, (value) => value !== '')
  const columns = _.map(ruleObj, (value, key) => {
    return rule_type_name_map[key]
  })

  if (columns.length > 1 && _.has(ruleObj, column)) {
    return i18next.t('KEY140', {
      VAR1: columns.join('、'),
    }) /* src:`${columns.join('、')}只能输入其中一列` => tpl:${VAR1}只能输入其中一列 */
  }
}

const transformSkuSelectedList = (
  list,
  price_rule,
  refPriceTypeFlag,
  currentList
) => {
  const arr = []
  _.forEach(list, (v) => {
    const {
      sku_id,
      sku_name,
      outer_id,
      sale_ratio,
      std_unit_name_forsale,
      sale_unit_name,
      sale_price,
      state,
    } = v
    const isExist = _.find(currentList, (l) => {
      return l.id === v.sku_id
    })
    if (!isExist) {
      arr.push({
        value: sku_id,
        text: sku_name,
        id: sku_id,
        name: sku_name,
        check_data: {
          in_salemenu: 1,
          status: 1,
        },
        outer_id,
        chengben: v[refPriceTypeFlag]
          ? Big(v[refPriceTypeFlag]).div(100).toFixed(2)
          : '-',
        guige: sale_ratio + std_unit_name_forsale + '/' + sale_unit_name,
        price_rule,
        sale_price: Big(sale_price).div(100).toFixed(2),
        sale_unit_name,
        std_unit_name_forsale,
        sku_cost: '-1',
        state,
        yuanjia: Big(sale_price).div(100).toFixed(2),
      })
    }
  })
  return arr
}

export {
  getMutltiColumnName,
  inputFocus,
  tableTrFocus,
  transformSkuSelectedList,
}
