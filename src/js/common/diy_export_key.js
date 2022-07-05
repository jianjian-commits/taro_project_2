import { i18next } from 'gm-i18n'
import _ from 'lodash'
import globalStore from '../stores/global'
import { Storage } from '@gmfe/react'
import System from './system'

const hkOrderOption = globalStore.isHuaKang()
  ? {
      [i18next.t('验货金额')]: 'total_actual_price',
      [i18next.t('售后出库金额')]: 'total_after_sale_outstock_price',
      [i18next.t('自采金额')]: 'total_self_acquisition_price',
      [i18next.t('销售出库金额（总）')]: 'total_sale_outstock_price',
    }
  : null

const hkSkuInfoOption = globalStore.isHuaKang()
  ? {
      [i18next.t('验货数')]: 'actual_quantity',
      [i18next.t('售后出库数')]: 'after_sale_outstock_quantity',
      [i18next.t('自采数')]: 'self_acquisition_quantity',
      [i18next.t('销售出库数')]: 'sale_outstock_quantity',
    }
  : null

const hkSkuSaleOption = globalStore.isHuaKang()
  ? {
      [i18next.t('验货金额')]: 'actual_price',
      [i18next.t('售后出库金额')]: 'after_sale_outstock_price',
      [i18next.t('自采金额')]: 'self_acquisition_price',
      [i18next.t('销售出库金额')]: 'sale_outstock_price',
    }
  : null

const taxRateOption = globalStore.hasPermission('get_tax')
  ? {
      [i18next.t('销售额(不含税,运)')]: 'sale_money_without_tax',
      [i18next.t('订单税额')]: 'order_tax',
      [i18next.t('销售额(不含运费)')]: 'sales',
      [i18next.t('运费')]: 'freight',
      [i18next.t('销售额(含税,运)')]: 'total_pay',
    }
  : {
      [i18next.t('销售额(不含运费)')]: 'sales',
      [i18next.t('运费')]: 'freight',
      [i18next.t('销售额(含运费)')]: 'total_pay',
    }

const commanderOption = {
  [i18next.t('社区店名称')]: 'community_name',
  [i18next.t('团长姓名')]: 'distributor_name',
  [i18next.t('团长账户')]: 'distributor_username',
}

const boxTypeOption = globalStore.hasPermission('edit_box_type')
  ? {
      [i18next.t('装箱类型')]: { key: 'box_type' },
    }
  : {}

const saleExportKey = {
  [i18next.t('基础信息')]: {
    SPUID: { key: 'spu_id', diyEnable: false },
    SKUID: { key: 'sku_id', diyEnable: false },
    [i18next.t('商品名')]: { key: 'sku_name', diyEnable: false },
    [i18next.t('商品描述')]: 'sku_desc',
    [i18next.t('一级分类')]: { key: 'category_title_1' },
    [i18next.t('二级分类')]: { key: 'category_title_2' },
  },
  [i18next.t('规格信息')]: {
    [i18next.t('单价')]: 'excel_unit_price',
    [i18next.t('是否时价')]: { key: 'is_price_timing' },
    [i18next.t('基础单位')]: { key: 'std_unit_full' },
    [i18next.t('销售规格')]: { key: 'sale_ratio_full' },
    [i18next.t('损耗率')]: { key: 'attrition_rate' },
    [i18next.t('销售价')]: 'sale_price_full',
    [i18next.t('最小下单数')]: 'sale_num_least',
    [i18next.t('销售状态')]: 'state',
    [i18next.t('是否称重')]: { key: 'is_weigh' },
    [i18next.t('供应商编码')]: { key: 'custom_id' },
    [i18next.t('供应商')]: { key: 'supplier_name' },
    [i18next.t('参考价')]: 'sku_ref_price',
    [i18next.t('排序')]: 'sku_order',
    [i18next.t('自定义编码')]: 'outer_id',
    ...boxTypeOption,
    [i18next.t('设置库存类型')]: { key: 'stock_type' },
    [i18next.t('设置库存数')]: 'stocks',
    [i18next.t('区域')]: 'origin_area',
    [i18next.t('产地')]: 'origin_place',
    [i18next.t('品牌')]: 'brand',
    [i18next.t('商品规格')]: 'specification_desc',
    [i18next.t('商品特征')]: 'feature_desc',
    [i18next.t('售后标准')]: 'after_sale_desc',
    [i18next.t('定价方式')]: 'price_cal_type',
    [i18next.t('定价规则')]: 'is_step_price',
    [i18next.t('阶梯定价表')]: 'step_price_table',
  },
}

