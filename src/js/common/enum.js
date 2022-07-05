import { t } from 'gm-i18n'

export const purchaseTypes = [
  { id: 1, name: t('采购价') },
  { id: 2, name: t('询价') },
  { id: 3, name: t('入库价') },
]
export const purchaseSheetStatus = [
  { value: -1, name: t('已删除') },
  { value: 2, name: t('已提交') },
  { value: 3, name: t('未提交') },
]
export const PURCHASE_TASK_STATUS = [
  { value: 1, name: t('未发布') },
  { value: 2, name: t('已发布') },
  { value: 3, name: t('已完成') },
]
// 订单状态
export const filterStatusList = [
  { id: 0, name: t('全部状态') },
  { id: 1, name: t('等待分拣') },
  { id: 5, name: t('分拣中') },
  { id: 10, name: t('配送中') },
  { id: 15, name: t('已签收') },
]
// 分拣进度状态
export const sortingStatusList = [
  { id: 0, name: t('全部状态') },
  { id: 5, name: t('分拣中') },
  { id: 10, name: t('配送中') },
  { id: 15, name: t('已签收') },
]
// 报价单 搜索条件
export const merchandiseTypes = {
  saleType: [
    { value: '-1', name: t('全部报价单类型') },
    { value: '4', name: t('自售单') },
    { value: '2', name: t('代售单') },
  ],
  saleStatus: [
    { value: '-1', name: t('全部报价单状态') },
    { value: '1', name: t('已激活') },
    { value: '0', name: t('未激活') },
  ],
  saleState: [
    { value: '1', name: t('上架') },
    { value: '0', name: t('下架') },
  ],
}

export const dateFilterData = [
  {
    type: '1',
    name: '按下单日期',
    expand: false,
  },
  {
    type: '2',
    name: '按运营周期',
    expand: true,
  },
  {
    type: '3',
    name: '按收货日期',
    expand: false,
  },
]

export const dateFilterDataForSalesFilter = [
  {
    type: '1',
    name: '按收货日期',
    expand: true,
  },
  {
    type: '2',
    name: '按运营周期',
    expand: false,
  },
]

export const searchDateTypes = {
  ORDER: {
    type: '1',
    name: t('按下单日期'),
  },
  CYCLE: {
    type: '2',
    name: t('按运营周期'),
  },
  RECEIVE: {
    type: '3',
    name: t('按收货日期'),
  },
}
export const purchaseTaskSearchDateTypes = {
  ORDER: {
    type: 1,
    name: t('按下单日期'),
  },
  CYCLE: {
    type: 2,
    name: t('按运营周期'),
  },
  RECEIVE: {
    type: 3,
    name: t('按收货日期'),
  },
}

export const purchaseTaskHistorySearchDateTypes = {
  ORDER: {
    type: 1,
    name: t('按下单日期'),
  },
  RECEIVE: {
    type: 3,
    name: t('按收货日期'),
  },
}

