import { observable, action, runInAction, computed } from 'mobx'
import { getStaticStorage } from 'gm_static_storage'
import { Request } from '@gm-common/request'
import { Storage } from '@gmfe/react'
import moment from 'moment'
import { System } from '../common/service'
import {
  COMPONENT_TYPE_SELECT,
  CONFIG_ORDER_DETAIL,
  CONFIG_ORDER_HEADER,
} from '../common/enum'
import _ from 'lodash'

/* eslint-disable */
const user = Object.assign(
  {
    permission: [],
  },
  window.g_user || {},
  { userId: '' },
)

// 可打点测试账号
const whiteList = [3578, 3585]

const groupId = window.g_group_id || 0
const otherInfo = {
  authority: window.g_authority || {},
  cleanFood: !!window.g_clean_food,

  // 该字段代表C站点 -- 1-b+c/b, 2-纯c
  isCStation: window.g_is_c_station === 2,

  isFqt: !!window.g_is_fqt,
  isStaff: !!window.g_is_staff,

  showOrderRemark: !!window.g_show_order_remark,
  /** 税额展示 */
  showTaxRate: !!window.g_show_tax_rate,
  // 是否显示价格区间
  showSuggestPrice: !!window.g_show_suggest_price,
  /** 同步时价商品 */
  syncPriceTiming: !!window.g_sync_price_timing,
  /** 商品ID展现方式 */
  showSkuOuterId: !!window.g_show_sku_outer_id,
  /** 商品公式定价精确度 0-取整，1保留一位，2-保留两位，默认保留两位 */
  formulaPricePrecision: window.g_formula_price_precision,
  /** 商品公式定价取舍方法 0-四舍五入，1-向上取整，2-向下取整，默认四舍五入 */
  formulaPriceRoundingType: window.g_formula_price_rounding_type,
  batchInStock: !!window.g_batch_in_stock,
  inStockPriceWarning: window.g_in_stock_price_warning, // 入库单价预警维度
  defaultSettleWay: window.g_default_settle_way,
  generateSortNumRule: window.g_generate_sort_num_rule,
  generateSortNumRuleClassification:
    window.g_generate_sort_num_rule_classification,
  purchaseSheetRefPrice: window.g_purchase_sheet_ref_price, // 采购单价默认值
  inStockRefPrice: window.g_in_stock_ref_price, // 入库单价默认值
  showResCustomCode: window.g_show_res_custom_code, // 是否展示商户自定义编码  0不展示 1展示
  isNegativeAllow: 1, // 负库存是否允许出库，0不允许，1允许，默认1
  isBshopNewUI: window.g_bshop_new_ui, // 是否展示bshop新UI
  autoSelectBatch: 0, // 出库单自动推荐出库批次出库数，只有先进先出站点返回\
  select_batch_method: 1,
}
const purchaseInfo = window.g_supplier_data
// 订单设置
const orderInfo = {
  // 采用的是哪种采购方式 0自动进入采购任务 1手动进入采购任务
  orderCreatePurchaseTask: window.g_order_create_purchase_task,
  orderProcess: [],
  // 订单中是否允许同种商品可以拆分下单 0不允许 1允许
  orderCanHaveDuplicateSku: 0,
  // 订单合单后，运费计算规则， 0:更新，1:不更新运费
  recalculateFreight: 0,
  // 变化率
  contract_rate_format: 1,
  // 是否开启自动签收
  order_auto_sign: 0,
  // 自动签收天数
  auto_sign_days: 7,
  default_spu_remark: 0,
  // 下单后自动打印配送单
  order_auto_print: 0,
}

// 系统设置-净菜加工计划算法配置信息
const initProcessPlanAlgorithmInfo = {
  is_active: 0, // 是否启用算法， 0为不启用
  query_order_type: 1, // 日均下单数设置
  query_order_days: null, // 手动填写的最近下单数，query_order_type === 1时使用
  adjust_ratio: null, // 调整比例
  stock_up_type: 1, // 备货天数类型，1为按手动填写，2为按保质期
  stock_up_days: null, // 手动填写的备货天数，stock_up_type === 1 时使用
  is_deduct_stock: 0, // 是否扣减库存
}
// 加工设置
const initProcessInfo = {
  processPlanAlgorithmInfo: initProcessPlanAlgorithmInfo,
  process_order_suggest_plan_amount_config: 1, // 任务发布时计划生产数默认设置，1 建议计划生产数，2 下单数
}

