import React from 'react'
import { i18next } from 'gm-i18n'
import globalStore from 'stores/global'
import SVGMerchandise from 'svg/merchandise.svg'
import SVGSupplyChain from 'svg/supply_chain.svg'
import SVGSalesInvoicing from 'svg/sales_invoicing.svg'
import SVGSystem from 'svg/system.svg'
import SVGMarketing from 'svg/nav_marketing.svg'
import SVGOrder from 'svg/nav_order.svg'
import SVGRetail from 'svg/retail.svg'
import SVGData from 'svg/data_icon.svg'
import SVGCommander from 'svg/commander.svg'
import { canShow } from './util'
import _ from 'lodash'

const navConfig = [
  {
    link: '/merchandise',
    name: i18next.t('nav__商品'),
    icon: <SVGMerchandise />,
    sub: [
      {
        name: i18next.t('nav__商品管理'),
        link: '/merchandise/manage',
        sub: [
          {
            link: '/merchandise/manage/sale',
            name: i18next.t('nav__报价单管理'),
            display: canShow({ auth: 'get_salemenu' }),
          },
          {
            link: '/merchandise/manage/list',
            name: i18next.t('nav__商品库'),
          },
          {
            link: '/merchandise/manage/category_management',
            name: i18next.t('nav_分类管理'),
          },
          {
            link: '/merchandise/manage/spu_remark',
            name: i18next.t('nav__商品备注'),
            display: canShow({ auth: 'view_spu_remark' }),
          },
          {
            link: '/merchandise/manage/tax_rate',
            name: i18next.t('nav__销项税率规则'),
            display: canShow({
              auth: 'get_tax',
              globalField: globalStore.otherInfo.showTaxRate,
            }),
          },
          {
            link: '/merchandise/manage/demand',
            name: i18next.t('nav__新品需求'),
            display: canShow({
              auth: 'view_demand_for_new_merchandise',
            }),
          },
          {
            link: '/merchandise/manage/commission',
            name: i18next.t('nav__分佣规则'),
            display: canShow({ auth: 'get_commission_rule' }),
          },
          {
            link: '/merchandise/manage/quotation_record',
            name: i18next.t('nav__报价记录'),
            display: canShow({ auth: 'get_sku_snapshot_prices' }),
          },
        ],
      },
      {
        name: i18next.t('nav__商品合同价'),
        link: '/merchandise/contract_price',
        sub: [
          {
            link: '/merchandise/contract_price/comeup_pricing',
            name: i18next.t('nav__上浮定价'),
            display: canShow({ auth: 'get_change_rate' }),
          },
          {
            link: '/merchandise/contract_price/whole_order_discount_pricing',
            name: i18next.t('nav__整单折扣定价'),
            display: canShow({ auth: 'get_change_rate' }),
          },
        ],
      },
    ],
  },
  {
    link: '/order_manage/',
    name: i18next.t('nav__订单'),
    icon: <SVGOrder />,
    sub: [
      {
        name: i18next.t('nav__订单'),
        link: '/order_manage/order',
        sub: [
          {
            link: '/order_manage/order/list',
            name: i18next.t('nav__订单列表'),
            display: canShow({ auth: 'get_order' }),
          },
          {
            link: '/order_manage/order/create',
            name: i18next.t('nav__新建订单'),
            display: canShow({ auth: 'add_order' }),
          },
          {
            link: '/order_manage/order_review/list',
            name: i18next.t('nav__改单审核'),
            display: canShow({ auth: 'get_order_audit' }),
          },
          {
            link: '/order_manage/order/customize',
            display: canShow({ auth: 'get_order_customized_field' }),
            name: i18next.t('nav__自定义字段'),
          },
          {
            link: '/order_manage/no_order',
            name: i18next.t('nav__未下单商户'),
          },
        ],
      },
    ],
  },
  {
    link: '/data',
    name: i18next.t('nav__数据'),
    icon: <SVGData />,
    display:
      canShow({ auth: 'sales_cockpit' }) ||
      canShow({ auth: 'customer_purchase_analysis' }) ||
      canShow({ auth: 'merchandising_analysis' }) ||
      canShow({ auth: 'sales_summary_table' }),
    sub: [
      {
        name: i18next.t('nav__驾驶舱'),
        link: '/data/dashboard',
        display: canShow({ auth: 'sales_cockpit' }),
        sub: [
          {
            link: '/data/dashboard/sale_dashboard',
            display: canShow({ auth: 'sales_cockpit' }),
            name: i18next.t('nav__销售驾驶舱'),
          },
        ],
      },
      {
        name: i18next.t('nav__销售分析'),
        link: '/data/sale',
        display:
          canShow({ auth: 'customer_purchase_analysis' }) ||
          canShow({ auth: 'merchandising_analysis' }) ||
          canShow({ auth: 'sales_summary_table' }),
        sub: [
          {
            link: '/data/sale/merchant_analysis',
            name: i18next.t('nav__客户购买分析'),
            display: canShow({ auth: 'customer_purchase_analysis' }),
          },
          {
            link: '/data/sale/goods_analysis',
            name: i18next.t('nav__商品销售分析'),
            display: canShow({ auth: 'merchandising_analysis' }),
          },
          {
            link: '/data/sale/summary',
            name: i18next.t('nav__销售总表'),
            display: canShow({ auth: 'sales_summary_table' }),
          },
        ],
      },
      // {
      //   name: i18next.t('nav__采购分析'),
      //   link: '/data/purchase',
      //   sub: [
      //     {
      //       link: '/data/purchase/goods_analysis',
      //       name: i18next.t('nav__商品分析'),
      //     },
      //     {
      //       link: '/data/purchase/cost_analysis',
      //       name: i18next.t('nav__成本分析'),
      //     },
      //     {
      //       link: '/data/purchase/staff_analysis',
      //       name: i18next.t('nav__人员分析'),
      //     },
      //     {
      //       link: '/data/purchase/supplier_analysis',
      //       name: i18next.t('nav__供应商分析'),
      //     },
      //   ],
      // },
    ],
  },
  {
    link: '/supply_chain',
    name: i18next.t('nav__供应链'),
    icon: <SVGSupplyChain />,
    sub: [
      {
        name: i18next.t('nav__采购'),
        link: '/supply_chain/purchase',
        sub: [
          {
            link: '/supply_chain/purchase/task',
            name: i18next.t('nav__采购任务'),
            display: canShow({ auth: 'get_purchase_task' }),
          },
          {
            link: '/supply_chain/purchase/bills',
            name: i18next.t('nav__采购单据'),
            display: canShow({ auth: 'get_purchase_sheet' }),
          },
          {
            link: '/supply_chain/purchase/overview',
            name: i18next.t('nav__采购总览'),
            display:
              canShow({ globalField: !globalStore.otherInfo.cleanFood }) &&
              canShow({ auth: 'get_purchase_overview' }),
          },
          {
            link: '/supply_chain/purchase/analysis',
            name: i18next.t('nav__采购分析'),
            display:
              canShow({ globalField: !globalStore.otherInfo.cleanFood }) &&
              (canShow({ auth: 'get_supply_and_analysis' }) ||
                canShow({ auth: 'get_purchaser_assess' }) ||
                canShow({ auth: 'get_supplier_assess' }) ||
                canShow({ auth: 'get_quote_price_record' })),
          },
          {
            link: '/supply_chain/purchase/information',
            name: i18next.t('nav__采购资料'),
            display:
              canShow({ auth: 'get_purchaser' }) ||
              canShow({ auth: 'get_pur_spec' }),
          },
        ],
      },
      {
        name: i18next.t('加工'),
        link: '/supply_chain/process',
        display: canShow({ globalField: globalStore.otherInfo.cleanFood }),
        sub: [
          {
            link: '/supply_chain/process/plan',
            name: i18next.t('nav__加工计划'),
          },
          {
            link: '/supply_chain/process/receipt',
            name: i18next.t('nav__加工单据'),
          },
          {
            link: '/supply_chain/process/material_management',
            name: i18next.t('nav__领料管理'),
          },
          {
            link: '/supply_chain/process/report',
            name: i18next.t('nav__生产报表'),
          },
          {
            link: '/supply_chain/process/basic_info',
            name: i18next.t('nav__加工资料'),
          },
        ],
      },
      {
        name: i18next.t('nav__拣货'),
        link: '/supply_chain/picking',
        display:
          canShow({ globalField: !globalStore.otherInfo.cleanFood }) &&
          // 没有一个菜单时，该模块不显示
          canShow({ auth: 'get_picking_task' }),
        sub: [
          {
            link: '/supply_chain/picking/task',
            name: i18next.t('nav__拣货任务'),
            display: canShow({ auth: 'get_picking_task' }),
          },
        ],
      },
      {
        name: i18next.t('nav__分拣'),
        link: '/supply_chain/sorting',
        sub: [
          {
            link: '/supply_chain/sorting/schedule',
            name: i18next.t('nav__分拣进度'),
            display: canShow({ auth: 'get_sorting_schedule' }),
          },
          {
            link: '/supply_chain/sorting/detail',
            name: i18next.t('nav__分拣明细'),
            display: canShow({ auth: 'get_sorting_detail' }),
          },
          {
            link: '/supply_chain/sorting/method',
            name: i18next.t('nav__分拣资料'),
            display:
              canShow({ auth: 'get_dispatch_method' }) ||
              canShow({ auth: 'view_sorter_info' }),
          },
          {
            link: '/supply_chain/sorting/performance',
            name: i18next.t('nav__分拣绩效'),
            display: canShow({ auth: 'view_sorter_performance' }),
          },
          {
            link: '/supply_chain/sorting/rule_setting_of_performance',
            name: i18next.t('nav__绩效规则设置'),
            display: canShow({ auth: 'view_sorter_performance_rule' }),
          },
        ],
      },
      {
        name: i18next.t('nav__配送'),
        link: '/supply_chain/distribute',
        sub: [
          {
            link: '/supply_chain/distribute/task',
            name: i18next.t('nav__配送任务'),
            display: canShow({ auth: 'get_distribute_task' }),
          },
          {
            link: '/supply_chain/distribute/control_center',
            name: i18next.t('nav__调度中心'),
            display: canShow({ auth: 'get_distribute_center_tab' }),
          },
          {
            link: '/supply_chain/distribute/driver_manage',
            name: i18next.t('nav__司机管理'),
            display: canShow({ auth: 'get_distribute_center' }),
          },
          {
            link: '/supply_chain/distribute/driver_performance',
            name: i18next.t('nav__司机绩效'),
          },
          {
            link: '/supply_chain/distribute/self_lifting',
            name: i18next.t('nav__自提点'),
            display: canShow({ auth: 'get_pick_up_station' }),
          },
        ],
      },
      {
        name: i18next.t('nav__追溯'),
        link: '/supply_chain/food_security',
        sub: [
          {
            link: '/supply_chain/food_security/sku_report_search',
            name: i18next.t('nav__信息查询'),
            display: canShow({ auth: 'get_food_security' }),
          },
          {
            link: '/supply_chain/food_security/supplier_report',
            name: i18next.t('nav__检测报告'),
            display: canShow({ auth: 'get_security_report' }),
          },
        ],
      },
      {
        name: i18next.t('nav__周转物管理'),
        link: '/supply_chain/material_manage',
        sub: [
          {
            link: '/supply_chain/material_manage/list',
            name: i18next.t('nav__周转物列表'),
            display: canShow({ auth: 'get_turnover' }),
          },
          {
            link: '/supply_chain/material_manage/record',
            name: i18next.t('nav__借出归还记录'),
            display:
              canShow({ auth: 'get_turnover_loan_sheet' }) ||
              canShow({ auth: 'get_turnover_return_sheet' }),
          },
          {
            link: '/supply_chain/material_manage/customer/list',
            name: i18next.t('nav__商户借出查询'),
            display: canShow({ auth: 'get_turnover_history' }),
          },
          {
            link: '/supply_chain/material_manage/deposit_review',
            name: i18next.t('nav__押金退还审核'),
            display: canShow({ auth: 'get_turnover_refund' }),
          },
        ],
      },
      {
        name: i18next.t('nav__装箱'),
        link: '/supply_chain/box',
        sub: [
          {
            link: '/supply_chain/box/box_manage',
            name: i18next.t('nav__装箱管理'),
            display:
              canShow({ auth: 'get_boxtag_print' }) ||
              canShow({ auth: 'get_boxperformance_export' }),
          },
        ],
      },
    ],
    display: canShow({ globalField: !globalStore.isCenterSaller() }),
  },
  {
    link: '/sales_invoicing',
    name: i18next.t('nav__进销存'),
    icon: <SVGSalesInvoicing />,
    sub: [
      {
        name: i18next.t('入库管理'),
        link: '/sales_invoicing/stock_in',
        sub: [
          {
            link: '/sales_invoicing/stock_in/product',
            name: globalStore.otherInfo.cleanFood
              ? i18next.t('nav__入库')
              : i18next.t('nav__采购入库'),
            display: canShow({ auth: 'get_in_stock' }),
          },
          {
            link: '/sales_invoicing/stock_in/return',
            name: i18next.t('nav__商户退货入库'),
            display: canShow({ auth: 'get_customer_return_stock' }),
          },
          {
            link: '/sales_invoicing/stock_in/adjust_sheet',
            name: i18next.t('nav__入库调整单'),
            display: canShow({ auth: 'get_in_stock_adjust' }),
          },
        ],
      },
      {
        name: i18next.t('nav__出库管理'),
        link: '/sales_invoicing/stock_out',
        sub: [
          {
            link: '/sales_invoicing/stock_out/product',
            name: i18next.t('nav__销售出库'),
            display: canShow({ auth: 'get_out_stock' }),
          },
          {
            link: '/sales_invoicing/stock_out/refund',
            name: i18next.t('nav__采购退货'),
            display: canShow({ auth: 'get_return_stock' }),
          },
          {
            link: '/sales_invoicing/stock_out/adjust_record',
            name: i18next.t('nav__出库调整记录'),
            display: canShow({ auth: 'get_out_stock_adjust' }),
          },
        ],
      },
      {
        name: i18next.t('nav__调拨管理'),
        link: '/sales_invoicing/warehouse',
        sub: [
          {
            link:
              '/sales_invoicing/warehouse/transfer_inside_warehouse/inventory_transfer_list',
            name: i18next.t('nav__仓内移库'),
            display: canShow({ auth: 'get_inner_transfer_sheet' }),
          },
          {
            link: '/sales_invoicing/warehouse/inventory_transfer_record',
            name: i18next.t('nav__移库记录'),
            display: canShow({ auth: 'get_inner_transfer_log' }),
          },
        ],
      },
      {
        name: i18next.t('nav__加工分割'),
        link: '/sales_invoicing/processing_division/',
        sub: [
          {
            link: '/sales_invoicing/processing_division/split_document',
            name: i18next.t('nav__分割单据'),
            display: canShow({ auth: 'get_split_sheet' }),
          },
          {
            link: '/sales_invoicing/processing_division/loss_report',
            name: i18next.t('nav__损耗报表'),
            display: canShow({ auth: 'get_split_loss' }),
          },
        ],
      },
      {
        name: i18next.t('nav__库存账表'),
        link: '/sales_invoicing/inventory',
        sub: [
          {
            link: '/sales_invoicing/inventory/product',
            name: i18next.t('nav__商品盘点'),
            display:
              canShow({ auth: 'get_check_spu' }) &&
              canShow({ globalField: !globalStore.otherInfo.cleanFood }),
          },
          {
            link: '/sales_invoicing/inventory/stock_overview',
            name: i18next.t('nav__库存总览'),
            display: canShow({ globalField: globalStore.otherInfo.cleanFood }),
          },
          {
            link: '/sales_invoicing/inventory/account',
            name: i18next.t('nav__商品台账'),
            display: canShow({ auth: 'get_check_spu' }),
          },
          {
            link: '/sales_invoicing/inventory/summary',
            name: i18next.t('nav__出入库汇总'),
            display:
              canShow({ auth: 'get_out_stock_summary' }) &&
              canShow({ auth: 'get_in_stock_summary' }),
          },
          {
            link: '/sales_invoicing/inventory/stock_record',
            name: i18next.t('nav__入库明细'),
            display: canShow({ auth: 'get_stock_change_record' }),
          },
          {
            link: '/sales_invoicing/inventory/stock_removal_record',
            name: i18next.t('nav__出库明细'),
            display: canShow({ auth: 'get_stock_change_record' }),
          },
          {
            link: '/sales_invoicing/inventory/increase_lose_stock',
            name: i18next.t('nav__报损报溢表'),
            display: canShow({ auth: 'get_stock_change_record' }),
          },
          {
            link: '/sales_invoicing/inventory/report_value',
            name: i18next.t('nav__货值成本表'),
            display: canShow({ auth: 'get_stock_value' }),
          },
          {
            link: '/sales_invoicing/inventory/merchant_goods',
            name: i18next.t('nav__商户货值查询'),
            display: canShow({ auth: 'get_address_stock_value' }),
          },
        ],
      },
      {
        name: i18next.t('nav__财务核算'),
        link: '/sales_invoicing/finance',
        sub: [
          {
            link: '/sales_invoicing/finance/payment_review',
            name: i18next.t('nav__供应商结算'),
            display: canShow({ auth: 'get_settle_review' }),
          },
          // {
          //   link: '/sales_invoicing/finance/report',
          //   name: i18next.t('nav__应付总账'),
          //   display: canShow({ auth: 'get_settle_statistics' })
          // }, // todo 重构应付总账，迁移到finance下
          {
            link: '/sales_invoicing/finance/payment_total_accounts',
            name: i18next.t('nav__应付总账'),
            display: canShow({ auth: 'get_settle_statistics' }),
          },
          {
            link: '/sales_invoicing/finance/payment_accounts_detail',
            name: i18next.t('nav__应付明细账'),
            display: canShow({ auth: 'get_detail_settle_statistics' }),
          },
          {
            link: '/sales_invoicing/finance/payment_perform_sheet',
            name: i18next.t('nav__付款执行表'),
            display: canShow({ auth: 'get_settle_verification' }),
          },
        ],
      },
      {
        name: i18next.t('nav__基础资料'),
        link: '/sales_invoicing/base',
        display: canShow({ auth: 'get_settle_supplier' }),
        sub: [
          {
            link: '/sales_invoicing/base/supplier',
            name: i18next.t('nav__供应商列表'),
          },
          {
            link: '/sales_invoicing/base/tax_rate',
            name: i18next.t('nav__进项税率规则'),
            display: canShow({
              auth: 'get_tax',
              globalField: globalStore.otherInfo.showTaxRate,
            }),
          },
          {
            link: '/sales_invoicing/base/cargo_location_management',
            name: i18next.t('nav__货位管理'),
            display: canShow({ auth: 'get_shelf' }),
          },
          {
            link: '/sales_invoicing/base/split_scheme',
            name: i18next.t('nav__分割方案'),
            display: canShow({ auth: 'get_split_plan' }),
          },
          {
            link: '/sales_invoicing/base/cycle_quote_rules',
            name: i18next.t('nav__周期报价规则'),
            display: canShow({ auth: 'get_cycle_quoted_price' }),
          },
        ],
      },
    ],
    display: canShow({ globalField: !globalStore.isCenterSaller() }),
  },
  {
    link: '/marketing',
    name: i18next.t('nav__营销'),
    icon: <SVGMarketing />,
    sub: [
      {
        name: i18next.t('nav__营销'),
        link: '/marketing/manage',
        sub: [
          {
            link: '/marketing/manage/price_rule',
            name: i18next.t('nav__限时锁价'),
            display: canShow({ auth: 'get_sjgz' }),
          },
          {
            link: '/marketing/manage/market_tag',
            name: i18next.t('nav__营销活动'),
            display: canShow({ auth: 'get_promotion' }),
          },
          {
            link: '/marketing/manage/combine_goods',
            name: i18next.t('nav__组合商品'),
          },
          {
            link: '/marketing/manage/coupon',
            name: i18next.t('nav__优惠券'),
            display: canShow({ auth: 'get_coupon' }),
          },
          {
            link: '/marketing/manage/charge_gift',
            name: i18next.t('nav__充值赠送'),
            display: canShow({ auth: 'get_charge_gift' }),
          },
          {
            link: '/marketing/manage/buy_gift',
            name: i18next.t('nav__买赠'),
            // display: canShow({ auth: 'get_buy_gift' }),
          },
          {
            link: '/marketing/manage/cookbook',
            name: i18next.t('nav__菜谱'),
          },
        ],
      },
      {
        name: i18next.t('积分'),
        link: '/marketing/points',
        sub: [
          {
            link: '/marketing/points/points_merchandise',
            name: i18next.t('nav__积分商品'),
            display: canShow({ auth: 'get_reward_sku' }),
          },
          {
            link: '/marketing/points/exchange_detail',
            name: i18next.t('nav__兑换明细'),
            display: canShow({ auth: 'get_exchange_reward_flow' }),
          },
        ],
      },
    ],
  },
  {
    link: '/c_retail',
    name: i18next.t('nav__零售'),
    icon: <SVGRetail />,
    sub: [
      {
        name: i18next.t('nav_基础信息'),
        link: '/c_retail/basic_info',
        sub: [
          {
            link: '/c_retail/basic_info/list',
            name: i18next.t('nav__商品管理'),
            display: canShow({ auth: 'view_product_tob' }),
          },
          {
            link: '/c_retail/basic_info/category_management',
            name: i18next.t('nav__分类管理'),
            display: canShow({ auth: 'view_category_manage_tob' }),
          },
          {
            link: '/c_retail/basic_info/member',
            name: i18next.t('nav__客户管理'),
            display: canShow({ auth: 'view_customer_manage_tob' }),
          },
          {
            link: '/c_retail/basic_info/custom_page',
            name: i18next.t('nav__商城设置'),
          },
        ],
      },
      {
        name: i18next.t('nav__订单'),
        link: '/c_retail/order',
        sub: [
          {
            link: '/c_retail/order/list',
            name: i18next.t('nav__订单列表'),
            display: canShow({ auth: 'get_order_tob' }),
          },
          {
            link: '/c_retail/order/after_sales',
            name: i18next.t('nav__售后列表'),
            display: canShow({ auth: 'view_order_after_sale_tob' }),
          },
        ],
      },
      {
        name: i18next.t('nav__报表'),
        link: '/c_retail/report',
        sub: [
          {
            link: '/c_retail/report/detail',
            name: i18next.t('nav__运营报表'),
            display: canShow({ auth: 'view_operation_report_tob' }),
          },
        ],
      },
      {
        name: i18next.t('nav__营销'),
        link: '/c_retail/marketing',
        sub: [
          {
            link: '/c_retail/marketing/coupon',
            name: i18next.t('nav__优惠券'),
            display: canShow({ auth: 'get_coupon_tob' }),
          },
          {
            link: '/c_retail/marketing/flash_sale',
            name: i18next.t('nav__限时抢购'),
            display: canShow({ auth: 'get_flash_sale_tob' }),
          },
          {
            link: '/c_retail/marketing/invite',
            name: i18next.t('nav__邀请有礼'),
            display: canShow({ auth: 'get_invitation_gift_tob' }),
          },
          {
            link: '/c_retail/marketing/market_tag',
            name: i18next.t('nav__营销活动'),
            display: canShow({ auth: 'get_promotion_tob' }),
          },
        ],
      },
      {
        name: i18next.t('nav__会员'),
        link: '/c_retail/marketing',
        sub: [
          {
            link: '/c_retail/marketing/member',
            name: i18next.t('nav__会员管理'),
            display: canShow({ auth: 'view_member_information_tob' }),
          },
          {
            link: '/c_retail/marketing/charge_info',
            name: i18next.t('nav__购买记录'),
            display: canShow({ auth: 'view_purchase_record_tob' }),
          },
          {
            link: '/c_retail/marketing/setting',
            name: i18next.t('nav__会员卡设置'),
            display: canShow({ auth: 'view_member_setting_tob' }),
          },
        ],
      },
    ],
    display:
      _.findIndex(globalStore.user.permission, (v) => _.endsWith(v, '_tob')) !==
      -1,
  },
  {
    link: '/c_commander',
    name: i18next.t('nav__团长'),
    icon: <SVGCommander />,
    sub: [
      {
        link: '/c_commander/manage',
        name: i18next.t('nav__团长管理'),
        sub: [
          {
            link: '/c_commander/manage/list',
            name: i18next.t('nav__团长管理'),
            display: canShow({ auth: 'get_distributor_list_tob' }),
          },
          {
            link: '/c_commander/manage/level',
            name: i18next.t('nav__团长等级'),
            display: canShow({ auth: 'get_distributor_level_tob' }),
          },
          {
            link: '/c_commander/manage/tasks',
            name: i18next.t('nav__团长任务'),
            display: canShow({ auth: 'get_distributor_task_tob' }),
          },
          {
            link: '/c_commander/manage/rank',
            name: i18next.t('nav__团长排行'),
            display: canShow({ auth: 'get_distributor_rank_tob' }),
          },
          {
            link: '/c_commander/manage/recruit',
            name: i18next.t('nav__团长招募'),
            display: canShow({ auth: 'get_distributor_qrcode_tob' }),
          },
        ],
      },
      {
        link: '/c_commander/settlement',
        name: i18next.t('nav__团长结算'),
        sub: [
          {
            link: '/c_commander/settlement/list',
            name: i18next.t('nav__团长结算'),
            display: canShow({ auth: 'get_distributor_settle_list_tob' }),
          },
          {
            link: '/c_commander/settlement/withdraw',
            name: i18next.t('nav__团长提现'),
            display: canShow({ auth: 'get_distributor_withdraw_list_tob' }),
          },
        ],
      },
    ],
  },
  {
    link: '/system',
    name: i18next.t('nav__系统'),
    icon: <SVGSystem />,
    sub: [
      {
        name: i18next.t('nav__运营设置'),
        link: '/system/setting',
        sub: [
          {
            link: '/system/setting/service_time',
            name: i18next.t('nav__运营时间'),
          },
          {
            link: '/system/setting/freight',
            name: i18next.t('nav__运费管理'),
          },
          {
            link: '/system/setting/system_setting',
            name: i18next.t('nav__系统设置'),
            display: canShow({
              eitherAuth: [
                'get_merchandise_setting',
                'get_bshop_setting',
                'get_order_setting',
                'get_sorting_setting',
                'get_distribute_setting',
                'get_stock_setting',
                'get_cast_setting',
                'get_process_setting',
              ],
            }),
          },
          {
            link: '/system/setting/custom_page',
            name: i18next.t('nav__店铺运营'),
            display: canShow({ auth: 'get_shop_setting' }),
          },
          {
            link: '/system/setting/distribute_templete',
            name: i18next.t('nav__系统模板'),
            display: canShow({ auth: 'get_print_template' }),
          },
        ],
      },
      {
        name: i18next.t('nav__增值服务'),
        link: '/system/setting',
        sub: [
          {
            link: '/system/setting/short_message',
            name: i18next.t('nav__短信管理'),
            display: canShow({ auth: 'get_sms_manage' }),
          },
          {
            link: '/system/setting/open_platform',
            name: i18next.t('nav__平台管理'),
            display: canShow({ auth: 'view_open_app_store' }),
          },
          {
            link: '/system/setting/rate',
            name: i18next.t('nav__汇率管理'),
            display: canShow({ auth: 'get_fee_rate' }),
          },
          {
            link: '/system/setting/food_security',
            name: i18next.t('nav__溯源设置'),
            display: canShow({ auth: 'edit_food_security_display' }),
          },
          {
            link: '/system/setting/weight_setting',
            name: i18next.t('nav__地磅设置'),
          },
        ],
      },
      {
        name: i18next.t('nav__日志'),
        link: '/system/log',
        sub: [
          {
            link: '/system/log/operate',
            name: i18next.t('nav__操作日志'),
            display: canShow({ auth: 'view_op_log' }),
          },
          {
            link: '/system/log/recycle_bin',
            name: i18next.t('nav__回收站'),
            display: canShow({ auth: 'get_recycle_bin_data' }),
          },
        ],
      },
      {
        name: i18next.t('nav__小程序'),
        link: '/system/setting',
        sub: [
          {
            link: '/system/setting/mp',
            name: i18next.t('nav__小程序'),
            display: canShow({ auth: 'edit_toc_mp' }),
          },
        ],
      },
    ],
  },
]

export default navConfig
