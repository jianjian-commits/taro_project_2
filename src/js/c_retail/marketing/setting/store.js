import { observable, action, runInAction, computed } from 'mobx'
import _ from 'lodash'
import { Request } from '@gm-common/request'

import { listToFlat } from './util'
import { skuListAdapter } from '../../../common/util'

const rule = {
  card_type: '年卡',
  card_day: 0,
  origin_price: 0,
  current_price: 0,
  id: Math.random()
    .toString(36)
    .slice(2)
}

const init_base_setting = {
  desc: '开通会员卡享受海量优惠',
  is_active: false
}

class SettingStore {
  @observable is_create = true
  // 基础设置
  @observable base_setting = init_base_setting
  // 会员卡定价
  @observable rules = []
  // 会员权益
  @observable member_config = {
    member_freight: false,
    member_sku: false,
    member_coupon: false
  }

  // 运费模板数据
  @observable freight_list = []
  @observable member_freight_id = ''

  // 折扣商品
  @observable goods = {
    discount: 1,
    sku_ids: []
  }

  @observable skuList = []
  @observable skuListLoading = false
  @observable skus = []
  @observable member_card_id = -1

  @action
  changeRules(data, index) {
    this.rules[index] = {
      ...this.rules[index],
      ...data
    }
  }

  @action
  clearMemberSetting() {
    this.base_setting = init_base_setting
    this.rules = []
    this.skuList = []
    this.skuListLoading = false
    this.skus = []
    this.goods = {
      discount: 1,
      sku_ids: []
    }
    this.member_config = {
      member_freight: false,
      member_sku: false,
      member_coupon: false
    }
    this.member_freight_id = ''
  }

  @action
  addRules() {
    this.rules = _.concat(this.rules.slice(), [rule])
  }

  @action
  deleteRules(index) {
    this.rules.remove(this.rules[index])
  }

  @action
  changeBaseSetting(name, val) {
    this.base_setting[name] = val
  }

  @action
  changeMemberConfig(name, val) {
    this.member_config[name] = val
  }

  @action
  setMemberCardSetting() {
    const url = this.is_create ? '/member/card/create' : '/member/card/edit'
    return Request(url)
      .data(this.memberCardSetting)
      .post()
  }

  // 获取会员卡设置详情
  @action
  getMemberCardSetting() {
    return Request('/member/card/get')
      .get()
      .then(json => {
        runInAction(() => {
          this.is_create = !json.data.member_config
          // member_config 为空时，是创建状态
          if (json.data.member_config) {
            const {
              rules,
              member_freight,
              member_coupon,
              member_sku,
              member_discount
            } = json.data.member_config
            this.member_card_id = json.data.id
            this.member_config.member_sku = !!member_sku
            this.member_config.member_coupon = !!member_coupon
            this.member_config.member_freight = !!member_freight
            this.goods.discount = member_discount
            this.goods.sku_ids = json.data.discount_sku_ids
            this.member_freight_id = json.data.member_freight_id
            this.rules = _.map(rules, item => ({
              ...item,
              id: Math.random()
                .toString(36)
                .slice(2)
            }))
            this.base_setting.is_active = json.data.is_active
            this.base_setting.desc = json.data.desc
          }
        })
      })
  }

  // 设置运费模板
  @action
  setMemberFreight(id) {
    this.member_freight_id = id
  }

  // 获取运费模板
  @action
  getFreightList() {
    return Request('/station/freight/list')
      .get()
      .then(json => {
        runInAction(() => {
          this.freight_list = _.map(json.data, item => ({
            value: item.id,
            text: item.name
          }))
        })
      })
  }

  @action
  setGoods(name, value) {
    this.goods[name] = value
  }

  @action
  setSkuList(list) {
    list = skuListAdapter(list)
    this.skus = list
  }

  @action
  getSkuList() {
    this.skuListLoading = true

    return Request('/member/sku/list')
      .get()
      .then(json => {
        const list = json.data
        runInAction(() => {
          this.skuList = skuListAdapter(list)
          // 将已选的商品筛出来
          const flat = listToFlat(this.skuList.slice())
          const res = _.filter(flat, i => _.includes(this.goods.sku_ids, i.id))
          this.setSkuList(res)
          this.skuListLoading = false
        })
      })
  }

  @computed
  get memberCardSetting() {
    const { member_freight, member_sku, member_coupon } = this.member_config
    const config = {
      member_freight: member_freight ? 1 : 0,
      member_sku: member_sku ? 1 : 0,
      member_coupon: member_coupon ? 1 : 0
    }
    const new_rules = _.map(this.rules, item => ({
      card_type: item.card_type,
      card_day: item.card_day,
      origin_price: item.origin_price,
      current_price: item.current_price
    }))

    return {
      member_config: JSON.stringify(config),
      is_active: this.base_setting.is_active ? 1 : 0,
      desc: this.base_setting.desc,
      rules: JSON.stringify(new_rules),
      member_freight_id: this.member_freight_id,
      member_discount: this.goods.discount,
      sku_discount_ids: JSON.stringify(this.goods.sku_ids),
      member_card_id: this.member_card_id === -1 ? null : this.member_card_id
    }
  }
}

export default new SettingStore()