/* eslint-enable */

const DISABLED_HOME_TIP = 'DISABLED_HOME_TIP_' + user.name
const disabledHomeTip = Storage.get(DISABLED_HOME_TIP) || false
setTimeout(() => {
  Storage.set(DISABLED_HOME_TIP, true)
}, 2000)

class Store {
  @observable
  groupId = groupId

  @observable
  stationId = user.station_id || 0

  // stock_method: 进销存计算方式： 1 加权平均    2 先进先出
  @observable
  user = user

  @observable
  otherInfo = otherInfo

  @observable
  purchaseInfo = purchaseInfo

  @observable
  processInfo = { ...initProcessInfo }

  @observable
  logo = {
    name: '',
    ico: '',
    logo: '',
    logoPure: '',
    hideDocument: true,
    hideApp: true,
  }

  @observable
  breadcrumbs = []

  @observable
  unitName = []

  @observable
  groundWeightInfo = {
    sorting_product_code_type: 1,
    weigh_stock_in: 0, // 地磅入库
    weigh_check: 0, // 地磅盘点
    sorting_edit_lock: 0,
    sale_unit_sort_independence: 0, // 单独记录销售单位的称重数
  }

  // system_setting 司机设置
  @observable
  driverInfo = {
    en_driver_performance: 0,
    en_driver_pic_received: 0,
    distribution_limit: 0,
    distribution_areas: [],
    station_addr: null,
    lat: null,
    lng: null,
  }

  // system_setting 投屏设置
  @observable
  fullScreenInfo = {
    is_set_carousel: 0,
    carousel_interface: [],
    stay_time: null,
  }

  @observable
  measurementUnitList = []

  @observable
  bShop = {
    logo: '',
  }

  @observable
  orderInfo = {
    ...orderInfo,
  }

  // 补录订单价格
  @observable
  orderSupplementPrice = 0

  @observable
  disabledHomeTip = disabledHomeTip

  // 净菜加工计量单位,这里不需要修改子属性，为空对象没有问题
  // eslint-disable-next-line gm-react-app/no-observable-empty-object
  @observable processUnit = {}

  // 零售报价单id
  @observable
  c_salemenu_id = window.g_c_salemenu_id || 'S36718' // eslint-disable-line

  @observable
  customizedConfigs = []

  settingList = []

  @observable
  turnoverInfo = {
    is_turnover_sync: 1,
    is_turnover_deposit: 0,
    turnover_driver_modify: 0,
    turnover_driver_return: 0,
    turnover_driver_loan: 0,
  }

  @observable
  procurement = {
    recommended_purchase_setting: 1,
    ban_generate_multiple_times: 1,
  }

  // 是否为可打点账号
  @observable
  canGio = false

  /**
   * 判断是否为可打点账号
   * @param userType 1-客户，2-内部
   * @param userId 用户id，用来判断内部用户是否在白名单中
   */
  @action
  getGioPermission(groupType, userId) {
    this.canGio =
      groupType !== 2 || (groupType === 2 && whiteList.includes(userId))
  }

  /**
   *  区分tob跟toc的权限判断
   *  纯B站点的权限没有后缀
   *  纯C站点的权限 后缀都是toc_ 即使是共用的进销存和供应链模块的相关权限，后缀也都是toc_[由于历史原因，会返回没有后缀的权限 可以忽略]
   *  如果是B+C站点，B的权限没有前缀，零售模块的权限tob_后缀
   */
  @action
  hasPermission(per) {
    if (this.otherInfo.isCStation) {
      return this.user.permission.includes(per + '_toc')
    }

    // 纯b的或者，b和零售共用的部分权限，如打印配送单，则不加后缀处理
    if (
      System.isB() ||
      _.includes(['get_distribute_print', 'receive_order_remind'], per)
    ) {
      return this.user.permission.includes(per)
    } else if (System.isC()) {
      return this.user.permission.includes(per + '_tob')
    }
  }

  @action
  hasViewTaxRate() {
    return this.hasPermission('get_tax') && this.otherInfo.showTaxRate
  }

