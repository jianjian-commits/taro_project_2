import { observable, action, runInAction, computed } from 'mobx'
import { Request } from '@gm-common/request'
import { Storage } from '@gmfe/react'
import _ from 'lodash'

const KEY = 'latest_print_template'
const SPLIT_KEY = 'split_order_type'

// 长条单打印比较特殊，他不走自定义模板
export const __THERMAL_PRINTER = '__thermal_printer'
export const isThermalPrinter = (s) => s === __THERMAL_PRINTER

class TemplateStore {
  constructor() {
    this.templateId = Storage.get(KEY) === null ? '-1' : Storage.get(KEY)
    this.splitOrderType = Storage.get(SPLIT_KEY) ?? 0
  }

  // 当前模板
  @observable templateId = '-1'
  @observable printTemplateList = []
  @observable templateVersion = 1

  // 是否分单打印
  @observable splitOrderType = 0

  // 账户合并配送单据 0汇总商品数量 1展示商户明细 2展示商户明细二
  @observable kidMergeType = 0

  @observable isPrintSid = true
  @observable isPrintKid = false

  @action.bound
  handleChangePrint = (e, key) => {
    this[key] = e.currentTarget.checked
  }

  @action
  setSplitOrderType(val) {
    this.splitOrderType = val
    Storage.set(SPLIT_KEY, val)
  }

  @action
  setKidMergeType(val) {
    this.kidMergeType = val
    this.isPrintKid = true
  }

  @computed
  get isOldVersion() {
    return this.templateVersion === 1
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
  getPrintTemplate() {
    // 作为过渡,兼容新旧模板
    const URL = this.isOldVersion
      ? '/station/distribute_config/get'
      : '/station/distribute_config/list'
    const name = (item) => (this.isOldVersion ? item.name : item.content.name)

    Request(URL)
      .get()
      .then(
        action('gotPrintTemplate', (json) => {
          const list = _.sortBy(json.data, 'create_time')
          const templateList = _.map(list, (item) => {
            return {
              name: name(item),
              id: item.id,
              is_default: item.is_default,
            }
          })
          this.printTemplateList.replace(templateList)

          // 如果选中的模板被删除,那么radio选中默认模板
          if (
            !_.find(templateList, (v) => v.id === this.templateId) &&
            this.templateId !== '-1' &&
            !isThermalPrinter(this.templateId)
          ) {
            this.templateId = _.find(templateList, 'is_default').id
          }
        }),
      )
  }

  @action
  setTemplateID(id) {
    this.templateId = id

    Storage.set(KEY, id)
  }

  @action
  toggleTemplateVersion() {
    const config = this.isOldVersion ? 2 : 1
    this.templateVersion = config
    this.getPrintTemplate()

    // 当前使用模板版本记录到后台,全部切到新模板之后会去掉下面的接口
    return Request('/station/distribute_config/old_or_new/set')
      .data({ config })
      .post()
      .then((json) => json)
  }
}

export default new TemplateStore()
