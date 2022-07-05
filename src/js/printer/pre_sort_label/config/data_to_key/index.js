import moment from 'moment'

const toKey = (data) => {
  return {
    SKU: data.sku_name,
    SKU_ID: data.sku_id,
    实称数_基本单位: `${data.quantity}${data.std_unit_name_forsale}`,
    商品描述: data.desc,

    规格: `${data.sale_ratio}${data.std_unit_name_forsale}/${data.unit_name}`,

    溯源码: data.food_security_code,
    商品码: data.package_id,
    自定义编码: data.outer_id,

    站点名: data.station_name,
    客服电话: data.phone,

    打包员账号: data.packer_id,
    打包员名称: data.packer_name,

    当前时间: moment().format('YYYY-MM-DD HH:mm:ss'),
    当前时间_时间: moment().format('HH:mm:ss'),
    当前时间_年月日: moment().format('YYYY-MM-DD'),
  }
}

export default toKey
