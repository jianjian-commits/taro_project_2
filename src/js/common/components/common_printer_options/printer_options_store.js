import { observable, action, runInAction, computed } from 'mobx'
import { Request } from '@gm-common/request'
import { withMobxStorage, DBActionStorage } from 'gm-service/src/action_storage'
import ACTION_STORAGE_KEY_NAMES from 'common/action_storage_key_names'
import _ from 'lodash'
import { isVersionSwitcherShow } from 'common/print_log'
import { RightSideModal, Tip } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import { handleCommonOrderPrint } from 'common/components/common_printer_options/util'
import globalStore from 'stores/global'
import { openNewTab } from 'common/util'
import qs from 'query-string'
import { Storage } from '@gmfe/react'

const SELECTOR = [
  'templateId',
  'splitOrderType',
  'kidPrintId',
  'isPrintSid',
  'hidePrinterOptionsModal',
  'to_print_task',
  'to_print_sku',
  'to_print_checklist',
]

@withMobxStorage({
  name: ACTION_STORAGE_KEY_NAMES.COMMON_PRINTER_OPTIONS,
  // 🚀🔥🚀🔥 缓存变量到localeStorage写到这里
  selector: SELECTOR,
})
class PrinterOptionsStore {
  __THERMAL_PRINTER = '__thermal_printer' // 长条单打印比较特殊，他不走自定义模板
  isThermalPrinter = (s) => s === this.__THERMAL_PRINTER

  constructor() {
    isVersionSwitcherShow().then((isShow) => {
      this.isVersionSwitcherShow = isShow
    })
  }

  /** 当前模板 */
  @observable templateId = '-1'
  /** 是否分单打印 */
  @observable splitOrderType = 0
  /** 分单拆分方式 1 一级分类 / 2 二级分类 */
  @observable splitOrderTypeWay = Storage.get('PRINT_SPLIT_ORDER_WAY') || 1
  /** 账户合并配送单据 0汇总商品数量 1展示商户明细 2展示商户明细二 */
  @observable kidMergeType = 0
  /** 账户配送模版id 为2时是客户 */
  @observable kidPrintId = 2
  /** 按商户sid打印 */
  @observable isPrintSid = true
  /** 是否打印 司机任务单 */
  @observable to_print_task = false
  /** 是否打印 司机装车单 */
  @observable to_print_sku = false
  /** 是否打印 分拣核查单 */
  @observable to_print_checklist = false
  /** 是否不再弹出单据模板选择窗口 */
  @observable hidePrinterOptionsModal = false
  /** 自定义分类 是一级还是二级进行分类（默认1级）1 一级分类 / 2 二级分类 */
  @observable diyCategoryToggle = Storage.get('DIY_CATEGORY_TOGGLE') || 1
  /** 分类单抬头是否展示分类后缀名 */
  @observable isCategorySuffix = Storage.get('PRINT_CATEGORY_SUFFIX') ?? true
  // 是否合并打印相同商户订单
  // @observable isSIDMergePrint = Storage.get('SID_MERGE_PRINT') || false
  /** 是否合并打印配送单 */
  @observable isMergePrintDelivery =
    Storage.get('MERGE_PRINT_DELIVERY') || false

  /** 是否合并打印配送单 */
  @observable isZDPrintConfig = Storage.get('ZD_PRINT_CONFIG') || false

  /** 合并打印配送单类型  1---合并打印订单内相同商品  2---合并打印相同商户订单 */
  @observable mergeDeliveryType = Storage.get('MERGE_DELIVERY_TYPE') || 1

  /** 打印类型（整单打印）按商品分类管理顺序打印  1---合并打印订单内相同商品  2---合并打印相同商户订单 */
  @observable categorySort = Storage.get('CATEGORY_SORT') ?? false

  /* --- 🍉上面字段记得做记忆👆 --- */

  /* --- 不需要记忆的字段👇 --- */
  /** 商户模板列表 */
  @observable printTemplateList = []
  /** 账户模板列表 */
  @observable printKidTemplateList = []
  /** 是否展示'切回(新/旧)模板'按钮 */
  @observable isVersionSwitcherShow = true
  /** 配送单版本 1:旧 2:新 */
  @observable templateVersion = 2

