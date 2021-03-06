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
  // ðð¥ðð¥ ç¼å­åéå°localeStorageåå°è¿é
  selector: SELECTOR,
})
class PrinterOptionsStore {
  __THERMAL_PRINTER = '__thermal_printer' // é¿æ¡åæå°æ¯è¾ç¹æ®ï¼ä»ä¸èµ°èªå®ä¹æ¨¡æ¿
  isThermalPrinter = (s) => s === this.__THERMAL_PRINTER

  constructor() {
    isVersionSwitcherShow().then((isShow) => {
      this.isVersionSwitcherShow = isShow
    })
  }

  /** å½åæ¨¡æ¿ */
  @observable templateId = '-1'
  /** æ¯å¦ååæå° */
  @observable splitOrderType = 0
  /** ååæåæ¹å¼ 1 ä¸çº§åç±» / 2 äºçº§åç±» */
  @observable splitOrderTypeWay = Storage.get('PRINT_SPLIT_ORDER_WAY') || 1
  /** è´¦æ·åå¹¶ééåæ® 0æ±æ»ååæ°é 1å±ç¤ºåæ·æç» 2å±ç¤ºåæ·æç»äº */
  @observable kidMergeType = 0
  /** è´¦æ·ééæ¨¡çid ä¸º2æ¶æ¯å®¢æ· */
  @observable kidPrintId = 2
  /** æåæ·sidæå° */
  @observable isPrintSid = true
  /** æ¯å¦æå° å¸æºä»»å¡å */
  @observable to_print_task = false
  /** æ¯å¦æå° å¸æºè£è½¦å */
  @observable to_print_sku = false
  /** æ¯å¦æå° åæ£æ ¸æ¥å */
  @observable to_print_checklist = false
  /** æ¯å¦ä¸åå¼¹åºåæ®æ¨¡æ¿éæ©çªå£ */
  @observable hidePrinterOptionsModal = false
  /** èªå®ä¹åç±» æ¯ä¸çº§è¿æ¯äºçº§è¿è¡åç±»ï¼é»è®¤1çº§ï¼1 ä¸çº§åç±» / 2 äºçº§åç±» */
  @observable diyCategoryToggle = Storage.get('DIY_CATEGORY_TOGGLE') || 1
  /** åç±»åæ¬å¤´æ¯å¦å±ç¤ºåç±»åç¼å */
  @observable isCategorySuffix = Storage.get('PRINT_CATEGORY_SUFFIX') ?? true
  // æ¯å¦åå¹¶æå°ç¸ååæ·è®¢å
  // @observable isSIDMergePrint = Storage.get('SID_MERGE_PRINT') || false
  /** æ¯å¦åå¹¶æå°ééå */
  @observable isMergePrintDelivery =
    Storage.get('MERGE_PRINT_DELIVERY') || false

  /** æ¯å¦åå¹¶æå°ééå */
  @observable isZDPrintConfig = Storage.get('ZD_PRINT_CONFIG') || false

  /** åå¹¶æå°ééåç±»å  1---åå¹¶æå°è®¢ååç¸ååå  2---åå¹¶æå°ç¸ååæ·è®¢å */
  @observable mergeDeliveryType = Storage.get('MERGE_DELIVERY_TYPE') || 1

  /** æå°ç±»åï¼æ´åæå°ï¼æåååç±»ç®¡çé¡ºåºæå°  1---åå¹¶æå°è®¢ååç¸ååå  2---åå¹¶æå°ç¸ååæ·è®¢å */
  @observable categorySort = Storage.get('CATEGORY_SORT') ?? false

  /* --- ðä¸é¢å­æ®µè®°å¾åè®°å¿ð --- */

  /* --- ä¸éè¦è®°å¿çå­æ®µð --- */
  /** åæ·æ¨¡æ¿åè¡¨ */
  @observable printTemplateList = []
  /** è´¦æ·æ¨¡æ¿åè¡¨ */
  @observable printKidTemplateList = []
  /** æ¯å¦å±ç¤º'åå(æ°/æ§)æ¨¡æ¿'æé® */
  @observable isVersionSwitcherShow = true
  /** ééåçæ¬ 1:æ§ 2:æ° */
  @observable templateVersion = 2

  /** åºå®ä¸ä¸ªåç±»ä¸å¼ å ä¸çº§åç±» å¦ææå°å¨é¨åç±»å­æ´ä¸ªåç±»list */
  @observable category1ListSelected = Storage.get('PRINT_CATEGORY1_LIST') || []
  /** åºå®ä¸ä¸ªåç±»ä¸å¼ å äºçº§åç±» å¦ææå°å¨é¨åç±»å­æ´ä¸ªåç±»list */
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

