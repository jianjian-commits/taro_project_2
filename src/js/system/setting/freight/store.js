import { i18next } from 'gm-i18n'
import { Tip } from '@gmfe/react'
import { observable, action, computed } from 'mobx'
import { Request } from '@gm-common/request'
import {
  addressConvertTree,
  saleMenuConvertTree,
  merchantLabelConvertTree,
  cAddressConvertTree,
} from './util'
import _ from 'lodash'
import moment from 'moment'
import { history } from '../../../common/service'
import globalStore from 'stores/global'
import { numberToType } from './util'

let orgTemplateData = null

const initFreight = {
  foundation: 'Money',
  dimension: 'Interval',
  way: 'Artificial',
}

const noFreight = {
  foundation: '',
  dimension: '',
  way: '',
}

const FreightType = {
  // 按金额计算--->按下单金额区间设置--->人工设置
  MoneyIntervalArtificial: 2,
  // 按金额计算--->按下单金额区间设置--->自动设置价格区间
  MoneyIntervalAuto: 3,
  // 按金额计算--->按下单金额比例设置
  MoneyProportion: 4,
  // 按距离计算
  Distance: 5,
}
class FreightStore {
  @computed get placeHolder() {
    const _default = {
      left: i18next.t('输入商户名或模板名称'),
      right: i18next.t('输入商户名'),
    }
    switch (this.filterType) {
      case 1:
        return _default
      case 2:
        return {
          left: i18next.t('搜索报价单或模板名称'),
          right: i18next.t('搜索报价单或模板名称'),
        }
      case 3:
        return {
          left: i18next.t('搜索商户标签或模板名称'),
          right: i18next.t('搜索商户标签或模板名称'),
        }
      default:
        return _default
    }
  }

  @computed get viewDeliveryNumber() {
    const { foundation, dimension, way } = this.freightOfDelivery
    const type = `${foundation}${dimension}${way}`
    if (type) {
      return FreightType[type]
    } else {
      return 1
    }
  }

  @computed get viewPickUpNumber() {
    const { foundation, dimension, way } = this.freightOfPickUp
    const type = `${foundation}${dimension}${way}`
    if (type) {
      return FreightType[type]
    } else {
      return 1
    }
  }

  @observable merchantCategory = [
    {
      text: i18next.t('按地理标签'),
      value: 1,
    },
    {
      text: i18next.t('按报价单'),
      value: 2,
    },
    {
      text: globalStore.otherInfo.isCStation
        ? i18next.t('按客户标签')
        : i18next.t('按商户标签'),
      value: 3,
    },
  ]

  @observable filterType = 1

  @observable freightTemplateList = []

  // 商户列表
  @observable merchantList = []

  // 选中商户列表
  @observable merchantSelectedOrigin = []
  @observable merchantListSelected = []

  @observable isLoading = false

  // 是否收运费
  @observable isFreightOfDelivery = 0
  @observable freightOfDelivery = { ...noFreight }

  // 自提运费
  @observable isFreightOfPickUp = 0
  @observable freightOfPickUp = { ...noFreight }

  @observable cMerchantList = []

  // 因为切换按距离计算运费section[0].min要设置为0
  // 所以用tempMinObj暂存一下delivery_freight和pick_up_freight里面section[0].min
  @observable tempMinObj = {
    delivery: 0,
    pick_up: 0,
  }

  // 默认模板
  @observable templateData = {
    id: '',
    name: '',
    delivery_freight: {
      min_total_price: 0,
      amount_auto_section: {
        base_charge: '',
        origin_fee: '',
        increase_fee: '',
        addition_fee: '',
        free_fee: null,
      },
      scale_set: {
        percentage: '',
        free_fee: null,
      },
      section: [
        {
          min: 0,
          max: 0,
          freight: 0,
        },
      ],
    },
    pick_up_freight: {
      min_total_price: 0,
      amount_auto_section: {
        base_charge: '',
        origin_fee: '',
        increase_fee: '',
        addition_fee: '',
        free_fee: null,
      },
      scale_set: {
        percentage: '',
        free_fee: null,
      },
      section: [
        {
          min: 0,
          max: 0,
          freight: 0,
        },
      ],
    },
  }