const merchandiseExportKey = {
  [i18next.t('基础信息')]: {
    ...saleExportKey[i18next.t('基础信息')],
  },
  [i18next.t('规格信息')]: {
    [i18next.t('单价')]: 'excel_unit_price',
    [i18next.t('是否时价')]: { key: 'is_price_timing' },
    [i18next.t('基础单位')]: { key: 'std_unit_full' },
    [i18next.t('销售规格')]: { key: 'sale_ratio_full' },
    [i18next.t('损耗率')]: { key: 'attrition_rate' },
    [i18next.t('销售价')]: 'sale_price_full',
    [i18next.t('最小下单数')]: 'sale_num_least',
    [i18next.t('销售状态')]: 'state',
    [i18next.t('是否称重')]: { key: 'is_weigh' },
    [i18next.t('供应商编码')]: { key: 'custom_id' },
    [i18next.t('供应商')]: { key: 'supplier_name' },
    [i18next.t('参考价')]: 'sku_ref_price',
    [i18next.t('排序')]: 'sku_order',
    [i18next.t('自定义编码')]: 'outer_id',
    [i18next.t('采购规格ID')]: 'purchase_spec_id',
    ...boxTypeOption,
    [i18next.t('报价单ID')]: { key: 'salemenu_id' },
    [i18next.t('报价单名称')]: { key: 'salemenu_name' },
    [i18next.t('设置库存类型')]: { key: 'stock_type' },
    [i18next.t('设置库存数')]: 'stocks',
    [i18next.t('区域')]: 'origin_area',
    [i18next.t('产地')]: 'origin_place',
    [i18next.t('品牌')]: 'brand',
    [i18next.t('商品规格')]: 'specification_desc',
    [i18next.t('商品特征')]: 'feature_desc',
    [i18next.t('售后标准')]: 'after_sale_desc',
    [i18next.t('定价方式')]: 'price_cal_type',
    [i18next.t('定价规则')]: 'is_step_price',
    [i18next.t('阶梯定价表')]: 'step_price_table',
  },
}

const orderExportKey = {
  [i18next.t('订单信息')]: {
    [i18next.t('下单日期')]: 'date_time',
    [i18next.t('下单时间')]: 'order_time',
    [i18next.t('出库日期')]: 'distribute_time',
    [i18next.t('收货日期')]: 'receive_date',
    [i18next.t('订单号')]: 'order_id',
    [i18next.t('分拣序号')]: 'sort_id',
    [i18next.t('线路')]: 'route_name',
    [i18next.t('订单状态')]: 'order_status',
    [i18next.t('订单来源')]: 'client_cn',
    [i18next.t('订单类型')]: 'order_process_name',
    [i18next.t('支付状态')]: 'pay_status',
    [i18next.t('打印状态')]: 'is_print',
    [i18next.t('配送司机')]: 'driver_name',
    [i18next.t('订单备注')]: 'remark',
    [i18next.t('收货时间')]: 'receipt_time',
    [i18next.t('收货方式')]: 'receive_way',
    [i18next.t('下单员')]: 'create_user',
    [i18next.t('自提点')]: 'pick_up_st_name',
    [i18next.t('收货地址')]: 'receipt_address',
    [i18next.t('收货时间(时分)')]: 'receive_time_frame',
    [i18next.t('收货人')]: 'receiver_name',
    [i18next.t('联系方式')]: 'receiver_phone',
    [i18next.t('包含赠品')]: 'has_present_sku',
  },
  [i18next.t('商户信息')]: {
    [i18next.t('商户ID')]: 'sid',
    [i18next.t('商户名')]: 'resname',
    [i18next.t('销售经理')]: 'sales_employee',
    [i18next.t('一级地理标签')]: 'address_sign_name1',
    [i18next.t('二级地理标签')]: 'address_sign_name2',
    [i18next.t('商户自定义编码')]: 'res_custom_code',
    [i18next.t('商户自定义字段1')]: 'tenant_custom_field_1',
    [i18next.t('商户自定义字段2')]: 'tenant_custom_field_2',
    [i18next.t('商户自定义字段3')]: 'tenant_custom_field_3',
  },
  [i18next.t('金额信息')]: {
    [i18next.t('下单金额(成交)')]: 'total_price',
    [i18next.t('优惠金额')]: 'coupon_amount',
    [i18next.t('出库金额')]: 'real_price',
    [i18next.t('异常金额')]: 'abnormal_money',
    [i18next.t('退货金额')]: 'refund_money',
    [i18next.t('货币类型')]: 'fee_name',
    ...hkOrderOption,
    ...taxRateOption,
  },
  [i18next.t('其他信息')]: {
    [i18next.t('运营配置名称')]: 'time_config_name',
    [i18next.t('运营周期')]: 'cycle_time',
    [i18next.t('服务站点ID')]: 'station_id',
    [i18next.t('服务站点名称')]: 'station_name',
    [i18next.t('报价单名称')]: 'salemenu_names',
    [i18next.t('报价单ID')]: 'salemenu_ids',
  },
}

