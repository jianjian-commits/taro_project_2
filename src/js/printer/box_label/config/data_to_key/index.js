import moment from 'moment'
import _ from 'lodash'
import { MULTI_SUFFIX } from 'gm-printer'

const getTableData = (data) => {
  return _.map(data.details, (item) => {
    return {
      商品名: item.sku_name,
      下单数_销售单位_基本单位: `${item.quantity}${item.sale_unit_name}(${item.std_quantity}${item.std_unit_name})`,
      下单数_销售单位: `${item.quantity}${item.sale_unit_name}`,
      实称数: `${item.weighting_quantity}${item.std_unit_name}`,
      商品备注: item.remark,
      实称数_销售单位: `${item.sale_unit_weighting_quantity ?? ''}${
        item.sale_unit_name
      }`,
    }
  })
}

const getTableDataMuti = (list) => {
  const mutiList = []
  const skuGroup = list

  let index = 0
  const len = skuGroup.length

  while (index < len) {
    const sku1 = skuGroup[index]
    const sku2 = {}
    _.each(skuGroup[1 + index], (val, key) => {
      sku2[key + MULTI_SUFFIX] = val
    })

    mutiList.push({
      ...sku1,
      ...sku2,
    })

    index += 2
  }

  return mutiList
}

const formatData = (data) => {
  const common = {
    barcode: data.box_code,
    箱号: data.box_no,
    商品数: data.details.length,
    客服电话: data.phone,
    打印时间: moment(data.print_time).format('YYYY-MM-DD'),
    商户名: data.address_name,
    自定义编码: data.res_custom_code,
    收货时间: data.receive_time,
    收货人: data.name,
    收货电话: data.phone,
    订单号: data.order_id,
    分拣序号: data.sort_id,
  }

  // 单栏
  const ordinary = getTableData(data)
  // 双栏
  const ordinary_multi = getTableDataMuti(ordinary)

  return {
    common,
    _table: {
      ordinary,
      ordinary_multi,
    },
    _origin: data,
  }
}

export default formatData
