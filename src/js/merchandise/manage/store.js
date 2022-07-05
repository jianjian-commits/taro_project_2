import { i18next } from 'gm-i18n'
import { observable, action, runInAction } from 'mobx'
import {
  fetchServiceTime,
  getCategory1,
  getCategory2,
  getPinlei,
  fetchSalemenuList,
  setRefPrice,
  getRefPrice,
} from './api'
import _ from 'lodash'
import { Request } from '@gm-common/request'
import { uploadQiniuImage } from 'common/service'

class ManageStore {
  @observable categories = []

  // 请自行console查看结构
  @observable cate1Map = {} // eslint-disable-line

  @observable cate2Map = {} // eslint-disable-line

  @observable pinleiMap = {} // eslint-disable-line

  @observable serviceTime = []

  @observable activeSelfSalemenuList = [] // 已激活的自售单

  @observable salemenuList = [] // 报价单列表

  @observable allSalemenuList = [] // 所有报价单，包含自售单和代售单

  @observable reference_price_type = 1

  @observable spuSupplierList = [] // 某spu的供应商列表

  @observable processLabelList = [] // 商品加工标签列表

  @action
  getAllMerchandise() {
    if (!this.categories.length) {
      Promise.all([getCategory1(), getCategory2(), getPinlei()]).then(
        (result) => {
          const categories = []
          const cate1Map = {}
          const cate2Map = {}
          const pinleiMap = {}

          const category1 = result[0].data
          const category2 = result[1].data
          const pinlei = result[2].data

          _.forEach(category1, (cate1) => {
            cate1Map[cate1.id] = cate1
            cate1.children = []
            categories.push(cate1)
          })

          _.forEach(category2, (cate2) => {
            cate2Map[cate2.id] = cate2
            cate2.children = []
            if (
              cate1Map[cate2.upstream_id] &&
              cate1Map[cate2.upstream_id].children
            ) {
              cate1Map[cate2.upstream_id].children.push(cate2)
            }
          })

          _.forEach(pinlei, (pl) => {
            pinleiMap[pl.id] = pl
            if (cate2Map[pl.upstream_id] && cate2Map[pl.upstream_id].children) {
              cate2Map[pl.upstream_id].children.push(pl)
            }
          })

          this.categories = categories
          this.cate1Map = cate1Map
          this.cate2Map = cate2Map
          this.pinleiMap = pinleiMap
          this.category1 = category1
        },
      )
    }
  }

  @action
  getServerTime() {
    fetchServiceTime({ details: 0 }).then((json) => {
      runInAction(() => {
        this.serviceTime = json.data || []
      })
    })
  }

  @action
  getActiveSelfSalemenuList() {
    fetchSalemenuList({ type: 4, is_active: 1 }).then((json) => {
      this.activeSelfSalemenuList = _.map(json.data, (v) => {
        return {
          ...v,
          text: v.name,
          value: v.id,
        }
      })
    })
  }

  @action
  setRefPriceType(where, type) {
    setRefPrice(where, type).then(() => {
      runInAction(() => {
        this.reference_price_type = type
      })
    })
  }

  @action
  getRefPriceType(where) {
    getRefPrice(where).then((json) => {
      runInAction(() => {
        this.reference_price_type = json.data.type
      })
    })
  }

  @action
  getSalemenuList(data) {
    fetchSalemenuList(data).then((json) => {
      this.salemenuList = _.map(json.data, (v) => {
        return {
          ...v,
          text: v.name,
          value: v.id,
        }
      })
    })
  }

  @action
  getAllSalemenuList() {
    fetchSalemenuList().then((json) => {
      this.allSalemenuList = _.map(json.data, (v) => {
        return {
          ...v,
          text: v.name,
          value: v.id,
        }
      })
    })
  }

  @action
  uploadImg(file) {
    return uploadQiniuImage(file, 'product_img')
  }

  @action
  getSpuSupplierList(spu_id) {
    Request('/product/sku_supplier/list_new')
      .data({ spu_id })
      .get()
      .then(({ data }) => {
        runInAction(() => {
          const list = {
            recommend_suppliers: data.recommend_suppliers,
            other_suppliers: data.other_suppliers,
          }
          this.spuSupplierList = Object.entries(list).map(([key, value]) => {
            return {
              label:
                key === 'other_suppliers'
                  ? i18next.t('其他供应商')
                  : i18next.t('推荐供应商'),
              children: value.map((item) => ({
                value: item.id,
                text: item.name,
                upstream: item.upstream,
              })),
            }
          })
        })
      })
  }

  /**
   * 获取商品加工标签列表
   */
  @action
  fetchProcessLabelList() {
    return Request('/process/label/list')
      .get()
      .then((json) => {
        runInAction(() => {
          const data = _.map(json.data, (item) => {
            return {
              text: item.name,
              value: item.id,
            }
          })

          this.processLabelList = data
        })
        return json
      })
  }
}

export default new ManageStore()