const spuExportKey = {
  [i18next.t('订单信息')]: {
    [i18next.t('下单日期')]: 'date_time',
    [i18next.t('下单时间')]: 'order_time',
    [i18next.t('出库日期')]: 'distribute_time',
    [i18next.t('收货日期')]: 'receive_date',
    [i18next.t('订单号')]: 'order_id',
    [i18next.t('分拣序号')]: 'sort_id',
    [i18next.t('线路')]: 'route_name',
    [i18next.t('商户ID')]: 'sid',
    [i18next.t('商户名')]: 'resname',
    [i18next.t('收货时间(时分)')]: 'receive_time_frame',
    [i18next.t('商户自定义编码')]: 'res_custom_code',
    [i18next.t('订单备注')]: 'order_remark',
    [i18next.t('商户自定义字段1')]: 'tenant_custom_field_1',
    [i18next.t('商户自定义字段2')]: 'tenant_custom_field_2',
    [i18next.t('商户自定义字段3')]: 'tenant_custom_field_3',
  },
  [i18next.t('商品信息')]: {
    [i18next.t('一级分类ID')]: 'category_id_1',
    [i18next.t('一级分类')]: 'category1_name',
    [i18next.t('二级分类ID')]: 'category_id_2',
    [i18next.t('二级分类')]: 'category2_name',
    [i18next.t('报价单ID')]: 'salemenu_id',
    SPUID: 'spu_id',
    [i18next.t('商品ID(SKUID)')]: 'sku_id',
    [i18next.t('自定义编码')]: 'outer_id',
    [i18next.t('商品名')]: 'spu_name',
    [i18next.t('规格名')]: 'sku_name',
    [i18next.t('规格')]: 'sale_ratio',
    [i18next.t('品牌')]: 'brand',
    [i18next.t('区域')]: 'origin_area',
    [i18next.t('产地')]: 'origin_place',
    [i18next.t('描述')]: 'desc',
    [i18next.t('商品规格')]: 'specification_desc',
    [i18next.t('商品特征')]: 'feature_desc',
    [i18next.t('售后标准')]: 'after_sale_desc',
    [i18next.t('商品备注')]: 'remark',
    [i18next.t('报价单名称')]: 'salemenu_name',
    [i18next.t('单价(基本单位)')]: 'std_sale_price_forsale',
    [i18next.t('单价(销售单位)')]: 'sale_price',
    [i18next.t('参考成本')]: 'ref_price',
    [i18next.t('单位(基本单位)')]: 'unit_name',
    [i18next.t('下单数(销售单位)')]: 'quantity',
    [i18next.t('销售单位')]: 'sale_unit_name',
    [i18next.t('下单数(基本单位)')]: 'quantity_forsale',
    [i18next.t('基本单位')]: 'std_unit_name_forsale',
    [i18next.t('出库数(基本单位)')]: 'real_std_count_forsale',
    [i18next.t('出库数(销售单位)')]: 'real_quantity',
    [i18next.t('异常数(基本单位)')]: 'abnormal_amount',
    [i18next.t('实退数(基本单位)')]: 'refund_amount',
    [i18next.t('税率')]: 'sku_tax_rate',
    [i18next.t('税收分类编码')]: 'tax_id_for_bill',
    [i18next.t('包含赠品')]: 'has_present_sku',
    [i18next.t('商品类型')]: 'sku_type',
    [i18next.t('买赠商品的关联商品')]: 'refer_sku_id',

    [i18next.t('变化率')]: 'change_rate',
    [i18next.t('原单价（基本单位）')]: 'before_change_price',
    [i18next.t('原单价（销售单位）')]: 'before_change_price_forsale',
    [i18next.t('称重状态')]: 'is_weight',
    ...hkSkuInfoOption,
  },
  [i18next.t('金额信息')]: {
    [i18next.t('下单金额(成交)')]: 'total_item_price',
    [i18next.t('出库金额')]: 'real_item_price',
    [i18next.t('异常金额')]: 'abnormal_money',
    [i18next.t('实退金额')]: 'refund_money',
    [i18next.t('销售额')]: 'sales',
    [i18next.t('货币类型')]: 'fee_name',
    ...hkSkuSaleOption,
  },
  [i18next.t('其他信息')]: {
    [i18next.t('运营配置名称')]: 'time_config_name',
    [i18next.t('服务站点ID')]: 'station_id',
    [i18next.t('服务站点名称')]: 'station_name',
    [i18next.t('运营周期')]: 'cycle_time',
  },
}

