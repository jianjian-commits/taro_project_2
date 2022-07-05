import _ from 'lodash'
import moment from 'moment'
import Big from 'big.js'

function sku(data) {
  // const skuList = _.filter(data.sku_detail, o => o.sort_name === '#######')
  const skuListAfterSort = _.sortBy(data.sku_detail, [
    'category_1_id',
    'category_2_id',
  ])
  const skuGroup = _.groupBy(skuListAfterSort, 'category_1_name')

  /* --------- 分类商品统计 ---------------- */
  const counter = _.map(skuGroup, (o, k) => ({
    text: k,
    len: o.length,
    quantity: Big(_.sumBy(o, 'quantity')).toFixed(2),
  }))

  /* --------- 分类商品 -------------------- */
  function getDetail(sku) {
    const len = sku.customer_detail.length
    return _.map(sku.customer_detail, (customer, index) =>
      [
        `[${customer.sort_id || '-'}]${customer.customer_name}*`,
        customer.sku_amount,
        (index + 1) % 2 === 0
          ? '<br>'
          : len !== 1 && index !== len - 1
          ? '+'
          : '',
      ].join(''),
    ).join('')
  }

  let commanderSku = []
  _.forEach(skuGroup, (skuArr, categoryName) => {
    const skuList = _.map(skuArr, (sku) => ({
      商品名称: sku.sku_name || '-',
      分类: sku.category_2_name || '-',
      销售规格:
        sku.sale_ratio + sku.std_unit_name_forsale + '/' + sku.std_unit || '-',
      下单数: sku.quantity + sku.std_unit || '-',
      售后异常数: sku.abnormal
        ? sku.abnormal.amount_delta + sku.std_unit_name_forsale
        : '-',
      明细: getDetail(sku),
    }))
    // 每种分类的数量
    const groupLength = skuGroup[categoryName].length
    const categoryLen = {
      _special: {
        text: `${categoryName}: ${groupLength}`,
      },
    }

    commanderSku = commanderSku.concat(skuList, categoryLen)
  })

  const common = {
    社区店名称: data.community_name || '-',
    打印时间: moment().format('YYYY-MM-DD HH:mm:ss'),
    团长名称: data.name || '-',
    团长电话: data.phone || '-',
    团长地址: data.address || '-',
  }

  return {
    common,
    _counter: counter,
    _table: {
      commander_sku: commanderSku,
    },
    _origin: data,
  }
}

export default sku