export const payStatusList = [
  { value: 0, name: t('全部状态') },
  { value: 1, name: t('未支付') },
  { value: 5, name: t('部分支付') },
  { value: 10, name: t('已支付') },
]
export const saleReferencePrice = {
  LASTQOUTEPRICE: {
    type: 1,
    name: t('供应商最近询价'),
    flag: 'last_quote_price',
  },
  LASTPURCHASEPRICE: {
    type: 2,
    name: t('供应商最近采购价'),
    flag: 'last_purchase_price',
  },
  LASTINSTOCKPRICE: {
    type: 3,
    name: t('供应商最近入库价'),
    flag: 'last_in_stock_price',
  },
  LATESTPURCHASEPRICE: {
    type: 7,
    name: t('最近采购价'),
    flag: 'latest_purchase_price',
  },
  LASESTPURCHASEPRICE: {
    type: 5,
    name: t('最近询价'),
    flag: 'latest_quote_price',
  },
  LASESTINSTOCKPRICE: {
    type: 6,
    name: t('最近入库价'),
    flag: 'latest_in_stock_price',
  },
  STOCKAVGPRICE: {
    type: 4,
    name: t('库存均价'),
    flag: 'stock_avg_price',
  },
  SUPPLIERCYCLEQUOTE: {
    type: 9,
    name: t('供应商周期报价'),
    flag: 'supplier_cycle_quote',
  },
}
// 采购进度的单位
export const purchaseProgressUnit = [
  { id: 0, name: t('基本单位') },
  { id: 1, name: t('采购单位') },
]
export const editStatusArr = [
  {
    id: 5,
    text: t('分拣中'),
  },
  {
    id: 10,
    text: t('配送中'),
  },
  {
    id: 15,
    text: t('已签收'),
  },
]
// 加工计划
export const DATE_TYPE_LIST = [
  {
    name: t('创建日期'),
    value: 5,
  },
  {
    name: t('计划开始日期'),
    value: 1,
  },
]
export const STATUS_LIST = [
  {
    name: t('全部状态'),
    value: '',
  },
  {
    name: t('未下达'),
    value: 1,
  },
  {
    name: t('已下达'),
    value: 2,
  },
  {
    name: t('已开工'),
    value: 4,
  },
  {
    name: t('已完成'),
    value: 3,
  },
]

// 计划来源
export const PLAN_ORIGIN_STATUS = [
  { value: 0, text: t('全部来源') },
  { value: 1, text: t('订单') },
  { value: 2, text: t('手工新建') },
]

// 订单商品售后类型
export const afterSalesType = [
  { value: 0, text: t('无') },
  { value: 1, text: t('异常') },
  { value: 2, text: t('退货') },
]

export const PRINT_STATUS = [
  { value: '', name: t('全部状态') },
  { value: '0', name: t('未打印') },
  { value: '1', name: t('已打印') },
]

export const WEIGHT_STATUS = [
  { value: '', name: t('全部状态') },
  { value: '0', name: t('未称重') },
  { value: '1', name: t('已称重') },
]

// 绩效方式Option
export const PERF_WAY = [
  { value: '', name: t('全部状态') },
  { value: '1', name: t('计重') },
  { value: '2', name: t('计件') },
]

export const INSPECT_STATUS = [
  { value: '', name: t('全部状态') },
  { value: 1, name: t('未装车') },
  { value: 2, name: t('已装车') },
]
export const INSPECT_STATUS_SKU = [
  { value: '', name: t('全部状态') },
  { value: 1, name: t('未验货') },
  { value: 2, name: t('已验货') },
]

// 订单分拣状态
export const SORT_STATUS_ORDER = [
  { value: '', name: t('全部状态') },
  { value: 1, name: t('未完成分拣') },
  { value: 2, name: t('已完成分拣') },
]

// 订单集包状态
export const ORDER_BOX_STATUS = [
  { value: '', name: t('全部状态') },
  { value: 0, name: t('未集包') },
  { value: 1, name: t(' 已集包') },
]

// 商品装箱类型
export const BOX_TYPE = [
  { value: null, name: t('全部类型') },
  { value: 0, name: t('散件装箱') },
  { value: 1, name: t('整件装箱') },
]

// 商品装箱状态
export const SKU_PACKAGE_STATUS = [
  { value: '', name: t('全部状态') },
  { value: 0, name: t('未装箱') },
  { value: 1, name: t('已装箱') },
]

// 装箱管理箱签打印状态
export const BOX_LABEL_PRINT_STATUS = [
  { value: null, name: t('全部状态') },
  { value: 0, name: t('未打印') },
  { value: 1, name: t('已打印') },
]

