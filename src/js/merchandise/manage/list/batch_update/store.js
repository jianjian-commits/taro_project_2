import { i18next } from 'gm-i18n'
import _ from 'lodash'
import { action, observable, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import { getQueryFilterForList, filterSkuByFeeType } from '../../util'
import { addField } from './util'
import { System } from '../../../../common/service'
import globalStore from '../../../../stores/global'

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
    const { isSelectAllPage, list, filter, selectedTree } = store
    let data = {
      ...page,
      all: isSelectAllPage ? 1 : 0,
    }
    if (!isSelectAllPage) {
      const selectedSpu = _.mapKeys(selectedTree, (value, key) => {
        if (value.length) return key
      })
      data = Object.assign({}, data, {
        spu_list: JSON.stringify(_.keys(selectedSpu)),
      })
    }
    if (isSelectAllPage) {
      data = Object.assign({}, data, {
        ...getQueryFilterForList(filter),
        salemenu_is_active: filter.salemenu_is_active ? 1 : null,
      })
      if (System.isC()) {
        data.salemenu_ids = JSON.stringify([globalStore.c_salemenu_id])
        data.is_retail_interface = 1
      }
    }

    Request('/product/spu_supplier/list')
      .data(data)
      .get()
      .then((json) => {
        runInAction(() => {
          this.spus = []
          _.forEach(json.data, (d) => {
            let CNYSkus = {}
            let HKDSkus = {}
            const { spu_id, spu_name, std_unit_name, spu_supplier } = d
            if (isSelectAllPage) {
              CNYSkus = filterSkuByFeeType(d.skus, 'CNY')
              HKDSkus = filterSkuByFeeType(d.skus, 'HKD')
            } else {
              const spu = _.find(list, (spu) => spu.spu_id === d.spu_id)
              const skus = []
              _.forEach(spu.skus, (s) => {
                if (_.find(selectedTree[spu.spu_id], (v) => v === s.sku_id)) {
                  skus.push(s)
                }
              })
              if (spu) {
                CNYSkus = filterSkuByFeeType(skus, 'CNY', true)
                HKDSkus = filterSkuByFeeType(skus, 'HKD', true)
              }
            }
            const basicSpu = {
              supplierList: _.map(spu_supplier, (v) => {
                return {
                  text: v.name,
                  value: v.id,
                  upstream: v.upstream,
                }
              }), // 供应商 List
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
          this.pagination = json.pagination || { count: json.data.length }
        })
      })
  }

  @action
  changeSpuValue(index, field, value) {
    const spu = this.spus[index]
    spu[field] = value
  }

  @action
  changeSupplier(index, value) {
    const spu = this.spus[index]
    spu.supplier = value
    spu.purchaseSpec = null

    this.fetchpurchaseSpecList(index)
  }

  async fetchpurchaseSpecList(spuIndex) {
    const spu = this.spus[spuIndex]
    const suppierId = _.get(spu.supplier, 'value')
    if (!suppierId) {
      spu.purchaseSpecList = []
      return
    }
    const list = await this.requestPurchaseSpec(spu.spu_id, suppierId)
    runInAction(() => {
      spu.purchaseSpecList = list
    })
  }

  requestPurchaseSpec(spu_id, supplier_id) {
    const req = { spu_id, supplier_id }
    // 零售 需要加上零售报价单id
    if (System.isC()) req.salemenu_id = globalStore.c_salemenu_id
    return Request('/product/sku_spec/list')
      .data({
        spu_id,
        supplier_id,
      })
      .get()
      .then((json) =>
        _.map(json.data, (d) => {
          return {
            ...d,
            value: d.id,
            text: d.name,
          }
        })
      )
  }

  @action
  save() {
    const spus = []
    for (const spu of this.spus) {
      const supplier_id = _.get(spu.supplier, 'value') // 供应商ID
      const purchase_spec_id = _.get(spu.purchaseSpec, 'value') // 采购规格ID

      const idParams = _.pick(spu, ['sku_ids', 'spu_id'])
      const params = {}
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
  init() {
    this.pagination = initPagination
    this.spus = []
  }
}

export default new Store()
