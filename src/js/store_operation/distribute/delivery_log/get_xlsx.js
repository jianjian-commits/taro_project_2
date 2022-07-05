import _ from 'lodash'
import { i18next } from 'gm-i18n'
import globalStore from '../../../stores/global'

export const getXlsxJson = (json, type) => {
  const { orders, products } = json.data
  // 商品明细
  const spuList = _.map(products, (item) => {
    let salePriceOption = {}
    let serveTimeOption = {}
    let orderTimeOption = {}
    if (type === 2) {
      salePriceOption = {
        [i18next.t('单价')]: item.std_sale_price,
      }
      serveTimeOption = {
        [i18next.t('运营周期')]: item.cycle_time,
      }
    } else {
      salePriceOption = {
        [i18next.t('单价(基本单位)')]: item.std_sale_price,
        [i18next.t('单价(销售单位)')]: item.sale_price,
      }
      orderTimeOption = {
        [i18next.t('下单时间')]: item.order_time,
      }
    }
    // 华康定制加入以下三列
    let isHuaKangCustomize = {}
    if (globalStore.isHuaKang()) {
      isHuaKangCustomize = {
        [i18next.t('真实出库数(销售单位)')]: item.outstock_quantity,
        [i18next.t('自采数(销售单位)')]: item.self_pick_quantity,
        [i18next.t('自采金额')]: item.self_pick_money,
      }
    }
    return {
      [i18next.t('下单日期')]: item.date_time,
      ...orderTimeOption,
      [i18next.t('出库日期')]: item.distribute_time,
      [i18next.t('收货日期')]: item.receive_date,
      [i18next.t('运营配置名称')]: item.time_config_name,
      ...serveTimeOption,
      [i18next.t('订单号')]: item.order_id,
      [i18next.t('分拣序号')]: item.sort_id,
      [i18next.t('线路')]: item.route_name,
      [i18next.t('服务站点ID')]: item.station_id,
      [i18next.t('服务站点名称')]: item.station_name,
      [i18next.t('报价单ID')]: item.salemenu_id,
      [i18next.t('报价单名称')]: item.salemenu_name,
      [i18next.t('商户ID')]: item.sid,
      [i18next.t('商户名')]: item.resname,
      [i18next.t('一级分类ID')]: item.category1_id,
      [i18next.t('一级分类')]: item.category1_name,
      [i18next.t('二级分类ID')]: item.category2_id,
      [i18next.t('二级分类')]: item.category2_name,
      SPUID: item.spu_id,
      [i18next.t('商品ID(SKUID)')]: item.sku_id,
      [i18next.t('自定义编码')]: item.outer_id,
      [i18next.t('商品名')]: item.sku_name,
      [i18next.t('规格')]: item.sale_ratio,
      ...salePriceOption,
      ...isHuaKangCustomize,
      [i18next.t('参考成本')]: item.ref_price,
      [i18next.t('单位(基本单位)')]: item.unit_name,
      [i18next.t('下单数(销售单位)')]: item.quantity,
      [i18next.t('销售单位')]: item.sale_unit_name,
      [i18next.t('下单数(基本单位)')]: item.quantity_base_unit,
      [i18next.t('基本单位')]: item.std_unit_name,
      [i18next.t('出库数(基本单位)')]: item.real_std_count_forsale,
      [i18next.t('出库数(销售单位)')]: item.real_quantity,
      [i18next.t('异常数(基本单位)')]: item.abnormal_amount,
      [i18next.t('实退数(基本单位)')]: item.refund_amount,
      [i18next.t('下单金额(成交)')]: item.total_item_price,
      [i18next.t('出库金额')]: item.real_item_price,
      [i18next.t('异常金额')]: item.abnormal_money,
      [i18next.t('实退金额')]: item.refund_money,
      [i18next.t('销售额')]: item.sales,
      [i18next.t('商品备注')]: item.remark,
      [i18next.t('收货时间(时分)')]: item.receive_time_frame,
    }
  })

  // 订单明细
  const orderList = _.map(orders, (item) => {
    // 只判断权限
    const taxRateOption = globalStore.hasPermission('get_tax')
      ? {
          [i18next.t('销售额(不含税,运)')]: item.sale_money_without_tax,
          [i18next.t('订单税额')]: item.order_tax,
          [i18next.t('销售额(不含运费)')]: item.sales,
          [i18next.t('运费')]: item.freight,
          [i18next.t('销售额(含税,运)')]: item.total_pay,
        }
      : {
          [i18next.t('销售额(不含运费)')]: item.sales,
          [i18next.t('运费')]: item.freight,
          [i18next.t('销售额(含运费)')]: item.total_pay,
        }
    let serveTimeOption = {}
    let orderTimeOption = {}
    if (type === 2) {
      serveTimeOption = { [i18next.t('运营周期')]: item.cycle_time }
    } else {
      orderTimeOption = { [i18next.t('下单时间')]: item.order_time }
    }
    // 华康定制加入汇总金额
    let isHuaKangCustomize = {}
    if (globalStore.isHuaKang()) {
      isHuaKangCustomize = { [i18next.t('汇总金额')]: item.total_money }
    }

    return {
      [i18next.t('下单日期')]: item.date_time,
      ...orderTimeOption,
      [i18next.t('出库日期')]: item.distribute_time,
      [i18next.t('收货日期')]: item.receive_date,
      [i18next.t('运营配置名称')]: item.time_config_name,
      ...serveTimeOption,
      [i18next.t('订单号')]: item.id,
      [i18next.t('分拣序号')]: item.sort_id,
      [i18next.t('线路')]: item.route_name,
      [i18next.t('服务站点ID')]: item.station_id,
      [i18next.t('服务站点名称')]: item.station_name,
      [i18next.t('报价单ID')]: item.salemenu_ids,
      [i18next.t('报价单名称')]: item.salemenu_names,
      [i18next.t('商户ID')]: item.sid,
      [i18next.t('商户名')]: item.resname,
      [i18next.t('销售经理')]: item.sales_employee,
      [i18next.t('下单金额(成交)')]: item.total_price,
      [i18next.t('优惠金额')]: item.coupon_amount,
      [i18next.t('出库金额')]: item.real_price,
      [i18next.t('异常金额')]: item.abnormal_money,
      [i18next.t('退货金额')]: item.refund_money,
      ...isHuaKangCustomize,
      ...taxRateOption,
      [i18next.t('支付状态')]: item.pay_status,
      [i18next.t('打印状态')]: item.is_print,
      [i18next.t('配送司机')]: item.driver_name,
      [i18next.t('订单备注')]: item.remark,
      [i18next.t('收货时间')]: item.receipt_time,
      [i18next.t('一级地理标签')]: item.address_sign_name1,
      [i18next.t('二级地理标签')]: item.address_sign_name2,
      [i18next.t('收货地址')]: item.receipt_address,
      [i18next.t('收货时间(时分)')]: item.receive_time_frame,
      [i18next.t('收货人')]: item.receiver_name,
      [i18next.t('联系方式')]: item.receiver_phone,
    }
  })

  return [orderList, spuList]
}
