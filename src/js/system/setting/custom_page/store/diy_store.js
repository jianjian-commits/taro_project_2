import { i18next } from 'gm-i18n'
import { Request } from '@gm-common/request'
import { action, observable, toJS, computed } from 'mobx'
import _ from 'lodash'

import globalStore from 'stores/global'
import {
  moduleType,
  adLayoutType,
  tabSize,
  createModule,
  getDefaultSkuGroups,
} from '../component/enum'
import { isCStationAndC } from '../../../../common/service'

class DiyStore {
  @observable data = {} // eslint-disable-line

  // 采用两份索引，1. 控制（所有模块）的激活状态， 2.控制（可移动模块）的位置
  // 头部的轮播图、icon模块固定不动，所以（位置索引）在（状态索引）的基础上跳过两个
  // 考虑每个模块自己存储两份索引activeIndex、sortIndex
  @observable sortSkip = 2

  @observable banners = []

  @observable favorites_icon = ''

  @observable combine_goods_icon = ''

  @observable tabSize = tabSize.small

  @observable show_daily_selection = true

  @observable daily_selection_type = 1

  @observable show_v2_ui = 0

  // 模块初始状态
  @observable modules = [
    createModule(moduleType.sku),
    createModule(moduleType.ad),
    createModule(moduleType.coupon),
  ]

  // 缓存营销活动的详情
  @observable promotionDetails = []

  // 营销活动随时可能会被失效，存储所有活动用于判断所选是否失效
  @observable promotionList = []

  // 存储可选的营销活动(过滤掉了空)
  @observable promotionListSelect = []

  @computed
  get labels() {
    const labels = _.hasIn(this.data, 'labels') ? this.data.labels.slice() : []
    return [
      {
        id: 'FAV',
        name: i18next.t('我的收藏'),
        url: this.favorites_icon,
      },
      {
        id: 'COMBINE',
        name: i18next.t('组合商品'),
        url: this.combine_goods_icon,
      },
      ...labels,
    ]
  }

  @computed
  get canEditCombine() {
    return (
      globalStore.hasPermission('add_combine_goods') ||
      globalStore.hasPermission('edit_combine_goods') ||
      globalStore.hasPermission('edit_batch_combine_goods') ||
      globalStore.hasPermission('delete_combine_goods')
    )
  }

  // 获取当前的模板配置信息
  getCurrentConfig() {
    // banners: {id, name, url}
    let {
      banners,
      tabSize,
      modules,
      show_daily_selection,
      daily_selection_type,
    } = this
    modules = modules.map((module) =>
      createModule(module.category, toJS(module)),
    )
    // 模板格式如下
    return {
      banners,
      tabSize,
      modules,
      show_daily_selection,
      daily_selection_type,
    }
  }

  // 设置模板
  @action
  setConfig({
    banners,
    tabSize,
    modules,
    show_daily_selection,
    daily_selection_type,
  }) {
    this.banners = banners
    this.tabSize = tabSize
    this.modules = modules
    this.show_daily_selection = show_daily_selection
    this.daily_selection_type = daily_selection_type
  }

  @action
  getCustomized = async () => {
    let url = '/station/customized'
    // 纯C站点或零售时拉取C的配置
    if (isCStationAndC()) {
      url = '/station/cshop/customized_info/get'
    }
    await this.getPromotionList()
    return Request(url)
      .get()
      .then(
        action((json) => {
          const data = json.data
          let errorIndex = -1
          if (data.is_customiszed) {
            data.homepage = _.map(data.homepage, (v, i) => {
              if (v.category === moduleType.ad) {
                const len = v.ad_imgs_with_url.length
                const all = Object.keys(adLayoutType).length
                if (len < all) {
                  _.forEach(_.range(all - len), () => {
                    v.ad_imgs_with_url.push({})
                  })
                }
              } else if (v.category === moduleType.sku) {
                this.checkPromotion(v, (msg) => {
                  v.error = { sku: msg }
                  if (errorIndex === -1) errorIndex = i
                })
              }
              return v
            })

            this.modules = data.homepage
          } else {
            if (isCStationAndC()) {
              this.modules = [
                createModule(moduleType.ad),
                createModule(moduleType.coupon),
                createModule(moduleType.flashSale),
              ]
            } else {
              this.modules = [
                createModule(moduleType.sku),
                createModule(moduleType.ad),
              ]
            }
          }
          this.show_daily_selection = data.show_daily_selection
          this.daily_selection_type = data.daily_selection_type
          this.tabSize = data.label_size
          this.banners = data.banners_with_url
          this.favorites_icon = data.favorites_icon
          this.combine_goods_icon = data.combine_goods_icon
          this.show_v2_ui = data.show_v2_ui
          this.data = data
          if (errorIndex !== -1) return errorIndex + this.sortSkip
          return data
        }),
      )
  }

  submit() {
    let url = '/station/customized/update'
    // 纯C站点或零售时拉取C的配置
    if (isCStationAndC()) {
      url = '/station/cshop/customized_info/update'
    }
    const data = this.getUpdateParams()
    return Request(url).data(data).post()
  }

  // 切换新/旧版bshopUI
  toggleShopVersion = (version) => {
    return Request('/station/customized/update')
      .data({
        show_v2_ui: version ? 1 : 0,
      })
      .post()
  }