  // 'create' / 'edit' 创建 / 编辑 运费模板
  @observable viewType = 'create'

  @action
  resetData = () => {
    this.filterType = 1
    this.merchantSelectedOrigin = []
    this.merchantListSelected = []
  }

  @action.bound
  getFreightTemplateList() {
    this.isLoading = true
    return Request('/station/freight/list')
      .data()
      .get()
      .then((json) => {
        const list = json.data.slice()
        list.sort((a, b) => {
          return moment(a.create_time).isBefore(moment(b.create_time)) ? -1 : 1
        })
        this.freightTemplateList = list
        this.isLoading = false
      })
  }

  @action.bound
  getFreightMerchantList(id) {
    this.isLoading = true
    return Request('/station/freight/address/list')
      .get()
      .then((json) => {
        this.merchantList = json.data
        this.isLoading = false
        id && this.getMerchantListSelected(id)
      })
  }

  // 拉取toc商户列表
  getCMerchantList() {
    return Request('/station/freight/c_user/list')
      .get()
      .then((json) => {
        // 处理toc商户列表
        this.cMerchantList = json.data
      })
  }

  @action
  getMerchantListSelected(id) {
    // 增加零售客户
    let cMerchantSelected = []
    if (id) {
      this.merchantSelectedOrigin = _.filter(
        this.merchantList.slice(),
        (address) => address.freight_id === id,
      )
      cMerchantSelected = _.filter(
        this.cMerchantList.slice(),
        (merchant) => merchant.freight_id === id,
      )
    }
    const bSelected = this.convertTree(
      this.merchantSelectedOrigin,
      this.filterType,
    )
    let cSelected = []
    const list = cAddressConvertTree(cMerchantSelected, [])
    cSelected = list.length && list[0].children.length ? list : []
    this.merchantListSelected = bSelected.concat(cSelected)
  }

  @action.bound
  changeViewType(type) {
    this.viewType = type
  }

  @action.bound
  clearTemplateData() {
    this.templateData = {
      id: '',
      name: '',
      delivery_freight: {
        min_total_price: 0,
        amount_auto_section: {
          base_charge: '',
          origin_fee: '',
          increase_fee: '',
          addition_fee: '',
          free_fee: null,
        },
        scale_set: {
          percentage: '',
          free_fee: null,
        },
        section: [
          {
            min: 0,
            max: 0,
            freight: 0,
          },
        ],
      },
      pick_up_freight: {
        min_total_price: 0,
        amount_auto_section: {
          base_charge: '',
          origin_fee: '',
          increase_fee: '',
          addition_fee: '',
          free_fee: null,
        },
        scale_set: {
          percentage: '',
          free_fee: null,
        },
        section: [
          {
            min: 0,
            max: 0,
            freight: 0,
          },
        ],
      },
    }
    this.isFreightOfDelivery = 0
    this.isFreightOfPickUp = 0
  }

  @action.bound
  getFreightTemplateDetail(id) {
    return Request('/station/freight/detail')
      .data({ id })
      .get()
      .then((json) => {
        const data = json.data
        // 后台兼容以前的运费，以前设置的delivery_type都是null
        if (data.delivery_type) {
          if (data.delivery_type > 1) {
            this.isFreightOfDelivery = 1
            this.freightOfDelivery = numberToType(data.delivery_type)
          }
        } else {
          if (
            !(
              data.delivery_freight.section.length === 1 &&
              data.delivery_freight.section[0].freight === 0
            )
          ) {
            this.isFreightOfDelivery = 1
            this.freightOfDelivery = numberToType(2)
          }
        }

        if (data.pick_up_type) {
          if (data.pick_up_type > 1) {
            this.isFreightOfPickUp = 1
            this.freightOfPickUp = numberToType(data.pick_up_type)
          }
        } else {
          if (
            !(
              data.pick_up_freight.section.length === 1 &&
              data.pick_up_freight.section[0].freight === 0
            )
          ) {
            this.isFreightOfPickUp = 1
            this.freightOfPickUp = numberToType(2)
          }
        }

        const _data = {
          id: data.id,
          name: data.name,
          delivery_freight: {
            ...this.templateData.delivery_freight,
            ...data.delivery_freight,
          },
          pick_up_freight: {
            ...this.templateData.pick_up_freight,
            ...data.pick_up_freight,
          },
        }

        this.templateData = _data
        orgTemplateData = _data
        this.getMerchantListSelected(id)
      })
  }