// 采购来源
export const PURCHASE_SOURCE = {
  '1': t('采购APP'),
  '2': t('业务平台'),
  '3': t('供应商APP'),
}
// 库存变动类型
export const INVENTORY_CHANGES_TYPE = () => {
  return [
    { value: '0', name: t('全部') },
    { value: '1', name: t('采购入库') },
    { value: '4', name: t('销售出库') },
    { value: '17', name: t('退货入库') },
    { value: '8', name: t('退货出库') },
    { value: '6', name: t('报损') },
    { value: '7', name: t('报溢') },
    {
      value: '2',
      name: t('采购入库审核不通过'),
    },
    { value: '9', name: t('退货出库审核不通过') },
    { value: '3', name: t('采购入库冲销') },
    { value: '5', name: t('销售出库冲销') },
    { value: '10', name: t('退货出库冲销') },
    { value: '25', name: t('分割入库') },
    { value: '26', name: t('分割出库') },
    { value: '27', name: t('分割入库冲销') },
    { value: '28', name: t('分割单冲销原料入库') },
    { value: '22', name: t('退料入库') },
    { value: '11', name: t('领料出库') },
    { value: '14', name: t('加工入库') },
    { value: '18', name: t('修复库存均价') },
  ]
}

export const INVENTORY_EXAMINE_TYPE = [
  { value: '', text: t('全部状态') },
  { value: 1, text: t('已审核') },
  { value: 2, text: t('审核不通过') },
  { value: 3, text: t('冲销') },
]

export const REMARK_STATUS = [
  // 订单备注
  { value: '', name: t('全部备注') },
  { value: '0', name: t('无备注') },
  { value: '1', name: t('有备注') },
]

export const OUT_STOCK_STATUS = [
  { value: 1, name: t('未出库') },
  { value: 2, name: t('已出库') },
]

export const RECEIVE_LIMIT_BY_DAYS = [
  // 二进制 0000001 表示
  { name: t('周一'), value: 1 },
  { name: t('周二'), value: 2 },
  { name: t('周三'), value: 4 },
  { name: t('周四'), value: 8 },
  { name: t('周五'), value: 16 },
  { name: t('周六'), value: 32 },
  { name: t('周日'), value: 64 },
]

export const RULE_TYPE = [
  { value: 0, name: t('固定'), operator: '' },
  { value: 1, name: t('加'), operator: '+' },
  { value: 2, name: t('乘'), operator: 'x' },
]

// 分拣状态
export const SORT_STATUS = [
  { value: '1', name: t('已完成') },
  { value: '2', name: t('未完成') },
]

// 进销存
export const PRODUCT_TIME_TYPE = {
  1: t('按入库日期'),
  2: t('按建单日期'),
}
export const PRODUCT_REASON_TYPE = {
  1: t('运输费用分摊'),
  2: t('其他费用分摊'),
}
export const PRODUCT_ACTION_TYPE = {
  1: t('加钱'),
  2: t('扣钱'),
}
export const PRODUCT_METHOD_TYPE = {
  1: t('金额分摊'),
  2: t('入库数分摊'),
}
export const PRODUCT_STATUS = {
  '1': t('待提交'),
  '2': t('已提交待审核'),
  '3': t('审核通过待结款'),
  '4': t('已结款'),
  '0': t('审核不通过'),
  '-1': t('已删除'),
}
// 成品入库状态
export const FINISHED_PRODUCT_STATUS = {
  '1': t('待提交'),
  '2': t('已提交'),
  '-1': t('已删除'),
}
export const FORMULA_TYPE = [
  { value: -1, name: t('全部') },
  { value: 1, name: t('开启') },
  { value: 0, name: t('关闭') },
]

// 要货申请状态
export const REQUIRE_GOODS_APPLY_STATUS = [
  { value: 1, name: t('未发送申请') },
  { value: 2, name: t('已发送申请') },
  { value: 3, name: t('已接收报价') },
]

// 是否生成采购单
export const HAS_CREATED_PURCHASE_SHEET_STATUS = [
  { value: 1, name: t('已生成') },
  { value: 0, name: t('未生成') },
]

// 采购来源
export const PURCHASE_ORIGIN_STATUS = [
  { value: 0, text: t('全部来源') },
  { value: 1, text: t('订单') },
  { value: 2, text: t('手工新建') },
  { value: 3, text: t('智能补货') },
  { value: 4, text: t('预生产计划') }, // 非净菜站点需要屏蔽，即去掉该选项
]

