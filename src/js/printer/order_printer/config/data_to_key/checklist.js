import _ from 'lodash'
import Big from 'big.js'

function checklist(data) {
  // 按一级分类分组
  const groupByCategory1 = _.groupBy(data.details, (d) => d.category_title_1)
  let kCategoryList = []

  _.forEach(groupByCategory1, (value) => {
    kCategoryList = kCategoryList.concat(value)
  })

  // 过滤按订单投框
  const checklist = _.map(
    _.filter(kCategoryList, (c) => !c.union_dispatch),
    (sku, index) => {
      return {
        序号: index + 1,
        分类:
          `${sku.category_title_1}-${sku.category_title_2}-${sku.pinlei_title}` ||
          '-',
        商品ID: sku.id || '-',
        商品名: sku.name || '-',
        基本单位: sku.std_unit_name,
        规格:
          sku.std_unit_name === sku.sale_unit_name && sku.sale_ratio === 1
            ? `按${sku.sale_unit_name}`
            : `${sku.sale_ratio}${sku.std_unit_name}/${sku.sale_unit_name}`,
        下单数_基本单位: Big(sku.quantity || 0).times(sku.sale_ratio),
        实配数_基本单位: sku.real_weight,
      }
    },
  )

  const common = {
    订单号: data.id || '-',
    分拣序号: data.sort_id || '-',
    司机: data.driver_name || '-',
    商户名: data.resname || '-',
    线路: data.address_route_name || '-',
  }

  return {
    common,
    _table: {
      check_list: checklist,
    },
    _origin: data,
  }
}

export default checklist
