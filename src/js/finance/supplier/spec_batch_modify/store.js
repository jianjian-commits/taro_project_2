import { action, observable } from 'mobx'
import _ from 'lodash'
import { i18next } from 'gm-i18n'
import { Request } from '@gm-common/request'
import { System } from '../../../common/service'

const sheetHeaderMap = {
  [i18next.t('采购规格ID（不可修改）')]: 'pur_spec_id',
  [i18next.t('规格名称（可修改）')]: 'name',
  [i18next.t('规格条码（可修改）')]: 'barcode',
  [i18next.t('一级分类')]: 'category_1_name',
  [i18next.t('二级分类')]: 'category_2_name',
  [i18next.t('商品名')]: 'spu_name',
  [i18next.t('最近询价（不可修改）')]: 'last_quoted_price',
  [i18next.t('规格系数（可修改）')]: 'ratio',
  [i18next.t('基本单位（不可修改）')]: 'std_unit',
  [i18next.t('采购单位（可修改）')]: 'purchase_unit',
  [i18next.t('采购规格（不可修改）')]: 'purchase_spec',
  [i18next.t('最高入库单价（0为不设置）')]: 'max_stock_unit_price',
  [i18next.t('采购描述（可修改）')]: 'purchase_desc',
}

class Store {
  @observable
  fileData = null

  @observable
  specBatchModifyList = []

  @action
  init() {
    this.fileData = null
  }

  @action
  setFileData(data) {
    this.fileData = data
  }

  @action
  generateSpecBatchModifyList(sheetData) {
    const sheetHeader = sheetData.shift()
    const list = []

    _.forEach(sheetData, (row) => {
      const spec_obj = {}

      _.forEach(sheetHeader, (head, index) => {
        const key = sheetHeaderMap[head]
        if (key) {
          spec_obj[key] = row[index]
        }
      })
      if (!spec_obj.pur_spec_id) {
        return
      }

      // 导入列表需要显示修改后的采购规格，但是掉导入接口时，修改前的也要上传
      spec_obj.purchase_spec_display = `${spec_obj.ratio || '-'}${
        spec_obj.std_unit || '-'
      }/${spec_obj.purchase_unit || '-'}`

      list.push(spec_obj)
    })
    this.specBatchModifyList = list
  }

  @action
  setSpecBatchModifyList(list) {
    this.specBatchModifyList = list
  }

  @action
  batchImport() {
    return Request('/purchase_spec/batch/import')
      .data({
        spec_details: JSON.stringify(this.specBatchModifyList),
        is_retail_interface: System.isC() ? 1 : null,
      })
      .post()
      .then(
        action((json) => {
          return json
        }),
      )
  }
}

export default new Store()