export const ORDER_CLIENTS = [
  { value: 1, name: t('后台下单') },
  { value: 2, name: t('微信商城') },
  { value: 3, name: 'app' },
  { value: 4, name: t('微信小程序') },
  { value: 5, name: t('有赞推送') },
  { value: 6, name: t('开放平台') },
  { value: 7, name: t('后台补录') },
  { value: 8, name: t('云管家代客下单') },
  { value: 9, name: t('CRM代客下单') },
]

export const ORDER_CLIENTS_MAP = {
  1: t('后台下单'),
  2: t('微信商城'),
  3: t('app'),
  4: t('微信小程序'),
  5: t('有赞推送'),
  6: t('开放平台'),
  7: t('后台补录'),
  8: t('云管家代客下单'),
  9: t('CRM代客下单'),
}

export const PRICE_TYPES = [
  { value: 1, name: t('时价') },
  { value: 0, name: t('非时价') },
]

// 单据状态
export const RECEIPT_TYPE = [
  { key: '', text: t('全部单据状态') },
  { key: '0', text: t('审核不通过') },
  { key: '1', text: t('待提交') },
  { key: '2', text: t('已提交待结款') },
  { key: '4', text: t('已结款') },
  { key: '3', text: t('部分结款') },
  { key: '-1', text: t('已删除') },
]

// 结算周期
export const PAY_METHOD_TYPE = [
  { value: '', name: t('全部标签') },
  { value: 1, name: t('日结') },
  { value: 2, name: t('周结') },
  { value: 3, name: t('半月结') },
  { value: 4, name: t('月结') },
]

export const PAY_METHOD_ENUM = {
  1: t('日结'),
  2: t('周结'),
  3: t('半月结'),
  4: t('月结'),
}

export const UNHANDLE_TYPE = [
  { key: '5', text: t('全部单据类型') },
  { key: '1', text: t('采购入库单') },
  { key: '2', text: t('采购退货单') },
]

export const BUSINESS_STATUS = [
  { id: 1, value: t('开启') },
  { id: 2, value: t('关闭') },
]

export const RECEIVE_WAYS = [
  { value: 1, name: t('配送') },
  { value: 2, name: t('自提') },
]

export const PURCHASE_ANALYSIS_TYPE = [
  { value: '1', name: t('按下单日期') },
  { value: '3', name: t('按收货日期') },
]

export const TASK_STATUS = [
  { name: t('未发布'), value: 1 },
  { name: t('已发布'), value: 2 },
]

export const PROCESS_STATUS = [
  { text: t('待处理'), value: 1 },
  { text: t('已添加'), value: 2 },
  { text: t('已拒绝'), value: 3 },
]

export const STOCK_IN_PRINT_STATUS = [
  { value: '-1', name: t('全部状态') },
  { value: '0', name: t('未打印') },
  { value: '1', name: t('已打印') },
]

export const purchaseSheetSource = [
  { value: '', name: t('全部来源') },
  { value: 0, name: t('采购任务') },
  { value: 1, name: t('小程序/app') },
  { value: 2, name: t('手动新建') },
]

export const SERVICE_TIME_TYPE = [
  { text: t('15分钟'), value: '15' },
  { text: t('30分钟'), value: '30' },
  { text: t('1小时'), value: '60' },
  { text: t('2小时'), value: '120' },
  { text: t('4小时'), value: '240' },
  { text: t('6小时'), value: '360' },
]

export const FEE_LIST = [
  { name: t('人民币'), value: 'CNY' },
  { name: t('港币'), value: 'HKD' },
  { name: t('澳门币'), value: 'MOP' },
]

export const ORDER_IMPORT_TYPE = [
  { value: 1, text: t('标准模板') },
  { value: 2, text: t('连锁门店模板') },
]

export const ORDER_PRINT_STATUS = [
  { value: '', text: t('全部状态') },
  { value: '1', text: t('已打印') },
  { value: '0', text: t('未打印') },
]