  @action
  delFreightTemplate(data) {
    return Request('/station/freight/delete')
      .data(data)
      .post()
      .then((json) => {
        if (!json.code) {
          this.getFreightTemplateList()
          this.getFreightMerchantList()
          Tip.success(i18next.t('模板删除成功.'))

          // 拉取模板列表 / 商户列表 -- toc拉取C商户列表，tob拉取b+c商户列表
          const { isCStation } = globalStore.otherInfo
          if (isCStation) {
            this.getCAddressList()
            return
          }

          this.getFreightAddressList().then(() => {
            this.getCAddressList()
          })
        }
      })
  }

  @action.bound
  setDefaultTemplate(data) {
    return Request('/station/freight/setdefault')
      .data(data)
      .post()
      .then((json) => {
        if (!json.code) {
          this.getFreightTemplateList()
          Tip.success(i18next.t('设置默认模板成功'))
        }
      })
  }

  @action.bound
  uploadFreightTemplate(data) {
    return Request('/station/freight/edit_new')
      .data(data)
      .post()
      .then((json) => {
        if (!json.code) {
          Tip.success(i18next.t('模板修改成功'))
          this.changeMerchantListSelected([])
          // 清空模板
          this.clearTemplateData()
          history.push('/system/setting/freight')
        }
      })
  }

  @action.bound
  createFreightTemplate(data) {
    return Request('/station/freight/create')
      .data(data)
      .post()
      .then((json) => {
        if (!json.code) {
          Tip.success(i18next.t('模板创建成功.'))
          history.push('/system/setting/freight')
          this.changeMerchantListSelected([])
          this.clearTemplateData()
        }
      })
  }

  @action.bound
  changeMerchantListSelected(list) {
    this.merchantListSelected = list
  }

  @action.bound
  // 切换 是否收运费
  changeFreightType(value, type) {
    if (type === 'delivery_freight') {
      this.isFreightOfDelivery = value
      if (value) {
        this.freightOfDelivery = { ...initFreight }
      } else {
        this.freightOfDelivery = { ...noFreight }
      }
    } else {
      this.isFreightOfPickUp = value
      if (value) {
        this.freightOfPickUp = { ...initFreight }
      } else {
        this.freightOfPickUp = { ...noFreight }
      }
    }

    if (value === 0) {
      this.templateData = {
        ...this.templateData,
        [type]: {
          amount_auto_section: {
            base_charge: '',
            origin_fee: '',
            increase_fee: '',
            addition_fee: '',
            free_fee: null,
          },
          scale_set: {
            percentage: '',
            free_fee: null,
          },
          min_total_price: this.templateData[type].min_total_price,
          section: [
            {
              min: this.templateData[type].min_total_price || 0,
              max: 0,
              freight: 0,
            },
          ],
        },
      }
    } else {
      if (this.viewType === 'edit') {
        this.templateData = {
          ...this.templateData,
          [type]: {
            ...orgTemplateData[type],
          },
        }
      }
    }
  }

  changeTemplateData(type, section) {
    this.templateData = {
      ...this.templateData,
      [type]: {
        ...this.templateData[type],
        section,
      },
    }
  }

  // 更改起送价
  @action.bound
  changeStartPrice(value, type) {
    const section = this.templateData[type].section.slice()
    if (
      type === 'delivery_freight' &&
      (this.viewDeliveryNumber === 2 || this.viewDeliveryNumber === 1)
    ) {
      section[0].min = value
    }
    if (
      type === 'pick_up_freight' &&
      (this.viewPickUpNumber === 2 || this.viewPickUpNumber === 1)
    ) {
      section[0].min = value
    }
    this.templateData = {
      ...this.templateData,
      [type]: {
        ...this.templateData[type],
        min_total_price: value,
        section,
      },
    }
  }

