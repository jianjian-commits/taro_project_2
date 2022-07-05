import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'
import moment from 'moment/moment'
import { i18next } from 'gm-i18n'
import { renderPurchaseSpec } from '../../common/filter'
import _ from 'lodash'

// 统一处理excel头部
class ExcelHeaderMap {
  constructor() {
    // 改excel字段请改下面部分
    this.spu_id = i18next.t('商品ID')
    this.spu_name = i18next.t('商品名称')
    this.spec_id = i18next.t('采购规格ID')
    this.spec_name = i18next.t('规格名称')
    this.category_1_name = i18next.t('一级分类')
    this.category_2_name = i18next.t('二级分类')
    this.pinlei_name = i18next.t('品类')
    this.purchase_spec = i18next.t('采购规格')
    this.customer_id = i18next.t('供应商编号(必填)')
    this.settle_supplier_name = i18next.t('供应商名称')
    this.std_unit_price = i18next.t('询价(基本单位)(必填)')
    this.std_unit = i18next.t('基本单位')
    this.origin_place = i18next.t('产地')
    this.remark = i18next.t('描述')

    this.map = {
      [this.spu_id]: 'spu_id',
      [this.spu_name]: 'spu_name',
      [this.spec_id]: 'spec_id',
      [this.spec_name]: 'spec_name',
      [this.category_1_name]: 'category_1_name',
      [this.category_2_name]: 'category_2_name',
      [this.pinlei_name]: 'pinlei_name',
      [this.purchase_spec]: 'purchase_spec',
      [this.customer_id]: 'customer_id',
      [this.settle_supplier_name]: 'settle_supplier_name',
      [this.std_unit_price]: 'std_unit_price',
      [this.std_unit]: 'std_unit',
      [this.origin_place]: 'origin_place',
      [this.remark]: 'remark',
    }
  }

  getVarName = (s) => {
    return this.map[s]
  }
}

export const excelHeaderMap = new ExcelHeaderMap()

export default function generateQuotationExcel(data) {
  const list = _.map(data, (item) => {
    return {
      [excelHeaderMap.spu_id]: item.spu_id,
      [excelHeaderMap.spu_name]: item.spu_name,
      [excelHeaderMap.spec_id]: item.id || item.spec_id, // 请求接口不一样,数据做下兼容处理
      [excelHeaderMap.spec_name]: item.name || item.spec_name, // 请求接口不一样,数据做下兼容处理
      [excelHeaderMap.category_1_name]: item.category_1_name,
      [excelHeaderMap.category_2_name]: item.category_2_name,
      [excelHeaderMap.pinlei_name]: item.pinlei_name,
      [excelHeaderMap.purchase_spec]: renderPurchaseSpec(item),
      [excelHeaderMap.customer_id]: '',
      [excelHeaderMap.settle_supplier_name]: '',
      [excelHeaderMap.std_unit_price]: '',
      [excelHeaderMap.std_unit]: item.std_unit,
      [excelHeaderMap.origin_place]: '',
      [excelHeaderMap.remark]: '',
    }
  })

  requireGmXlsx((res) => {
    const { jsonToSheet } = res
    jsonToSheet([list], {
      fileName: `quotation_${moment().format('YYYY_MM_DD')}.xlsx`,
    })
  })
}