  // åæ­¥ä¸ä¸localStorageçæ°æ®(æµè§å¨æætabå±äº«ä¸ä»½æ°æ®)
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
    // ä½ä¸ºè¿æ¸¡,å¼å®¹æ°æ§æ¨¡æ¿
    const URL = this.isOldVersion
      ? '/station/distribute_config/get'
      : '/station/distribute_config/list'
    const name = (item) => (this.isOldVersion ? item.name : item.content.name)

    // categoryä¼ 1æåæ·æ¨¡çåè´¦æ·æ¨¡çï¼ä¸ä¼ é»è®¤æåæ·æ¨¡ç
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

          // å¼å®¹æ§çæ¬çåæ·æ¨¡æ¿åè¡¨
          // åæ·æ¨¡æ¿åè¡¨--ãæ§çæ¬ç´æ¥ä½¿ç¨è¿åæ¥çæ°æ®ï¼æ°çæ¬æ ¹æ®categoryåºåä¸¤ç§
          this.printTemplateList = this.isOldVersion
            ? templateList
            : _.filter(templateList, (item) => item.category === 0)
          // è´¦æ·æ¨¡çåè¡¨
          this.printKidTemplateList = _.filter(
            templateList,
            (item) => item.category === 1,
          )

          // å¦æéä¸­çæ¨¡æ¿è¢«å é¤,é£ä¹radioéä¸­é»è®¤æ¨¡æ¿
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