  // 是否常规的 station 账号
  @action
  isNormalStation() {
    return (
      !this.isCenterSaller() &&
      !this.isSupply() &&
      !this.isSettleSupply() &&
      !this.isCleanFood() &&
      !this.otherInfo.isFqt
    )
  }

  // TODO 732灰度测试用 753为马来
  @action
  isMalaysia() {
    return [732, 753].includes(this.groupId)
  }

  @action
  isXNN() {
    return [1, 496].includes(this.groupId)
  }

  @action
  isHuaKang() {
    return this.user.custom_fake_bill
  }

  // 绿康源定制 配送单套餐数
  @action
  isLvKangYuan() {
    return [2309, 2315].includes(this.groupId)
  }

  // dqhq定制 配送单折前金额汇总
  @action
  isdqhq() {
    return [356, 2219, 428].includes(this.groupId)
  }

  // 自定义二维码定制分拣标签
  @action
  isDiyqrcode() {
    return [
      599,
      2289,
      1851,
      1,
      1488,
      1139,
      988,
      2748,
      375,
      3083,
      2675,
    ].includes(this.groupId)
  }

  @action
  isNBLA() {
    return this.groupId === 716
  }

  @action
  isCenterSaller() {
    return this.otherInfo.authority.isCenterSaller
  }

  // 杭州喜点科技 客户屏蔽有关观麦字眼的功能
  @action
  isShieldGuanMai() {
    return [1953].includes(this.groupId)
  }

  // 国外站点 1135 因地图不支持国外 屏蔽首页投屏 868灰度测试用
  @action
  isForeign() {
    return [1135, 868].includes(this.groupId)
  }

  // 是供应商
  @action
  isSupply() {
    return this.otherInfo.authority.role === 1
  }

  // 是供应商
  @action
  isSettleSupply() {
    return this.otherInfo.authority.role === 6
  }

  @action
  isCleanFood() {
    return this.otherInfo.cleanFood
  }

  fetchCurrency() {
    return getStaticStorage('/common/currency.json').then((json) => {
      return json[this.groupId] || json.default
    })
  }

  @action
  fetchLogo() {
    return getStaticStorage('/common/logo.json').then(
      action((json) => {
        const id = json.name[this.groupId] ? this.groupId : 'default'

        this.logo = {
          name: json.name[id],
          ico: json.ico[id],
          logo: json.logo[id],
          logoPure: json.logoPure[id],
          hideDocument: json.hideDocument.includes(this.groupId),
          hideApp: json.hideApp.includes(this.groupId),
        }
      }),
    )
  }

  @action
  getGroundWeightInfo() {
    return Request('/station/user')
      .get()
      .then(
        action((res) => {
          const data = res.data.profile
          const {
            is_turnover_sync,
            is_turnover_deposit,
            turnover_driver_modify,
            turnover_driver_return,
            turnover_driver_loan,
          } = data

          const carouselList = this.isForeign()
            ? _.filter(data.carousel_interface, (o) => o !== 1)
            : data.carousel_interface

          this.groundWeightInfo = {
            sorting_product_code_type: data.sorting_product_code_type,
            weigh_stock_in: data.weigh_stock_in,
            weigh_check: data.weigh_check,
            sorting_edit_lock: data.sorting_edit_lock,
            sale_unit_sort_independence: data.sale_unit_sort_independence,
            box_number_rule: data.box_number_rule,
          }
          this.driverInfo = {
            ...this.driverInfo,
            en_driver_pic_received: data.en_driver_pic_received,
            en_driver_performance: data.en_driver_performance,
            distribution_limit: data.distribution_limit,
            distribution_areas: data.distribution_areas,
            delivery_distance: data.delivery_distance,
            station_addr: data.site.station_addr || '',
            lat: data.site.lat || '',
            lng: data.site.lng || '',
          }
          this.otherInfo = {
            ...this.otherInfo,
            isNegativeAllow: data.is_negative_allow,
            autoSelectBatch: data.auto_select_batch ?? 0,
            select_batch_method: data.select_batch_method ?? 1,
            shelf_life_warning: data.shelf_life_warning,
            before_warn_days: data.before_warn_days,
          }
          this.fullScreenInfo = {
            is_set_carousel: data.is_set_carousel,
            carousel_interface: carouselList,
            stay_time: data.stay_time,
          }

          this.turnoverInfo = {
            is_turnover_sync,
            is_turnover_deposit,
            turnover_driver_modify,
            turnover_driver_return,
            turnover_driver_loan,
          }
          // 获取进销存设置中净菜加工计划算法配置
          this.processInfo = {
            order_request_release_amount_type:
              data.order_request_release_amount_type,
            processPlanAlgorithmInfo: {
              ...data.process_order_suggest_plan_amount_config,
            },
          }

          // 订单设置中多sku下单配置
          this.orderInfo = {
            ...this.orderInfo,
            contract_rate_format: data.contract_rate_format,
            orderCanHaveDuplicateSku: data.order_can_have_duplicate_sku,
            recalculateFreight: data.recalculate_freight,
            pf_merge_order: data.pf_merge_order,
            order_auto_sign: data.order_auto_sign || 0,
            auto_sign_days: data.auto_sign_days || 7,
            default_spu_remark: data.default_spu_remark,
            order_auto_print: data.order_auto_print,
          }

          // 当前user id信息
          this.user.userId = res.data.id

          this.procurement.recommended_purchase_setting =
            data.recommended_purchase_setting

          this.procurement.ban_generate_multiple_times =
            data.ban_generate_multiple_times

          // 补录订单价格
          this.orderSupplementPrice = data.order_supplement_price
        }),
      )
  }