  /** 固定一个分类一张单 一级分类 如果打印全部分类存整个分类list */
  @observable category1ListSelected = Storage.get('PRINT_CATEGORY1_LIST') || []
  /** 固定一个分类一张单 二级分类 如果打印全部分类存整个分类list */
  @observable category2ListSelected = Storage.get('PRINT_CATEGORY2_LIST') || []

  @action.bound
  setOptions(key, value) {
    this[key] = value
  }

  @action
  setSplitOrderType(val) {
    this.splitOrderType = val
  }

  @action.bound
  setSplitOrderWay(val) {
    this.splitOrderTypeWay = val
    Storage.set('PRINT_SPLIT_ORDER_WAY', val)
  }

  @action.bound
  setCategorySort(val) {
    this.categorySort = val
    Storage.set('CATEGORY_SORT', val)
  }

  @action.bound
  setDiyCategoryToggle(val) {
    this.diyCategoryToggle = val
    Storage.set('DIY_CATEGORY_TOGGLE', val)
  }

  @action.bound
  setCategorySuffix(val) {
    this.isCategorySuffix = val
    Storage.set('PRINT_CATEGORY_SUFFIX', val)
  }

  @action.bound
  setMergePrintDelivery(val) {
    this.isMergePrintDelivery = val
    Storage.set('MERGE_PRINT_DELIVERY', val)
  }

  @action.bound
  setZDPrintConfig(val) {
    this.isZDPrintConfig = val
    Storage.set('ZD_PRINT_CONFIG', val)
  }

  @action.bound
  setDeliveryMergeType(val) {
    this.mergeDeliveryType = val
    Storage.set('MERGE_DELIVERY_TYPE', val)
  }

  // 同步一下localStorage的数据(浏览器所有tab共享一份数据)
  @action.bound
  syncObservableFromLocalstorage() {
    const storage = DBActionStorage.get(
      ACTION_STORAGE_KEY_NAMES.COMMON_PRINTER_OPTIONS,
    )
    if (storage) {
      SELECTOR.forEach((key) => {
        this[key] = storage[key]
      })
    }
  }

  @action.bound
  changeCategoryList(type, list) {
    switch (type) {
      case 'category1': {
        this.category1ListSelected = list
        Storage.set('PRINT_CATEGORY1_LIST', this.category1ListSelected)
        break
      }
      case 'category2': {
        this.category2ListSelected = list
        Storage.set('PRINT_CATEGORY2_LIST', this.category2ListSelected)
        break
      }
      default:
        break
    }
  }

  @action
  setKidPrintId(val) {
    this.kidPrintId = val
  }

  @computed
  get isOldVersion() {
    return this.templateVersion === 1
  }

  getURLBaseOnVersion = () => {
    return this.isOldVersion
      ? '#/system/setting/distribute_templete/print'
      : '#/system/setting/order_printer/print'
  }

  @action
  getTemplateVersion() {
    return Request('/station/distribute_config/old_or_new/get')
      .get()
      .then((json) => {
        runInAction(() => {
          this.templateVersion = json.data.config
        })
        return json
      })
  }

  @action
  getPrintTemplate(category) {
    // 作为过渡,兼容新旧模板
    const URL = this.isOldVersion
      ? '/station/distribute_config/get'
      : '/station/distribute_config/list'
    const name = (item) => (this.isOldVersion ? item.name : item.content.name)

    // category传1拉商户模版和账户模版，不传默认拉商户模版
    Request(URL)
      .data({ category: category })
      .get()
      .then(
        action('gotPrintTemplate', (json) => {
          const list = _.sortBy(json.data, 'create_time')
          const templateList = _.map(list, (item) => {
            return {
              name: name(item),
              id: item.id,
              is_default: item.is_default,
              category: item.category,
            }
          })

          // 兼容旧版本的商户模板列表
          // 商户模板列表--》旧版本直接使用返回来的数据，新版本根据category区分两种
          this.printTemplateList = this.isOldVersion
            ? templateList
            : _.filter(templateList, (item) => item.category === 0)
          // 账户模版列表
          this.printKidTemplateList = _.filter(
            templateList,
            (item) => item.category === 1,
          )

          // 如果选中的模板被删除,那么radio选中默认模板
          if (
            !_.find(templateList, (v) => v.id === this.templateId) &&
            this.templateId !== '-1' &&
            !this.isThermalPrinter(this.templateId)
          ) {
            this.templateId = _.find(templateList, 'is_default').id
          }
        }),
      )
  }

