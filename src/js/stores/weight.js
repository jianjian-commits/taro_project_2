import { i18next } from 'gm-i18n'
import { action, observable } from 'mobx'
import bridge from '../bridge'
import { Storage } from '@gmfe/react'
import { cutNumberByPrecision } from '../common/service'

const KEYPRECISION = 'KEYPRECISION'
const KEYISREVERSE = 'KEYISREVERSE'
const KEYSELECTEDDEVICE = 'KEYSELECTEDDEVICE'
const KEYISKG = 'KEYISKG'

// 这样通信好点
window.____isReverse = Storage.get(KEYISREVERSE) === 0 ? 0 : 1

window.____selectedDevice =
  Storage.get(KEYSELECTEDDEVICE) || i18next.t('无限量')

class WeightStore {
  @observable isOpen = false
  @observable data = 0
  @observable list = []

  @observable precision = Storage.get(KEYPRECISION) || 1
  @observable weightUnit = Storage.get(KEYISKG) || i18next.t('公斤') // 称读书单位为公斤或斤

  // 空 和 1 一致
  @observable isReverse = window.____isReverse
  @observable deviceList = [
    i18next.t('无限量'),
    i18next.t('衡新'),
    i18next.t('首衡'),
  ]

  @observable selectedDevice = window.____selectedDevice

  // 大屏展现输入的重量
  @observable bigScreenInputWeight = 0

  // 进过 unit 转换的
  // 产品说
  // 只称重框才的单位才有逻辑，其他单位都是纯展示
  // mark 只 basket 才能调用
  // _getUnitWeight (weight) {
  //   const isKg = (this.weightUnit === i18next.t('公斤'))
  //   return +Big(weight || 0).div(isKg ? 2 : 1)
  // }

  @action
  getComList() {
    this.list = bridge.mes_app.getDevices()
  }

  // 在用数据的地方启动，不停的获取数据
  @action
  start() {
    if (this.isOpen) {
      return
    }
    this.isOpen = true
    this._getData()
  }

  @action
  stop() {
    this.isOpen = false
  }

  @action
  _getData() {
    if (!this.isOpen) {
      return
    }

    // 判断是否安装了插件
    const { isInstalled } = bridge.mes_app.getChromeStatus()

    // try catch 保护下，避免 setTimeout 中断
    try {
      const d = bridge.mes_app.getMesAppData() || 0.0

      this.data = cutNumberByPrecision(d, this.precision)
    } catch (error) {
      console.log(error)
    }

    isInstalled &&
      setTimeout(() => {
        this._getData()
      }, 500)
  }

  @action
  setPrecision(pre) {
    this.precision = pre
    Storage.set(KEYPRECISION, pre)
  }

  // 设置电子秤读书单位
  @action
  setWeightUnit(isKg) {
    this.weightUnit = isKg
    Storage.set(KEYISKG, isKg)
  }

  @action
  setIsReverse(isReverse) {
    this.isReverse = isReverse
    window.____isReverse = isReverse
    Storage.set(KEYISREVERSE, isReverse)
  }

  @action
  setSelectedDevice(name) {
    window.____selectedDevice = name
    this.selectedDevice = name
    Storage.set(KEYSELECTEDDEVICE, name)
  }

  @action
  setBlueToothWeight(data) {
    this.data = cutNumberByPrecision(data, this.precision)
  }

  @action
  setBigScreenInputWeight(weight) {
    this.bigScreenInputWeight = weight
  }
}

const weight = new WeightStore()

export default weight