  @action
  setBreadcrumbs(breadcrumbs) {
    this.breadcrumbs = breadcrumbs
  }

  @action
  fetchUnitName() {
    const unitName = this.isMalaysia() ? 'en.unit_name.json' : 'unit_name.json'
    getStaticStorage(`/common/${unitName}`)
      .then(
        action((json) => {
          Storage.set('GM_STATION_UNIT_NAME_LIST', json.unitName || [])
          this.unitName = json.unitName || []
        }),
      )
      .catch(() => {
        this.unitName = Storage.get('GM_STATION_UNIT_NAME_LIST') || []
      })
  }

  @action
  setGroundWeightInfo(groundWeightInfo) {
    this.groundWeightInfo = groundWeightInfo
  }

  @action
  fetchMeasurementUnitList() {
    Request('/product/sku/measurement/list')
      .get()
      .then((json) => {
        this.measurementUnitList = json.data
      })
  }

  @action
  fetchProcessUnitList() {
    return Request('/process/process_unit/list')
      .get()
      .then((json) => {
        runInAction(() => {
          this.processUnit = json.data
        })
      })
  }

  @action
  fetchBShop() {
    return Request('/station/customized/simple')
      .get()
      .then(
        action((json) => {
          this.bShop = json.data
        }),
      )
  }

  @action
  getOrderProcessInfo() {
    return Request('/station/order_process/list')
      .get()
      .then(
        action((json) => {
          this.orderInfo = {
            ...this.orderInfo,
            orderProcess: json.data,
          }
        }),
      )
  }

  @action
  isShowHomeTip() {
    const createTime = moment(this.user.create_time)
    const m = moment('2020-03-24 00:00:00')
    if (createTime > m && !this.disabledHomeTip) {
      return true
    }
    return false
  }

  setDisabledHomeTip() {
    this.disabledHomeTip = true
  }

  @action.bound
  fetchCustomizedConfigs() {
    return Request('/station/customized_field/list')
      .get()
      .then((json) => {
        this.customizedConfigs = json.data
        return json
      })
  }

  @action.bound
  fetchPurchaseSettings() {
    return Request('/station/profile/get')
      .get()
      .then((json) => {
        this.settingList = json.data
        return json.data
      })
  }

  @computed
  get customizedInfoConfigs() {
    return this.customizedConfigs.filter(
      (v) => v.object_type === CONFIG_ORDER_HEADER,
    )
  }

  @computed
  get customizedDetailConfigs() {
    return this.customizedConfigs.filter(
      (v) => v.object_type === CONFIG_ORDER_DETAIL,
    )
  }

  @computed
  get customizedSelectConfigs() {
    return this.customizedConfigs.filter(
      (v) => v.field_type === COMPONENT_TYPE_SELECT,
    )
  }
}

export default new Store()