  @action
  setTemplateID(id) {
    this.templateId = id
  }

  @action
  toggleTemplateVersion() {
    const config = this.isOldVersion ? 2 : 1
    this.templateVersion = config
    this.getPrintTemplate(1)

    // 当前使用模板版本记录到后台,全部切到新模板之后会去掉下面的接口
    return Request('/station/distribute_config/old_or_new/set')
      .data({ config })
      .post()
      .then((json) => json)
  }

  // 1️⃣订单tab打印
  goToPrintPage = ({
    orderIdList,
    curAddressId,
    deliveryType,
    selectAllType,
    isSelectAll,
    filter,
    sortType,
    isCompile, // 区分订单-编辑订单-打印（没有合并配送单打印的功能）
    isViewEditDocument, // 区分配送任务-查看编辑单据-打印（没有合并配送单打印的功能）
  }) => {
    const {
      templateId,
      splitOrderType,
      splitOrderTypeWay,
      isPrintSid,
      kidPrintId,
      diyCategoryToggle,
      isCategorySuffix,
      isMergePrintDelivery,
      mergeDeliveryType,
      categorySort,
    } = this

    // 多于一个单 && !isPrintSid 才能判断为批量kid打印
    // const isRealPrintKid = orderIdList.length > 1 && !isPrintSid
    const URL = this.getURLBaseOnVersion()

    // if (kidPrintId === 2 && isRealPrintKid) {
    //   URL = '#/system/setting/order_printer/print_sid_detail2'
    // }
    const query = {
      URL,
      order_ids: orderIdList,
      address_id: curAddressId, // 当前商户id,用来拉分组分类配置
      template_id: templateId, // 模板id
      split_order_type: splitOrderType, // 0: 普通打印 1: 分单打印
      split_order_type_way: splitOrderTypeWay, // 1 按一级分类  2 按二级分类
      diy_category_toggle: diyCategoryToggle, // 自定义 1 按一级分类  2 按二级分类
      delivery_type: deliveryType,
      selectAllType,
      isSelectAll,
      filter,
      kidPrintId,
      isPrintSid,
      sortType, // 排序类型
      isCategorySuffix, // 分类单抬头是否展示分类后缀名
      // 按商品分类管理顺序打印（只有splitOrderType为0整单打印的时候才生效）
      categorySort: splitOrderType === 0 ? categorySort : false,
    }

    // 打印可以从四个地方进行打印，订单有两个（打印和编辑），配送有两个（打印和编辑）
    // ！！注意：合并打印配送单---编辑中的打印不需要进行合并打印（两个）isCompile订单中的编辑打印 isViewEditDocument配送任务中的查看编辑打印
    const result = !isCompile && isMergePrintDelivery && !isViewEditDocument
    // eslint-disable-next-line no-unused-expressions
    result ? (query.mergeDeliveryType = mergeDeliveryType) : query
    handleCommonOrderPrint(query)

    RightSideModal.hide()
  }

