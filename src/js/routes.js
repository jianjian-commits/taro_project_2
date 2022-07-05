import { i18next } from 'gm-i18n'
import React from 'react'
import { connect } from 'react-redux'
import { HashRouter as Router, Route, Redirect, Switch } from 'react-router-dom'
import globalStore from './stores/global'
import App from './app'
import Loadable from 'react-loadable'
import { getNavConfig } from './navigation'
import _ from 'lodash'
import { reportDingtalk, history, System } from './common/service'
import { processReactRouterProps } from '@gm-common/router'
import { LayoutRoot, Flex, Button } from '@gmfe/react'
import logo from 'img/404.png'
import { guid } from './common/util'

const NoMatch = () => (
  <Flex column alignCenter style={{ paddingTop: '160px' }}>
    <img
      src={logo}
      style={{
        maxHeight: '160px',
        maxWidth: '160px',
      }}
    />
    <div className='gm-gap-20' />
    <p className='gm-margin-bottom-10 gm-text-desc'>
      {i18next.t('您好！检测到您已切换UI版本，请点击回到首页后再次进入。')}
    </p>
    <Button type='primary' onClick={() => history.push('/home')}>
      {i18next.t('回到首页')}
    </Button>
  </Flex>
)

const Loading = ({ isLoading, error }) => {
  if (isLoading) {
    return <div className='text-center gm-padding-20'>加载中...</div>
  } else if (error) {
    const traceId = guid()
    // // 资源错误上报钉钉
    reportDingtalk(
      'cdn_exception_station',
      '资源错误',
      [{ title: 'error', text: error.stack }],
      traceId,
    )
    return (
      <div style={{ height: '100vh', paddingTop: '150px' }}>
        <div
          style={{
            width: 'max-content',
            padding: '30px 20px',
            margin: 'auto',
          }}
          className='gm-border text-center gm-text-14 gm-bg'
        >
          <p>
            {i18next.t('当前cdn资源存在错误，错误代码：')}
            <span style={{ color: '#56a3f2' }}>{traceId}</span>
            <br />
            {i18next.t(
              '请尝试更换谷歌浏览器使用，如仍有问题，请截屏错误信息联系售后团队',
            )}
          </p>
        </div>
      </div>
    )
  } else {
    return null
  }
}

const stateAndReactRouteHOC = (WrappedComponent) => {
  return connect((state, ownProps) => {
    return {
      ...state,
      ...processReactRouterProps(ownProps),
    }
  })(WrappedComponent)
}

// ma or station点击ma整个模块的入口时，则跳转到此模块有权限的links
const renderTo = (link) => {
  const oneSub = _.find(getNavConfig(), (v) => _.startsWith(link, v.link))

  if (oneSub) {
    // 如果link能匹配二级菜单，则跳转到该二级菜单下第一个有权限的页面，也就是twoSub[0].sub[0].link
    // 否则就跳转到一级目录下第一个有权限的页面，也就是oneSub.sub[0].sub[0].link
    const twoSub = _.filter(oneSub.sub, (v) => v.link === link)

    if (twoSub.length) {
      return () => <Redirect to={twoSub[0].sub[0].link} />
    } else {
      return () => <Redirect to={oneSub.sub[0].sub[0].link} />
    }
  }
}

const bc_c_urls = _.map(System.config, (v, k) => k)
const req = require.context('../js', true, /\.page\.js$/, 'lazy')
const bc_c_routesList = []
let routesList = _.filter(
  _.map(req.keys(), (key) => {
    let path = key.slice(1, -8) // ./home/index.page.js => /home/index

    if (path.endsWith('/index')) {
      path = path.slice(0, -6)
    }

    // 自动构建 bc c 的路由
    const item = _.find(bc_c_urls, (v) => path.startsWith(v))
    if (item) {
      bc_c_routesList.push({
        path: path.replace(item, System.config[item]),
        loader: () => Promise.resolve(req(key)),
      })
    }

    return {
      path,
      loader: () => Promise.resolve(req(key)),
    }
  }),
  (v) => !!v,
)
routesList = routesList.concat(bc_c_routesList)