  getUpdateParams() {
    const {
      modules,
      tabSize,
      banners,
      show_daily_selection,
      daily_selection_type,
      favorites_icon,
      combine_goods_icon,
    } = this
    const homepage = _.map(modules, (m, i) => {
      if (m.category === moduleType.sku) {
        return {
          category: m.category,
          title: m.title,
          promotion_id: m.promotion_id,
          show_type: m.show_type,
          sku_display_num: m.sku_display_num
        }
      } else if (m.category === moduleType.ad) {
        const imgs = toJS(m.ad_imgs_with_url).slice(0, m.type)
        return {
          category: moduleType.ad,
          type: m.type,
          ad_imgs_with_url: _.map(imgs, (i) => {
            return { img_id: i.img_id, url: i.url }
          }),
        }
      } else if (m.category === moduleType.coupon) {
        return {
          category: moduleType.coupon,
        }
      } else if (m.category === moduleType.flashSale) {
        return {
          category: moduleType.flashSale,
        }
      }
    })

    const data = {
      show_daily_selection: show_daily_selection ? 1 : 0,
      daily_selection_type,
      favorites_icon,
      combine_goods_icon,
      label_size: tabSize,
      banners_with_url: JSON.stringify(
        _.map(banners, (b) => {
          return { img: b.id, url: b.url }
        }),
      ),
      homepage: JSON.stringify(toJS(homepage)),
    }
    return data
  }

  @action
  checkModules() {
    const { modules } = this

    let errorIndex = -1
    const assignIndex = (i) => {
      if (errorIndex === -1) {
        errorIndex = i + this.sortSkip
      }
    }

    _.each(modules, (m, i) => {
      const error = {}
      if (m.category === moduleType.sku) {
        this.checkPromotion(m, (msg) => {
          assignIndex(i)
          error.sku = msg
        })
        if(m.sku_display_num === null) {
          assignIndex(i)
          error.sku = i18next.t('自定义商品数不能为空')
        }
        if (!m.title) {
          assignIndex(i)
          error.title = i18next.t('请填写商品组标题')
        }
        this.setModulesError(i, error)
      } else if (m.category === moduleType.ad) {
        // type 等于 ad_imgs 数量
        const nums = m.type

        const imgs = toJS(m.ad_imgs_with_url).slice(0, nums)
        const validImg = _.filter(imgs, (img) => !!img.img_id)

        if (validImg.length < nums) {
          assignIndex(i)
          this.setModulesError(i, {
            msg: i18next.t(
              /* tpl: 请上传${nums}张图片 */
              'diy_shop_img_warning',
              { nums },
            ),
          })
        }
      }
    })

    return errorIndex
  }

  @action
  checkPromotion = (module, errorCb) => {
    const msg = this.getPromotionErrorText(module.promotion_id)
    // 营销有问题 使用默认的商品
    if (msg) {
      errorCb(msg)
      module.skus = getDefaultSkuGroups().skus
    }
  }

  getPromotionErrorText = (promotion_id) => {
    if (!promotion_id) {
      return i18next.t('请选择营销活动')
    }
    const p = _.find(this.promotionList, (p) => p.id === promotion_id)
    if (!p || !p.active) {
      return i18next.t(
        '所选营销活动已失效，商城首页不展示该商品组商品，请重新选择营销活动',
      )
    }
    if (!p.valid_sku_nums) {
      return i18next.t(
        '所选营销活动中商品均已下架，商城首页不展示该商品组商品，请上架商品或重新选择营销活动',
      )
    }
    return ''
  }

  @action
  getPromotionDetail = (id) => {
    const promotion = _.find(this.promotionDetails, (v) => v.id === id)
    if (promotion) {
      return Promise.resolve(promotion)
    } else {
      return Request('/station/promotion/get')
        .data({ id, is_retail_interface: isCStationAndC() ? 1 : null })
        .get()
        .then((json) => {
          const data = json.data
          data.id = id
          // 过滤下架商品
          const skus = _.filter(data.skus, (sku) => sku.state)
          if (!skus.length || !data.active) {
            data.skus = getDefaultSkuGroups().skus
          } else {
            data.skus = skus
          }
          this.promotionDetails.push(data)
          return data
        })
    }
  }

  @action
  getPromotionList = () => {
    return Request('/station/promotion/list')
      .data({ all: 1, is_retail_interface: isCStationAndC() ? 1 : null })
      .get()
      .then((json) => {
        let data = json.data
        this.promotionList = data
        data = _.filter(data, (d) => {
          return d.active && d.valid_sku_nums
        })
        this.promotionListSelect = data
        return data
      })
  }

  @action
  setBanners = (banners) => {
    this.banners = banners
  }

  @action
  operateModules = (modules, index = '') => {
    if (index !== '') {
      this.modules[index] = modules
    } else {
      this.modules = modules
    }
  }

  @action
  setFavoriteIcon = (url) => {
    this.favorites_icon = url
  }

  @action
  setCombineIcon = (url) => {
    this.combine_goods_icon = url
  }

  @action
  setTabSize = (type) => {
    this.tabSize = type
  }

  @action
  setDaily = (bool) => {
    this.show_daily_selection = bool
  }

  // 1默认 2常用
  @action
  setDailType = (number) => {
    this.daily_selection_type = number
  }

  @action
  setModules = (index, key, value) => {
    const modules = [...this.modules]
    modules[index][key] = value
    this.modules = modules
  }

  @action
  setModulesError = (index, error) => {
    const modules = [...this.modules]
    modules[index].error = Object.assign({}, modules[index].error, error)
    this.modules = modules
  }
}

export default new DiyStore()