    // å½åä½¿ç¨æ¨¡æ¿çæ¬è®°å½å°åå°,å¨é¨åå°æ°æ¨¡æ¿ä¹åä¼å»æä¸é¢çæ¥å£
    return Request('/station/distribute_config/old_or_new/set')
      .data({ config })
      .post()
      .then((json) => json)
  }

  // 1ï¸â£è®¢åtabæå°
  goToPrintPage = ({
    orderIdList,
    curAddressId,
    deliveryType,
    selectAllType,
    isSelectAll,
    filter,
    sortType,
    isCompile, // åºåè®¢å-ç¼è¾è®¢å-æå°ï¼æ²¡æåå¹¶ééåæå°çåè½ï¼
    isViewEditDocument, // åºåééä»»å¡-æ¥çç¼è¾åæ®-æå°ï¼æ²¡æåå¹¶ééåæå°çåè½ï¼
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

    // å¤äºä¸ä¸ªå && !isPrintSid æè½å¤æ­ä¸ºæ¹ékidæå°
    // const isRealPrintKid = orderIdList.length > 1 && !isPrintSid
    const URL = this.getURLBaseOnVersion()

    // if (kidPrintId === 2 && isRealPrintKid) {
    //   URL = '#/system/setting/order_printer/print_sid_detail2'
    // }
    const query = {
      URL,
      order_ids: orderIdList,
      address_id: curAddressId, // å½ååæ·id,ç¨æ¥æåç»åç±»éç½®
      template_id: templateId, // æ¨¡æ¿id
      split_order_type: splitOrderType, // 0: æ®éæå° 1: ååæå°
      split_order_type_way: splitOrderTypeWay, // 1 æä¸çº§åç±»  2 æäºçº§åç±»
      diy_category_toggle: diyCategoryToggle, // èªå®ä¹ 1 æä¸çº§åç±»  2 æäºçº§åç±»
      delivery_type: deliveryType,
      selectAllType,
      isSelectAll,
      filter,
      kidPrintId,
      isPrintSid,
      sortType, // æåºç±»å
      isCategorySuffix, // åç±»åæ¬å¤´æ¯å¦å±ç¤ºåç±»åç¼å
      // æåååç±»ç®¡çé¡ºåºæå°ï¼åªæsplitOrderTypeä¸º0æ´åæå°çæ¶åæçæï¼
      categorySort: splitOrderType === 0 ? categorySort : false,
    }

    // æå°å¯ä»¥ä»åä¸ªå°æ¹è¿è¡æå°ï¼è®¢åæä¸¤ä¸ªï¼æå°åç¼è¾ï¼ï¼ééæä¸¤ä¸ªï¼æå°åç¼è¾ï¼
    // ï¼ï¼æ³¨æï¼åå¹¶æå°ééå---ç¼è¾ä¸­çæå°ä¸éè¦è¿è¡åå¹¶æå°ï¼ä¸¤ä¸ªï¼isCompileè®¢åä¸­çç¼è¾æå° isViewEditDocumentééä»»å¡ä¸­çæ¥çç¼è¾æå°
    const result = !isCompile && isMergePrintDelivery && !isViewEditDocument
    // eslint-disable-next-line no-unused-expressions
    result ? (query.mergeDeliveryType = mergeDeliveryType) : query
    handleCommonOrderPrint(query)

    RightSideModal.hide()
  }

  // 2ï¸â£å¸æºtabæå°
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
      Tip.warning(i18next.t('è¯·éæ©å°è¦æå°çåæ®!'))
      return
    }

    const query = {
      type: 'driver',
      template_id: templateId,
      split_order_type: splitOrderType, // 0: æ®éæå° 1: ååæå°
      order_ids: orderIdList,
      print_drivers: JSON.stringify(driverOrderObj),
      isPrintSid: canPrintDistribute && isPrintSid,
      to_print_task: canPrintDriverTask && to_print_task,
      to_print_sku: canPrintDriverTask && to_print_sku,
      to_print_checklist: canPrintCheckSheet && to_print_checklist,
      split_order_type_way: splitOrderTypeWay, // 1 æä¸çº§åç±»  2 æäºçº§åç±»
      diy_category_toggle: diyCategoryToggle, // 1 æä¸çº§åç±»  2 æäºçº§åç±»
      isCategorySuffix, // åç±»åæ¬å¤´æ¯å¦å±ç¤ºåç±»åç¼å
    }
    const result = !isCompile && isMergePrintDelivery && !isViewEditDocument
    // eslint-disable-next-line no-unused-expressions
    result ? (query.mergeDeliveryType = mergeDeliveryType) : query
    const URL = this.getURLBaseOnVersion()

    openNewTab(`${URL}?${qs.stringify(query)}`)

    RightSideModal.hide()
  }

  // 3ï¸â£çº¿è·¯tabæå°
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
      Tip.warning(i18next.t('è¯·éæ©å°è¦æå°çåæ®!'))
      return
    }

    const canPrintCheckSheet = globalStore.hasPermission('print_check_sheet')

    const query = {
      type: 'line',
      order_ids: orderIdList,
      template_id: templateId,
      split_order_type: splitOrderType, // 0: æ®éæå° 1: ååæå°
      isPrintSid,
      to_print_checklist: canPrintCheckSheet && to_print_checklist,
      split_order_type_way: splitOrderTypeWay, // 1 æä¸çº§åç±»  2 æäºçº§åç±»
      diy_category_toggle: diyCategoryToggle, // 1 æä¸çº§åç±»  2 æäºçº§åç±»
      isCategorySuffix, // åç±»åæ¬å¤´æ¯å¦å±ç¤ºåç±»åç¼å
    }
    const result = !isCompile && isMergePrintDelivery && !isViewEditDocument
    // eslint-disable-next-line no-unused-expressions
    result ? (query.mergeDeliveryType = mergeDeliveryType) : query
    const URL = this.getURLBaseOnVersion()
    openNewTab(`${URL}?${qs.stringify(query)}`)

    RightSideModal.hide()
  }

  // è´¦æ·ééåæå°
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

    // å¤äºä¸ä¸ªå && !isPrintSid æè½å¤æ­ä¸ºæ¹ékidæå°
    const isRealPrintKid = orderIdList.length > 1 && !isPrintSid

    let URL = '#/system/setting/account_printer/print'
    // åæ·æç»çºµåæ¨¡æ¿
    if (kidPrintId === 2 && isRealPrintKid) {
      URL = '#/system/setting/order_printer/print_sid_detail2'
    }
    handleCommonOrderPrint({
      URL,
      order_ids: orderIdList,
      split_order_type: splitOrderType, // 0: æ®éæå° 1: ååæå°
      selectAllType,
      isSelectAll,
      filter,
      kidPrintId, // è´¦æ·æå°æ¨¡ç
      isPrintSid,
      split_order_type_way: splitOrderTypeWay, // 1 æä¸çº§åç±»  2 æäºçº§åç±»
      diy_category_toggle: diyCategoryToggle, // 1 æä¸çº§åç±»  2 æäºçº§åç±»
      isCategorySuffix,
      group_by_sid: isZDPrintConfig,
    })

    RightSideModal.hide()
  }
}

export default new PrinterOptionsStore()
