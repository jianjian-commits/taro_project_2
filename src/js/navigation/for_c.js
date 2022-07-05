import React from 'react'
import { i18next } from 'gm-i18n'
import globalStore from 'stores/global'
import SVGMerchandise from 'svg/merchandise.svg'
import SVGSupplyChain from 'svg/supply_chain.svg'
import SVGSalesInvoicing from 'svg/sales_invoicing.svg'
import SVGSystem from 'svg/system.svg'
import SVGMarketing from 'svg/nav_marketing.svg'
import SVGOrder from 'svg/nav_order.svg'
import SVGMember from 'svg/member.svg'
import SVGReport from 'svg/report.svg'
import SVGCommander from 'svg/commander.svg'
import { canShow } from './util'

const navConfig = [
  {
    link: '/dashboard',
    name: i18next.t('nav__首页'),
    icon: <SVGMerchandise />,
    sub: [
      {
        name: i18next.t('nav__驾驶舱'),
        link: '/dashboard',
        sub: [
          // {
          //   link: '/dashboard/summary_dashboard',
          //   // 先不要
          //   name: i18next.t('nav__总驾驶舱'),
          // },
          {
            link: '/dashboard/sale_dashboard',
            name: i18next.t('nav__销售驾驶舱'),
          },
          // {
          //   link: '/dashboard/purchase_dashboard',
          //   name: i18next.t('nav__采购驾驶舱'),
          // },
        ],
      },
    ],
  },
  {
    link: '/data',
    name: i18next.t('nav__数据'),
    icon: <SVGMerchandise />,
    sub: [
      {
        name: i18next.t('nav__销售分析'),
        link: '/data/sale',
        sub: [
          {
            link: '/data/sale/merchant_analysis',
            name: i18next.t('nav__客户购买分析'),
          },
          {
            link: '/data/sale/goods_analysis',
            name: i18next.t('nav__商品销售分析'),
          },
          {
            link: '/data/sale/summary',
            name: i18next.t('nav__销售总表'),
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
    link: '/c_retail',
    name: i18next.t('nav__商品'),
    icon: <SVGMerchandise />,
    sub: [
      {
        name: i18next.t('nav__商品管理'),
        link: '/c_retail/basic_info',
        sub: [
          {
            link: '/c_retail/basic_info/list',
            name: i18next.t('nav__商品管理'),
            display: canShow({ auth: 'view_product_toc' }),
          },
          {
            link: '/c_retail/basic_info/category_management',
            name: i18next.t('nav__分类管理'),
            display: canShow({ auth: 'view_category_manage_toc' }),
          },
        ],
      },
    ],
  },
  {
    link: '/c_retail',
    name: i18next.t('nav__订单'),
    icon: <SVGOrder />,
    sub: [
      {
        name: i18next.t('nav__订单'),
        link: '/c_retail/order',
        sub: [
          {
            link: '/c_retail/order/list',
            name: i18next.t('nav__订单列表'),
            display: canShow({ auth: 'get_order_toc' }),
          },
          {
            link: '/c_retail/order/after_sales',
            name: i18next.t('nav__售后列表'),
            display: canShow({ auth: 'view_order_after_sale_toc' }),
          },
        ],
      },
    ],
  },
  {
    link: '/c_retail',
    name: i18next.t('nav__会员'),
    icon: <SVGMember />,
    sub: [
      {
        name: i18next.t('nav__客户信息'),
        link: '/c_retail/basic_info',
        sub: [
          {
            link: '/c_retail/basic_info/member',
            name: i18next.t('nav__客户管理'),
            display: canShow({ auth: 'view_customer_manage_toc' }),
          },
        ],
      },
      {
        name: i18next.t('nav__会员管理'),
        link: '/c_retail/marketing',
        sub: [
          {
            link: '/c_retail/marketing/member',
            name: i18next.t('nav__会员信息'),
            display: canShow({ auth: 'view_member_information_toc' }),
          },
          {
            link: '/c_retail/marketing/charge_info',
            name: i18next.t('nav__购买记录'),
            display: canShow({ auth: 'view_purchase_record_toc' }),
          },
          {
            link: '/c_retail/marketing/setting',
            name: i18next.t('nav__会员卡设置'),
            display: canShow({ auth: 'view_member_setting_toc' }),
          },
        ],
      },
    ],
  },
  {
    link: '/c_retail',
    name: i18next.t('nav__营销'),
    icon: <SVGMarketing />,
    sub: [
      {
        name: i18next.t('nav__营销活动'),
        link: '/c_retail/marketing',
        sub: [
          {
            link: '/c_retail/marketing/coupon',
            name: i18next.t('nav__优惠券'),
            display: canShow({ auth: 'get_coupon_toc' }),
          },
          {
            link: '/c_retail/marketing/flash_sale',
            name: i18next.t('nav__限时抢购'),
            display: canShow({ auth: 'get_flash_sale_toc' }),
          },
          {
            link: '/c_retail/marketing/invite',
            name: i18next.t('nav__邀请有礼'),
            display: canShow({ auth: 'get_invitation_gift_toc' }),
          },
          {
            link: '/c_retail/marketing/market_tag',
            name: i18next.t('nav__营销活动'),
            display: canShow({ auth: 'get_promotion_toc' }),
          },
        ],
      },
    ],
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
            display: canShow({ auth: 'get_distributor_list_toc' }),
          },
          {
            link: '/c_commander/manage/level',
            name: i18next.t('nav__团长等级'),
            display: canShow({ auth: 'get_distributor_level_toc' }),
          },
          {
            link: '/c_commander/manage/tasks',
            name: i18next.t('nav__团长任务'),
            display: canShow({ auth: 'get_distributor_task_toc' }),
          },
          {
            link: '/c_commander/manage/rank',
            name: i18next.t('nav__团长排行'),
            display: canShow({ auth: 'get_distributor_rank_toc' }),
          },
          {
            link: '/c_commander/manage/recruit',
            name: i18next.t('nav__团长招募'),
            display: canShow({ auth: 'get_distributor_qrcode_toc' }),
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
            display: canShow({ auth: 'get_distributor_settle_list_toc' }),
          },
          {
            link: '/c_commander/settlement/withdraw',
            name: i18next.t('nav__团长提现'),
            display: canShow({ auth: 'get_distributor_withdraw_list_toc' }),
          },
        ],
      },
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
            display: canShow({ auth: 'get_purchase_task_toc' }),
          },
          {
            link: '/supply_chain/purchase/bills',
            name: i18next.t('nav__采购单据'),
            display: canShow({ auth: 'get_purchase_sheet_toc' }),
          },
          {
            link: '/supply_chain/purchase/overview',
            name: i18next.t('nav__采购总览'),
            display:
              canShow({ globalField: !globalStore.otherInfo.cleanFood }) &&
              canShow({ auth: 'get_purchase_overview_toc' }),
          },
          {
            link: '/supply_chain/purchase/analysis',
            name: i18next.t('nav__采购分析'),
            display:
              canShow({ globalField: !globalStore.otherInfo.cleanFood }) &&
              canShow({ auth: 'get_supply_and_analysis_toc' }),
          },
          {
            link: '/supply_chain/purchase/information',
            name: i18next.t('nav__采购资料'),
            display:
              canShow({ auth: 'get_purchaser_toc' }) ||
              canShow({ auth: 'get_pur_spec_toc' }),
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
            display: canShow({ auth: 'get_sorting_schedule_toc' }),
          },
          {
            link: '/supply_chain/sorting/detail',
            name: i18next.t('nav__分拣明细'),
            display: canShow({ auth: 'get_sorting_detail_toc' }),
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
            display: canShow({ auth: 'get_distribute_task_toc' }),
          },
          {
            link: '/supply_chain/distribute/control_center',
            name: i18next.t('nav__调度中心'),
            display: canShow({ auth: 'get_distribute_center_tab_toc' }),
          },
          {
            link: '/supply_chain/distribute/driver_manage',
            name: i18next.t('nav__司机管理'),
            display: canShow({ auth: 'get_distribute_center_toc' }),
          },
          {
            link: '/supply_chain/distribute/self_lifting',
            name: i18next.t('nav__自提点'),
            display: canShow({ auth: 'get_pick_up_station_toc' }),
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
            display: canShow({ auth: 'get_in_stock_toc' }),
          },
          {
            link: '/sales_invoicing/stock_in/return',
            name: i18next.t('nav__商户退货入库'),
            display: canShow({ auth: 'get_customer_return_stock_toc' }),
          },
          {
            link: '/sales_invoicing/stock_in/adjust_sheet',
            name: i18next.t('nav__入库调整单'),
            display: canShow({ auth: 'edit_in_stock_adjust_toc' }),
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
            display: canShow({ auth: 'get_out_stock_toc' }),
          },
          {
            link: '/sales_invoicing/stock_out/refund',
            name: i18next.t('nav__采购退货'),
            display: canShow({ auth: 'get_return_stock_toc' }),
          },
          {
            link: '/sales_invoicing/stock_out/adjust_record',
            name: i18next.t('nav__出库调整记录'),
            display: canShow({ auth: 'get_out_stock_adjust_toc' }),
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
            display: canShow({ auth: 'get_inner_transfer_sheet_toc' }),
          },
          {
            link: '/sales_invoicing/warehouse/inventory_transfer_record',
            name: i18next.t('nav__移库记录'),
            display: canShow({ auth: 'get_inner_transfer_log_toc' }),
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
            display: canShow({ auth: 'get_split_sheet_toc' }),
          },
          {
            link: '/sales_invoicing/processing_division/loss_report',
            name: i18next.t('nav__损耗报表'),
            display: canShow({ auth: 'get_split_loss_toc' }),
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
            display: canShow({ auth: 'get_check_spu_toc' }),
          },
          {
            link: '/sales_invoicing/inventory/account',
            name: i18next.t('nav__商品台账'),
            display: canShow({ auth: 'get_check_spu_toc' }),
          },
          {
            link: '/sales_invoicing/inventory/summary',
            name: i18next.t('nav__出入库汇总'),
            display:
              canShow({ auth: 'get_out_stock_summary_toc' }) &&
              canShow({ auth: 'get_in_stock_summary_toc' }),
          },
          {
            link: '/sales_invoicing/inventory/record',
            name: i18next.t('nav__出入库明细'),
            display: canShow({ auth: 'get_stock_change_record_toc' }),
          },
          {
            link: '/sales_invoicing/inventory/report_value',
            name: i18next.t('nav__货值成本表'),
            display: canShow({ auth: 'get_stock_value_toc' }),
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
            display: canShow({ auth: 'get_settle_review_toc' }),
          },
          {
            link: '/sales_invoicing/finance/payment_total_accounts',
            name: i18next.t('nav__应付总账'),
            display: canShow({ auth: 'get_settle_statistics_toc' }),
          },
          {
            link: '/sales_invoicing/finance/payment_accounts_detail',
            name: i18next.t('nav__应付明细账'),
            display: canShow({ auth: 'get_detail_settle_statistics_toc' }),
          },
          {
            link: '/sales_invoicing/finance/payment_perform_sheet',
            name: i18next.t('nav__付款执行表'),
            display: canShow({ auth: 'get_settle_verification_toc' }),
          },
        ],
      },
      {
        name: i18next.t('nav__基础资料'),
        link: '/sales_invoicing/base',
        sub: [
          {
            link: '/sales_invoicing/base/supplier',
            name: i18next.t('nav__供应商列表'),
            display: canShow({ auth: 'get_settle_supplier_toc' }),
          },
          // c端暂时屏蔽掉
          // {
          //   link: '/sales_invoicing/base/tax_rate',
          //   name: i18next.t('nav__进项税率规则'),
          // },
          {
            link: '/sales_invoicing/base/cargo_location_management',
            name: i18next.t('nav__货位管理'),
            display: canShow({ auth: 'get_shelf_toc' }),
          },
          {
            link: '/sales_invoicing/base/split_scheme',
            name: i18next.t('nav__分割方案'),
            display: canShow({ auth: 'get_split_plan_toc' }),
          },
        ],
      },
    ],
    display: canShow({ globalField: !globalStore.isCenterSaller() }),
  },
  {
    link: '/c_retail',
    name: i18next.t('nav__报表'),
    icon: <SVGReport />,
    sub: [
      {
        name: i18next.t('nav__报表'),
        link: '/c_retail/report',
        sub: [
          {
            link: '/c_retail/report/detail',
            name: i18next.t('nav__运营报表'),
            display: canShow({ auth: 'view_operation_report_toc' }),
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
            display: canShow({ auth: 'get_freight_toc' }),
          },
          {
            link: '/system/setting/system_setting',
            name: i18next.t('nav__系统设置'),
            display: canShow({
              eitherAuth: [
                'get_merchandise_setting_toc',
                'get_sorting_setting_toc',
                'get_distribute_setting_toc',
                'get_stock_setting_toc',
                'get_cast_setting_toc',
                'get_process_setting_toc',
              ],
            }),
          },
          {
            link: '/system/setting/custom_page',
            name: i18next.t('nav__店铺运营'),
            display: canShow({ auth: 'get_shop_setting_toc' }),
          },
          {
            link: '/system/setting/distribute_templete',
            name: i18next.t('nav__系统模板'),
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
            display: canShow({ auth: 'get_sms_manage_toc' }),
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
            display: canShow({ auth: 'view_op_log_toc' }),
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
            display: canShow({ auth: 'edit_toc_mp_toc' }),
          },
        ],
      },
    ],
  },
]

export default navConfig
