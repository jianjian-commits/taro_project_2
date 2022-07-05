import { observable, action, computed, reaction } from 'mobx'
import { pinYinFilter } from '@gm-common/tool'
import _ from 'lodash'
import {
  apiFetchCategory2,
  apiFetchCategory1,
  apiUploadPriceRule,
} from '../api_request'
import { getRuleType } from '../filter'
import { Price, Tip } from '@gmfe/react'
import { tableTrFocus, inputFocus } from '../util'
import { i18next } from 'gm-i18n'
import Big from 'big.js'

const initPagination = {
  count: 0,
  limit: 10,
  offset: 0,
}

class EditStore {
  constructor() {
    this.r1 = reaction(
      () => this.resultList.length,
      (length) => {
        this.pagination.count = length
      },
    )
  }

  @observable pagination = initPagination

  @observable inputValue = ''

  // 站点所有二级分类
  @observable category2List = []

  @observable resultList = []

  @observable xlsxList = []

  // 报价单信息
  @observable salemenuInfo = {}

  @action init(data) {
    const { category_2_list, ...rest } = data
    this.resultList.replace(category_2_list)
    if (rest.salemenu_fee_type) rest.fee_type = rest.salemenu_fee_type
    this.salemenuInfo = rest
  }

  @action reset() {
    this.resultList.clear()
    this.xlsxList.clear()
    this.inputValue = ''
    this.pagination = initPagination
  }

  @action
  async getCategory2List() {
    const [category1, category2] = await Promise.all([
      apiFetchCategory1(),
      apiFetchCategory2(),
    ])

    // 二级分类也要把一级分类的信息带上
    this.category2List = _.filter(
      category2.map((o) => {
        const item = category1.find((v) => v.id === o.upstream_id)
        // 加入本站和通用后，一级分类会过滤,存在没有的情况
        if (!item) {
          return null
        }
        return {
          category_1_id: item.id,
          category_1_name: item.name,
          category_2_id: o.id,
          category_2_name: o.name,
        }
      }),
    )
  }

  @action inputValueChange(value) {
    this.inputValue = value
  }

  // searchList 值 = inputValue + resultList 共同衍生
  @computed get searchList() {
    const value = this.inputValue
    if (value === '') {
      return []
    }
    const idFilter = this.category2List.filter(
      (o) => o.category_2_id.toUpperCase() === value.toUpperCase(),
    )
    const filterList = pinYinFilter(
      this.category2List,
      value,
      (o) => o.category_2_name,
      { isSort: true },
    )

    return [...filterList, ...idFilter].map((o) => {
      const category2Obj = this.resultList.find(
        (v) => v.category_2_id === o.category_2_id,
      )
      const isInResultList = !_.isUndefined(category2Obj)
      let rule = '-'
      if (isInResultList) {
        const { rule_type, yx_price } = category2Obj
        rule = `${
          yx_price >= 0 ? getRuleType(rule_type).operator : ''
        }${yx_price}${rule_type === 1 ? Price.getUnit() : ''}`
      }

      return {
        ...o,
        id: o.category_2_id,
        rule,
        isInResultList,
      }
    })
  }

  @action resultListAdd(obj) {
    const category2Obj = {
      ...obj,
      rule_type: 1,
      yx_price: '',
    }
    this.resultList.unshift(category2Obj)

    this.pagination.offset = 0
    tableTrFocus(0)
    inputFocus(obj.category_2_id)
  }

  @action resultListAddByIndex(index) {
    const obj = this.searchList[index]
    const { isInResultList, category_2_id } = obj

    if (!isInResultList) {
      this.resultListAdd(obj)
    } else {
      // 如果在结果列表内,那么就定位出来,闪烁显示
      const resIndex = this.resultList.findIndex(
        (o) => o.category_2_id === category_2_id,
      )
      const { limit } = this.pagination
      const newOffset = Math.floor(resIndex / limit) * limit
      const newIndex = resIndex % limit
      // 定位: 跳页
      this.pagination = { ...this.pagination, offset: newOffset }
      // 闪烁
      tableTrFocus(newIndex)
    }
  }

  @action.bound resultListRemoveItem(id) {
    const index = this.resultList.findIndex((o) => o.category_2_id === id)
    this.resultList.remove(this.resultList[index])
  }

  @action setResultItem(item, modify) {
    const index = this.resultList.findIndex(
      (o) => o.category_2_id === item.category_2_id,
    )
    this.resultList[index] = {
      ...this.resultList[index],
      ...modify,
    }
  }

  @action JumpPage(pageObj) {
    this.pagination = {
      ...this.pagination,
      ...pageObj,
    }
  }

  @action searchListClear() {
    this.inputValue = ''
  }

  // 批量导入
  @action
  async uploadFileData(file) {
    const { salemenu_id, type } = this.salemenuInfo

    const req = {
      upload_type: 'category_2',
      upload_file: file,
      salemenu_id,
      rule_type: type,
    }
    apiUploadPriceRule(req).then((json) => {
      this.xlsxList = _.map(json.data, (v) => {
        const { variation, multiple } = v.price_rule
        return {
          ...v,
          price_rule: {
            variation: variation ? Big(variation).toFixed(2) : '',
            multiple: multiple ? Big(multiple).toFixed(4) : '',
          },
        }
      })
    })
  }

  @action xlsxListPriceRuleChange(category_2_id, key, value) {
    const index = this.xlsxList.findIndex(
      (o) => o.category_2_id === category_2_id,
    )

    const price_rule = this.xlsxList[index].price_rule
    this.xlsxList[index].price_rule = {
      ...price_rule,
      [key]: value,
    }
  }

  @action xlsxListRemoveItem(index) {
    this.xlsxList.remove(this.xlsxList[index])
  }

  @action.bound xlsxListClear() {
    this.xlsxList.clear()
  }

  @action.bound resultListBulkImport() {
    if (this.xlsxList.length === 0) {
      Tip.danger(i18next.t('请添加分类'))
      return false
    }
    // 校验数据是否合法
    const isFail = this.xlsxList.some((o) => {
      const { multiple = '', variation = '' } = o.price_rule
      if (multiple === '' && variation === '') {
        Tip.danger(i18next.t('请填写完整信息'))
        return true
      } else if (multiple !== '' && variation !== '') {
        Tip.danger(o.category_2_id + i18next.t('价格变动,倍数只能输入其中一列'))
        return true
      } else if (multiple !== '' && multiple <= 0) {
        Tip.danger(i18next.t('倍数须大于0'))
        return true
      }
    })

    if (isFail) {
      return false
    } else {
      const list = this.xlsxList.map((o) => {
        const {
          category_1_name,
          category_2_name,
          category_2_id,
          price_rule,
        } = o
        return {
          category_2_id,
          category_2_name,
          category_1_name,
          rule_type: price_rule.multiple ? 2 : 1,
          yx_price: price_rule.multiple || price_rule.variation,
        }
      })

      this.resultList.replace(list)
      this.xlsxList.clear()
      return true
    }
  }
}

export default new EditStore()