// 订单查看 -- 搜索类型
export const ORDER_SEARCH_TYPE = [
  { value: 1, text: t('按订单/商户') },
  { value: 2, text: t('按订单号') },
  { value: 3, text: t('按商户名/ID') },
  { value: 4, text: t('按订单备注') },
  { value: 5, text: t('按下单员') },
]
export const NOTIFY_TYPE = {
  0: t('全部类型'),
  1: t('商户注册'),
  2: t('新品需求'),
  3: t('改单审核'),
  4: t('积分兑换'),
  5: t('订单退券'),
}

export const WARNING_TYPE = {
  1: t('低库存'),
  2: t('报价单'),
  3: t('短信'),
  4: t('锁价'),
  5: t('保质期'),
  6: t('呆滞品'),
  7: t('高库存'),
  10: t('订单'),
  11: t('报价单周期定价'),
}

// 商品查看 -- 缺货状态
export const STATUS_OF_STOCK = [
  { value: 1, name: t('全部状态') },
  { value: 2, name: t('缺货') },
  { value: 3, name: t('不缺货') },
]

export const STATUS_OF_STOCK_2 = [
  { value: '', name: t('全部状态') },
  { value: 1, name: t('已标记') },
  { value: 0, name: t('未标记') },
]

// 组合商品销售状态
export const COMBINATION_GOODS_SALES_STATUS = [
  {
    value: '',
    text: t('全部状态'),
  },
  {
    value: 0,
    text: t('下架'),
  },
  {
    value: 1,
    text: t('上架'),
  },
]

export const DEMAND_TYPES = [
  {
    value: 1,
    text: t('bshop商城'),
  },
  {
    value: 2,
    text: t('采购app'),
  },
]

// 出库状态
export const outStockStatusMap = {
  1: t('待出库'),
  2: t('已出库'),
  3: t('已删除'),
}

export const OUT_STOCK_STATUS_TYPE = {
  notOutStock: 1,
  finish: 2,
  delete: 3,
}

export const PRICE_RULE_STATUS = [
  {
    id: '',
    name: t('全部状态'),
  },
  {
    id: 2,
    name: t('未开始'),
  },
  {
    id: 3,
    name: t('有效'),
  },
  {
    id: 1,
    name: t('无效'),
  },
  {
    id: 0,
    name: t('关闭'),
  },
]

export const PRICE_RULE_TYPE = [
  {
    id: 'customer',
    name: t('商户'),
  },
  {
    id: 'station',
    name: t('站点'),
  },
]

export const TASK_LIST_SEARCH_TYPE = [
  { text: t('商品名称'), value: 1 },
  { text: t('订单号'), value: 2 },
  { text: t('商户信息'), value: 3 },
]

// 订单类型, 搜索条件
export const orderTypes = [
  { value: '0', text: t('全部') },
  { value: '', text: t('常规') },
]

// 默认订单类型: 搜索筛选默认全部，创建订单独自定义默认为常规
export const initOrderType = '0'

export const TAX_RATE_STATUS = {
  0: t('无效'),
  1: t('有效'),
}

export const SUPPLIER_INVOICE_TYPE = {
  1: t('一般纳税人'),
  2: t('小规模纳税人'),
  3: t('普票或无票'),
}

// 自提点类型
export const SELF_LIFTING_TYPE_STATUS = [
  {
    value: 1,
    text: t('共享'),
  },
  {
    value: 2,
    text: t('团长专属'),
  },
]

export const SELF_LIFTING_TYPE_SHOW = {
  1: t('共享'),
  2: t('团长专属'),
}

export const clubDateFilterData = [
  {
    type: '1',
    name: '按下单日期',
    expand: false,
  },
  {
    type: '3',
    name: '按收货日期',
    expand: false,
  },
]

export const CHANGE_TYPE_STATUS = [
  {
    value: 1,
    text: t('佣金结算'),
  },
  {
    value: 2,
    text: t('余额提现'),
  },
]

