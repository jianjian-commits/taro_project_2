import { observable, action } from 'mobx'
import _ from 'lodash'

export class Store {
  @observable categories = []

  @observable cate1Map = {}

  @observable cate2Map = {}

  @observable pinleiMap = {}

  @action
  clear() {
    this.categories = []
    this.cate1Map = {}
    this.cate2Map = {}
    this.pinleiMap = {}
  }

  @action
  init(api) {
    Promise.all([api.getCategory1(), api.getCategory2(), api.getPinlei()]).then(
      (result) => {
        const categories = []
        const cate1Map = {}
        const cate2Map = {}
        const pinleiMap = {}

        const category1 = result[0].data.sort((pre, cur) => cur.rank - pre.rank)
        const category2 = result[1].data.sort((pre, cur) => cur.rank - pre.rank)
        const pinlei = result[2].data.sort((pre, cur) => cur.rank - pre.rank)

        _.forEach(category1, (cate1) => {
          cate1Map[cate1.id] = cate1
          cate1.children = []
          cate1.value = cate1.id
          cate1.text = cate1.name
          categories.push(cate1)
        })

        _.forEach(category2, (cate2) => {
          cate2Map[cate2.id] = cate2
          cate2.value = cate2.id
          cate2.text = cate2.name
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
          pl.value = pl.id
          pl.text = pl.name
          if (cate2Map[pl.upstream_id] && cate2Map[pl.upstream_id].children) {
            cate2Map[pl.upstream_id].children.push(pl)
          }
        })

        this.categories = categories
      },
    )
  }
}

export default new Store()
