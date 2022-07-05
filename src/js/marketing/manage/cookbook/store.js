import { action, observable } from 'mobx'
import _ from 'lodash'
import { Request } from '@gm-common/request'
import globalStore from '../../../stores/global'
import { getId, getCookbookInfo } from './util'
// import { Price } from '@gmfe/react'
import { Tip } from '@gmfe/react'
import { i18next } from 'gm-i18n'

class CookbookStore {
  /** 选中报价单数组 */
  @observable saleMenus = [] // [{value: , text: }, ...]

  /** 选中组合商品数组 */
  @observable combineGoodsList = []

  /** 删除的餐次 */
  @observable deleteCookbookInfos = []

  @observable cookbook_id = null

  /** 菜谱管理详情数据 */
  @observable initDataList = {
    salemenus: [],
    cookbook_info: [],
    is_show: 0,
  }

  /** 获取菜谱管理详情数据 */
  @action.bound
  getInitData() {
    return (
      Request('/cookbook/detail')
        // .data({ station_id: 'T7936' })
        .data({ station_id: globalStore.stationId })
        .get()
        .then(({ data }) => {
          if (Object.keys(data).length !== 0) {
            this.initDataList = data
            this.cookbook_id = data.id
            this.saleMenus = _.map(data.salemenus, (item) => {
              return {
                ...item,
                value: item.id,
                text: item.name,
              }
            })
          }
        })
    )
  }

  /** 设置可见报价单 */
  @action.bound
  setSaleMenus(list) {
    this.saleMenus = list
    //  触发组合商品下拉框数据的更新
    this.getCombineGoodsList()
    // 将删除的餐次添加到删除列表
    if (this.initDataList.cookbook_info.length) {
      const cookbookInfo = _.filter(
        this.initDataList.cookbook_info,
        (item) => item.id && item.id !== 'new',
      )
      this.deleteCookbookInfos.push(...cookbookInfo)
    }
    // 清空餐次
    this.initDataList.cookbook_info = []
  }

  // 新建餐次
  @action.bound
  creatNewBatch() {
    this.initDataList.cookbook_info.push({
      name: '-',
      id: 'new',
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    })
  }

  // 修改餐次的名字
  @action.bound
  setMealTimesValue(value, index) {
    this.initDataList.cookbook_info[index].name = value
  }

  // 修改顺序
  @action.bound
  setMove(index, type) {
    // 删除原本位置的数据
    const deleteData = this.initDataList.cookbook_info.splice(index, 1)
    // 插入到对应的位置 type=-1时是上移，1是下移
    this.initDataList.cookbook_info.splice(index + type, 0, ...deleteData)
  }

  // 删除餐次
  @action.bound
  deleteCookbook(index) {
    // 删除index位置的数据
    const deleteData = this.initDataList.cookbook_info.splice(index, 1)
    if (deleteData.id !== 'new') {
      this.deleteCookbookInfos.push(...deleteData)
    }
  }

  // 对应星期的组合商品增加和删除
  @action.bound
  changeCombined(mealTimesIndex, itemIndex, type, week) {
    if (type === -1) {
      // 只有一个时保留
      if (this.initDataList.cookbook_info[mealTimesIndex][week].length === 1)
        return
      // 删除index位置的数据
      this.initDataList.cookbook_info[mealTimesIndex][week].splice(itemIndex, 1)
    } else {
      this.initDataList.cookbook_info[mealTimesIndex][week].push({})
    }
  }

  // 修改星期里的组合商品内容
  @action.bound
  setCombinedGoods(value, week, mealTimesIndex, itemIndex) {
    this.initDataList.cookbook_info[mealTimesIndex][week][itemIndex] =
      value ?? {}
  }

  // 是否在商城里展示
  @action.bound
  setSwitch(value) {
    this.initDataList.is_show = +value
  }

  // 组合商品数据的获取
  @action.bound
  getCombineGoodsList(value) {
    const salemenu_ids = _.map(this.saleMenus, (item) => {
      return item.id ?? item.value
    })
    Request('/cookbook/combine_goods/list')
      .data({
        salemenu_ids: JSON.stringify(salemenu_ids),
        station_id: globalStore.stationId,
        // station_id: 'T7936',
      })
      .get()
      .then((res) => {
        const list = res.data.map((d) => ({
          text: d.name ?? d.text,
          value: d.id,
        }))
        this.combineGoodsList = list
      })
  }

  // 组合商品的模糊搜索
  @action.bound
  searchCombinedGoods(q) {
    Request('/cookbook/combine/search')
      .data({
        station_id: globalStore.stationId,
        salemenu_ids: JSON.stringify(getId(this.saleMenus, 'value')),
        search: q,
      })
      .get()
      .then((res) => {
        const list = res.data.map((d) => ({
          text: d.name,
          value: d.id,
        }))
        this.combineGoodsList = list
      })
  }

  // 检测是否有空的的餐次
  @action.bound
  validatorCookbookInfo() {
    const week = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ]
    let validator = true
    _.forEach(this.initDataList.cookbook_info, (item) => {
      // 1.周一到周日都是空，数组长度为0
      // 2.数组长度不为零，还要判断数组里的对象是否为空，用户可能添加两个空的组合商品
      const weekLength = _.filter(week, (j) => {
        return (
          item[j].length === 0 ||
          (item[j].length !== 0 &&
            !_.filter(item[j], (k) => Object.keys(k).length).length)
        )
      })
      // weekLength的长度是7时，代表用户没有在餐次中添加任何组合商品
      if (weekLength.length === 7) {
        validator = false
      }
    })
    return validator
  }

  // 保存
  @action.bound
  saveCookbook() {
    const { cookbook_info, is_show } = this.initDataList
    if (!cookbook_info.length || !this.saleMenus.length) {
      return Tip.danger(i18next.t('请添加餐次！'))
    }
    const req = {
      is_show,
      // station_id: 'T7936',
      // group_id: '356',
      station_id: globalStore.stationId,
      group_id: globalStore.groupId,
      salemenu_ids: JSON.stringify(getId(this.saleMenus, 'value')),
      cookbook_info: JSON.stringify(getCookbookInfo(cookbook_info)),
      delete_cookbook_infos: JSON.stringify(
        getId(this.deleteCookbookInfos, 'id'),
      ),
      cookbook_id: this.cookbook_id,
    }

    return Request('/cookbook/detail')
      .data(req)
      .post()
      .then(() => {
        // 清空已经删除的id
        this.deleteCookbookInfos = []
      })
  }
}
export default new CookbookStore()
