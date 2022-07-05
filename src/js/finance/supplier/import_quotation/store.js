import { observable, action, computed } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import { isPositiveFloat } from '../../../common/util'
import { excelHeaderMap } from '../quotation_list_excel'
import { Tip } from '@gmfe/react'
import Big from 'big.js'
import { i18next } from 'gm-i18n'

class ImportQuotationStore {
  @observable fileData = null

  @observable suppliers = [{ value: null, text: i18next.t('全部供应商') }]

  @observable selectedSupplier = { value: null, text: i18next.t('全部供应商') }

  @action
  init() {
    this.fileData = null
    this.suppliers = [{ value: null, text: i18next.t('全部供应商') }]
    this.selectedSupplier = { value: null, text: i18next.t('全部供应商') }
  }

  @action
  setFileData(data) {
    this.fileData = data
  }

  /* --------- 批量导入 ---------- */
  @observable quotationImportList = []

  @computed
  get canNotSubmit() {
    return (
      !this.quotationImportList.length ||
      this.quotationImportList.some(
        (val) => !isPositiveFloat(val.std_unit_price)
      )
    )
  }

  @action
  getQuotationImportList(sheetData) {
    const excelHeader = sheetData.shift()
    if (!excelHeader.includes(excelHeaderMap.customer_id)) {
      Tip.warning(`模板缺少${excelHeaderMap.customer_id}`)
      return
    } else if (!excelHeader.includes(excelHeaderMap.spec_id)) {
      Tip.warning(`模板缺少${excelHeaderMap.spec_id}`)
      return
    } else if (!excelHeader.includes(excelHeaderMap.std_unit_price)) {
      Tip.warning(`模板缺少${excelHeaderMap.std_unit_price}`)
      return
    }

    const list = []
    _.forEach(sheetData, (item) => {
      const spec_obj = {}
      // 根据表头填入每列数据
      _.forEach(excelHeader, (v, index) => {
        const key = excelHeaderMap.getVarName(v)
        spec_obj[key] = item[index]
      })
      // 没特定字段的数据不导入
      if (
        !spec_obj.customer_id ||
        !spec_obj.spec_id ||
        !spec_obj.std_unit_price
      ) {
        return
      }

      const {
        category_1_name = '-',
        category_2_name = '-',
        pinlei_name = '-',
      } = spec_obj
      // 分类
      spec_obj.fenlei = `${category_1_name}/${category_2_name}/${pinlei_name}`

      list.push(spec_obj)
    })

    this.quotationImportList = list
  }

  @action
  setQuotationList(index, field, value) {
    this.quotationImportList[index][field] = value
  }

  @action
  deleteQuotationItem(index) {
    this.quotationImportList.splice(index, 1)
  }

  @action
  async submit() {
    const quoted_price = _.map(this.quotationImportList, (item) => {
      const {
        spec_id,
        customer_id,
        std_unit_price,
        origin_place,
        remark,
        settle_supplier_name,
      } = item
      return {
        spec_id,
        customer_id,
        settle_supplier_name,
        std_unit_price: Number(Big(std_unit_price).times(100).toFixed(2)),
        origin_place,
        remark,
      }
    })
    const req = {
      quoted_price: JSON.stringify(quoted_price),
    }
    const json = await Request('/purchase/quote_price/import').data(req).post()
    if (json.code === 0) {
      return json
    }
  }

  @action
  getSuppliers() {
    return Request('/purchase/task/settle_suppliers')
      .get()
      .then(
        action((json) => {
          this.suppliers = [
            { value: null, text: i18next.t('全部供应商') },
            ..._.map(json.data, (v) => {
              return {
                text: v.name,
                value: v.id,
              }
            }),
          ]
          console.log(this.suppliers)
        })
      )
  }

  @action
  setSelectedSupplier(selected) {
    this.selectedSupplier = selected
  }
}

export default new ImportQuotationStore()
