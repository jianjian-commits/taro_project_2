import { keyMirror } from '@gm-common/tool'

// ACTION_STORAGE_KEY_NAMES
export default keyMirror({
  FINANCE_PAYMENT_REVIEW: null, // 进销存 - 结款审核 - 待处理单据
  PRODUCT: null, // 退货出库 日期类型 和 成品入库 日期类型
  DISTRIBUTE_ORDER: null, // 供应链 - 配送任务
  DISTRIBUTE_ORDER_TIME: null, // 供应链 - 配送任务 - 运营时间
  DISTRIBUTE_DRIVER: null, // 供应链 - 配送任务
  DISTRIBUTE_DRIVER_TIME: null, // 供应链 - 配送任务 - 运营时间
  PRODUCT_OUTSTOCK: null, // 进销存 - 成品出库
  PRODUCT_OUTSTOCK_TIME: null, // 进销存 - 成品出库 - 运营时间
  ORDER_VIEW_ORDER: null, // 订单列表 - 按订单查看
  ORDER_VIEW_ORDER_TIME: null, // 订单列表 - 按订单查看 - 运营时间
  ORDER_VIEW_SKU: null, // 订单列表 - 按商品查看
  ORDER_VIEW_SKU_TIME: null, // 订单列表 - 按商品查看 - 运营时间
  PURCHASE_TASK: null, // 供应链 - 采购任务
  PURCHASE_TASK_TIME: null, // 供应链 - 采购任务 - 运营时间
  DISTRIBUTE_TASK_LINE_TAB: null, // 供应链 - 配送任务 - 线路任务,
  DELIVERY_LOG: null, // 供应链 - 配送任务 - 订单任务列表 - 查看编辑单据
  TEMPLATE_INDEX: null, // 系统 - 打印模板设置
  POINTS_DETAIL: null, // 积分 - 积分明细,
  DISTRIBUTE_CONTROL_CENTER: null, // 配送 - 调度中心
  DRIVER_PERFORMANCE_FILTER_TIME: null, // 配送 - 司机绩效 - 搜索条件
  PURCHASE_OVERVIEW_FILTER_TIME: null, // 采购 - 采购总览 - 下单时间
  PURCHASE_PERFORMANCE_FILTER_TIME: null, // 采购 - 采购员绩效 - 下单时间
  SORTING_SCHEDULE_FILTER_TIME: null, // 分拣 - 分拣进度 - 分拣进度
  SORTING_DETAIL_VIEW: null, // 分拣 - 分拣明细 - 按销售规格
  SORTING_DETAIL_TIME: null, // 分拣 - 分拣明细 - 分拣明细
  SORTING_PERFORMANCE_FILTER_TIME: null, // 分拣 - 分拣进度 - 分拣绩效
  HOME_CITY_MAP_SELECT: null, // 首页 - 运营地图,
  COMMON_PRINTER_OPTIONS: null, // 公共打印配置
  TPL_BOX_MANAGE: null, // 装箱管理模版
})
