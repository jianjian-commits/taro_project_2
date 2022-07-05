import { i18next } from 'gm-i18n'
import { observable, action, runInAction } from 'mobx'
import { fetchServiceTime, getCategory1, getCategory2, getPinlei } from './api'
import { Tip } from '@gmfe/react'
import _ from 'lodash'

class MerchandiseStore {
  @observable categories = []

  // 请自行console查看结构
  @observable cate1Map = {}

  @observable cate2Map = {}

  @observable pinleiMap = {}

  @observable serviceTime = []

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
        }
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
}

export default new MerchandiseStore()
