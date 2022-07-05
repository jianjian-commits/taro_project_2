/* eslint-disable gm-react-app/no-observable-empty-object */
import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { Tip } from '@gmfe/react'
import {
  hasImagesType,
  noImagesType,
  runCloudImagesType,
  eachForMap,
} from './util'
import { history, uploadQiniuImage } from 'common/service'
import { initFilter } from './init'

class Store {
  @observable filter = { ...initFilter }
  @observable type = runCloudImagesType // 1 云图库， 2 压缩包
  @observable loadingProgress = 0
  @observable loading = true
  @observable list = []
  @observable listWithFilter = []
  @observable fileName = ''
  @observable withoutImagesLength = 0
  @observable category1NameMap = {}
  @observable category2NameMap = {}
  zipFile = null
  withoutImages = []

  @action
  setZipFile(file) {
    this.fileName = file.name
    this.zipFile = file
  }

  @action
  search() {
    const {
      categoryFilter: { category2_ids, category1_ids },
      selected,
      q,
    } = this.filter
    let list = this.list.slice()

    if (q) {
      list = _.filter(list, (i) => i.name.includes(q))
    }
    if (selected) {
      list = _.filter(list, (item) => {
        return (
          (hasImagesType === selected && item?.image_list?.length) ||
          (noImagesType === selected && !item?.image_list?.length)
        )
      })
    }
    const category2Ids = _.map(category2_ids, (id) => id.id)
    const category1Ids = _.map(category1_ids, (id) => id.id)
    if (category2Ids.length) {
      list = _.filter(list, (i) => category2Ids.includes(i.category_id_2))
    } else if (category1Ids.length) {
      list = _.filter(list, (i) => category1Ids.includes(i.category_id_1))
    }
    this.listWithFilter = list
  }

  @action
  submit() {
    const spuList = []
    _.each(this.listWithFilter, (item) => {
      if (item.image_list) {
        spuList.push({
          id: item.id,
          image_ids: _.map(item.image_list, (image) => image.id),
        })
      }
    })
    if (!spuList.length) {
      Tip.info(t('没有可更新的图片'))
      return Promise.reject(new Error('no images'))
    }
    return Request('/merchandise/spu/batch_update_images')
      .data({ spu_list: JSON.stringify(spuList) })
      .post()
      .then(() => {
        Tip.info(t('更新图片成功'))
        history.replace('/merchandise/manage/list')
      })
  }

  @action
  getSpuWithoutImage() {
    return Request('/merchandise/spu/without_image')
      .get()
      .then(
        action('without_image', (json) => {
          this.withoutImages = json.data.spus
          this.withoutImagesLength = json.data.spus.length
        })
      )
  }

  @action
  reset() {
    this.filter = { ...initFilter }
    this.list = []
    this.listWithFilter = []
    this.loadingProgress = 0
  }

  @action
  setFilter(key, value) {
    this.filter[key] = value
  }

  @action
  setType(type) {
    this.type = type
    this.zipFile = null
    this.fileName = ''
  }

  @action
  setLoadingProgress(processSchedule) {
    this.loadingProgress = processSchedule
  }

  @action
  setLoading(bool) {
    this.loading = bool
    if (bool) {
      this.reset()
    }
  }

  @action
  postStartCompute() {
    return Request('/merchandise/spu/recommend_image/batch_match').post()
  }

  @action
  getRecommendResult(taskUrl) {
    return Request(taskUrl).data().get()
  }

  @action
  setRecommendResult(list) {
    this.list = list
    this.listWithFilter = list
  }

  @action
  deleteItem(index) {
    this.listWithFilter.splice(index, 1)
  }

  @action.bound
  async matchImages(fileMap) {
    const list = []
    for (const item of this.withoutImages) {
      const file = fileMap[item.name]
      let imageList = []
      if (file) {
        try {
          const image = await this.uploadImg(file, 'product_img').then(
            (json) => json.data
          )
          imageList = [image]
        } catch (error) {
          console.log(error)
          Tip.info('上传失败，请重试')
          Promise.reject(error)
        }
      }
      list.push({ ...item, image_list: imageList })
    }

    this.setRecommendResult(list)
    this.zipFile = null
    this.fileName = ''
  }

  @action
  updateSpuImages(index, images) {
    this.listWithFilter[index].image_list = images
  }

  uploadImg(file) {
    return uploadQiniuImage(file, 'product_img')
  }

  @action.bound
  getCategory1() {
    return Request('/merchandise/category1/get')
      .get()
      .then(
        action('getCategory1', (json) => {
          this.category1NameMap = eachForMap(json.data)
          return json
        })
      )
  }

  @action.bound
  getCategory2() {
    return Request('/merchandise/category2/get')
      .get()
      .then(
        action('getCategory2', (json) => {
          this.category2NameMap = eachForMap(json.data)
          return json
        })
      )
  }

  @action
  getPinlei() {
    return Promise.resolve({ data: [] })
  }
}

export default new Store()
