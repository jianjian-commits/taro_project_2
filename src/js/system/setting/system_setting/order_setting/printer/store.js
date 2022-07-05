import { observable, action } from 'mobx'
import { Storage } from '@gmfe/react'
import _ from 'lodash'
import bridge from '../../../../../bridge'

const PRINTER_NAME_KEY = 'PRINTER_NAME_KEY'
const getPrinterName = () => Storage.get(PRINTER_NAME_KEY)
class PrintStore {
  @observable name = getPrinterName() || null
  @observable list = [] // [{description, isDefault, name}]

  @action
  init() {
    this.name = getPrinterName() || null
    this.list = []
  }

  @action
  getPrinterList() {
    this.list = bridge.printer.getPrinters()
    // 判断是否有上次选择的打印机
    const lastPrinter = this.list.find((printer) => printer.name === this.name)
    if (!lastPrinter) {
      // 如果没有选择默认，则默认选择默认打印机
      const defaultPrinter = _.find(this.list, (printer) => printer.isDefault)
      if (defaultPrinter) {
        this.setPrinter(defaultPrinter.name)
        this.savePrinterName()
      }
    }
  }

  @action
  setPrinter(name) {
    this.name = name
    Storage.set(PRINTER_NAME_KEY, this.name)
  }

  @action
  savePrinterName() {
    if (this.name) {
      Storage.set(PRINTER_NAME_KEY, this.name)
      return true
    }
    return false
  }
}

const print = new PrintStore()

export default print
