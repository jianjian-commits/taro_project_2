import { i18next } from 'gm-i18n'
import _ from 'lodash'
import { action, observable, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import { getQueryFilter, addField, filterSkuByFeeType } from '../util'

const initPagination = {
  count: 0,
  offset: 0,
  limit: 10,
}
class Store {
  @observable spus = []
  @observable pagination = initPagination

  @action
  getSpuList(store, page = this.pagination) {
    const { selectAllType, list, isShowUnActive } = store
    const isAll = selectAllType === 2
    let data = {
      ...page,
      all: isAll ? 1 : 0,
    }
    if (!isAll) {
      let spu_list = []
      _.forEach(list, (v) => {
        if (_.find(v.skus, (v) => v._gm_select)) spu_list.push(v.spu_id)
      })

      data = Object.assign({}, data, {
        spu_list: JSON.stringify(spu_list),
      })
    }
    if (isAll) {
      data = Object.assign({}, data, {
        ...getQueryFilter(store),
        salemenu_is_active: isShowUnActive ? 1 : null,
      })
    }

    Request('/product/spu_supplier/list')
      .data(data)
      .get()
      .then((json) => {
        runInAction(() => {
          _.forEach(json.data, (d) => {
            let CNYSkus = {}
            let HKDSkus = {}
            const { spu_id, spu_name, std_unit_name, spu_supplier } = d
            const basicSpu = {
              supplierList: spu_supplier, // 供应商 List
              purchaseSpecList: [], // 采购规格 List
              purchaseSpec: null, // 当前选中的
              supplier: null, // 当前选中的供应商
              std_sale_price_forsale: '', // 销售单价(销售计量单位)
              std_sale_price: '', // 销售单价(基本单位)
              sale_ratio: '', // 销售规格
              sale_unit_name: '', // 销售单位
              spu_id,
              spu_name,
              std_unit_name,
              std_unit_name_forsale: '',
            }
            if (isAll) {
              CNYSkus = filterSkuByFeeType(d.skus, 'CNY')
              HKDSkus = filterSkuByFeeType(d.skus, 'HKD')
            } else {
              const spu = _.find(list, (spu) => spu.spu_id === d.spu_id)
              if (spu) {
                CNYSkus = filterSkuByFeeType(spu.skus, 'CNY', true)
                HKDSkus = filterSkuByFeeType(spu.skus, 'HKD', true)
              }
            }
            if (CNYSkus.length)
              this.spus.push(
                Object.assign({}, basicSpu, {
                  sku_ids: CNYSkus,
                  fee_type: 'CNY',
                })
              )
            if (HKDSkus.length)
              this.spus.push(
                Object.assign({}, basicSpu, {
                  sku_ids: HKDSkus,
                  fee_type: 'HKD',
                })
              )
          })
          this.pagination =
            json.pagination ||
            Object.assign({}, initPagination, { count: json.data.length })
        })
      })
  }

  @action
  changeSpuValue(index, field, value) {
    let spu = this.spus[index]
    spu[field] = value
  }

  @action
  changeSupplier(index, value) {
    let spu = this.spus[index]
    spu.supplier = value
    spu.purchaseSpec = null

    this.fetchpurchaseSpecList(index)
  }

  async fetchpurchaseSpecList(spuIndex) {
    let spu = this.spus[spuIndex]
    let suppierId = _.get(spu.supplier, 'id')
    if (!suppierId) {
      spu.purchaseSpecList = []
      return
    }
    let list = await this.requestPurchaseSpec(spu.spu_id, suppierId)
    runInAction(() => {
      spu.purchaseSpecList = list
    })
  }

  requestPurchaseSpec(spu_id, supplier_id) {
    return Request('/product/sku_spec/list')
      .data({
        spu_id,
        supplier_id,
      })
      .get()
      .then((json) => json.data)
  }

  @action
  save() {
    let spus = []
    for (let spu of this.spus) {
      let supplier_id = _.get(spu.supplier, 'id') // 供应商ID
      let purchase_spec_id = _.get(spu.purchaseSpec, 'id') // 采购规格ID

      let idParams = _.pick(spu, ['sku_ids', 'spu_id'])
      let params = {}
      addField(
        params,
        _.pick(spu, ['std_sale_price_forsale', 'sale_ratio']),
        Number
      )
      addField(params, {
        sale_unit_name: spu.sale_unit_name,
        std_unit_name_forsale: spu.std_unit_name_forsale,
        purchase_spec_id,
        supplier_id,
      })

      // 修改供应商 也需要修改采购规格
      if (params.supplier_id && !params.purchase_spec_id) {
        throw new Error(i18next.t('请选择采购规格！'))
      }
      // 修改了销售计量单位，也需要修改规格
      if (params.std_unit_name_forsale && !params.sale_unit_name) {
        throw new Error(i18next.t('修改了销售计量单位，请同步修改规格！'))
      }
      // 修改了字段
      if (Object.keys(params).length > 0) {
        _.assign(params, idParams)
        spus.push(params)
      }
    }
    if (spus.length === 0) {
      throw new Error(i18next.t('未作任何修改，请录入修改字段'))
    }

    return Request('/product/sku/batch_update')
      .data({ skus: JSON.stringify(spus) })
      .post()
  }

  @action
  clear() {
    this.spus = []
    this.pagination = initPagination
  }
}

export default new Store()