  // 2️⃣司机tab打印
  driverGotoPrint = ({
    orderIdList,
    driverOrderObj,
    isCompile,
    isViewEditDocument,
  }) => {
    const {
      templateId,
      isPrintSid,
      to_print_sku,
      to_print_task,
      to_print_checklist,
      splitOrderType,
      splitOrderTypeWay,
      isCategorySuffix,
      diyCategoryToggle,
      isMergePrintDelivery,
      mergeDeliveryType,
    } = this

    const canPrintDistribute = globalStore.hasPermission('get_distribute_print')
    const canPrintDriverTask = globalStore.hasPermission('print_driver_tasks')
    const canPrintCheckSheet = globalStore.hasPermission('print_check_sheet')

    if (!to_print_sku && !to_print_task && !to_print_checklist && !isPrintSid) {
      Tip.warning(i18next.t('请选择将要打印的单据!'))
      return
    }

    const query = {
      type: 'driver',
      template_id: templateId,
      split_order_type: splitOrderType, // 0: 普通打印 1: 分单打印
      order_ids: orderIdList,
      print_drivers: JSON.stringify(driverOrderObj),
      isPrintSid: canPrintDistribute && isPrintSid,
      to_print_task: canPrintDriverTask && to_print_task,
      to_print_sku: canPrintDriverTask && to_print_sku,
      to_print_checklist: canPrintCheckSheet && to_print_checklist,
      split_order_type_way: splitOrderTypeWay, // 1 按一级分类  2 按二级分类
      diy_category_toggle: diyCategoryToggle, // 1 按一级分类  2 按二级分类
      isCategorySuffix, // 分类单抬头是否展示分类后缀名
    }
    const result = !isCompile && isMergePrintDelivery && !isViewEditDocument
    // eslint-disable-next-line no-unused-expressions
    result ? (query.mergeDeliveryType = mergeDeliveryType) : query
    const URL = this.getURLBaseOnVersion()

    openNewTab(`${URL}?${qs.stringify(query)}`)

    RightSideModal.hide()
  }

  // 3️⃣线路tab打印
  lineGotoPrint = ({ orderIdList, isCompile, isViewEditDocument }) => {
    const {
      templateId,
      splitOrderType,
      to_print_checklist,
      isPrintSid,
      splitOrderTypeWay,
      diyCategoryToggle,
      isCategorySuffix,
      isMergePrintDelivery,
      mergeDeliveryType,
    } = this

    if (!to_print_checklist && !isPrintSid) {
      Tip.warning(i18next.t('请选择将要打印的单据!'))
      return
    }

    const canPrintCheckSheet = globalStore.hasPermission('print_check_sheet')

    const query = {
      type: 'line',
      order_ids: orderIdList,
      template_id: templateId,
      split_order_type: splitOrderType, // 0: 普通打印 1: 分单打印
      isPrintSid,
      to_print_checklist: canPrintCheckSheet && to_print_checklist,
      split_order_type_way: splitOrderTypeWay, // 1 按一级分类  2 按二级分类
      diy_category_toggle: diyCategoryToggle, // 1 按一级分类  2 按二级分类
      isCategorySuffix, // 分类单抬头是否展示分类后缀名
    }
    const result = !isCompile && isMergePrintDelivery && !isViewEditDocument
    // eslint-disable-next-line no-unused-expressions
    result ? (query.mergeDeliveryType = mergeDeliveryType) : query
    const URL = this.getURLBaseOnVersion()
    openNewTab(`${URL}?${qs.stringify(query)}`)

    RightSideModal.hide()
  }

  // 账户配送单打印
  goToPrintKid = ({
    orderIdList,
    deliveryType,
    selectAllType,
    isSelectAll,
    filter,
    sortType,
  }) => {
    const {
      splitOrderType,
      isPrintSid,
      kidPrintId,
      splitOrderTypeWay,
      diyCategoryToggle,
      isCategorySuffix,
      isZDPrintConfig,
    } = this
    console.log('isZDPrintConfig', isZDPrintConfig)

    // 多于一个单 && !isPrintSid 才能判断为批量kid打印
    const isRealPrintKid = orderIdList.length > 1 && !isPrintSid

    let URL = '#/system/setting/account_printer/print'
    // 商户明细纵列模板
    if (kidPrintId === 2 && isRealPrintKid) {
      URL = '#/system/setting/order_printer/print_sid_detail2'
    }
    handleCommonOrderPrint({
      URL,
      order_ids: orderIdList,
      split_order_type: splitOrderType, // 0: 普通打印 1: 分单打印
      selectAllType,
      isSelectAll,
      filter,
      kidPrintId, // 账户打印模版
      isPrintSid,
      split_order_type_way: splitOrderTypeWay, // 1 按一级分类  2 按二级分类
      diy_category_toggle: diyCategoryToggle, // 1 按一级分类  2 按二级分类
      isCategorySuffix,
      group_by_sid: isZDPrintConfig,
    })

    RightSideModal.hide()
  }
}

export default new PrinterOptionsStore()