const purchaseTaskExportKey = {
  [i18next.t('基础信息')]: {
    SPUID: 'spu_id',
    [i18next.t('采购规格id')]: 'spec_id',
    [i18next.t('商品名')]: 'spu_name',
    [i18next.t('采购规格名')]: 'spec_name',
    [i18next.t('一级类目')]: 'category_id_1',
    [i18next.t('二级类目')]: 'category_id_2',
    [i18next.t('采购规格')]: 'purchase_ratio',
    [i18next.t('采购单位')]: 'sale_unit_name',
    [i18next.t('基本单位')]: 'std_unit_name',
    [i18next.t('库存')]: 'stock',
    [i18next.t('参考价')]: 'ref_price',
  },
  [i18next.t('任务信息')]: {
    [i18next.t('总价')]: 'total_price',
    [i18next.t('供应商')]: 'supplier_name',
    [i18next.t('采购员')]: 'purchaser_name',
    [i18next.t('任务发布时间')]: 'release_time',
    [i18next.t('任务状态')]: 'status',
    [i18next.t('实采')]: 'real_purchase',
    [i18next.t('建议采购')]: 'suggest_purchase',
    [i18next.t('计划采购')]: 'plan_purchase',
    [i18next.t('采购描述')]: 'description',
  },
}

const purchaseTaskItemsExportKey = {
  [i18next.t('基础信息')]: {
    SPUID: 'spu_id',
    [i18next.t('商品名')]: 'spu_name',
    [i18next.t('采购规格名')]: 'spec_name',
    [i18next.t('一级类目')]: 'category_id_1',
    [i18next.t('二级类目')]: 'category_id_2',
    [i18next.t('采购规格')]: 'purchase_ratio',
    [i18next.t('采购单位')]: 'purchase_unit_name',
    [i18next.t('基本单位')]: 'std_unit_name',
    [i18next.t('销售规格')]: 'sale_ratio',
    [i18next.t('商品备注')]: 'remark',
    [i18next.t('销售SKU_ID')]: 'sku_id',
    [i18next.t('销售规格名称')]: 'sku_name',
    [i18next.t('商品描述')]: 'desc',
    [i18next.t('采购规格id')]: 'spec_id',
  },
  [i18next.t('任务信息')]: {
    [i18next.t('计划采购')]: 'plan_purchase',
    [i18next.t('采购员')]: 'purchaser_name',
    [i18next.t('供应商')]: 'supplier_name',
    [i18next.t('分拣序号')]: 'sort_id',
    [i18next.t('订单号')]: 'order_id',
    [i18next.t('线路')]: 'route_name',
    [i18next.t('商户名')]: 'res_name',
    [i18next.t('下单数')]: 'quantity',
    [i18next.t('商户自定义编码')]: 'res_custom_code',
    [i18next.t('采购描述')]: 'description',
  },
}

const userDefinedKey = {
  orderExportKey,
  spuExportKey,
  purchaseTaskExportKey,
  purchaseTaskItemsExportKey,
  saleExportKey,
  merchandiseExportKey,
}

// toc订单导出去除字段
const removedFieldOfCOrder = {
  order_export: [
    'route_name',
    'client_cn',
    'create_user',
    'sale_money_without_tax',
    'order_tax',
    'time_config_name',
    'cycle_time',
    'salemenu_names',
    'salemenu_ids',
    'sales_employee',
    'res_custom_code',
    'refund_money',
    'fee_name',
    'sid',
    'order_process_name',
  ],
  spu_export: [
    'route_name',
    'salemenu_id',
    'salemenu_name',
    'real_std_count_forsale',
    'real_quantity',
    'time_config_name',
    'cycle_time',
    'res_custom_code',
    'refund_amount',
    'fee_name',
    'refund_money',
    'sid',
  ],
}

// toc采购导出去除字段
const removedFieldOfCPurchase = {
  purchaseTaskItems_export: ['route_name'],
}

const getKey = (source, abolish) => {
  const keys = _.flatten(
    _.map(source, (item) => _.map(item, (value, key) => value)),
  )
  const newKey = _.filter(
    keys,
    (key) => _.findIndex(abolish, (field) => field === key) === -1,
  )
  return newKey
}

