import _ from 'lodash'
import { pinYinFilter } from '@gm-common/tool'
import { getNavConfig } from '../../navigation'
import { t } from 'gm-i18n'

// 手动维护一份
const helpPathMap = {
  rh9gi9: 'update',
  ho43ou: 'station',
  srtlkz: 'manage',
  hkr1kt: 'faq',
}

let _cache
function getNavLeaf() {
  if (!_cache) {
    const result = []
    const config = getNavConfig()

    _.each(config, (one) => {
      _.each(one.sub, (two) => {
        _.each(two.sub, (three) => {
          result.push({
            value: three.link,
            text: three.name,
          })
        })
      })
    })
    _cache = result
  }

  return _cache
}

function filterNavLeaf(query) {
  return pinYinFilter(getNavLeaf(), query, (v) => v.text)
}

async function fetchHelp(query) {
  const res = await window.fetch(
    'https://station.guanmai.cn/gm_help/search?q=' + query,
    {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      mode: 'cors',
    },
  )

  if (res.ok) {
    const json = await res.json()

    const checkData = _.filter(
      json.data,
      (item) => helpPathMap[item.target.book.slug],
    )

    const data = _.map(checkData, (v) => {
      return {
        value: `https://station.guanmai.cn/gm_help/${
          helpPathMap[v.target.book.slug]
        }/${v.target.book.slug}/${v.target.slug}`,
        text: v.title,
        summary: v.summary,
      }
    })

    return data
  } else {
    return []
  }
}

// 订单 PLxxx LKxxx
// 采购单 Txxx-CGD-xxxx-xx-xx-xxxxx
// 采购入库单（进货单） Txxx-JHD-xxxx-xx-xx-xxxxx
// 入库调整单 Txxx-RKTZD-xxxx-xx-xx-xxxxx
// 出库调整单 Txxx-CKTZD-xxxx-xx-xx-xxxxx
// 采购退货单 Txxx-JHTHD-xxxx-xx-xx-xxxxx
// 移库单 Txxx-CNYK-xxxx-xx-xx-xxxxx
// 供应商结款单 Txxx-FKD-xxxx-xx-xx-xxxxx
function getRuleNumber(id) {
  if (
    (id.startsWith('PL') ||
      id.startsWith('LK') ||
      // 最小前4位，最大前6位为大写字母，接下来的一位判断是为PL单还是LK单，a，b为PL，c,d为LK
      /^[A-Y]{4,6}[abcd]/.test(id)) &&
    id.length > 2
  ) {
    return {
      value: `/order_manage/order/list/detail?id=${id}`,
      text: `${t('【搜索订单】')}${id}`,
    }
  } else if (id.includes('-CGD-')) {
    return {
      value: `/supply_chain/purchase/bills/detail?id=${id}`,
      text: `${t('【搜索采购单】')}${id}`,
    }
  } else if (id.includes('-JHD-')) {
    return {
      value: `/sales_invoicing/stock_in/product/detail?id=${id}`,
      text: `${t('【采购入库单】')}${id}`,
    }
  } else if (id.includes('-RKTZD-')) {
    return {
      value: `/sales_invoicing/stock_in/adjust_sheet/detail?sheet_no=${id}`,
      text: `${t('【入库调整单】')}${id}`,
    }
  } else if (id.includes('-CKTZD-')) {
    return {
      value: `/sales_invoicing/stock_out/adjust_record/detail?sheet_no=${id}`,
      text: `${t('【出库调整单】')}${id}`,
    }
  } else if (id.includes('-JHTHD-')) {
    return {
      value: `/sales_invoicing/stock_out/refund/detail/${id}`,
      text: `${t('【采购退货单】')}${id}`,
    }
  } else if (id.includes('-CNYK-')) {
    return {
      value: `/sales_invoicing/warehouse/transfer_inside_warehouse/inventory_transfer_list/transfer_receipt_detail?receiptNo=${id}`,
      text: `${t('【移库单】')}${id}`,
    }
  } else if (id.includes('-FKD-')) {
    return {
      value: `/sales_invoicing/finance/payment_review/${id}`,
      text: `${t('【供应商结款单】')}${id}`,
    }
  }

  return false
}

export { filterNavLeaf, fetchHelp, getRuleNumber }
