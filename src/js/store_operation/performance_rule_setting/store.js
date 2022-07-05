import { observable, action, toJS } from 'mobx'

import { Tip } from '@gmfe/react'
import { t } from 'gm-i18n'

import {
  getSorterPerformanceRules,
  setSorterPerformanceRules,
  getSpu,
  setSpu,
} from './service'

const initfirstRule = {
  min: 0,
  index: 0,
  perf: undefined,
}
const initRules = {
  base_salary: 0,
  piece_method: 1,
  piece_rules: [{ ...initfirstRule }],
  weight_rules: [{ ...initfirstRule }],
}
class Store {
  @observable sorterRules = { ...initRules }
  @observable spu_ids = []
  @observable isGettingSpuIds = false
  @observable loading = false

  @action
  async getRules() {
    this.loading = true
    const { data } = await getSorterPerformanceRules()
    this.loading = false
    this.formatInitRules(data, 'piece_rules')
    this.formatInitRules(data, 'weight_rules')

    this.changeSorterRules(data)
  }

  @action
  async setRules() {
    const submit = toJS(this.sorterRules)
    const { piece_rules, weight_rules } = submit
    piece_rules[piece_rules.length - 1].value = 0
    weight_rules[weight_rules.length - 1].value = 0
    const res = await setSorterPerformanceRules({
      ...submit,
      piece_rules: JSON.stringify(piece_rules),
      weight_rules: JSON.stringify(weight_rules),
    })
    if (res?.code === 0) {
      Tip.success(t('保存成功'))
    }
  }

  @action
  changeSorterRules(newSorterRules = {}) {
    this.sorterRules = {
      ...this.sorterRules,
      ...newSorterRules,
    }
  }

  @action
  changeRow(isPiece, key, value, index) {
    const [targetKey, targetRows] = this.getTargetRows(isPiece)
    targetRows[index][key] = value
    if (key === 'value' && index < targetRows.length - 1) {
      targetRows[index + 1].min = value
    }
    this.changeSorterRules({ [targetKey]: targetRows })
  }

  @action
  addRow(isPiece) {
    const [targetKey, targetRows] = this.getTargetRows(isPiece)
    const rowLength = targetRows.length
    const lastRow = targetRows[rowLength - 1]
    lastRow.value = undefined
    targetRows.push({ index: rowLength })

    this.changeSorterRules({ [targetKey]: targetRows })
  }

  @action
  deleteRow(isPiece) {
    const [targetKey, targetRows] = this.getTargetRows(isPiece)
    targetRows.pop()
    targetRows[targetRows.length - 1].value = undefined
    this.changeSorterRules({ [targetKey]: targetRows })
  }

  getTargetRows(isPiece) {
    const targetKey = `${isPiece ? 'piece' : 'weight'}_rules`
    const targetRows = this.sorterRules[targetKey].slice()
    return [targetKey, targetRows]
  }

  @action
  async getSpu({ perf_method }) {
    this.isGettingSpuIds = true
    const res = await getSpu(perf_method)
    this.isGettingSpuIds = false
    if (res?.data?.spu_ids) {
      this.setSpuIds(res?.data?.spu_ids)
    }
  }

  @action
  async setSpu({ perf_method }) {
    const res = await setSpu({
      perf_method,
      spu_ids: JSON.stringify(this.spu_ids),
    })
    if (res.code === 0) {
      Tip.success(t('保存成功'))
      return true
    }
    return false
  }

  @action
  setSpuIds(spu_ids) {
    this.spu_ids = spu_ids
  }

  // 格式化初始规则列表数据
  formatInitRules(data, key) {
    if (data[key]?.length === 0) {
      data[key] = [{ ...initfirstRule }]
    } else {
      data[key] = data[key].map((item, index) => ({ ...item, index }))
    }
  }
}

export default new Store()