  // 更改 金额比例 自动设置价格区间与运费
  @action.bound
  changeDimensionAndWay(type, key, obj) {
    this.templateData = {
      ...this.templateData,
      [type]: {
        ...this.templateData[type],
        [key]: { ...this.templateData[type][key], ...obj },
      },
    }
  }

  // 增加运费区间
  @action.bound
  addFreightSection(price, type) {
    const section = this.templateData[type].section.slice()

    const len = section.length
    section.splice(
      len - 1,
      1,
      {
        min: price,
        max: '',
        freight: '',
      },
      section[len - 1],
    )
    this.changeTemplateData(type, section)
  }

  // 删除运费区间
  @action.bound
  delFreightSection(index, type) {
    const section = this.templateData[type].section.slice()
    section.splice(index, 1)
    this.changeTemplateData(type, section)
  }

  @action.bound
  changeMaxPrice(index, value, type) {
    const section = this.templateData[type].section.slice()
    section[index].max = value
    if (index !== section.length - 1) {
      section[index + 1].min = value
    }
    this.changeTemplateData(type, section)
  }

  @action.bound
  changeName(value) {
    this.templateData = {
      ...this.templateData,
      name: value,
    }
  }

  // 修改运费金额
  @action.bound
  changeFreightAmount(index, value, type) {
    const section = this.templateData[type].section.slice()
    section[index].freight = value
    this.changeTemplateData(type, section)
  }

  @action
  changeFilterType = (v, id) => {
    this.filterType = v
    this.getMerchantListSelected(id)
  }

  @action
  convertTree = (data, type) => {
    switch (type) {
      case 1:
        return addressConvertTree(data, [])
      case 2:
        return saleMenuConvertTree(data)
      case 3:
        return merchantLabelConvertTree(data)
      default:
        return addressConvertTree(data, [])
    }
  }

  @computed get merchantGroup() {
    return this.convertTree(this.merchantList.slice(), this.filterType)
  }

  // 默认生效报价单 store
  @observable
  getSaleMenuLoading = true

  @observable
  saleMenus = []

  @observable
  saleMenuLeft = []

  @observable
  saleMenuRight = []

  @action
  changeSaleMenuGroup = (left, right) => {
    this.saleMenuLeft = left
    this.saleMenuRight = right
  }

  @action
  handleChangeLoading = (bool) => {
    this.getSaleMenuLoading = bool
  }

  @action
  getSaleMenuGroup = (id) => {
    this.getSaleMenuLoading = false
    const left = []
    const right = []
    this.saleMenus.forEach((v) => {
      const item = {
        value: v.id,
        name: v.name,
        freight_id: v.freight_id,
        freight_name: v.freight_name,
        _gm_select: false,
      }
      v.freight_id === id ? right.push(item) : left.push(item)
    })
    this.saleMenuLeft = left
    this.saleMenuRight = right
  }

  @action
  getSaleMenus = (id) => {
    this.getSaleMenuLoading = true
    Request('/station/freight/sale_menu/list')
      .get()
      .then((res) => {
        this.saleMenus = res.data
        this.getSaleMenuGroup(id)
      })
  }

  @action.bound
  changeFreightDimension(value, type, key) {
    if (key === 'foundation' && value === 'Distance') {
      this[type].dimension = ''
      this[type].way = ''
      this.tempMinObj = {
        delivery: this.templateData.delivery_freight.section[0].min,
        pick_up: this.templateData.pick_up_freight.section[0].min,
      }
      this.templateData.delivery_freight.section[0].min = this.templateData.pick_up_freight.section[0].min = 0
    } else if (key === 'foundation' && value === 'Money') {
      this[type].dimension = 'Interval'
      this[type].way = 'Artificial'
      this.templateData.delivery_freight.section[0].min = this.tempMinObj.delivery
      this.templateData.pick_up_freight.section[0].min = this.tempMinObj.pick_up
    } else if (value === 'Proportion') {
      this[type].way = ''
    } else if (key === 'dimension' && value === 'Interval') {
      this[type].way = 'Artificial'
    }
    this[type][key] = value
  }
}

export default new FreightStore()