const oRouteList = [
  { path: '/demo', loader: () => import('./demo') },

  // 登录脱离任何一个业务
  { path: '/login', loader: () => import('./login') },
]

const oneTwo = []
_.each(getNavConfig(), (one) => {
  oneTwo.push({
    path: one.link,
    render: () => renderTo(one.link),
  })
  _.each(one.sub, (two) => {
    oneTwo.push({
      path: two.link,
      render: () => renderTo(two.link),
    })
  })
})

const appRouteList = [
  // 页面登录进来后，首页根据账号or登录设备不一样而展现不同页面
  { path: '/(|home_page)/', render: () => toHome() },

  ...oneTwo,

  // 首页投屏
  {
    path: '/home/old/full_screen',
    loader: () => import('./home/old/full_screen'),
  },
  // 商品
  // {
  //   path: '/merchandise/manage/sale/batch',
  //   loader: () => import('./merchandise/sale/batch_new/batch_new_salemenu'),
  // },
  // {
  //   path: '/merchandise/manage/sale/batch_categories',
  //   loader: () => import('./merchandise/sale/batch_new/batch_new_categories'),
  // },
  // {
  //   path: '/merchandise/manage/sale/batch_sales',
  //   loader: () => import('./merchandise/sale/batch_new/batch_new_sale'),
  // },
  {
    path: '/merchandise/manage/sale/create',
    loader: () => import('./merchandise/sku_detail/sku_create'),
  },
  {
    path: '/merchandise/manage/sale/stock_detail',
    loader: () => import('./merchandise/sale/stock/stock_detail'),
  },
  {
    path: '/merchandise/manage/sale/detail',
    loader: () => import('./merchandise/sku_detail/sku_detail'),
  },

  // 商品-商品库索引
  {
    path: '/merchandise/manage/list/detail',
    loader: () => import('./merchandise/sku_detail/sku_detail'),
  },

  // 供应链-采购任务
  {
    path: '/supply_chain/purchase/task',
    loader: () => import('./store_operation/purchase_task/index'),
  },
  {
    path: '/supply_chain/purchase/task/history',
    loader: () => import('./store_operation/purchase_task/history_data/index'),
  },
  {
    path: '/supply_chain/purchase/task/print',
    loader: () => import('./store_operation/purchase_task/print'),
  },
  {
    path: '/supply_chain/purchase/task/batch_modify_retry',
    loader: () =>
      import('./store_operation/purchase_task/batch_modify_retry/index'),
  },
  {
    path: '/supply_chain/purchase/task/batch_create_specs',
    loader: () => import('./store_operation/purchase_task/batch_create_specs'),
  },
  {
    path: '/supply_chain/purchase/task/batch_create_item',
    loader: () => import('./store_operation/purchase_task/batch_create_item'),
  },

  // 供应链-采购总览
  {
    path: '/supply_chain/purchase/overview',
    loader: () => import('./store_operation/purchase_overview/index'),
  },
  // 供应链-采购总览-全屏模式
  {
    path: '/supply_chain/purchase/overview/full_screen',
    loader: () =>
      import(
        './store_operation/purchase_overview/purchase_overview/full_screen'
      ),
  },
  // 供应链-采购员绩效-全屏模式
  {
    path: '/supply_chain/purchase/performance/full_screen',
    loader: () =>
      import(
        './store_operation/purchase_overview/purchaser_rank/performance_full_screen'
      ),
  },
  // 供应链-采购分析
  {
    path: '/supply_chain/purchase/analysis',
    loader: () => import('./store_operation/purchase_analysis/index'),
  },
  // 供应链-采购资料
  {
    path: '/supply_chain/purchase/information',
    loader: () =>
      import('./store_operation/purchase_task/purchasing_information/index'),
  },
  {
    path: '/supply_chain/purchase/information/import_quotation',
    loader: () => import('./finance/supplier/import_quotation/quotation_batch'),
  },
  {
    path: '/supply_chain/purchase/information/spec_batch_modify',
    loader: () => import('./finance/supplier/spec_batch_modify/spec_batch'),
  },
  // 供应链-采购员
  {
    path: '/supply_chain/purchase/information/buyer',
    loader: () => import('./store_operation/purchase_task/purchase_sourcer'),
  },
  {
    path: '/supply_chain/purchase/information/buyer/create',
    loader: () =>
      import('./store_operation/purchase_task/purchase_sourcer_detail'),
  },
  {
    path: '/supply_chain/purchase/information/buyer/:id',
    loader: () =>
      import('./store_operation/purchase_task/purchase_sourcer_detail'),
  },

  // 供应链-要货单据
  {
    path: '/supply_chain/purchase/require_goods',
    loader: () => import('./store_operation/require_goods_bill/index'),
  },
  {
    path: '/supply_chain/purchase/require_goods/print',
    loader: () => import('./store_operation/require_goods_bill/print'),
  },
  {
    path: '/supply_chain/purchase/require_goods/:id',
    loader: () => import('./store_operation/require_goods_bill/detail'),
  },

  // 供应链-询价记录
  // {
  //   path: '/supply_chain/purchase/log',
  //   loader: () => import('./store_operation/purchase_task/quotation_log')
  // },

  // 供应链-拣货任务
  {
    path: '/supply_chain/picking/task',
    loader: () => import('./supply_chain/picking/task'),
  },
  {
    path: '/printer/picking/task',
    loader: () => import('./supply_chain/picking/printer'),
  },
  // 供应链-分拣任务
  {
    path: '/supply_chain/sorting/schedule',
    loader: () => import('./store_operation/sorting/schedule'),
  },
  {
    path: '/supply_chain/sorting/schedule/full_screen',
    loader: () => import('./store_operation/sorting/schedule/full_screen'),
  },
  // 分拣员绩效全屏
  {
    path: '/supply_chain/sorting/performance/full_screen',
    loader: () =>
      import(
        './store_operation/sorting/schedule/sorter_rank/performance_full_screen'
      ),
  },
  {
    path: '/supply_chain/sorting/detail',
    loader: () => import('./store_operation/sorting/detail'),
  },
  {
    path: '/supply_chain/sorting/task/sorting_old',
    loader: () => import('./store_operation/sorting/sorting.old'),
  },
  {
    path: '/supply_chain/sorting/task/sorting_list',
    loader: () => import('./store_operation/sorting/sorting.list'),
  },
  // 供应链-分拣员
  {
    path: '/supply_chain/sorting/method/sorter/detail/:user_id',
    loader: () => import('./store_operation/sort_data/sorter/edit'),
  },
  // 供应链-分拣方式
  {
    path: '/supply_chain/sorting/method',
    // loader: () => import('./store_operation/sort_setting/index'),
    loader: () => import('./store_operation/sort_data'),
  },
  // 供应链-分拣绩效
  {
    path: '/supply_chain/sorting/performance',
    loader: () => import('./store_operation/sort_performance'),
  },
  // 供应链-分拣绩效打印
  {
    path: '/supply_chain/sorting/performance/print',
    loader: () => import('./store_operation/sort_performance/print'),
  },
  // 供应链-绩效规则设置
  {
    path: '/supply_chain/sorting/rule_setting_of_performance',
    loader: () => import('./store_operation/performance_rule_setting'),
  },
  // 供应链-配送任务
  {
    path: '/supply_chain/distribute/task',
    loader: () => import('./store_operation/distribute/index'),
  },
  {
    path: '/supply_chain/distribute/task/edit_log',
    loader: () => import('./store_operation/distribute/edit_log'),
  }, // 老配送单编辑
  {
    path: '/supply_chain/distribute/task/delivery_log',
    loader: () => import('./store_operation/distribute/delivery_log'),
  }, // 新配送单编辑
  {
    path: '/supply_chain/distribute/task/edit_distribute',
    loader: () => import('./distribute_template/edit_print_distribute'),
  },

  {
    path: '/supply_chain/distribute/driver_manage',
    loader: () => import('./store_operation/driver_manage'),
  },
  // 新建司机
  {
    path: '/supply_chain/distribute/driver_manage/create_driver',
    loader: () => import('./store_operation/driver_manage/create_driver'),
  },
  // 编辑司机
  {
    path: '/supply_chain/distribute/driver_manage/edit_driver',
    loader: () => import('./store_operation/driver_manage/edit_driver'),
  },
  {
    path: '/supply_chain/distribute/self_lifting',
    loader: () => import('./self_lifting'),
  },
  {
    path: '/supply_chain/distribute/self_lifting/create',
    loader: () => import('./self_lifting/create'),
  },
  {
    path: '/supply_chain/distribute/self_lifting/detail',
    loader: () => import('./self_lifting/detail'),
  },

  // 进销存
  // 进销存-入库
  // 进销存-净菜(入库列表页路由由净菜控制)
  {
    path: '/sales_invoicing/stock_in/product/add/:id',
    loader: () => import('./product/in_stock/add'),
  },
  {
    path: '/sales_invoicing/stock_in/product/create',
    loader: () => import('./sales_invoicing/stock_in/product/create'),
  },
  {
    path: '/sales_invoicing/stock_in/product/detail',
    loader: () => import('./sales_invoicing/stock_in/product/detail'),
  },
  {
    path: '/sales_invoicing/stock_in/product/batch_import',
    loader: () => import('./product/in_stock/batch_import'),
  },
  // 进销存-入库-入库调整单
  {
    path: '/sales_invoicing/stock_in/adjust_sheet',
    loader: () => import('./product/adjustment_sheet'),
  },
  {
    path: '/sales_invoicing/stock_in/adjust_sheet/detail',
    loader: () => import('./product/adjustment_sheet/detail'),
  },

  // 进销存-商户退货入库
  {
    path: '/sales_invoicing/stock_in/return',
    loader: () => import('./store_operation/return_manage/index'),
  },

  // 进销存-出库
  {
    path: '/sales_invoicing/stock_out/product',
    loader: () => import('./sales_invoicing/stock_out/product'),
  },
  {
    path: '/sales_invoicing/stock_out/product/pre_add',
    loader: () => import('./sales_invoicing/stock_out/product/pre_add'),
  },
  {
    path: '/sales_invoicing/stock_out/adjust_record',
    loader: () => import('./product/out_stock_adjustment_record'),
  },
  {
    path: '/sales_invoicing/stock_out/adjust_record/detail',
    loader: () => import('./product/out_stock_adjustment_record/detail'),
  },

  // 进销存-供应商退货出库
  {
    path: '/sales_invoicing/stock_out/refund',
    loader: () => import('./product/refund'),
  },
  {
    path: '/sales_invoicing/stock_out/refund/pre_add/:operate',
    loader: () => import('./product/supplier_select'),
  },
  {
    path: '/sales_invoicing/stock_out/refund/add',
    loader: () => import('./product/refund_add'),
  },
  {
    path: '/sales_invoicing/stock_out/refund/add/:id',
    loader: () => import('./product/refund_add'),
  },
  {
    path: '/sales_invoicing/stock_out/refund/detail/:id',
    loader: () => import('./product/refund/refund_stock_detail'),
  },
  {
    path: '/sales_invoicing/stock_out/refund/batch_import',
    loader: () => import('./product/refund/refund_stock_batch_import'),
  },
  {
    path: '/sales_invoicing/stock_out/refund/print',
    loader: () => import('./product/refund/refund_stock_print'),
  },

  // 进销存-盘点
  {
    path: '/sales_invoicing/inventory/product',
    loader: () => import('./product/inventory/inventory'),
  },
  {
    path: '/sales_invoicing/inventory/product/supply',
    loader: () => import('./product/inventory/supply_inventory'),
  },
  {
    path: '/sales_invoicing/inventory/product/batch',
    loader: () => import('./product/inventory/batch_inventory'),
  },
  {
    path: '/sales_invoicing/inventory/product/cost_detail',
    loader: () => import('./product/inventory/cost_detail'),
  },
  {
    path: '/sales_invoicing/inventory/product/change_record',
    loader: () => import('./product/inventory/change_record'),
  },
  // 商品台账
  {
    path: '/sales_invoicing/inventory/account',
    loader: () => import('./product/inventory/spu_detail/index.js'),
  },
  {
    path: '/sales_invoicing/inventory/account/details',
    loader: () => import('./product/inventory/spu_detail/index.js'),
  },
  // 出入库汇总
  {
    path: '/sales_invoicing/inventory/summary',
    loader: () => import('./product/inventory/summary'),
  },

  {
    path: '/sales_invoicing/inventory/report_value',
    loader: () => import('./report/index'),
  },
  {
    path: '/sales_invoicing/inventory/product/pending/inventory',
    loader: () => import('./product/inventory/batch_report_overflow_lost'),
  },
  {
    path: '/sales_invoicing/inventory/product/error/show',
    loader: () => import('./product/inventory/inventory_error_list'),
  },
  {
    path: '/sales_invoicing/inventory/merchant_goods',
    loader: () => import('./product/inventory/merchant_goods/list'),
  },
  {
    path: '/sales_invoicing/inventory/merchant_goods/detail',
    loader: () => import('./product/inventory/merchant_goods/detail'),
  },

  // 进销存-仓库管理
  {
    path:
      '/sales_invoicing/warehouse/transfer_inside_warehouse/inventory_transfer_list/new_transfer_receipt',
    loader: () =>
      import(
        './sales_invoicing/warehouse/transfer_inside_warehouse/inventory_transfer_list/new_transfer_receipt'
      ),
  },
  {
    path:
      '/sales_invoicing/warehouse/transfer_inside_warehouse/inventory_transfer_list/transfer_receipt_detail',
    loader: () =>
      import(
        './sales_invoicing/warehouse/transfer_inside_warehouse/inventory_transfer_list/transfer_receipt_detail'
      ),
  },
  {
    path: '/sales_invoicing/warehouse/inventory_transfer_record',
    loader: () =>
      import('./sales_invoicing/warehouse/inventory_transfer_record'),
  },

  // 进销存-财务核算
  {
    path: '/sales_invoicing/finance/payment_review',
    loader: () => import('./finance/payment_review'),
  },
  {
    path: '/sales_invoicing/finance/payment_review/:id',
    loader: () => import('./finance/payment_review/settle_sheet_detail'),
  },
  {
    path: '/sales_invoicing/finance/report',
    loader: () => import('./report/unpay_report'),
  },
  {
    path: '/sales_invoicing/finance/print/:id',
    loader: () => import('./finance/payment_review/settle_sheet_print'),
  },
  {
    path: '/sales_invoicing/finance/payment_total_accounts',
    loader: () => import('./finance/payment_total_accounts'),
  },
  {
    path: '/sales_invoicing/finance/payment_accounts_detail',
    loader: () => import('./finance/payment_accounts_detail'),
  },
  {
    path: '/sales_invoicing/finance/payment_accounts_detail/detail',
    loader: () => import('./finance/payment_accounts_detail'),
  },
  {
    path: '/sales_invoicing/finance/payment_perform_sheet',
    loader: () => import('./finance/payment_perform_sheet'),
  },

  // 进销存-基础资料
  {
    path: '/sales_invoicing/base/supplier',
    loader: () => import('./finance/supplier/list'),
  },
  {
    path: '/sales_invoicing/base/supplier/supplier_info',
    loader: () => import('./finance/supplier/supplier_info'),
  },
  {
    path: '/sales_invoicing/base/supplier/batch_import',
    loader: () => import('./finance/supplier/batch_import'),
  },

  // {
  //   path: '/sales_invoicing/base/supplier/purchase_specification_manage',
  //   loader: () => import('./finance/supplier/purchase_specification/list'),
  // },
  {
    path: '/sales_invoicing/base/supplier/purchase_specification_print',
    loader: () => import('./finance/supplier/purchase_specification/print'),
  },
  {
    path: '/sales_invoicing/base/supplier/quotation_error_list',
    loader: () => import('./finance/supplier/quotation_error_list/index'),
  },
  {
    path: '/sales_invoicing/base/cargo_location_management',
    loader: () => import('./product/cargo_location_management'),
  },
  // 供应链 - 周转物管理
  {
    path: '/supply_chain/material_manage/list',
    loader: () => import('./material_manage/list'),
  },
  {
    path: '/supply_chain/material_manage/record',
    loader: () => import('./material_manage/record'),
  },
  {
    path: '/supply_chain/material_manage/record/in_record/create',
    loader: () => import('./material_manage/record/in_record/create'),
  },
  {
    path: '/supply_chain/material_manage/record/out_record/create',
    loader: () => import('./material_manage/record/out_record/create'),
  },
  {
    path: '/supply_chain/material_manage/customer/list',
    loader: () => import('./material_manage/customer/list'),
  },
  {
    path: '/supply_chain/material_manage/customer/list/detail',
    loader: () => import('./material_manage/customer/detail'),
  },
  {
    path: '/supply_chain/material_manage/deposit_review',
    loader: () => import('./material_manage/deposit_review'),
  },

  // 系统-汇率设置
  { path: '/system/setting/rate', loader: () => import('./rate_setting') },

  // 系统-打印模板设置
  {
    path: '/system/setting/distribute_templete',
    loader: () => import('./printer/index'),
  },
  {
    path: '/system/setting/distribute_templete/add',
    loader: () => import('./distribute_template/add_template'),
  },
  {
    path: '/system/setting/distribute_templete/detail',
    loader: () => import('./distribute_template/edit_template'),
  },
  {
    path: '/system/setting/distribute_templete/print',
    loader: () => import('./distribute_template/print'),
  },
  {
    path: '/system/setting/distribute_templete/print_preview_template',
    loader: () => import('./distribute_template/preview_template'),
  },
  {
    path: '/system/setting/distribute_templete/print_edited_distribute',
    loader: () => import('./distribute_template/print_edited_distribute'),
  },
  {
    path: '/system/setting/distribute_templete/malay_print',
    loader: () => import('./malay_print/index'),
  },

  // 新打印
  {
    path: '/system/setting/distribute_templete/order_printer',
    loader: () => import('./printer/index'),
  },
  {
    path: '/system/setting/distribute_templete/label_setting',
    loader: () => import('./printer/label/setting/index'),
  },
  {
    path: '/system/setting/distribute_templete/label_editor',
    loader: () => import('./printer/label/edit/index'),
  },
  {
    path: '/system/setting/label/print',
    loader: () => import('./printer/label/print'),
  },
  {
    path: '/system/setting/order_printer/template_editor',
    loader: () => import('./printer/order_printer/tem_editor/index'),
  },
  {
    path: '/system/setting/account_printer/template_editor',
    loader: () => import('./printer/account_printer/tem_editor/index'),
  },
  {
    path: '/system/setting/order_printer/print',
    loader: () => import('./printer/order_printer/print/index'),
  },
  {
    path: '/system/setting/finance_voucher_printer/print',
    loader: () => import('./printer/finance_voucher_printer/print/index'),
  },
  {
    path: '/system/setting/account_printer/print',
    loader: () => import('./printer/account_printer/print/index'),
  },
  {
    path: '/system/setting/order_printer/print_sid_detail2',
    loader: () =>
      import(
        './store_operation/distribute/order_tab/components/kid_printer_two'
      ),
  },
  {
    path: '/system/setting/distribute_templete/purchase_editor',
    loader: () => import('./printer/purchase_printer/tem_editor'),
  },
  {
    path: '/system/setting/distribute_templete/purchase_printer',
    loader: () => import('./printer/purchase_printer/print'),
  },
  {
    path: '/system/setting/distribute_templete/stockin_editor',
    loader: () => import('./printer/stockin_printer/tem_editor'),
  },
  {
    path: '/system/setting/distribute_templete/stockin_printer',
    loader: () => import('./printer/stockin_printer/print'),
  },
  {
    path: '/system/setting/distribute_templete/stockout_editor',
    loader: () => import('./printer/stockout_printer/tem_editor'),
  },
  {
    path: '/system/setting/distribute_templete/stockout_printer',
    loader: () => import('./printer/stockout_printer/print'),
  },
  {
    path: '/system/setting/distribute_templete/settle_editor',
    loader: () => import('./printer/settle_printer/tem_editor'),
  },
  {
    path: '/system/setting/distribute_templete/settle_printer',
    loader: () => import('./printer/settle_printer/print'),
  },

  {
    path: '/system/setting/distribute_templete/order_batch',
    loader: () => import('./order_template/edit'),
  },
  {
    path: '/system/setting/distribute_templete/quotation_batch',
    loader: () => import('./quotation_import_template/edit'),
  },
  {
    path: '/system/setting/distribute_templete/thermal_printer',
    loader: () => import('./printer/thermal_printer/print'),
  },

  {
    path: '/system/setting/distribute_templete/box_label_editor',
    loader: () => import('./printer/box_label/edit/index'),
  },
  {
    path: '/system/setting/distribute_templete/box_label_setting',
    loader: () => import('./printer/box_label/setting/index'),
  },
  {
    path: '/system/setting/distribute_templete/box_label_printer',
    loader: () => import('./printer/box_label/print/index'),
  },
  {
    path: '/system/setting/distribute_templete/commander_task_printer',
    loader: () => import('./printer/commander_printer/print'),
  },
  {
    path: '/system/setting/distribute_templete/pre_sort_editor',
    loader: () => import('./printer/pre_sort_label/tem_editor'),
  },
  {
    path: '/system/setting/distribute_templete/salemenus_editor',
    loader: () => import('./printer/salemenus_printer/tem_editor'),
  },
  {
    path: '/system/setting/distribute_templete/salemenus_printer',
    loader: () => import('./printer/salemenus_printer/print'),
  },
  // 团长结算里的余额流水
  {
    path: '/c_commander/settlement/balance_flow',
    loader: () => import('./c_commander/settlement/balance_flow'),
  },
]