export const WITHDRAW_STATUS = [
  {
    value: 1,
    text: t('申请中'),
  },
  {
    value: 2,
    text: t('提现成功'),
  },
]

// 团长管理中的状态
export const COMMANDER_STATUS = [
  {
    value: 1,
    text: t('待审核'),
  },
  {
    value: 2,
    text: t('正常'),
  },
  {
    value: 3,
    text: t('冻结'),
  },
]

export const COMMANDER_STATUS_SHOW = {
  1: t('待审核'),
  2: t('正常'),
  3: t('冻结'),
}

export const SETTLE_STATUS = [
  {
    value: 1,
    text: t('待结算'),
  },
  {
    value: 2,
    text: t('已结算'),
  },
]

export const FORMULA_TEXT = {
  '{sale_price}': t('现单价'),
  '{last_quote_price}': t('供应商最近询价'),
  '{last_purchase_price}': t('供应商最近采购价'),
  '{last_in_stock_price}': t('供应商最近入库价'),
  '{stock_avg_price}': t('库存均价'),
  '{latest_quote_price}': t('最近询价'),
  '{latest_in_stock_price}': t('最近入库价'),
  '{latest_purchase_price}': t('最近采购价'),
  '{supplier_cycle_quote}': t('供应商周期报价'),
}

export const SPLIT_SHEET_STATUS = {
  0: t('全部'),
  1: t('未审核'),
  2: t('已审核'),
  3: t('审核不通过'),
  4: t('冲销'),
}

export const BATCH_ORIGIN_TYPE = {
  1: t('入库'),
  3: t('退货入库'),
  7: t('加工分割'),
  8: t('仓内移库'),
}
// 工艺，字段属性设置
export const PARAM_TYPE_ENUM = [
  { text: t('单选'), value: 0 },
  { text: t('文本'), value: 1 },
]

export const MATERIAL_TYPE = [
  { value: 0, text: t('全部') },
  { value: 1, text: t('原料') },
  { value: 2, text: t('净菜') },
  { value: 7, text: t('毛菜') },
]

export const CLEAN_FOOD_NUTRITION_INFO = [
  {
    text: t('能量'),
    value: 'energy',
    unit: 'KJ',
  },
  {
    text: t('碳水化合物'),
    value: 'carbohydrate',
    unit: 'g',
  },
  {
    text: t('蛋白质'),
    value: 'protein',
    unit: 'g',
  },
  {
    text: t('脂肪'),
    value: 'fat',
    unit: 'g',
  },
  {
    text: t('钙'),
    value: 'element_Ca',
    unit: 'mg',
  },
  {
    text: t('磷'),
    value: 'element_P',
    unit: 'mg',
  },
  {
    text: t('钾'),
    value: 'element_K',
    unit: 'mg',
  },
  {
    text: t('钠'),
    value: 'element_Na',
    unit: 'mg',
  },
  {
    text: t('氯'),
    value: 'element_Cl',
    unit: 'mg',
  },
  {
    text: t('镁'),
    value: 'element_Mg',
    unit: 'mg',
  },
  {
    text: t('铁'),
    value: 'element_Fe',
    unit: 'mg',
  },
  {
    text: t('锌'),
    value: 'element_Zn',
    unit: 'mg',
  },
  {
    text: t('硒'),
    value: 'element_Se',
    unit: 'μg',
  },
  {
    text: t('钼'),
    value: 'element_Mo',
    unit: 'μg',
  },
  {
    text: t('铬'),
    value: 'element_Cr',
    unit: 'μg',
  },
  {
    text: t('碘'),
    value: 'element_I',
    unit: 'μg',
  },
  {
    text: t('铜'),
    value: 'element_Cu',
    unit: 'mg',
  },
  {
    text: t('维生素A'),
    value: 'vitamin_A',
    unit: 'μg',
  },
  {
    text: t('维生素D'),
    value: 'vitamin_D',
    unit: 'μg',
  },
  {
    text: t('维生素E'),
    value: 'vitamin_E',
    unit: 'mg',
  },
  {
    text: t('维生素K'),
    value: 'vitamin_K',
    unit: 'μg',
  },
  {
    text: t('维生素B1'),
    value: 'vitamin_B1',
    unit: 'mg',
  },
  {
    text: t('维生素B2'),
    value: 'vitamin_B2',
    unit: 'mg',
  },
  {
    text: t('维生素B6'),
    value: 'vitamin_B6',
    unit: 'mg',
  },
  {
    text: t('维生素B12'),
    value: 'vitamin_B12',
    unit: 'μg',
  },
  {
    text: t('泛酸'),
    value: 'vitamin_B_pa',
    unit: 'mg',
  },
  {
    text: t('叶酸'),
    value: 'vitamin_B_folate',
    unit: 'μg',
  },
  {
    text: t('烟酸'),
    value: 'vitamin_B_niacin',
    unit: 'mg',
  },
  {
    text: t('胆碱'),
    value: 'vitamin_B_choline',
    unit: 'mg',
  },
  {
    text: t('生物素'),
    value: 'vitamin_B_biotin',
    unit: 'mg',
  },
  {
    text: t('维生素C'),
    value: 'vitamin_C',
    unit: 'mg',
  },
  {
    text: t('膳食纤维'),
    value: 'dietary_fiber',
    unit: 'g',
  },
  {
    text: t('水'),
    value: 'water',
    unit: 'g',
  },
]

