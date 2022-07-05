import { observable, action, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import { Tip } from '@gmfe/react'
import { getExpanderList } from './util'
import {
  dealCombineGoodsData,
  asyncQuantityAndFakeQuantity,
  asyncSalePrice,
  setSalePriceIfCombineGoods,
} from '../util'

const initRecognition = {
  vaild: [],
  textIndex: [],
  isEdit: true,
  isLoading: false,
}

class Store {
  @observable tabKey = 0

  // 文字识别
  @observable textRecognition = { ...initRecognition, errorNum: 0 }

  @observable searchText = ''

  // 图片识别
  @observable imgList = []

  // 图片识别结果
  @observable imgRecognition = { ...initRecognition }
  @action
  skusRecognize(time_config_id, address_id, searchCombineGoods) {
    this.textRecognition.isLoading = true
    const recognition_text = this.searchText
    return Request('/station/skus/recognize')
      .data({
        address_id,
        time_config_id,
        recognition_text,
        search_combine_goods: searchCombineGoods ? 1 : 0,
      })
      .post()
      .then((json) => {
        runInAction(() => {
          const { vaild, error_num, index } = json.data
          this.textRecognition = {
            vaild: getExpanderList(vaild),
            textIndex: index,
            errorNum: error_num,
            isEdit: false,
            isLoading: false,
          }
          this.searchText = recognition_text
        })
      })
  }

  @action
  toEdit(type) {
    if (type === 'text') {
      this.textRecognition.isEdit = true
    } else {
      this.imgRecognition.isEdit = true
    }
  }

  setVaild(type, list) {
    if (type === 'img') {
      this.imgRecognition.vaild = list
    } else {
      this.textRecognition.vaild = list
    }
  }

  @action
  changeItemNum(index, type, vaildType, value) {
    const list =
      vaildType === 'img'
        ? this.imgRecognition.vaild.slice()
        : this.textRecognition.vaild.slice()
    const currentSku = list[index]
    const params = {
      value,
      key: type,
      index,
      id: currentSku.id,
      belongWith: currentSku.belongWith,
    }
    if (currentSku.is_combine_goods) {
      asyncQuantityAndFakeQuantity(params, list)
    }
    asyncSalePrice(params, list)
    currentSku[type] = value
    list[index] = currentSku
    this.setVaild(vaildType, list)
  }

  @action
  changeItem(index, subIndex, type) {
    const list =
      type === 'img'
        ? this.imgRecognition.vaild.slice()
        : this.textRecognition.vaild.slice()
    const currentSku = list[index]
    const quantity = currentSku.quantity
    const changed = currentSku.others[subIndex]
    // 删除组合商品
    if (currentSku.isCombineGoodsTop) {
      list.splice(index, currentSku.skus.length + 1)
    }
    if (changed.is_combine_goods) {
      const items = dealCombineGoodsData(changed, currentSku.quantity)
      setSalePriceIfCombineGoods(items)
      items.length && list.splice(index, 1, ...items)
    } else {
      list[index] = { ...changed, quantity }
    }
    this.setVaild(type, list)
  }

  @action
  removeItem(index, type) {
    const list =
      type === 'img'
        ? this.imgRecognition.vaild.slice()
        : this.textRecognition.vaild.slice()
    const sku = list[index]
    if (sku.isCombineGoodsTop) {
      const combineGoodsLength = sku.skus.length
      list.splice(index, combineGoodsLength + 1)
    } else {
      list.splice(index, 1)
    }
    this.setVaild(type, list)
  }

  @action
  changeText(v) {
    this.searchText = v
  }

  @action
  clear() {
    this.textRecognition = { ...initRecognition, errorNum: 0 }
    this.imgRecognition = { ...initRecognition }
    this.imgList = []
  }

  @action
  clearText() {
    this.searchText = ''
  }

  @action
  skuImgRecognition(time_config_id, address_id, files, searchCombineGoods) {
    this.imgRecognition.isLoading = true
    return Request('/station/skus/img/recognize')
      .data({
        address_id,
        time_config_id,
        file_list: files,
        search_combine_goods: searchCombineGoods ? 1 : 0,
      })
      .code(4)
      .post()
      .then((json) => {
        runInAction(() => {
          if (json.code === 4) {
            Tip.warning(json.msg)
            this.imgRecognition.isLoading = false
          } else {
            const { vaild, index } = json.data
            this.imgRecognition = {
              vaild: getExpanderList(vaild),
              textIndex: index,
              isEdit: false,
              isLoading: false,
            }
          }
        })
      })
  }

  @action
  setImgList(files) {
    this.imgList = files
  }

  @action
  setTabKey(key) {
    this.tabKey = key
  }
}

export default new Store()