// 获取默认值
const getDefinedKeyOfCStation = () => {
  const CorderExportKey = getKey(
    orderExportKey,
    removedFieldOfCOrder.order_export,
  )

  const CspuExportKey = getKey(spuExportKey, removedFieldOfCOrder.spu_export)

  const CpurchaseTaskExportKey = _.flatten(
    _.map(purchaseTaskExportKey, (item) => _.map(item, (value, key) => value)),
  )

  const CpurchaseTaskItemsExportKey = getKey(
    purchaseTaskItemsExportKey,
    removedFieldOfCPurchase.purchaseTaskItems_export,
  )

  return {
    CorderExportKey,
    CspuExportKey,
    CpurchaseTaskExportKey,
    CpurchaseTaskItemsExportKey,
  }
}

const handleOrderKey = (key) => {
  // 处理是订单导出，b端订单导出没有团长相关字段，c端订单才有
  if (key === 'order' && System.isC()) {
    orderExportKey[i18next.t('订单信息')] = {
      ...orderExportKey[i18next.t('订单信息')],
      ...commanderOption,
    }
  } else {
    _.each(commanderOption, (item, key) => {
      delete orderExportKey[i18next.t('订单信息')][key]
    })
  }
}

const handleCustomizedKey = (key) => {
  if (key !== 'order' && key !== 'spu') return
  const detailConfigs = globalStore.customizedDetailConfigs.filter(
    (v) => v.permission.read_station_order,
  )
  const infoConfigs = globalStore.customizedInfoConfigs.filter(
    (v) => v.permission.read_station_order,
  )

  const orderCustomizedMap = {}
  _.forEach(infoConfigs, (v) => {
    orderCustomizedMap[v.field_name] = `customized_field.${v.id}`
  })

  const detailCustomizedMap = {}
  _.forEach(detailConfigs, (v) => {
    detailCustomizedMap[v.field_name] = `detail_customized_field.${v.id}`
  })
  if (_.keys(orderCustomizedMap)) {
    orderExportKey[i18next.t('其他信息')] = {
      ...orderExportKey[i18next.t('其他信息')],
      ...orderCustomizedMap,
    }
  }
  if (_.keys(detailCustomizedMap)) {
    spuExportKey[i18next.t('其他信息')] = {
      ...spuExportKey[i18next.t('其他信息')],
      ...detailCustomizedMap,
    }
  }
}

const getFieldOrGroupName = (key, type) => {
  handleOrderKey(key)
  handleCustomizedKey(key)
  return _.flatten(
    _.map(userDefinedKey[`${key}ExportKey`], (item, key) => {
      // 获取分组名
      if (type === 'groupName') return key

      // 获取字段信息
      return _.map(item, (sub, subKey) => {
        if (typeof sub === 'string') {
          const bool = !(
            sub.includes('detail_customized_field.') ||
            sub.includes('customized_field.')
          )
          return {
            Header: subKey,
            key: sub,
            diyEnable: true,
            diyGroupName: key,
            show: bool,
          }
        }
        if (typeof sub === 'object') {
          const diyEnable = 'diyEnable' in sub ? sub.diyEnable : true
          return {
            Header: subKey,
            key: sub.key,
            diyEnable,
            diyGroupName: key,
            show: true,
          }
        }
      })
    }),
  )
}

const getExportInfo = (params) => {
  const exportInfo = {}
  const paramsArr = params.split('&&')

  _.each(paramsArr, (item) => {
    exportInfo[`${item}_export`] = {}
    exportInfo[`${item}_export`].group_name = getFieldOrGroupName(
      item,
      'groupName',
    )
    exportInfo[`${item}_export`].export_key = getFieldOrGroupName(item)
  })

  return exportInfo
}

const getRequestField = (item, toc = false, hash = '') => {
  // toc导出直接额外处理
  if (!Storage.get(`${item}_export${hash}`) && toc) {
    const keys = getDefinedKeyOfCStation()
    const toCKeys = _.flatten(_.map(keys[`${item}ExportKey`], (key) => key))
    return toCKeys
  }
  // 有缓存则取缓存，无则默认全部
  const selectKey =
    Storage.get(`${item}_export${hash}`) || getFieldOrGroupName(item, '', toc)

  return _.map(
    selectKey.filter((o) => o.show),
    (item) => {
      return item.key
    },
  )
}

export {
  getExportInfo,
  getRequestField,
  removedFieldOfCOrder,
  removedFieldOfCPurchase,
}