export const ORDER_PUBLISH_SETTING = [
  { text: t('建议计划生产数'), value: 1 },
  { text: t('下单数'), value: 2 },
]
// 改单审核枚举
export const auditStatusEnum = new Map([
  [0, t('全部')],
  [1, t('待审核')],
  [2, t('已通过')],
  [3, t('已驳回')],
  [4, t('系统驳回')],
])

// 改单审核操作枚举
export const auditActionStatusEnum = new Map([
  [1, t('待审核')],
  [2, t('审核通过')],
  [3, t('审核驳回')],
])

// 安全库存
export const SAFE_STOCK_TYPE = [
  { value: 0, text: t('全部商品') },
  { value: 1, text: t('正常库存商品') },
  { value: 2, text: t('低库存商品') },
  { value: 3, text: t('高库存商品') },
]

// status: 1  // M, int,-1，删除；1，待提交（净菜）；2，正常；3，损坏；4，临期；5，过期
// 批次状态
export const BATCH_STATUS = [
  { value: 0, text: t('全部状态') },
  { value: 2, text: t('正常') },
  { value: 3, text: t('损坏') },
  { value: 4, text: t('临期') },
  { value: 5, text: t('过期') },
]

// 呆滞库存
export const DELAY_STOCK_TYPE = [
  { value: 0, text: t('全部商品') },
  { value: 1, text: t('呆滞品') },
  { value: 2, text: t('非呆滞品') },
]

// 批次库存
export const BATCH_STOCK_STATUS = [
  { value: 0, text: t('全部') },
  { value: 1, text: t('库存大于0') },
  { value: 2, text: t('库存等于0') },
  { value: 3, text: t('库存小于0') },
]

// 可见任务范围下拉选项
export const TASK_SCOPE_OPTIONS = [
  { value: 1, text: t('全部范围') },
  { value: 2, text: t('固定分配') },
]

export const CONFIG_ORDER_HEADER = 1
export const CONFIG_ORDER_DETAIL = 2

export const COMPONENT_TYPE_TEXT = 1
export const COMPONENT_TYPE_SELECT = 2
export const COMPONENT_TYPE_DATE = 3
// 周期报价状态下拉选项
export const CYCLE_QUOTE_TYPE = [
  {
    value: 2,
    text: t('未开始'),
  },
  {
    value: 3,
    text: t('生效中'),
  },
  {
    value: 1,
    text: t('已结束'),
  },
  {
    value: 0,
    text: t('已关闭'),
  },
]