const toHome = () => {
  const isViewHomePage = globalStore.hasPermission('view_home_page')

  if (isViewHomePage) {
    return () => <Redirect to='/home' />
  } else if (globalStore.otherInfo.isFqt) {
    return () => <Redirect to='/fqt' />
  } else if (globalStore.isSettleSupply()) {
    return () => <Redirect to='/supply_chain/purchase/task' />
  } else {
    return () => <Redirect to={getNavConfig()[0].sub[0].sub[0].link} />
  }
}

const oRouters = _.map(oRouteList, ({ path, loader }) => (
  <Route
    key={path}
    path={path}
    component={stateAndReactRouteHOC(
      Loadable({
        loader,
        loading: Loading,
      }),
    )}
  />
))

const routes = _.map(
  appRouteList.concat(routesList),
  ({ path, loader, render }) => {
    if (render) {
      return <Route key={path} exact path={path} render={render()} />
    } else {
      return (
        <Route
          key={path}
          exact
          path={path}
          component={stateAndReactRouteHOC(
            Loadable({
              loader,
              loading: Loading,
            }),
          )}
        />
      )
    }
  },
)

const AppRoute = () => (
  <App>
    <Switch>
      {routes}
      <Route exact component={NoMatch} />
    </Switch>
  </App>
)

const RouteConfig = () => (
  <Router>
    <Switch>
      {oRouters}
      <Route path='/' component={AppRoute} />
    </Switch>
    <LayoutRoot />
  </Router>
)

export default RouteConfig
