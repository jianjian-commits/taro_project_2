import { Request } from '@gm-common/request'

const saleTimeGet = () =>
  Request('/service_time/list').data({ details: 0 }).get()

const saleListGet = (data) => Request('/salemenu/sale/list').data(data).get()

const merchandiseSaleListGet = (data) =>
  Request('/product/sku_salemenu/list').data(data).get()

const saleListUpdate = (data) =>
  Request('/product/sku/update').data(data).post()

const skuImport = (fileInfo, stationId, salemenuId) => {
  const url =
    '/station/skuproducts/import/' + stationId + '/' + salemenuId + '/sku/'
  return Request(url, { timeout: 60000 }).data({ import_file: fileInfo }).post()
}

const refPriceTypeGet = (data) =>
  Request('/station/ref_price_type/get').data({ where: data }).get()

const refPriceTypeSet = (type, where) =>
  Request('/station/ref_price_type/set')
    .data({ where: where, type: type })
    .post()

const smartPriceListGet = (data) =>
  Request('/product/sku/smart_pricing/list').data(data).post()

const deleteSaleMenu = (data) =>
  Request('/salemenu/sale/delete ').data(data).post()

const fetchDefaultSaleMenu = (data) => Request('/salemenu/sale/default').get()

const fetchSalemenuShareInfo = (data) =>
  Request('/station/salemenu/print').data(data).get()

const fetchSalemenuShareId = (data) =>
  Request('/station/salemenu/share/create').data(data).post()

const setSaleListFormula = (data) =>
  Request('/product/sku/smart_formula_pricing/update').data(data).post()

const saleBatchDeleteSku = (data) =>
  Request('/product/sku/batch_delete').data(data).post()

export {
  saleTimeGet,
  saleListGet,
  merchandiseSaleListGet,
  saleListUpdate,
  skuImport,
  refPriceTypeGet,
  refPriceTypeSet,
  smartPriceListGet,
  deleteSaleMenu,
  fetchDefaultSaleMenu,
  fetchSalemenuShareId,
  fetchSalemenuShareInfo,
  setSaleListFormula,
  saleBatchDeleteSku,
}
